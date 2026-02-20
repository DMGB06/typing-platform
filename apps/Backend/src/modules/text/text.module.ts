import { Module } from '@nestjs/common';
import { TextService } from './text.service';
import { TextController } from './text.controller';

@Module({
  controllers: [TextController],
  providers: [TextService],
  exports: [TextService],
})
export class TextModule {}
