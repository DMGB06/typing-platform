import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../Prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateTextDto,
  UpdateTextDto,
  FilterTextDto,
  PaginationTextDto,
} from './dto/text.dto';

@Injectable()
export class TextService {
  private readonly logger = new Logger(TextService.name);

  constructor(private prisma: PrismaService) {}

  // ─── Helpers ─────────────────────────────
  private getPagination(paginationDto: PaginationTextDto) {
    const pageNumber = Math.max(1, paginationDto.page ?? 1);
    const pageSize = Math.max(1, paginationDto.limit ?? 10);
    return { pageNumber, pageSize, offset: (pageNumber - 1) * pageSize };
  }

  private buildPaginatedResponse<T>(
    items: T[],
    total: number,
    pageNumber: number,
    pageSize: number,
  ) {
    return {
      success: true,
      data: {
        items,
        meta: {
          totalItems: total,
          totalPages: Math.ceil(total / pageSize),
          currentPage: pageNumber,
          pageSize,
        },
      },
    };
  }

  private async validateRelatedIds(ids: {
    difficultyId?: number;
    typeId?: number;
    languageId?: number;
  }): Promise<void> {
    const { difficultyId, typeId, languageId } = ids;

    const [difficulty, type, language] = await Promise.all([
      difficultyId
        ? this.prisma.difficulty.findUnique({ where: { id: difficultyId } })
        : null,
      typeId
        ? this.prisma.textType.findUnique({ where: { id: typeId } })
        : null,
      languageId
        ? this.prisma.language.findUnique({ where: { id: languageId } })
        : null,
    ]);

    if (difficultyId && !difficulty)
      throw new NotFoundException(
        `La dificultad con ID ${difficultyId} no existe`,
      );
    if (typeId && !type)
      throw new NotFoundException(
        `El tipo de texto con ID ${typeId} no existe`,
      );
    if (languageId && !language)
      throw new NotFoundException(`El lenguaje con ID ${languageId} no existe`);
  }

  // ─── Métodos públicos ───────────────────────────────────────────────────────

  async createText(createTextDto: CreateTextDto, userId: number) {
    const existingText = await this.prisma.text.findFirst({
      where: { title: { mode: 'insensitive', equals: createTextDto.title } },
    });

    if (existingText) {
      throw new ConflictException('Ya existe un texto con este título');
    }

    await this.validateRelatedIds({
      difficultyId: createTextDto.difficultyId,
      typeId: createTextDto.typeId,
      languageId: createTextDto.languageId,
    });

    const newText = await this.prisma.text
      .create({
        data: {
          title: createTextDto.title,
          content: createTextDto.content,
          difficultyId: createTextDto.difficultyId,
          typeId: createTextDto.typeId,
          languageId: createTextDto.languageId,
          createdById: userId,
        },
        include: {
          difficulty: true,
          type: true,
          language: true,
          createdBy: { select: { id: true, username: true, email: true } },
        },
      })
      .catch((error) => {
        this.logger.error('Error al crear el texto', error);
        throw new BadRequestException(
          'Error al crear el texto. Por favor, intenta nuevamente.',
        );
      });

    return {
      success: true,
      message: 'Texto creado exitosamente',
      data: newText,
    };
  }

  async updateText(id: number, updateTextDto: UpdateTextDto) {
    const existingText = await this.prisma.text.findUnique({ where: { id } });

    if (!existingText) {
      throw new NotFoundException(`Texto con ID ${id} no encontrado`);
    }

    if (updateTextDto.title) {
      const duplicate = await this.prisma.text.findFirst({
        where: {
          title: { mode: 'insensitive', equals: updateTextDto.title },
          id: { not: id },
        },
      });
      if (duplicate)
        throw new ConflictException('Ya existe un texto con este título');
    }

    // Valida solo los IDs que realmente vienen en el DTO
    await this.validateRelatedIds({
      difficultyId: updateTextDto.difficultyId,
      typeId: updateTextDto.typeId,
      languageId: updateTextDto.languageId,
    });

    const updatedText = await this.prisma.text
      .update({
        where: { id },
        data: { ...updateTextDto },
        include: {
          difficulty: true,
          type: true,
          language: true,
          createdBy: { select: { id: true, username: true, email: true } },
        },
      })
      .catch((error) => {
        this.logger.error('Error al actualizar el texto', error);
        throw new BadRequestException(
          'Error al actualizar el texto. Por favor, intenta nuevamente.',
        );
      });

    return {
      success: true,
      message: 'Texto actualizado exitosamente',
      data: updatedText,
    };
  }

