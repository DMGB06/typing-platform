import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../Prisma/prisma.service';

export interface LeaderboardEntry {
  username: string;
  bestWpm: number;
  avgAccuracy: number;
  totalSessions: number;
}

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getByDifficulty(difficultyId: number) {
    const difficulty = await this.prisma.difficulty.findFirst({
      where: { id: difficultyId, isActive: true },
    });
    if (!difficulty) {
      throw new NotFoundException(`Dificultad ${difficultyId} no encontrada`);
    }

    return this.prisma.$queryRaw<LeaderboardEntry[]>`
      SELECT u.username, MAX(s.wpm) AS "bestWpm", AVG(s.accuracy) AS "avgAccuracy",
             COUNT(*)::int AS "totalSessions"
      FROM typing_attempts a
      JOIN typing_sessions s ON s.attempt_id = a.id
      JOIN users u ON u.id = a.user_id AND u.is_active
      WHERE a.difficulty_id = ${difficultyId} AND s.attempt_id IS NOT NULL
      GROUP BY u.id
      ORDER BY "bestWpm" DESC, "avgAccuracy" DESC, u.id ASC
      LIMIT 10
    `;
  }
}
