import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../Prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockPrismaService = {
    notification: {
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMyNotifications', () => {
    it('returns the latest 30 notifications with the difficulty name', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([
        {
          id: 1,
          difficultyId: 2,
          wpm: 65,
          isRead: false,
          createdAt: new Date('2026-08-15T10:00:00Z'),
          difficulty: { name: 'Intermedio' },
        },
      ]);

      const result = await service.getMyNotifications(1);

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { difficulty: true },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });
      expect(result).toEqual([
        {
          id: 1,
          difficultyId: 2,
          difficultyName: 'Intermedio',
          wpm: 65,
          isRead: false,
          createdAt: new Date('2026-08-15T10:00:00Z'),
        },
      ]);
    });
  });

  describe('getUnreadCount', () => {
    it('counts only unread notifications for the given user', async () => {
      mockPrismaService.notification.count.mockResolvedValue(3);

      const result = await service.getUnreadCount(1);

      expect(mockPrismaService.notification.count).toHaveBeenCalledWith({
        where: { userId: 1, isRead: false },
      });
      expect(result).toEqual({ count: 3 });
    });
  });

  describe('markAllAsRead', () => {
    it('marks all unread notifications as read for the given user', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.markAllAsRead(1);

      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 1, isRead: false },
        data: { isRead: true },
      });
      expect(result).toEqual({ count: 2 });
    });
  });

  describe('createPersonalBestNotification', () => {
    it('creates a notification row with the given values', async () => {
      mockPrismaService.notification.create.mockResolvedValue({});

      await service.createPersonalBestNotification(1, 2, 70);

      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: { userId: 1, difficultyId: 2, wpm: 70 },
      });
    });
  });
});
