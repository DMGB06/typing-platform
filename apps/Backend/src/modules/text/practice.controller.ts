import { Controller, Get, Header } from '@nestjs/common';
import { PracticeService } from './practice.service';

@Controller('practice')
export class PracticeController {
  constructor(private readonly practice: PracticeService) {}

  @Get('bootstrap')
  @Header('Cache-Control', 'no-store')
  getBootstrap() {
    return this.practice.getBootstrap();
  }
}
