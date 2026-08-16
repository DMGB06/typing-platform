import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../Prisma/prisma.service';
import * as bycript from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;

  // Mock de PrismaService
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userStatsByDifficulty: {
      findMany: jest.fn(),
    },
    difficulty: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Puedes agregar más tests aquí cuando los necesites

  describe('getMyStats', () => {
    it('returns the stats mapped with the difficulty name', async () => {
      mockPrismaService.userStatsByDifficulty.findMany.mockResolvedValue([
        {
          difficultyId: 1,
          bestWpm: 65,
          avgWpm: 52,
          avgAccuracy: 96.4,
          totalSessions: 12,
          avgErrorRate: 3.1,
          difficulty: { id: 1, name: 'Fácil' },
        },
      ]);

      const result = await service.getMyStats(1);

      expect(
        mockPrismaService.userStatsByDifficulty.findMany,
      ).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { difficulty: true },
        orderBy: { difficulty: { orderIndex: 'asc' } },
      });
      expect(result).toEqual([
        {
          difficultyId: 1,
          difficultyName: 'Fácil',
          bestWpm: 65,
          avgWpm: 52,
          avgAccuracy: 96.4,
          totalSessions: 12,
          avgErrorRate: 3.1,
        },
      ]);
    });

    it('returns an empty array when the user has no stats yet', async () => {
      mockPrismaService.userStatsByDifficulty.findMany.mockResolvedValue([]);

      const result = await service.getMyStats(1);

      expect(result).toEqual([]);
    });
  });

  describe('getMyPreferences', () => {
    it('returns null when the user has no saved preference', async () => {
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue({
        defaultDifficultyId: null,
      });

      const result = await service.getMyPreferences(1);

      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { defaultDifficultyId: true },
      });
      expect(result).toEqual({ defaultDifficultyId: null });
    });

    it('returns the saved defaultDifficultyId', async () => {
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue({
        defaultDifficultyId: 2,
      });

      const result = await service.getMyPreferences(1);

      expect(result).toEqual({ defaultDifficultyId: 2 });
    });
  });

  describe('updateMyPreferences', () => {
    it('throws NotFoundException if the difficulty does not exist or is inactive', async () => {
      mockPrismaService.difficulty.findFirst.mockResolvedValue(null);

      await expect(service.updateMyPreferences(1, 999)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('saves a valid, active difficulty as the default', async () => {
      mockPrismaService.difficulty.findFirst.mockResolvedValue({
        id: 2,
        name: 'Intermedio',
        isActive: true,
      });
      mockPrismaService.user.update.mockResolvedValue({
        defaultDifficultyId: 2,
      });

      const result = await service.updateMyPreferences(1, 2);

      expect(mockPrismaService.difficulty.findFirst).toHaveBeenCalledWith({
        where: { id: 2, isActive: true },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { defaultDifficultyId: 2 },
        select: { defaultDifficultyId: true },
      });
      expect(result).toEqual({ defaultDifficultyId: 2 });
    });
  });

  describe('updateUser', () => {
    const currentUser = {
      id: 1,
      email: 'ana@test.com',
      username: 'ana',
      role: 'USER',
    } as const;

    it('updates only the username without a false duplicate conflict when email is not provided', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue({
        username: 'nuevo_nombre',
        email: 'ana@test.com',
        role: 'USER',
        isActive: true,
      });

      const result = await service.updateUser(1, currentUser, {
        username: 'nuevo_nombre',
      });

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ username: 'nuevo_nombre' }], NOT: { id: 1 } },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { username: 'nuevo_nombre' },
      });
      expect(result).toEqual({
        username: 'nuevo_nombre',
        email: 'ana@test.com',
        role: 'USER',
        isActive: true,
      });
    });

    it('updates only the email without a false duplicate conflict when username is not provided', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue({
        username: 'ana',
        email: 'nuevo@test.com',
        role: 'USER',
        isActive: true,
      });

      await service.updateUser(1, currentUser, { email: 'nuevo@test.com' });

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ email: 'nuevo@test.com' }], NOT: { id: 1 } },
      });
    });

    it('throws ConflictException when the username is already taken by another user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 2,
        username: 'tomado',
      });

      await expect(
        service.updateUser(1, currentUser, { username: 'tomado' }),
      ).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateUser(1, currentUser, { username: 'nuevo_nombre' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when currentUser.id does not match the target id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 5 });

      await expect(
        service.updateUser(5, currentUser, { username: 'nuevo_nombre' }),
      ).rejects.toThrow('No tienes permiso para actualizar este usuario');
    });
  });

  describe('updateMyPassword', () => {
    it('rejects with the wrong current password and writes nothing', async () => {
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        passwordHash: await bycript.hash('correcta123', 10),
      });

      await expect(
        service.updateMyPassword(1, 'incorrecta', 'nueva123'),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('hashes and saves the new password when the current one is correct', async () => {
      const currentHash = await bycript.hash('correcta123', 10);
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        passwordHash: currentHash,
      });
      mockPrismaService.user.update.mockResolvedValue({ id: 1 });

      const result = await service.updateMyPassword(
        1,
        'correcta123',
        'nueva123',
      );

      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(1);
      const updateCall = (
        mockPrismaService.user.update.mock.calls as unknown[][]
      )[0]?.[0] as {
        where: { id: number };
        data: { passwordHash: string };
      };
      expect(updateCall.where).toEqual({ id: 1 });
      expect(updateCall.data.passwordHash).not.toBe(currentHash);
      expect(
        await bycript.compare('nueva123', updateCall.data.passwordHash),
      ).toBe(true);
      expect(result).toEqual({ success: true });
    });
  });

  describe('deactivateMyAccount', () => {
    it('sets isActive to false for the given user id only', async () => {
      mockPrismaService.user.update.mockResolvedValue({
        username: 'ana',
        isActive: false,
      });

      const result = await service.deactivateMyAccount(1);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
      expect(result).toEqual({ username: 'ana', isActive: false });
    });
  });
});
