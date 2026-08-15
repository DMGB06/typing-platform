import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { PrismaService } from '../../Prisma/prisma.service';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockDifficulty = {
  id: 2,
  name: 'Intermedio',
  description: null,
  orderIndex: 2,
  isActive: true,
  createdAt: new Date(),
};

const mockStats = [
  {
    bestWpm: 87,
    avgAccuracy: 96.2,
    totalSessions: 14,
    user: { username: 'ana' },
  },
  {
    bestWpm: 72,
    avgAccuracy: 91.5,
    totalSessions: 8,
    user: { username: 'luis' },
  },
];

// ─── Mock PrismaService ───────────────────────────────────────────────────────

const prismaMock = {
  difficulty: {
    findUnique: jest.fn(),
  },
  userStatsByDifficulty: {
    findMany: jest.fn(),
  },
};

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('LeaderboardService', () => {
  let service: LeaderboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<LeaderboardService>(LeaderboardService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getByDifficulty()', () => {
    it('lanza NotFoundException si la dificultad no existe', async () => {
      prismaMock.difficulty.findUnique.mockResolvedValue(null);

      await expect(service.getByDifficulty(999)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        prismaMock.userStatsByDifficulty.findMany,
      ).not.toHaveBeenCalled();
    });

    it('consulta userStatsByDifficulty ordenado por bestWpm desc, top 10', async () => {
      prismaMock.difficulty.findUnique.mockResolvedValue(mockDifficulty);
      prismaMock.userStatsByDifficulty.findMany.mockResolvedValue(mockStats);

      await service.getByDifficulty(2);

      expect(prismaMock.userStatsByDifficulty.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { difficultyId: 2 },
          orderBy: { bestWpm: 'desc' },
          take: 10,
        }),
      );
    });

    it('devuelve el ranking mapeado sin exponer email', async () => {
      prismaMock.difficulty.findUnique.mockResolvedValue(mockDifficulty);
      prismaMock.userStatsByDifficulty.findMany.mockResolvedValue(mockStats);

      const result = await service.getByDifficulty(2);

      expect(result).toEqual([
        { username: 'ana', bestWpm: 87, avgAccuracy: 96.2, totalSessions: 14 },
        { username: 'luis', bestWpm: 72, avgAccuracy: 91.5, totalSessions: 8 },
      ]);
    });

    it('devuelve un array vacío si nadie completó sesiones en esa dificultad', async () => {
      prismaMock.difficulty.findUnique.mockResolvedValue(mockDifficulty);
      prismaMock.userStatsByDifficulty.findMany.mockResolvedValue([]);

      const result = await service.getByDifficulty(2);

      expect(result).toEqual([]);
    });
  });
});
