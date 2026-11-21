import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Prisma, PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';
import { PrismaService } from '../src/Prisma/prisma.service';

const databaseUrl = process.env.TEST_DATABASE_URL;
const postgresSuite = databaseUrl ? describe : describe.skip;

postgresSuite('Typing attempts with PostgreSQL', () => {
  const prefix = `typing-test-${randomUUID()}`;
  const correct = [...'abcdefghij'];
  const corrected = ['z', 'Backspace', ...correct];
  let app: INestApplication<App>;
  let db: PrismaClient;
  let server: App;
  let cookie: string;
  let adminCookie: string;
  let textId: number;
  let userId: number;
  let adminId: number;
  let difficultyId: number;
  let nextDifficultyId: number;

  beforeAll(async () => {
    process.env.JWT_SECRET ??= 'typing-integration-only';
    db = new PrismaClient({ datasourceUrl: databaseUrl });
    await db.$connect();
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(db)
      .compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
    server = app.getHttpServer();
  });

  beforeEach(async () => {
    const label = `${prefix}-${randomUUID()}`;
    const [difficulty, other, type, language, user, admin] = await Promise.all([
      db.difficulty.create({ data: { name: label } }),
      db.difficulty.create({ data: { name: `${label}-other` } }),
      db.textType.create({ data: { name: label } }),
      db.language.create({ data: { code: label, name: label } }),
      db.user.create({
        data: {
          username: label,
          email: `${label}@test.invalid`,
          passwordHash: 'unused',
        },
      }),
      db.user.create({
        data: {
          username: `${label}-admin`,
          email: `${label}-admin@test.invalid`,
          passwordHash: 'unused',
          role: 'ADMIN',
        },
      }),
    ]);
    userId = user.id;
    adminId = admin.id;
    difficultyId = difficulty.id;
    nextDifficultyId = other.id;
    const text = await db.text.create({
      data: {
        title: label,
        content: correct.join(''),
        difficultyId,
        typeId: type.id,
        languageId: language.id,
        createdById: adminId,
      },
    });
    textId = text.id;
    const jwt = app.get(JwtService);
    cookie = `access_token=${jwt.sign({ sub: userId })}`;
    adminCookie = `access_token=${jwt.sign({ sub: adminId })}`;
  });

  afterAll(async () => {
    if (!db) return;
    await db.typingSession.deleteMany({
      where: { text: { title: { startsWith: prefix } } },
    });
    await db.userTextHistory.deleteMany({
      where: { text: { title: { startsWith: prefix } } },
    });
    await db.text.deleteMany({ where: { title: { startsWith: prefix } } });
    await db.user.deleteMany({ where: { username: { startsWith: prefix } } });
    await db.difficulty.deleteMany({ where: { name: { startsWith: prefix } } });
    await db.textType.deleteMany({ where: { name: { startsWith: prefix } } });
    await db.language.deleteMany({ where: { code: { startsWith: prefix } } });
    await app?.close();
    await db.$disconnect();
  });

  async function start() {
    const response = await request(server)
      .post('/typing-sessions/start')
      .set('Cookie', cookie)
      .send({ textId })
      .expect(201);
    const attempt = response.body as {
      attemptId: string;
      startedAt: string;
      expiresAt: string;
    };
    expect(Date.parse(attempt.expiresAt) - Date.parse(attempt.startedAt)).toBe(
      30 * 60 * 1000,
    );
    return attempt.attemptId;
  }

  function finish(attemptId: string, events: string[], owner = cookie) {
    return request(server)
      .post('/typing-sessions')
      .set('Cookie', owner)
      .send({ attemptId, events });
  }

  it('rejects client metrics, malformed replay, a changed revision and another owner', async () => {
    await request(server)
      .post('/typing-sessions/start')
      .send({ textId })
      .expect(401);
    const attemptId = await start();
    await request(server)
      .post('/typing-sessions')
      .set('Cookie', cookie)
      .send({ attemptId, events: correct, wpm: 9999 })
      .expect(400);
    await finish(attemptId, correct, adminCookie).expect(404);
    await finish(attemptId, ['ab', ...correct]).expect(400);
    await finish(attemptId, Array<string>(101).fill('x')).expect(400);
    await finish(attemptId, Array<string>(28000).fill('x')).expect(413);
    await finish(attemptId, ['Backspace', ...correct]).expect(400);
    await finish(attemptId, [...correct, 'x']).expect(400);
    await db.text.update({
      where: { id: textId },
      data: { content: 'changed version' },
    });
    await finish(attemptId, correct).expect(409);
    expect(await db.typingSession.count({ where: { textId } })).toBe(0);
  });

  it('finalizes once under concurrent delivery and replays after expiry', async () => {
    const attemptId = await start();
    const [first, duplicate] = await Promise.all([
      finish(attemptId, corrected).expect(201),
      finish(attemptId, corrected).expect(201),
    ]);
    const session = first.body as {
      id: number;
      accuracy: number;
      errorRate: number;
    };
    expect(duplicate.body).toEqual(session);
    expect(session.accuracy).toBeCloseTo(1000 / 11);
    expect(session.errorRate).toBeCloseTo(100 / 11);
    expect(session).not.toHaveProperty('attemptId');
    await db.typingAttempt.update({
      where: { id: attemptId },
      data: { expiresAt: new Date(0) },
    });
    expect((await finish(attemptId, corrected).expect(201)).body).toEqual(
      session,
    );
    await finish(attemptId, correct).expect(409);
    expect(await db.typingSession.count({ where: { textId } })).toBe(1);
    const detail = await request(server)
      .get(`/typing-sessions/${session.id}`)
      .set('Cookie', cookie)
      .expect(200);
    expect(detail.body).toMatchObject({
      id: session.id,
      errors: [{ wrongWord: 'z', correctWord: 'a', position: 0 }],
    });
    const expired = await start();
    await db.typingAttempt.update({
      where: { id: expired },
      data: { expiresAt: new Date(0) },
    });
    await finish(expired, correct).expect(409);
  });

  it('rolls back the session, errors, attempt hash and history if the stats write fails', async () => {
    const attemptId = await start();
    // A database constraint fails at the final write for this fixture alone.
    const constraint = Prisma.raw(`typing_test_reject_${userId}`);
    await db.$executeRaw`
      ALTER TABLE user_stats_by_difficulty ADD CONSTRAINT ${constraint}
      CHECK (user_id <> ${Prisma.raw(String(userId))}) NOT VALID
    `;
    try {
      await finish(attemptId, corrected).expect(500);
      expect(await db.typingSession.count({ where: { textId } })).toBe(0);
      expect(
        await db.typingError.count({ where: { session: { textId } } }),
      ).toBe(0);
      expect(await db.userTextHistory.count({ where: { textId } })).toBe(0);
      expect(await db.userStatsByDifficulty.count({ where: { userId } })).toBe(
        0,
      );
      expect(
        await db.typingAttempt.findUnique({ where: { id: attemptId } }),
      ).toMatchObject({ eventsHash: null });
    } finally {
      await db.$executeRaw`ALTER TABLE user_stats_by_difficulty DROP CONSTRAINT ${constraint}`;
    }
    await finish(attemptId, corrected).expect(201);
  });
  it('keeps both concurrent attempts and ranks them under the starting difficulty', async () => {
    const old = await db.typingSession.create({
      data: { userId, textId, wpm: 50000, accuracy: 100 },
    });
    const baseline = await start();
    await finish(
      baseline,
      correct.map(() => 'z'),
    ).expect(201);

    const [slow, fast] = await Promise.all([start(), start()]);
    await db.typingAttempt.update({
      where: { id: slow },
      data: { startedAt: new Date(Date.now() - 60_000) },
    });
    await db.text.update({
      where: { id: textId },
      data: { difficultyId: nextDifficultyId },
    });

    const [slowResult, fastResult] = await Promise.all([
      finish(slow, corrected).expect(201),
      finish(fast, correct).expect(201),
    ]);
    const slowSession = slowResult.body as { wpm: number; accuracy: number };
    const fastSession = fastResult.body as {
      id: number;
      wpm: number;
      accuracy: number;
    };
    expect(fastSession.wpm).toBeGreaterThan(slowSession.wpm);
    const stats = await db.userStatsByDifficulty.findUnique({
      where: { userId_difficultyId: { userId, difficultyId } },
    });
    expect(stats).toMatchObject({
      totalSessions: 3,
      accuracyCount: 3,
      bestWpm: fastSession.wpm,
    });
    expect(stats?.avgAccuracy).toBeCloseTo(
      (0 + slowSession.accuracy + fastSession.accuracy) / 3,
    );
    expect(stats?.avgWpm).toBeCloseTo(
      (0 + slowSession.wpm + fastSession.wpm) / 3,
    );
    expect(
      await db.userTextHistory.findUnique({
        where: { userId_textId: { userId, textId } },
      }),
    ).toMatchObject({ totalAttempts: 3, bestWpm: fastSession.wpm });

    const ranking = await request(server)
      .get(`/leaderboard/difficulty/${difficultyId}`)
      .expect(200);
    expect(ranking.body).toMatchObject([
      { bestWpm: fastSession.wpm, totalSessions: 3 },
    ]);
    await request(server)
      .get(`/leaderboard/difficulty/${nextDifficultyId}`)
      .expect(200, []);
    const top = await request(server).get(`/texts/${textId}/stats`).expect(200);
    expect(top.body).toMatchObject({
      stats: { totalAttempts: 3, maxWpm: fastSession.wpm },
      topSessions: [
        { id: fastSession.id },
        { wpm: slowSession.wpm },
        { wpm: 0 },
      ],
    });
    await request(server)
      .get(`/typing-sessions/${old.id}`)
      .set('Cookie', cookie)
      .expect(200);
    await finish(fast, correct).expect(201);
    expect(
      await db.notification.count({
        where: { userId, difficultyId, wpm: fastSession.wpm },
      }),
    ).toBe(1);

    await db.user.update({ where: { id: userId }, data: { isActive: false } });
    await request(server)
      .get(`/leaderboard/difficulty/${difficultyId}`)
      .expect(200, []);
    const inactive = await request(server)
      .get(`/texts/${textId}/stats`)
      .expect(200);
    expect(inactive.body).toMatchObject({
      stats: { totalAttempts: 0 },
      topSessions: [],
    });
  });

  it('backfills null and zero separately and keeps inactive text in owner history', async () => {
    const attemptId = await start();
    const createdAt = new Date('2020-01-01');
    await db.typingSession.createMany({
      data: [
        {
          userId,
          textId,
          createdAt,
          wpm: 100,
          accuracy: 100,
          errorRate: 0,
          timeSeconds: 5,
        },
        { userId, textId, createdAt, wpm: 0, accuracy: 0, errorRate: 100 },
        { userId, textId, createdAt },
      ],
    });
    const where = { userId_difficultyId: { userId, difficultyId } };
    const rebuild = () =>
      db.$transaction(async (tx) => {
        for (const file of [
          'rebuild-difficulty-stats.sql',
          'rebuild-text-history.sql',
        ]) {
          const sql = readFileSync(
            join(__dirname, '../prisma/maintenance', file),
            'utf8',
          );
          await tx.$executeRawUnsafe(sql);
        }
      });
    await rebuild();
    const first = await db.userStatsByDifficulty.findUnique({ where });
    expect(first).toMatchObject({
      totalSessions: 3,
      wpmCount: 2,
      accuracyCount: 2,
      errorRateCount: 2,
      avgWpm: 50,
      avgAccuracy: 50,
      avgErrorRate: 50,
      totalTimeSeconds: 5,
    });
    const history = { userId_textId: { userId, textId } };
    const firstHistory = await db.userTextHistory.findUnique({
      where: history,
    });
    expect(firstHistory).toMatchObject({
      lastAttemptAt: createdAt,
      totalAttempts: 3,
    });
    await rebuild();
    expect(await db.userStatsByDifficulty.findUnique({ where })).toEqual(first);
    expect(await db.userTextHistory.findUnique({ where: history })).toEqual(
      firstHistory,
    );

    await db.text.update({ where: { id: textId }, data: { isActive: false } });
    const listing = await request(server)
      .get(`/texts?difficultyId=${difficultyId}&limit=5`)
      .expect(200);
    expect(listing.body).toMatchObject({ data: [], meta: { total: 0 } });
    await request(server).get(`/texts/${textId}`).expect(404);
    await request(server).get(`/texts/${textId}/stats`).expect(404);
    await request(server)
      .get(`/texts/random?difficultyId=${difficultyId}`)
      .expect(404);
    await request(server)
      .get(`/admin/text/${textId}`)
      .set('Cookie', adminCookie)
      .expect(200);
    await request(server)
      .get(`/admin/text/${textId}/stats`)
      .set('Cookie', adminCookie)
      .expect(200);
    await request(server)
      .post('/typing-sessions/start')
      .set('Cookie', cookie)
      .send({ textId })
      .expect(404);
    await finish(attemptId, correct).expect(404);

    const sessions = await db.typingSession.findMany({
      where: { userId, textId },
      orderBy: { id: 'desc' },
    });
    const path = `/typing-sessions/text/${textId}`;
    const firstPage = await request(server)
      .get(`${path}?limit=2`)
      .set('Cookie', cookie)
      .expect(200);
    expect(firstPage.body).toMatchObject({
      data: [{ id: sessions[0].id }, { id: sessions[1].id }],
      pagination: { page: 1, limit: 2, total: 3, totalPages: 2 },
    });
    const lastPage = await request(server)
      .get(`${path}?limit=2&page=2`)
      .set('Cookie', cookie)
      .expect(200);
    expect(lastPage.body).toMatchObject({
      data: [{ id: sessions[2].id }],
      pagination: { page: 2, limit: 2, total: 3, totalPages: 2 },
    });
    const empty = await request(server)
      .get(`${path}?limit=2&page=3`)
      .set('Cookie', cookie)
      .expect(200);
    expect(empty.body).toMatchObject({ data: [], pagination: { total: 3 } });
    await request(server)
      .get(`${path}?limit=101`)
      .set('Cookie', cookie)
      .expect(400);
    await request(server)
      .get(`${path}?page=1.5`)
      .set('Cookie', cookie)
      .expect(400);
    const other = await request(server)
      .get(path)
      .set('Cookie', adminCookie)
      .expect(200);
    expect(other.body).toMatchObject({
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
  });

  it('validates and paginates the existing admin projection', async () => {
    const path = '/users/admin/all';
    await request(server).get(path).expect(401);
    await request(server).get(path).set('Cookie', cookie).expect(403);
    await request(server)
      .get(`${path}?page=1&page=2`)
      .set('Cookie', adminCookie)
      .expect(400);
    await request(server)
      .get(`${path}?page=0`)
      .set('Cookie', adminCookie)
      .expect(400);
    const total = await db.user.count();
    const ordered = await db.user.findMany({ orderBy: { id: 'asc' }, take: 2 });
    const first = await request(server)
      .get(`${path}?limit=1`)
      .set('Cookie', adminCookie)
      .expect(200);
    const second = await request(server)
      .get(`${path}?limit=1&page=2`)
      .set('Cookie', adminCookie)
      .expect(200);
    for (const [index, response] of [first, second].entries()) {
      const { id, username, email, role, isActive } = ordered[index];
      expect(response.body).toEqual({
        data: [{ id, username, email, role, isActive }],
        pagination: { page: index + 1, limit: 1, total, totalPages: total },
      });
    }
  });
});
