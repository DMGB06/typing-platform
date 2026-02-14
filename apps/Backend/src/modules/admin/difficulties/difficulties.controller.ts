import {
  Controller,
  Post,
  UseGuards,
  Body,
  Put,
  Param,
  Query,
  Get,
} from '@nestjs/common';
import { DifficultiesAdminService } from './difficulties.service';
import {
  CreateDifficultyDto,
  UpdateDifficultyDto,
  PaginationDto,
} from './dto/difficulties.dto';
import { JwtAuthGuard } from '../../auth/guards/wt-auth.guard';
import { AdminGuard } from '../../../common/decorators/guards/admin.guard';

@Controller('admin/difficulties')
@UseGuards(JwtAuthGuard, AdminGuard)
export class DifficultiesController {
  constructor(private readonly difficultiesService: DifficultiesAdminService) {}

  @Post()
  //Solo administradores pueden crear dificultades
  async createDifficulty(@Body() createDifficultyDto: CreateDifficultyDto) {
    return this.difficultiesService.createDifficulty(createDifficultyDto);
  }

  @Put(':id') //Solo administradores pueden actualizar dificultades
  async updateDifficulty(
    @Param('id') id: string,
    @Body() updateDifficultyDto: UpdateDifficultyDto,
  ) {
    return this.difficultiesService.updateDifficulty(
      Number(id),
      updateDifficultyDto,
    );
  }

  @Get()
  async getDifficulties(@Query() paginationDto: PaginationDto) {
    return this.difficultiesService.getDifficulties(paginationDto);
  }

  @Get(':id')
  async getDifficultyById(@Param('id') id: string) {
    return this.difficultiesService.getDifficultyById(Number(id));
  }
}
