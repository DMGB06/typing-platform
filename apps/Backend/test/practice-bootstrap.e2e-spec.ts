import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { sha256 } from '../src/common/sha256';
import { configureApp } from '../src/main';
import { PrismaService } from '../src/Prisma/prisma.service';

const databaseUrl = process.env.TEST_DATABASE_URL;
const postgresSuite = databaseUrl ? describe : describe.skip;

interface Bootstrap {
  catalogs: {
    difficulties: unknown[];
    textTypes: unknown[];
    languages: unknown[];
  };
  filters: { difficultyId: number; typeId: number; languageId: number } | null;
  texts: { id: number; content: string; contentHash: string }[];
  expiresAt: string;
}

postgresSuite('Public practice bootstrap', () => {
  const created = {
    users: [] as number[],
    difficulties: [] as number[],
    types: [] as number[],
    languages: [] as number[],
  };
  let db: PrismaClient;
  let app: INestApplication<App>;
  let server: App;
  let textId: number;
  let filters: NonNullable<Bootstrap['filters']>;
  let cookies: string[];

  beforeAll(async () => {
    process.env.JWT_SECRET ??= 'practice-integration-only';
    db = new PrismaClient({ datasourceUrl: databaseUrl });
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(db)
      .compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
    server = app.getHttpServer();
    for (const username of ['practice-test-owner', 'practice-test-visitor']) {
      const user = await db.user.create({
        data: {
          username,
          email: `${username}@test.invalid`,
          passwordHash: 'unused',
        },
      });
      created.users.push(user.id);
    }

    const intermediate = await db.difficulty.create({
      data: { name: 'Intermedio' },
    });
    created.difficulties.push(intermediate.id);
    const quote = await db.textType.create({ data: { name: 'Cita' } });
    created.types.push(quote.id);
    const paragraph = await db.textType.create({ data: { name: 'Párrafo' } });
    created.types.push(paragraph.id);
    const spanish = await db.language.create({
      data: { code: 'es', name: 'Español' },
    });
    created.languages.push(spanish.id);
    const english = await db.language.create({
      data: { code: 'en', name: 'English' },
    });
    created.languages.push(english.id);
    const disabled = await db.language.create({
      data: { code: 'fr', name: 'Français', isActive: false },
    });
    created.languages.push(disabled.id);
    filters = {
      difficultyId: intermediate.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    };
    const data = {
      ...filters,
      title: 'Practice bootstrap',
      content: 'abcdefghij',
      createdById: created.users[0],
    };
    const first = await db.text.create({ data });
    textId = first.id;
    await db.text.createMany({
      data: [
        ...Array.from({ length: 6 }, () => data),
        { ...data, typeId: quote.id, languageId: english.id },
        { ...data, languageId: disabled.id },
        { ...data, isActive: false },
      ],
    });
    const jwt = app.get(JwtService);
    cookies = created.users.map((sub) => `access_token=${jwt.sign({ sub })}`);
  });

  afterAll(async () => {
    if (!db) return;
    await db.typingSession.deleteMany({
      where: { userId: { in: created.users } },
    });
    await db.text.deleteMany({ where: { createdById: { in: created.users } } });
    await db.user.deleteMany({ where: { id: { in: created.users } } });
    await db.difficulty.deleteMany({
      where: { id: { in: created.difficulties } },
    });
    await db.textType.deleteMany({ where: { id: { in: created.types } } });
    await db.language.deleteMany({ where: { id: { in: created.languages } } });
    await app?.close();
    await db.$disconnect();
  });

  it('selects a valid default and exposes the same public fields to any visitor', async () => {
    const before = Date.now();
    await request(server)
      .get('/texts/random')
      .query({ ...filters, typeId: created.types[0] })
      .expect(404);
    const guest = await request(server)
      .get('/practice/bootstrap')
      .expect(200)
      .expect('Cache-Control', 'no-store');
    const snapshot = guest.body as Bootstrap;
    expect(snapshot.filters).toEqual(filters);
    expect(snapshot.texts).toHaveLength(5);
    expect(snapshot.texts[0].contentHash).toBe(
      sha256(snapshot.texts[0].content),
    );
    expect(Object.keys(snapshot.texts[0]).sort()).toEqual([
      'content',
      'contentHash',
      'difficultyId',
      'id',
      'languageId',
      'title',
      'typeId',
    ]);
    expect(Date.parse(snapshot.expiresAt)).toBeGreaterThan(before);
    expect(Date.parse(snapshot.expiresAt)).toBeLessThanOrEqual(
      Date.now() + 60_000,
    );
    for (const cookie of cookies) {
      const response = await request(server)
        .get('/practice/bootstrap')
        .set('Cookie', cookie)
        .expect(200);
      expect(response.headers).not.toHaveProperty('set-cookie');
      expect(response.body).toMatchObject({
        filters,
        catalogs: snapshot.catalogs,
        texts: snapshot.texts,
      });
    }
  });

  it('checks the cached content before creating an attempt and keeps the old input compatible', async () => {
    const start = (expectedContentHash: unknown) =>
      request(server)
        .post('/typing-sessions/start')
        .set('Cookie', cookies[0])
        .send({ textId, expectedContentHash });
    await start('bad-hash').expect(400);
    await start(null).expect(400);
    await start(sha256('another one')).expect(409);
    expect(await db.typingAttempt.count({ where: { textId } })).toBe(0);
    await request(server)
      .get('/users/me/preferences')
      .set('Cookie', cookies[0])
      .expect(200)
      .expect('Cache-Control', 'private, no-store');
    await request(server)
      .get('/typing-sessions')
      .set('Cookie', cookies[0])
      .expect(200)
      .expect('Cache-Control', 'private, no-store');
    await start(undefined)
      .expect(201)
      .expect('Cache-Control', 'private, no-store');
    await start(sha256('abcdefghij')).expect(201);
    await db.text.update({
      where: { id: textId },
      data: { content: 'klmnopqrst' },
    });
    await start(sha256('abcdefghij')).expect(409);
    await db.text.update({
      where: { id: textId },
      data: { content: 'abcdefghij', isActive: false },
    });
    await start(sha256('abcdefghij')).expect(404);
    expect(await db.typingAttempt.count({ where: { textId } })).toBe(2);
  });

  it('falls back to another active combination and excludes disabled catalogs', async () => {
    await db.text.updateMany({
      where: { ...filters, createdById: created.users[0] },
      data: { isActive: false },
    });
    const fallback = await request(server)
      .get('/practice/bootstrap')
      .expect(200);
    expect(fallback.body).toMatchObject({
      filters: {
        ...filters,
        typeId: created.types[0],
        languageId: created.languages[1],
      },
    });

    await db.language.update({
      where: { id: created.languages[1] },
      data: { isActive: false },
    });
    const empty = await request(server).get('/practice/bootstrap').expect(200);
    expect(empty.body).toMatchObject({ filters: null, texts: [] });
    expect((empty.body as Bootstrap).catalogs.languages).toEqual([
      { id: filters.languageId, code: 'es', name: 'Español' },
    ]);
  });
});