  async deleteText(id: number) {
    const existingText = await this.prisma.text.findUnique({ where: { id } });

    if (!existingText) {
      throw new NotFoundException(`Texto con ID ${id} no encontrado`);
    }

    await this.prisma.text
      .update({
        where: { id },
        data: { isActive: false },
      })
      .catch((error) => {
        this.logger.error('Error al eliminar el texto', error);
        throw new BadRequestException(
          'Error al eliminar el texto. Por favor, intenta nuevamente.',
        );
      });

    return { success: true, message: 'Texto eliminado exitosamente' };
  }

  async getTextById(id: number) {
    // Sin try/catch aquí: el NotFoundException debe propagarse tal cual (HTTP 404)
    const text = await this.prisma.text.findUnique({
      where: { id, isActive: true },
      include: {
        difficulty: true,
        type: true,
        language: true,
        createdBy: { select: { id: true, username: true, email: true } },
      },
    });

    if (!text) throw new NotFoundException(`Texto con ID ${id} no encontrado`);

    return text;
  }

  async getAllTexts(paginationDto: PaginationTextDto) {
    const { pageNumber, pageSize, offset } = this.getPagination(paginationDto);
    const where: Prisma.TextWhereInput = { isActive: true };

    const [texts, total] = await Promise.all([
      this.prisma.text.findMany({
        where,
        select: {
          id: true,
          title: true,
          difficulty: { select: { name: true } },
          type: { select: { name: true } },
        },
        skip: offset,
        take: pageSize,
      }),
      this.prisma.text.count({ where }),
    ]).catch((error) => {
      this.logger.error('Error al obtener los textos', error);
      throw new BadRequestException(
        'Error al obtener los textos. Por favor, intenta nuevamente.',
      );
    });

    return this.buildPaginatedResponse(
      texts.map(({ id, title, difficulty, type }) => ({
        id,
        title,
        difficulty: difficulty.name,
        type: type.name,
      })),
      total,
      pageNumber,
      pageSize,
    );
  }

  async getByFilters(
    filterTextDto: FilterTextDto,
    paginationDto: PaginationTextDto,
  ) {
    const { title, difficultyId, typeId, languageId, isActive } = filterTextDto;
    const { pageNumber, pageSize, offset } = this.getPagination(paginationDto);

    const where: Prisma.TextWhereInput = {
      ...(title && { title: { contains: title, mode: 'insensitive' } }),
      ...(difficultyId && { difficultyId }),
      ...(typeId && { typeId }),
      ...(languageId && { languageId }),
      ...(isActive !== undefined && { isActive }),
    };

    const [texts, total] = await Promise.all([
      this.prisma.text.findMany({
        where,
        select: {
          id: true,
          title: true,
          difficulty: { select: { name: true } },
          type: { select: { name: true } },
          language: { select: { name: true } },
        },
        skip: offset,
        take: pageSize,
      }),
      this.prisma.text.count({ where }),
    ]).catch((error) => {
      this.logger.error('Error al obtener textos por filtros', error);
      throw new BadRequestException(
        'Error al obtener textos por filtros. Por favor, intenta nuevamente.',
      );
    });

    return this.buildPaginatedResponse(
      texts.map(({ id, title, difficulty, type, language }) => ({
        id,
        title,
        difficulty: difficulty.name,
        type: type.name,
        language: language.name,
      })),
      total,
      pageNumber,
      pageSize,
    );
  }
}
