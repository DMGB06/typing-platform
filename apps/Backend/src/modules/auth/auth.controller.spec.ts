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
        expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
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
        expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
      );
      expect(result).toEqual({ user });
    });
  });

  describe('logout', () => {
    it('clears the auth cookie', () => {
      const res = mockResponse();

      const result = controller.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE);
      expect(result).toEqual({ success: true });
    });
  });
});
