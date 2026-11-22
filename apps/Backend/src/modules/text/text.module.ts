import { Module } from '@nestjs/common';
import { TextService } from './text.service';
import { TextController } from './text.controller';
import { CatalogsController } from './catalogs.controller';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';

@Module({
  controllers: [TextController, CatalogsController, PracticeController],
  providers: [TextService, PracticeService],
  exports: [TextService],
})
export class TextModule {}
