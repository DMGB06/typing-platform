import { TextModule as PublicTextModule } from '../../text/text.module';
import { Module } from '@nestjs/common';
import { TextService } from './text.service';
import { TextController } from './text.controller';

@Module({
  imports: [PublicTextModule],
  controllers: [TextController],
  providers: [TextService],
})
export class TextModule {}
