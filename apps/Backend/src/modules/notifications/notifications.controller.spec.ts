import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockNotificationsService = {
    getMyNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    markAllAsRead: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyNotifications', () => {
    it('delegates to the service with the authenticated user id', async () => {
      mockNotificationsService.getMyNotifications.mockResolvedValue([]);

      const result = await controller.getMyNotifications(1);

      expect(mockNotificationsService.getMyNotifications).toHaveBeenCalledWith(
        1,
      );
      expect(result).toEqual([]);
    });
  });

  describe('getUnreadCount', () => {
    it('delegates to the service with the authenticated user id', async () => {
      mockNotificationsService.getUnreadCount.mockResolvedValue({ count: 3 });

      const result = await controller.getUnreadCount(1);

      expect(mockNotificationsService.getUnreadCount).toHaveBeenCalledWith(1);
      expect(result).toEqual({ count: 3 });
    });
  });

  describe('markAllAsRead', () => {
    it('delegates to the service with the authenticated user id', async () => {
      mockNotificationsService.markAllAsRead.mockResolvedValue({ count: 2 });

      const result = await controller.markAllAsRead(1);

      expect(mockNotificationsService.markAllAsRead).toHaveBeenCalledWith(1);
      expect(result).toEqual({ count: 2 });
    });
  });
});
