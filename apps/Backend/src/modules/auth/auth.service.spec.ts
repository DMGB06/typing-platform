import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../Prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('signed-jwt'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    mockJwtService.sign.mockReturnValue('signed-jwt');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const dto = {
      username: 'ana',
      email: 'ana@test.com',
      password: 'Password123',
    };

    it('throws BadRequestException if the email or username already exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({ id: 1 });

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it('creates the user, hashes the password and returns user + token', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.create.mockResolvedValue({
        id: 1,
        username: 'ana',
        email: 'ana@test.com',
        role: 'USER',
      });

      const result = await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          username: 'ana',
          email: 'ana@test.com',
          passwordHash: 'hashed-password',
        },
      });
      expect(result).toEqual({
        user: {
          id: 1,
          username: 'ana',
          email: 'ana@test.com',
          role: 'USER',
        },
        token: 'signed-jwt',
      });
    });

    it('throws InternalServerErrorException if prisma.user.create fails', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.create.mockRejectedValue(new Error('db down'));

      await expect(service.register(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('login', () => {
    const dto = { email: 'ana@test.com', password: 'Password123' };
    const storedUser = {
      id: 1,
      username: 'ana',
      email: 'ana@test.com',
      role: 'USER',
      passwordHash: 'hashed-password',
      isActive: true,
    };

    it('throws UnauthorizedException with a generic message if the email does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const error = await service.login(dto).catch((e: unknown) => e as Error);
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toBe('Credenciales inválidas');
    });

    it('throws the same generic message if the password is wrong', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(storedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const error = await service.login(dto).catch((e: unknown) => e as Error);
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toBe('Credenciales inválidas');
    });

    it('throws UnauthorizedException if the user is inactive', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...storedUser,
        isActive: false,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(dto)).rejects.toThrow(
        new UnauthorizedException('Usuario inactivo'),
      );
    });

    it('throws InternalServerErrorException if jwtService.sign fails', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(storedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockImplementation(() => {
        throw new Error('sign failed');
      });

      await expect(service.login(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('returns user + token on valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(storedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(dto);

      expect(result).toEqual({
        user: {
          id: 1,
          username: 'ana',
          email: 'ana@test.com',
          role: 'USER',
        },
        token: 'signed-jwt',
      });
    });

    it('signs the token with the short expiry when rememberMe is not set', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(storedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login(dto);

      expect(mockJwtService.sign).toHaveBeenCalledWith(expect.anything(), {
        expiresIn: '1d',
      });
    });

    it('signs the token with the long expiry when rememberMe is true', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(storedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login({ ...dto, rememberMe: true });

      expect(mockJwtService.sign).toHaveBeenCalledWith(expect.anything(), {
        expiresIn: '30d',
      });
    });
  });
});
