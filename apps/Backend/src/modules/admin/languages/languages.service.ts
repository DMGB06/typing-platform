import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../Prisma/prisma.service';
import { CreateLanguageDto, UpdateLanguageDto } from './dto/languages.dto';

@Injectable()
export class LanguagesService {
  constructor(private prisma: PrismaService) {}

  private normalizeString(str: string): string {
    return str.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  async create(createLanguageDto: CreateLanguageDto) {
    const normalizedName = this.normalizeString(createLanguageDto.name);
    const normalizedCode = createLanguageDto.code.trim().toLowerCase();

    const [existingName, existingCode] = await Promise.all([
      this.prisma.language.findFirst({
        where: { name: normalizedName },
      }),
      this.prisma.language.findUnique({
        where: { code: normalizedCode },
      }),
    ]);

    if (existingName) {
      throw new ConflictException('Lenguaje ya existente');
    }

    if (existingCode) {
      throw new ConflictException('Código de lenguaje ya existente');
    }

    const language = await this.prisma.language.create({
      data: {
        name: normalizedName,
        code: normalizedCode,
      },
    });

    return {
      id: language.id,
      name: language.name,
      code: language.code,
    };
  }

  async update(id: number, updateLanguageDto: UpdateLanguageDto) {
    const existingLanguage = await this.prisma.language.findUnique({
      where: { id },
    });

    if (!existingLanguage) {
      throw new NotFoundException('Lenguaje no encontrado');
    }

    // Validar nombre si se proporciona
    if (updateLanguageDto.name) {
      const normalizedName = this.normalizeString(updateLanguageDto.name);
      const nameExists = await this.prisma.language.findFirst({
        where: {
          name: normalizedName,
          id: { not: id },
        },
      });

      if (nameExists) {
        throw new ConflictException('Nombre de lenguaje ya existente');
      }
    }

    // Validar código si se proporciona
    if (updateLanguageDto.code) {
      const normalizedCode = updateLanguageDto.code.trim().toLowerCase();
      const codeExists = await this.prisma.language.findUnique({
        where: { code: normalizedCode },
      });

      if (codeExists && codeExists.id !== id) {
        throw new ConflictException('Código de lenguaje ya existente');
      }
    }

    const updateData: Partial<{ name: string; code: string }> = {};

    if (updateLanguageDto.name) {
      updateData.name = this.normalizeString(updateLanguageDto.name);
    }

    if (updateLanguageDto.code) {
      updateData.code = updateLanguageDto.code.trim().toLowerCase();
    }

    const language = await this.prisma.language.update({
      where: { id },
      data: updateData,
    });

    return {
      id: language.id,
      name: language.name,
      code: language.code,
    };
  }

  async delete(id: number) {
    const language = await this.prisma.language.findUnique({
      where: { id },
    });

    if (!language) {
      throw new NotFoundException('Lenguaje no encontrado');
    }

    const deletedLanguage = await this.prisma.language.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      id: deletedLanguage.id,
      name: deletedLanguage.name,
      code: deletedLanguage.code,
      isActive: deletedLanguage.isActive,
    };
  }

  async getAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [languages, total] = await Promise.all([
      this.prisma.language.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          code: true,
        },
        orderBy: {
          name: 'asc',
        },
        skip,
        take: limit,
      }),
      this.prisma.language.count({
        where: { isActive: true },
      }),
    ]);

    return {
      data: languages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: number) {
    const language = await this.prisma.language.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    if (!language) {
      throw new NotFoundException('Lenguaje no encontrado');
    }

    return language;
  }
}
