import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TextService } from './text.service';
import {
  CreateTextDto,
  UpdateTextDto,
  FilterTextDto,
  PaginationTextDto,
} from './dto/text.dto';
import type { Request } from 'express';
import { CurrentUser } from '../../../types/user.types';
import { JwtAuthGuard } from '../../auth/guards/wt-auth.guard';
import { AdminGuard } from '../../../common/decorators/guards/admin.guard';

@Controller('admin/text')
@UseGuards(JwtAuthGuard, AdminGuard)
export class TextController {
  constructor(private readonly textService: TextService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createText(
    @Body() createTextDto: CreateTextDto,
    @Param() req: Request,
  ) {
    const currentUser = req.user as CurrentUser;
    return this.textService.createText(createTextDto, currentUser.id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateText(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTextDto: UpdateTextDto,
  ) {
    return this.textService.updateText(id, updateTextDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteText(@Param('id', ParseIntPipe) id: number) {
    return this.textService.deleteText(id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getTextById(@Param('id', ParseIntPipe) id: number) {
    return this.textService.getTextById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllTexts(@Query() paginationDto: PaginationTextDto) {
    return this.textService.getAllTexts(paginationDto);
  }

  @Get('filter/search')
  @HttpCode(HttpStatus.OK)
  async getByFilters(
    @Query() filterTextDto: FilterTextDto,
    @Query() paginationDto: PaginationTextDto,
  ) {
    return this.textService.getByFilters(filterTextDto, paginationDto);
  }
}
