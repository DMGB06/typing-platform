import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../Prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getMyNotifications(userId: number): Promise<
    Array<{
      id: number;
      difficultyId: number;
      difficultyName: string;
      wpm: number;
      isRead: boolean;
      createdAt: Date;
    }>
  > {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      include: { difficulty: true },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return notifications.map((n) => ({
      id: n.id,
      difficultyId: n.difficultyId,
      difficultyName: n.difficulty.name,
      wpm: n.wpm,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));
  }

  async getUnreadCount(userId: number): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAllAsRead(userId: number): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { count: result.count };
  }

  async createPersonalBestNotification(
    userId: number,
    difficultyId: number,
    wpm: number,
  ): Promise<void> {
    await this.prisma.notification.create({
      data: { userId, difficultyId, wpm },
    });
  }
}
