import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { sha256 } from '../../common/sha256';
import { PrismaService } from '../../Prisma/prisma.service';
import { paginated, PaginationDto } from '../../common/pagination.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { activeText } from '../text/text-visibility';
import {
  CreateTypingSessionDto,
  StartTypingSessionDto,
} from './dto/typing.dto';
import { replayTyping } from './typing-result';

const sessionSelect = {
  id: true,
  userId: true,
  textId: true,
  wpm: true,
  accuracy: true,
  timeSeconds: true,
  errorRate: true,
  improvementRate: true,
  createdAt: true,
} satisfies Prisma.TypingSessionSelect;

const newestFirst = [
  { createdAt: 'desc' },
  { id: 'desc' },
] satisfies Prisma.TypingSessionOrderByWithRelationInput[];

const attemptLifetimeMs = 30 * 60 * 1000;
const maxRetries = 3;

function nextAverage(average: number, count: number, value: number) {
  return average + (value - average) / (count + 1);
}

@Injectable()
export class TypingSessionsService {
  private readonly logger = new Logger(TypingSessionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async start(
    userId: number,
    { textId, expectedContentHash }: StartTypingSessionDto,
  ) {
    const text = await this.prisma.text.findUnique({
      where: { id: textId, ...activeText },
      select: { content: true, difficultyId: true },
    });
    if (!text) throw new NotFoundException('Texto no encontrado');

    const contentHash = sha256(text.content);
    if (
      expectedContentHash !== undefined &&
      expectedContentHash !== contentHash
    ) {
      throw new ConflictException('El contenido del texto cambi\u00f3');
    }

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + attemptLifetimeMs);
    const { id } = await this.prisma.typingAttempt.create({
      data: {
        userId,
        textId,
        difficultyId: text.difficultyId,
        contentHash,
        startedAt,
        expiresAt,
      },
      select: { id: true },
    });
    return { attemptId: id, startedAt, expiresAt };
  }

  async create(userId: number, { attemptId, events }: CreateTypingSessionDto) {
    const finishedAt = new Date();
    const eventsHash = sha256(JSON.stringify(events));

    for (let retry = 0; ; retry++) {
      try {
        const { session, personalBestDifficultyId } =
          await this.prisma.$transaction(
            (tx) =>
              this.finalize(
                tx,
                userId,
                attemptId,
                events,
                eventsHash,
                finishedAt,
              ),
            { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
          );

        if (personalBestDifficultyId !== null && session.wpm !== null) {
          try {
            await this.notificationsService.createPersonalBestNotification(
              userId,
              personalBestDifficultyId,
              session.wpm,
            );
          } catch (error) {
            this.logger.error(
              `Falló la notificación para la sesión ${session.id}`,
              error,
            );
          }
        }
        return session;
      } catch (error) {
        if (
          !(error instanceof Prisma.PrismaClientKnownRequestError) ||
          !(
            ['P2034', 'P2002'].includes(error.code) ||
            (error.code === 'P2010' &&
              (error.meta?.code === '40001' || error.meta?.code === '40P01'))
          )
        ) {
          throw error;
        }

        if (retry === maxRetries) {
          this.logger.warn(
            `Conflictos agotados al finalizar el intento ${attemptId}`,
          );
          throw new ServiceUnavailableException(
            'Reintenta guardar el resultado',
          );
        }
        await new Promise((resolve) =>
          setTimeout(resolve, 10 * 2 ** retry + Math.random() * 10),
        );
      }
    }
  }

  private async finalize(
    tx: Prisma.TransactionClient,
    userId: number,
    attemptId: string,
    events: string[],
    eventsHash: string,
    finishedAt: Date,
  ) {
    const attempt = await tx.typingAttempt.findUnique({
      where: { id: attemptId },
      include: { session: { select: sessionSelect } },
    });
    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundException('Intento no encontrado');
    }
    if (attempt.session) {
      if (attempt.eventsHash !== eventsHash) {
        throw new ConflictException(
          'El intento ya se guardó con otros eventos',
        );
      }
      return { session: attempt.session, personalBestDifficultyId: null };
    }
    if (finishedAt >= attempt.expiresAt) {
      throw new ConflictException('El intento venció');
    }

    const { textId, difficultyId } = attempt;
    // Keep this revision active and stable until the session commits.
    const [text] = await tx.$queryRaw<{ content: string }[]>`
      SELECT content FROM texts
      WHERE id = ${textId} AND is_active = ${activeText.isActive}
      FOR SHARE
    `;
    if (!text) throw new NotFoundException('Texto no encontrado');
    if (sha256(text.content) !== attempt.contentHash) {
      throw new ConflictException('El contenido del texto cambió');
    }

    const { errors, ...metrics } = replayTyping(
      text.content,
      events,
      finishedAt.getTime() - attempt.startedAt.getTime(),
    );
    const verified = { userId, attemptId: { not: null } };
    const [textBest, difficultyBest] = await Promise.all([
      tx.typingSession.aggregate({
        where: { ...verified, textId },
        _max: { wpm: true },
      }),
      tx.typingSession.aggregate({
        where: { ...verified, attempt: { difficultyId } },
        _max: { wpm: true },
      }),
    ]);

    const previousWpm = textBest._max.wpm;
    const session = await tx.typingSession.create({
      data: {
        userId,
        textId,
        attemptId,
        ...metrics,
        improvementRate: previousWpm
          ? ((metrics.wpm - previousWpm) / previousWpm) * 100
          : null,
        errors: errors.length ? { createMany: { data: errors } } : undefined,
      },
      select: sessionSelect,
    });
    await tx.typingAttempt.update({
      where: { id: attemptId },
      data: { eventsHash },
    });
    await this.updateTextHistory(
      tx,
      userId,
      textId,
      session.createdAt,
      metrics,
    );
    await this.updateStats(tx, userId, difficultyId, metrics);
    const previousBest = difficultyBest._max.wpm;
    return {
      session,
      personalBestDifficultyId:
        previousBest !== null && metrics.wpm > previousBest
          ? difficultyId
          : null,
    };
  }

