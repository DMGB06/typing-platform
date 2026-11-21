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
    username: 'ana',
  },
  {
    bestWpm: 72,
    avgAccuracy: 91.5,
    totalSessions: 8,
    username: 'luis',
  },
];

// ─── Mock PrismaService ───────────────────────────────────────────────────────

const prismaMock = {
  difficulty: {
    findFirst: jest.fn(),
  },
  $queryRaw: jest.fn(),
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
      prismaMock.difficulty.findFirst.mockResolvedValue(null);

      await expect(service.getByDifficulty(999)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.$queryRaw).not.toHaveBeenCalled();
    });

    it('devuelve el ranking mapeado sin exponer email', async () => {
      prismaMock.difficulty.findFirst.mockResolvedValue(mockDifficulty);
      prismaMock.$queryRaw.mockResolvedValue(mockStats);

      const result = await service.getByDifficulty(2);

      expect(result).toEqual([
        { username: 'ana', bestWpm: 87, avgAccuracy: 96.2, totalSessions: 14 },
        { username: 'luis', bestWpm: 72, avgAccuracy: 91.5, totalSessions: 8 },
      ]);
    });

    it('devuelve un array vacío si nadie completó sesiones en esa dificultad', async () => {
      prismaMock.difficulty.findFirst.mockResolvedValue(mockDifficulty);
      prismaMock.$queryRaw.mockResolvedValue([]);

      const result = await service.getByDifficulty(2);

      expect(result).toEqual([]);
    });
  });
});
