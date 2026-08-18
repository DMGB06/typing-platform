/* eslint-disable @typescript-eslint/unbound-method -- res.cookie/clearCookie are jest.fn() mocks referenced in expect(...).toHaveBeenCalledWith, not called unbound */
import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ACCESS_TOKEN_COOKIE } from './auth.constants';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  const mockResponse = () =>
    ({
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    }) as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('sets the auth cookie and returns only the user, not the token', async () => {
      const res = mockResponse();
      const user = {
        id: 1,
        username: 'ana',
        email: 'ana@test.com',
        role: 'USER',
      };
      mockAuthService.register.mockResolvedValue({ user, token: 'signed-jwt' });

      const result = await controller.register(
        { username: 'ana', email: 'ana@test.com', password: 'Password123' },
        res,
      );

      expect(res.cookie).toHaveBeenCalledWith(
        ACCESS_TOKEN_COOKIE,
        'signed-jwt',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        }),
      );
      expect(result).toEqual({ user });
      expect(result).not.toHaveProperty('token');
    });
  });

  describe('login', () => {
    it('sets the auth cookie and returns only the user, not the token', async () => {
      const res = mockResponse();
      const user = {
        id: 1,
        username: 'ana',
        email: 'ana@test.com',
        role: 'USER',
      };
      mockAuthService.login.mockResolvedValue({ user, token: 'signed-jwt' });

      const result = await controller.login(
        { email: 'ana@test.com', password: 'Password123' },
        res,
      );

      expect(res.cookie).toHaveBeenCalledWith(
        ACCESS_TOKEN_COOKIE,
        'signed-jwt',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 24 * 60 * 60 * 1000,
        }),
      );
      expect(result).toEqual({ user });
    });

    it('falls back to SameSite=Lax and a non-secure cookie when COOKIE_SECURE=false (local dev)', async () => {
      const original = process.env.COOKIE_SECURE;
      process.env.COOKIE_SECURE = 'false';
      try {
        const res = mockResponse();
        const user = {
          id: 1,
          username: 'ana',
          email: 'ana@test.com',
          role: 'USER',
        };
        mockAuthService.login.mockResolvedValue({ user, token: 'signed-jwt' });

        await controller.login(
          { email: 'ana@test.com', password: 'Password123' },
          res,
        );

        expect(res.cookie).toHaveBeenCalledWith(
          ACCESS_TOKEN_COOKIE,
          'signed-jwt',
          expect.objectContaining({ secure: false, sameSite: 'lax' }),
        );
      } finally {
        process.env.COOKIE_SECURE = original;
      }
    });

    it('sets a longer-lived cookie when rememberMe is true', async () => {
      const res = mockResponse();
      const user = {
        id: 1,
        username: 'ana',
        email: 'ana@test.com',
        role: 'USER',
      };
      mockAuthService.login.mockResolvedValue({ user, token: 'signed-jwt' });

      await controller.login(
        { email: 'ana@test.com', password: 'Password123', rememberMe: true },
        res,
      );

      expect(res.cookie).toHaveBeenCalledWith(
        ACCESS_TOKEN_COOKIE,
        'signed-jwt',
        expect.objectContaining({ maxAge: 30 * 24 * 60 * 60 * 1000 }),
      );
    });
  });

  describe('logout', () => {
    it('clears the auth cookie', () => {
      const res = mockResponse();

      const result = controller.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith(
        ACCESS_TOKEN_COOKIE,
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        }),
      );
      expect(result).toEqual({ success: true });
    });
  });
});
