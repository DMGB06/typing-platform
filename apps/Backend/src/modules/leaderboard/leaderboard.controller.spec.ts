import { Test, TestingModule } from '@nestjs/testing';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';

describe('LeaderboardController', () => {
  let controller: LeaderboardController;

  const mockLeaderboardService = {
    getByDifficulty: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaderboardController],
      providers: [
        { provide: LeaderboardService, useValue: mockLeaderboardService },
      ],
    }).compile();

    controller = module.get<LeaderboardController>(LeaderboardController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getByDifficulty', () => {
    it('delega en LeaderboardService.getByDifficulty con el id parseado', async () => {
      const ranking = [
        { username: 'ana', bestWpm: 87, avgAccuracy: 96.2, totalSessions: 14 },
      ];
      mockLeaderboardService.getByDifficulty.mockResolvedValue(ranking);

      const result = await controller.getByDifficulty(2);

      expect(mockLeaderboardService.getByDifficulty).toHaveBeenCalledWith(2);
      expect(result).toEqual(ranking);
    });
  });
});
