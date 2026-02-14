import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../Prisma/prisma.service';

import {
  CreateDifficultyDto,
  UpdateDifficultyDto,
  PaginationDto,
} from './dto/difficulties.dto';

@Injectable()
export class DifficultiesAdminService {
  constructor(private prisma: PrismaService) {}

  //Catalogos
  //Dificultades
  //Crear dificultad
  async createDifficulty(createDifficultyDto: CreateDifficultyDto) {
    const nameExists = await this.prisma.difficulty.findUnique({
      where: {
        name: createDifficultyDto.name
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''),
      },
    });

    if (nameExists) {
      throw new ConflictException('Dificultad con ese nombre ya existe');
    }

    //Verificar que el orderIndex no exista
    const orderIndexExists = await this.prisma.difficulty.findFirst({
      where: { orderIndex: createDifficultyDto.orderIndex },
    });

    if (orderIndexExists) {
      throw new ConflictException('Dificultad con ese orderIndex ya existe');
    }

    try {
      const difficulty = await this.prisma.difficulty.create({
        data: {
          name: createDifficultyDto.name
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''),
          description: createDifficultyDto.description || null,
        },
      });

      return {
        id: difficulty.id,
        name: difficulty.name,
        description: difficulty.description,
      };
    } catch (error) {
      console.error('Error al crear dificultad:', error);
      throw new Error('Error al crear dificultad');
    }
  }

  //Actualizar dificultad
  async updateDifficulty(id: number, updateDifficultyDto: UpdateDifficultyDto) {
    const userNameExist = await this.prisma.difficulty.findFirst({
      where: {
        name: updateDifficultyDto.name
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''),
        NOT: { id: id },
      },
    });

    if (userNameExist) {
      throw new ConflictException('Dificultad con ese nombre ya existe');
    }

    //Verificar que el orderIndex no exista
    const orderIndexExists = await this.prisma.difficulty.findFirst({
      where: {
        orderIndex: updateDifficultyDto.orderIndex,
        NOT: { id: id },
      },
    });

    if (orderIndexExists) {
      throw new ConflictException('Dificultad con ese orderIndex ya existe');
    }

    const updateDifficultyData: Record<string, unknown> = {
      ...(updateDifficultyDto.name && {
        name: updateDifficultyDto.name
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''),
      }),
      ...(updateDifficultyDto.description !== undefined && {
        description: updateDifficultyDto.description,
      }),
      ...(updateDifficultyDto.orderIndex !== undefined && {
        orderIndex: updateDifficultyDto.orderIndex,
      }),
      ...(updateDifficultyDto.isActive !== undefined && {
        isActive: updateDifficultyDto.isActive,
      }),
    };

    try {
      const difficulty = await this.prisma.difficulty.update({
        where: { id },
        data: updateDifficultyData,
      });

      return {
        id: difficulty.id,
        name: difficulty.name,
        description: difficulty.description,
      };
    } catch (error) {
      console.error('Error al actualizar dificultad:', error);
      throw new Error('Error al actualizar dificultad');
    }
  }

  //Actualizar dificultad isActive (activar/desactivar)

  async deleteDifficulty(id: number) {
    try {
      const difficulty = await this.prisma.difficulty.findUnique({
        where: { id },
      });

      if (!difficulty) {
        throw new ConflictException('Dificultad no encontrada');
      }

      const deletedDifficulty = await this.prisma.difficulty.update({
        where: { id },
        data: {
          isActive: false,
        },
      });

      return {
        id: deletedDifficulty.id,
        name: deletedDifficulty.name,
        description: deletedDifficulty.description,
        isActive: deletedDifficulty.isActive,
      };
    } catch (error) {
      console.error('Error al eliminar dificultad:', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('Error al eliminar dificultad');
    }
  }

  //Obtner una dificultad por ID
  async getDifficultyById(id: number) {
    try {
      const difficulty = await this.prisma.difficulty.findUnique({
        where: { id },
      });

      if (!difficulty) {
        throw new ConflictException('Dificultad no encontrada');
      }

      return {
        id: difficulty.id,
        name: difficulty.name,
        description: difficulty.description,
        isActive: difficulty.isActive,
      };
    } catch (error) {
      console.error('Error al obtener dificultad por ID:', error);
      throw error;
    }
  }

  async getDifficulties(paginationDto: PaginationDto) {
    try {
      const { page, limit } = paginationDto;
      const skip = (page - 1) * limit;

      // Obtener las dificultades con paginación
      const [data, total] = await Promise.all([
        this.prisma.difficulty.findMany({
          skip,
          take: limit,
          orderBy: { orderIndex: 'asc' }, // Ordenar por el índice de orden
        }),
        this.prisma.difficulty.count(), // Contar el total de registros
      ]);

      // Retornar los datos con información de paginación
      return {
        data,
        total,
        page,
        lastPage: Math.ceil(total / limit), // Calcular la última página
      };
    } catch (error) {
      console.error('Error al obtener dificultades:', error);
      throw new Error('Error al obtener dificultades');
    }
  }
}
