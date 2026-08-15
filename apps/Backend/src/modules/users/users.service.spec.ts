import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../Prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  // Mock de PrismaService
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userStatsByDifficulty: {
      findMany: jest.fn(),
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
});
