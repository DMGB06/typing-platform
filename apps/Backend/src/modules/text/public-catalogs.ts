import type { Prisma } from '@prisma/client';

export function getDifficulties(
  db: Pick<Prisma.TransactionClient, 'difficulty'>,
) {
  return db.difficulty.findMany({
    where: { isActive: true },
    select: { id: true, name: true, description: true, orderIndex: true },
    orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }],
  });
}

export function getTextTypes(db: Pick<Prisma.TransactionClient, 'textType'>) {
  return db.textType.findMany({
    where: { isActive: true },
    select: { id: true, name: true, description: true },
    orderBy: { id: 'asc' },
  });
}

export function getLanguages(db: Pick<Prisma.TransactionClient, 'language'>) {
  return db.language.findMany({
    where: { isActive: true },
    select: { id: true, name: true, code: true },
    orderBy: { id: 'asc' },
  });
}
