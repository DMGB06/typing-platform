import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TextService } from './text.service';
import { TextPaginationDto } from './dto/text.dto';
import { TextFilterDto } from './dto/text-filter.dto';

/**
 * Controlador público de textos.
 * Expone los endpoints para que cualquier usuario pueda
 * explorar, filtrar y obtener textos para practicar.
 *
 * Rutas:
 *   GET /texts              → Listar textos paginados con filtros
 *   GET /texts/random       → Texto aleatorio (con filtros opcionales)
 *   GET /texts/:id          → Texto específico por ID
 *   GET /texts/:id/stats    → Top 10 sesiones de ese texto
 */
@Controller('texts')
export class TextController {
  constructor(private readonly textService: TextService) {}

  // GET /texts?page=1&limit=10&difficultyId=1&typeId=2&languageId=1
  @Get()
  listTexts(
    @Query() paginationDto: TextPaginationDto,
    @Query() filterDto: TextFilterDto,
  ) {
    return this.textService.listTexts(paginationDto, filterDto);
  }

  // GET /texts/random?difficultyId=1
  // IMPORTANTE: debe ir antes de /:id para que NestJS no trate "random" como un ID
  @Get('random')
  getRandomText(@Query() filterDto: TextFilterDto) {
    return this.textService.getRandomText(filterDto);
  }

  // GET /texts/:id
  @Get(':id')
  getTextById(@Param('id', ParseIntPipe) id: number) {
    return this.textService.getTextById(id);
  }

  // GET /texts/:id/stats
  @Get(':id/stats')
  getTextStats(@Param('id', ParseIntPipe) id: number) {
    return this.textService.getTextStats(id);
  }
}
