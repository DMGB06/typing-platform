import { Module } from '@nestjs/common';
import { TypingSessionsService } from './typing-sessions.service';
import { TypingSessionsController } from './typing-sessions.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [TypingSessionsController],
  providers: [TypingSessionsService],
  exports: [TypingSessionsService],
})
export class TypingSessionsModule {}
