import { Module } from '@nestjs/common';
import { DifficultiesModule } from './difficulties/difficulties.module';
import { LanguagesModule } from './languages/languages.module';
import { TextModule } from './text/text.module';

@Module({
  controllers: [],
  providers: [],
  imports: [DifficultiesModule, LanguagesModule, TextModule],
})
export class AdminModule {}
