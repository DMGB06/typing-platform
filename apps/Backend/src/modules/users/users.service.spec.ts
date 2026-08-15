import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../Prisma/prisma.service';

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
});
