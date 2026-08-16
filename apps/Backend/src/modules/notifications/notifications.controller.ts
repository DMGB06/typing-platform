import { Controller, Get, Put, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/wt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // GET /notifications/me
  @Get('me')
  getMyNotifications(@CurrentUser('id') userId: number) {
    return this.notificationsService.getMyNotifications(userId);
  }

  // GET /notifications/me/unread-count
  @Get('me/unread-count')
  getUnreadCount(@CurrentUser('id') userId: number) {
    return this.notificationsService.getUnreadCount(userId);
  }

  // PUT /notifications/me/read-all
  @Put('me/read-all')
  markAllAsRead(@CurrentUser('id') userId: number) {
    return this.notificationsService.markAllAsRead(userId);
  }
}
