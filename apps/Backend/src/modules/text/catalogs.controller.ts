import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../Prisma/prisma.service';
import { getDifficulties, getLanguages, getTextTypes } from './public-catalogs';

/**
 * Controlador público de catálogos.
 * Expone dificultades, tipos de texto e idiomas
 * sin autenticación, para que el frontend pueda
 * poblar sus filtros dinámicamente.
 *
 * Rutas:
 *   GET /catalogs/difficulties  → Todas las dificultades activas
 *   GET /catalogs/text-types    → Todos los tipos de texto activos
 *   GET /catalogs/languages     → Todos los idiomas activos
 */
@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('difficulties')
  async getDifficulties() {
    return getDifficulties(this.prisma);
  }

  @Get('text-types')
  async getTextTypes() {
    return getTextTypes(this.prisma);
  }

  @Get('languages')
  async getLanguages() {
    return getLanguages(this.prisma);
  }
}
