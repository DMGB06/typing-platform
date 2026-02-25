import { Module } from '@nestjs/common';
import { TypingSessionsService } from './typing-sessions.service';
import { TypingSessionsController } from './typing-sessions.controller';

@Module({
  controllers: [TypingSessionsController],
  providers: [TypingSessionsService],
  exports: [TypingSessionsService],
})
export class TypingSessionsModule {}
