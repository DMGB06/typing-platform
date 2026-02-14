import { Module } from '@nestjs/common';
import { DifficultiesModule } from './difficulties/difficulties.module';
import { LanguagesModule } from './languages/languages.module';

@Module({
  controllers: [],
  providers: [],
  imports: [DifficultiesModule, LanguagesModule],
})
export class AdminModule {}
