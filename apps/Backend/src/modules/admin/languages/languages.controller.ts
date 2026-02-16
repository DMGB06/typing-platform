import {
  Controller,
  Post,
  Body,
  UseGuards,
  Put,
  Param,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto, UpdateLanguageDto } from './dto/languages.dto';
import { JwtAuthGuard } from '../../auth/guards/wt-auth.guard';
import { AdminGuard } from '../../../common/decorators/guards/admin.guard';

@Controller('admin/languages')
@UseGuards(JwtAuthGuard, AdminGuard)
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Post()
  async create(@Body() createLanguageDto: CreateLanguageDto) {
    return this.languagesService.create(createLanguageDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ) {
    return this.languagesService.update(id, updateLanguageDto);
  }

  @Put(':id/desactivate')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.languagesService.delete(id);
  }

  @Get()
  async findAll() {
    return this.languagesService.getAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.languagesService.getById(id);
  }
}
