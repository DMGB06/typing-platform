import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../Prisma/prisma.service';

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
    return this.prisma.difficulty.findMany({
      where: { isActive: true },
      select: { id: true, name: true, description: true, orderIndex: true },
      orderBy: { orderIndex: 'asc' },
    });
  }

  @Get('text-types')
  async getTextTypes() {
    return this.prisma.textType.findMany({
      where: { isActive: true },
      select: { id: true, name: true, description: true },
      orderBy: { id: 'asc' },
    });
  }

  @Get('languages')
  async getLanguages() {
    return this.prisma.language.findMany({
      where: { isActive: true },
      select: { id: true, code: true, name: true },
      orderBy: { id: 'asc' },
    });
  }
}
