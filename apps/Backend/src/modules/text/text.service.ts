import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../Prisma/prisma.service';
import { TextPaginationDto } from './dto/text.dto';
import { TextFilterDto } from './dto/text-filter.dto';

@Injectable()
export class TextService {
  constructor(private prisma: PrismaService) {}

  private buildWhereClause(
    filterDto: TextFilterDto,
    search?: string,
  ): Prisma.TextWhereInput {
    const where: Prisma.TextWhereInput = { isActive: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (filterDto.difficultyId) where.difficultyId = filterDto.difficultyId;
    if (filterDto.typeId) where.typeId = filterDto.typeId;
    if (filterDto.languageId) where.languageId = filterDto.languageId;

    return where;
  }

  async listTexts(paginationDto: TextPaginationDto, filterDto: TextFilterDto) {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(filterDto, search);

    const [texts, total] = await Promise.all([
      this.prisma.text.findMany({
        skip,
        take: limit,
        where,
        select: {
          id: true,
          title: true,
          content: true,
          difficultyId: true,
          typeId: true,
          languageId: true,
          createdAt: true,
          difficulty: { select: { id: true, name: true } },
          type: { select: { id: true, name: true } },
          language: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.text.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: texts,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getRandomText(filterDto: TextFilterDto) {
    const where = this.buildWhereClause(filterDto);
    const count = await this.prisma.text.count({ where });

    if (count === 0) {
      throw new NotFoundException(
        'No se encontraron textos con los filtros especificados',
      );
    }

    const randomIndex = Math.floor(Math.random() * count);

    const randomText = await this.prisma.text.findMany({
      skip: randomIndex,
      take: 1,
      where,
      select: {
        id: true,
        title: true,
        content: true,
        difficultyId: true,
        typeId: true,
        languageId: true,
        createdAt: true,
        difficulty: { select: { id: true, name: true, description: true } },
        type: { select: { id: true, name: true, description: true } },
        language: { select: { id: true, name: true, code: true } },
      },
    });

    return randomText[0];
  }

  async getTextById(id: number) {
    const text = await this.prisma.text.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        difficultyId: true,
        typeId: true,
        languageId: true,
        createdAt: true,
        difficulty: { select: { id: true, name: true, description: true } },
        type: { select: { id: true, name: true, description: true } },
        language: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, username: true } },
      },
    });

    if (!text?.difficulty) {
      throw new NotFoundException(`Texto con ID ${id} no encontrado`);
    }

    return text;
  }

  async getTextStats(id: number) {
    const textExists = await this.prisma.text.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!textExists) {
      throw new NotFoundException(`Texto con ID ${id} no encontrado`);
    }

    const sessionWhere: Prisma.TypingSessionWhereInput = {
      textId: id,
      wpm: { not: null },
    };

    const [topSessions, stats] = await Promise.all([
      this.prisma.typingSession.findMany({
        where: sessionWhere,
        take: 10,
        orderBy: [{ wpm: 'desc' }, { accuracy: 'desc' }],
        select: {
          id: true,
          wpm: true,
          accuracy: true,
          timeSeconds: true,
          errorRate: true,
          createdAt: true,
          user: { select: { id: true, username: true } },
        },
      }),
      this.prisma.typingSession.aggregate({
        where: sessionWhere,
        _avg: { wpm: true, accuracy: true, errorRate: true },
        _max: { wpm: true, accuracy: true },
        _count: { id: true },
      }),
    ]);

    return {
      text: { id: textExists.id, title: textExists.title },
      topSessions,
      stats: {
        totalAttempts: stats._count.id,
        avgWpm: stats._avg.wpm ? Math.round(stats._avg.wpm) : 0,
        avgAccuracy: stats._avg.accuracy
          ? Math.round(stats._avg.accuracy * 100) / 100
          : 0,
        avgErrorRate: stats._avg.errorRate
          ? Math.round(stats._avg.errorRate * 100) / 100
          : 0,
        maxWpm: stats._max.wpm ?? 0,
        maxAccuracy: stats._max.accuracy ?? 0,
      },
    };
  }
}