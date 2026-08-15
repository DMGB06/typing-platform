import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  // GET /leaderboard/difficulty/:difficultyId
  @Get('difficulty/:difficultyId')
  async getByDifficulty(
    @Param('difficultyId', ParseIntPipe) difficultyId: number,
  ) {
    return this.leaderboardService.getByDifficulty(difficultyId);
  }
}
