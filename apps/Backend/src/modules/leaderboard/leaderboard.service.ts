import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../Prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getByDifficulty(difficultyId: number): Promise<
    Array<{
      username: string;
      bestWpm: number;
      avgAccuracy: number;
      totalSessions: number;
    }>
  > {
    const difficulty = await this.prisma.difficulty.findFirst({
      where: { id: difficultyId, isActive: true },
    });
    if (!difficulty) {
      throw new NotFoundException(`Dificultad ${difficultyId} no encontrada`);
    }

    const stats = await this.prisma.userStatsByDifficulty.findMany({
      where: { difficultyId, user: { isActive: true } },
      orderBy: [{ bestWpm: 'desc' }, { avgAccuracy: 'desc' }],
      take: 10,
      select: {
        bestWpm: true,
        avgAccuracy: true,
        totalSessions: true,
        user: { select: { username: true } },
      },
    });

    return stats.map((s) => ({
      username: s.user.username,
      bestWpm: s.bestWpm,
      avgAccuracy: s.avgAccuracy,
      totalSessions: s.totalSessions,
    }));
  }
}
