import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../Prisma/prisma.service';
import { TypingSession } from '@prisma/client';
import { CreateTypingSessionDto } from './dto/typing.dto';

@Injectable()
export class TypingSessionsService {
  constructor(private prisma: PrismaService) {}

  // ============================================================
  // PÚBLICOS
  // ============================================================

  /** 1. Guarda una sesión completa y actualiza todas las estadísticas */
  async create(
    userId: number,
    dto: CreateTypingSessionDto,
  ): Promise<TypingSession> {
    const text = await this.prisma.text.findFirst({
      where: { id: dto.textId, isActive: true },
    });
    if (!text) throw new NotFoundException(`Texto ${dto.textId} no encontrado`);

    const improvementRate = await this.calculateImprovement(
      userId,
      dto.textId,
      dto.wpm,
    );

    const session = await this.prisma.typingSession.create({
      data: {
        userId,
        textId: dto.textId,
        wpm: dto.wpm ?? null,
        accuracy: dto.accuracy ?? null,
        timeSeconds: dto.timeSeconds ?? null,
        errorRate: dto.errorRate ?? null,
        improvementRate,
      },
    });

    await Promise.all([
      this.saveErrors(session.id, dto),
      this.updateTextHistory(userId, dto),
      this.updateStats(userId, text.difficultyId, dto),
    ]);

    return session;
  }

  /** 2. Sesiones recientes del usuario */
  async findMyRecent(userId: number, limit = 20): Promise<TypingSession[]> {
    return this.prisma.typingSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /** 3. Sesiones del usuario en un texto específico */
  async findByText(textId: number, userId: number): Promise<TypingSession[]> {
    const text = await this.prisma.text.findUnique({ where: { id: textId } });
    if (!text) throw new NotFoundException(`Texto ${textId} no encontrado`);

    return this.prisma.typingSession.findMany({
      where: { userId, textId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 4. Sesión por id (solo el dueño puede verla) */
  async findById(
    userId: number,
    id: number,
  ): Promise<TypingSession & { errors: any[] }> {
    const session = await this.prisma.typingSession.findUnique({
      where: { id },
      include: { errors: true },
    });
    if (!session) throw new NotFoundException(`Sesión ${id} no encontrada`);
    if (session.userId !== userId)
      throw new ForbiddenException('No tienes acceso a esta sesión');
    return session;
  }

  // ============================================================
  // PRIVADOS
  // ============================================================

  /** Calcula el % de mejora respecto al mejor WPM previo en ese texto */
  private async calculateImprovement(
    userId: number,
    textId: number,
    wpm?: number,
  ): Promise<number | null> {
    if (!wpm) return null;

    const best = await this.prisma.typingSession.findFirst({
      where: { userId, textId, wpm: { not: null } },
      orderBy: { wpm: 'desc' },
      select: { wpm: true },
    });

    if (!best?.wpm) return null;
    return ((wpm - best.wpm) / best.wpm) * 100;
  }

  /** Guarda los errores individuales de la sesión */
  private async saveErrors(
    sessionId: number,
    dto: CreateTypingSessionDto,
  ): Promise<void> {
    if (!dto.errors?.length) return;

    await this.prisma.typingError.createMany({
      data: dto.errors.map((e) => ({
        sessionId,
        wrongWord: e.wrongWord ?? null,
        correctWord: e.correctWord ?? null,
        position: e.position ?? null,
      })),
    });
  }

  /** Actualiza user_stats_by_difficulty recalculando promedios y máximos */
  private async updateStats(
    userId: number,
    difficultyId: number,
    dto: CreateTypingSessionDto,
  ): Promise<void> {
    const existing = await this.prisma.userStatsByDifficulty.findUnique({
      where: { userId_difficultyId: { userId, difficultyId } },
    });

    if (!existing) {
      await this.prisma.userStatsByDifficulty.create({
        data: {
          userId,
          difficultyId,
          bestWpm: dto.wpm ?? 0,
          avgWpm: dto.wpm ?? 0,
          avgAccuracy: dto.accuracy ?? 0,
          totalSessions: 1,
          totalTimeSeconds: dto.timeSeconds ?? 0,
          avgErrorRate: dto.errorRate ?? 0,
        },
      });
      return;
    }

    const n = existing.totalSessions; // sesiones anteriores
    const newCount = n + 1;

    const newAvgWpm = dto.wpm
      ? (existing.avgWpm * n + dto.wpm) / newCount
      : existing.avgWpm;

    const newAvgAccuracy = dto.accuracy
      ? (existing.avgAccuracy * n + dto.accuracy) / newCount
      : existing.avgAccuracy;

    const newAvgErrorRate =
      dto.errorRate !== undefined && dto.errorRate !== null
        ? (existing.avgErrorRate * n + dto.errorRate) / newCount
        : existing.avgErrorRate;

    await this.prisma.userStatsByDifficulty.update({
      where: { userId_difficultyId: { userId, difficultyId } },
      data: {
        totalSessions: { increment: 1 },
        totalTimeSeconds: { increment: dto.timeSeconds ?? 0 },
        bestWpm:
          dto.wpm && dto.wpm > existing.bestWpm ? dto.wpm : existing.bestWpm,
        avgWpm: newAvgWpm,
        avgAccuracy: newAvgAccuracy,
        avgErrorRate: newAvgErrorRate,
      },
    });
  }

  /** Actualiza el historial de textos practicados por el usuario */
  private async updateTextHistory(
    userId: number,
    dto: CreateTypingSessionDto,
  ): Promise<void> {
    const existing = await this.prisma.userTextHistory.findUnique({
      where: { userId_textId: { userId, textId: dto.textId } },
    });

    if (!existing) {
      await this.prisma.userTextHistory.create({
        data: {
          userId,
          textId: dto.textId,
          lastAttemptAt: new Date(),
          totalAttempts: 1,
          bestWpm: dto.wpm ?? null,
          bestAccuracy: dto.accuracy ?? null,
        },
      });
      return;
    }

    await this.prisma.userTextHistory.update({
      where: { userId_textId: { userId, textId: dto.textId } },
      data: {
        lastAttemptAt: new Date(),
        totalAttempts: { increment: 1 },
        bestWpm:
          dto.wpm && dto.wpm > (existing.bestWpm ?? 0)
            ? dto.wpm
            : existing.bestWpm,
        bestAccuracy:
          dto.accuracy && dto.accuracy > (existing.bestAccuracy ?? 0)
            ? dto.accuracy
            : existing.bestAccuracy,
      },
    });
  }
}
