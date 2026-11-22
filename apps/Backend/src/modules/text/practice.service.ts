import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../Prisma/prisma.service';
import { sha256 } from '../../common/sha256';
import { getDifficulties, getLanguages, getTextTypes } from './public-catalogs';
import { activeText } from './text-visibility';

const publicPracticeText = {
  ...activeText,
  difficulty: { isActive: true },
  type: { isActive: true },
  language: { isActive: true },
} satisfies Prisma.TextWhereInput;

@Injectable()
export class PracticeService {
  constructor(private readonly prisma: PrismaService) {}

  getBootstrap() {
    return this.prisma.$transaction(
      async (tx) => {
        const expiresAt = new Date(Date.now() + 60_000);
        const [difficulties, textTypes, languages, combinations] =
          await Promise.all([
            getDifficulties(tx),
            getTextTypes(tx),
            getLanguages(tx),
            tx.text.groupBy({
              by: ['languageId', 'difficultyId', 'typeId'],
              where: publicPracticeText,
              orderBy: [
                { languageId: 'asc' },
                { difficultyId: 'asc' },
                { typeId: 'asc' },
              ],
            }),
          ]);
        const catalogs = { difficulties, textTypes, languages };

        const spanish = languages.find(({ code }) => code === 'es')?.id;
        const intermediate = difficulties.find(
          ({ name }) => name === 'Intermedio',
        )?.id;
        const paragraph = textTypes.find(({ name }) => name === 'Párrafo')?.id;
        const rank = (filters: (typeof combinations)[number]) =>
          4 * Number(filters.languageId === spanish) +
          2 * Number(filters.difficultyId === intermediate) +
          Number(filters.typeId === paragraph);
        // The stable sort retains the database's ID ordering for ties.
        const filters =
          combinations.sort((a, b) => rank(b) - rank(a))[0] ?? null;
        if (!filters) return { catalogs, filters, texts: [], expiresAt };

        const texts = await tx.text.findMany({
          where: { ...publicPracticeText, ...filters },
          select: {
            id: true,
            title: true,
            content: true,
            languageId: true,
            difficultyId: true,
            typeId: true,
          },
          orderBy: { id: 'asc' },
          take: 5,
        });
        return {
          catalogs,
          filters,
          texts: texts.map((text) => ({
            ...text,
            contentHash: sha256(text.content),
          })),
          expiresAt,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }
}
