import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/Prisma/prisma.service';
import { configureApp } from '../src/main';

// supertest's agent runs over plain HTTP (no TLS), so the Secure cookie
// wouldn't be replayed on follow-up requests otherwise.
process.env.COOKIE_SECURE = 'false';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('sends security headers set by helmet', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-content-type-options']).toBe('nosniff');
      });
  });

  describe('register', () => {
    it('sets an httpOnly auth cookie and does not return the token in the body', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 1,
        username: 'ana',
        email: 'ana@test.com',
        role: 'USER',
      });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'ana',
          email: 'ana@test.com',
          password: 'Password123',
        })
        .expect(201);

      expect(res.body).toEqual({
        user: { id: 1, username: 'ana', email: 'ana@test.com', role: 'USER' },
      });

      const cookies = res.headers['set-cookie'] as unknown as string[];
      const authCookie = cookies.find((c) => c.startsWith('access_token='));
      expect(authCookie).toBeDefined();
      expect(authCookie).toMatch(/HttpOnly/);
    });
  });

  describe('logout', () => {
    it('clears the auth cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(201);

      const cookies = res.headers['set-cookie'] as unknown as string[];
      const authCookie = cookies.find((c) => c.startsWith('access_token='));
      expect(authCookie).toBeDefined();
      expect(authCookie).toMatch(/^access_token=;/);
    });
  });

  describe('protected routes with the auth cookie', () => {
    const hashedPassword = bcrypt.hashSync('Password123', 10);

    it('allows access using the cookie set by login, and rejects access without it', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 1,
        username: 'ana',
        email: 'ana@test.com',
        role: 'USER',
        passwordHash: hashedPassword,
        isActive: true,
      });
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 1,
        username: 'ana',
        email: 'ana@test.com',
        role: 'USER',
        isActive: true,
      });
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        username: 'ana',
        email: 'ana@test.com',
        role: 'USER',
        isActive: true,
      });

      const agent = request.agent(app.getHttpServer());

      await agent
        .post('/auth/login')
        .send({ email: 'ana@test.com', password: 'Password123' })
        .expect(201);

      const res = await agent.get('/users/me').expect(200);
      expect(res.body).toEqual({
        username: 'ana',
        email: 'ana@test.com',
        role: 'USER',
        isActive: true,
      });

      await request(app.getHttpServer()).get('/users/me').expect(401);
    });
  });
});
