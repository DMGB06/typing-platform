import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../Prisma/prisma.service';

import {
  CreateDifficultyDto,
  UpdateDifficultyDto,
  PaginationDto,
} from './dto/difficulties.dto';

@Injectable()
export class DifficultiesAdminService {
  constructor(private prisma: PrismaService) {}

  private normalizeString(str: string): string {
    return str
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  // Crear dificultad
  async createDifficulty(createDifficultyDto: CreateDifficultyDto) {
    const normalizedName = this.normalizeString(createDifficultyDto.name);

    const [nameExists, orderIndexExists] = await Promise.all([
      this.prisma.difficulty.findUnique({
        where: { name: normalizedName },
      }),
      this.prisma.difficulty.findFirst({
        where: { orderIndex: createDifficultyDto.orderIndex },
      }),
    ]);

    if (nameExists) {
      throw new ConflictException('Dificultad con ese nombre ya existe');
    }

    if (orderIndexExists) {
      throw new ConflictException('Dificultad con ese orderIndex ya existe');
    }

    const difficulty = await this.prisma.difficulty.create({
      data: {
        name: normalizedName,
        description: createDifficultyDto.description || null,
        orderIndex: createDifficultyDto.orderIndex,
      },
    });

    return {
      id: difficulty.id,
      name: difficulty.name,
      description: difficulty.description,
      orderIndex: difficulty.orderIndex,
    };
  }

  // Actualizar dificultad
  async updateDifficulty(id: number, updateDifficultyDto: UpdateDifficultyDto) {
    // Verificar que la dificultad existe
    const existingDifficulty = await this.prisma.difficulty.findUnique({
      where: { id },
    });

    if (!existingDifficulty) {
      throw new NotFoundException('Dificultad no encontrada');
    }

    // Validar nombre si se proporciona
    if (updateDifficultyDto.name) {
      const normalizedName = this.normalizeString(updateDifficultyDto.name);
      const nameExists = await this.prisma.difficulty.findFirst({
        where: {
          name: normalizedName,
          id: { not: id },
        },
      });

      if (nameExists) {
        throw new ConflictException('Dificultad con ese nombre ya existe');
      }
    }

    // Validar orderIndex si se proporciona
    if (updateDifficultyDto.orderIndex !== undefined) {
      const orderIndexExists = await this.prisma.difficulty.findFirst({
        where: {
          orderIndex: updateDifficultyDto.orderIndex,
          id: { not: id },
        },
      });

      if (orderIndexExists) {
        throw new ConflictException('Dificultad con ese orderIndex ya existe');
      }
    }

    const updateData: Partial<{
      name: string;
      description: string | null;
      orderIndex: number;
      isActive: boolean;
    }> = {};

    if (updateDifficultyDto.name) {
      updateData.name = this.normalizeString(updateDifficultyDto.name);
    }

    if (updateDifficultyDto.description !== undefined) {
      updateData.description = updateDifficultyDto.description;
    }

    if (updateDifficultyDto.orderIndex !== undefined) {
      updateData.orderIndex = updateDifficultyDto.orderIndex;
    }

    if (updateDifficultyDto.isActive !== undefined) {
      updateData.isActive = updateDifficultyDto.isActive;
    }

    const difficulty = await this.prisma.difficulty.update({
      where: { id },
      data: updateData,
    });

    return {
      id: difficulty.id,
      name: difficulty.name,
      description: difficulty.description,
      orderIndex: difficulty.orderIndex,
      isActive: difficulty.isActive,
    };
  }

  // Desactivar dificultad (soft delete)
  async deleteDifficulty(id: number) {
    const difficulty = await this.prisma.difficulty.findUnique({
      where: { id },
    });

    if (!difficulty) {
      throw new NotFoundException('Dificultad no encontrada');
    }

    const deletedDifficulty = await this.prisma.difficulty.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      id: deletedDifficulty.id,
      name: deletedDifficulty.name,
      description: deletedDifficulty.description,
      isActive: deletedDifficulty.isActive,
    };
  }

  // Obtener una dificultad por ID
  async getDifficultyById(id: number) {
    const difficulty = await this.prisma.difficulty.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        orderIndex: true,
        isActive: true,
      },
    });

    if (!difficulty) {
      throw new NotFoundException('Dificultad no encontrada');
    }

    return difficulty;
  }

  // Obtener dificultades con paginación
  async getDifficulties(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.difficulty.findMany({
        skip,
        take: limit,
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          orderIndex: true,
          isActive: true,
        },
      }),
      this.prisma.difficulty.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}