  private async updateTextHistory(
    tx: Prisma.TransactionClient,
    userId: number,
    textId: number,
    createdAt: Date,
    { wpm, accuracy }: Omit<ReturnType<typeof replayTyping>, 'errors'>,
  ) {
    const where = { userId_textId: { userId, textId } };
    const existing = await tx.userTextHistory.findUnique({ where });
    await tx.userTextHistory.upsert({
      where,
      create: {
        userId,
        textId,
        lastAttemptAt: createdAt,
        bestWpm: wpm,
        bestAccuracy: accuracy,
      },
      update: {
        totalAttempts: { increment: 1 },
        lastAttemptAt:
          existing && existing.lastAttemptAt > createdAt
            ? existing.lastAttemptAt
            : createdAt,
        bestWpm: Math.max(existing?.bestWpm ?? wpm, wpm),
        bestAccuracy: Math.max(existing?.bestAccuracy ?? accuracy, accuracy),
      },
    });
  }

  private async updateStats(
    tx: Prisma.TransactionClient,
    userId: number,
    difficultyId: number,
    {
      wpm,
      accuracy,
      errorRate,
      timeSeconds,
    }: Omit<ReturnType<typeof replayTyping>, 'errors'>,
  ) {
    const where = { userId_difficultyId: { userId, difficultyId } };
    const existing = await tx.userStatsByDifficulty.findUnique({ where });
    await tx.userStatsByDifficulty.upsert({
      where,
      create: {
        userId,
        difficultyId,
        bestWpm: wpm,
        avgWpm: wpm,
        avgAccuracy: accuracy,
        avgErrorRate: errorRate,
        totalSessions: 1,
        totalTimeSeconds: timeSeconds,
        wpmCount: 1,
        accuracyCount: 1,
        errorRateCount: 1,
      },
      update: {
        bestWpm: Math.max(existing?.bestWpm ?? wpm, wpm),
        avgWpm: nextAverage(
          existing?.avgWpm ?? 0,
          existing?.wpmCount ?? 0,
          wpm,
        ),
        avgAccuracy: nextAverage(
          existing?.avgAccuracy ?? 0,
          existing?.accuracyCount ?? 0,
          accuracy,
        ),
        avgErrorRate: nextAverage(
          existing?.avgErrorRate ?? 0,
          existing?.errorRateCount ?? 0,
          errorRate,
        ),
        totalSessions: { increment: 1 },
        totalTimeSeconds: { increment: timeSeconds },
        wpmCount: { increment: 1 },
        accuracyCount: { increment: 1 },
        errorRateCount: { increment: 1 },
      },
    });
  }

  findMyRecent(userId: number, limit = 20) {
    return this.prisma.typingSession.findMany({
      where: { userId },
      orderBy: newestFirst,
      take: limit,
      select: sessionSelect,
    });
  }

  async findByText(textId: number, userId: number, pagination: PaginationDto) {
    return this.prisma.$transaction(
      async (tx) => {
        const text = await tx.text.findUnique({
          where: { id: textId },
          select: { id: true },
        });
        if (!text) throw new NotFoundException(`Texto ${textId} no encontrado`);

        const where = { userId, textId };
        const total = await tx.typingSession.count({ where });
        const { page, limit } = pagination;
        const data =
          page <= Math.ceil(total / limit)
            ? await tx.typingSession.findMany({
                where,
                orderBy: newestFirst,
                skip: (page - 1) * limit,
                take: limit,
                select: sessionSelect,
              })
            : [];
        return paginated(data, pagination, total);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  async findById(userId: number, id: number) {
    const session = await this.prisma.typingSession.findUnique({
      where: { id },
      select: { ...sessionSelect, errors: true },
    });
    if (!session) throw new NotFoundException(`Sesión ${id} no encontrada`);
    if (session.userId !== userId)
      throw new ForbiddenException('No tienes acceso a esta sesión');
    return session;
  }
}
