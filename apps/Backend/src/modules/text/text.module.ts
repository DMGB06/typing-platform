import { Module } from '@nestjs/common';
import { TextService } from './text.service';
import { TextController } from './text.controller';
import { CatalogsController } from './catalogs.controller';

@Module({
  controllers: [TextController, CatalogsController],
  providers: [TextService],
  exports: [TextService],
})
export class TextModule {}
