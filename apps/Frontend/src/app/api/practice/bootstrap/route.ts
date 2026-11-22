import type { PracticeBootstrap } from '@/types';

export const dynamic = 'force-dynamic';

function object(value: unknown) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Objeto inválido');
  }
  return value as Record<string, unknown>;
}

function string(value: unknown) {
  if (typeof value !== 'string') throw new Error('Campo inválido');
  return value;
}

function integer(value: unknown) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw new Error('Número inválido');
  }
  return value;
}

function list<T>(value: unknown, project: (item: unknown) => T) {
  if (!Array.isArray(value)) throw new Error('Lista inválida');
  return value.map(project);
}

function named(item: Record<string, unknown>) {
  return { id: integer(item.id), name: string(item.name) };
}

function described(item: Record<string, unknown>) {
  return { ...named(item), description: typeof item.description === 'string' ? item.description : undefined };
}

function filterIds(item: Record<string, unknown>) {
  return {
    difficultyId: integer(item.difficultyId),
    typeId: integer(item.typeId),
    languageId: integer(item.languageId),
  };
}

function publicSnapshot(value: unknown): PracticeBootstrap {
  const input = object(value);
  const catalogs = object(input.catalogs);
  const filters = input.filters === null ? null : filterIds(object(input.filters));
  const texts = list(input.texts, (value) => {
    const text = object(value);
    const ids = filterIds(text);
    const contentHash = string(text.contentHash);
    if (!filters || filters.difficultyId !== ids.difficultyId ||
        filters.typeId !== ids.typeId || filters.languageId !== ids.languageId ||
        !/^[a-f0-9]{64}$(?![\s\S])/.test(contentHash)) {
      throw new Error('Texto inválido');
    }
    return { id: integer(text.id), title: string(text.title), content: string(text.content), ...ids, contentHash };
  });
  if (texts.length > 5 || Boolean(filters) !== Boolean(texts.length)) {
    throw new Error('Selección inválida');
  }
  return {
    expiresAt: string(input.expiresAt),
    catalogs: {
      difficulties: list(catalogs.difficulties, (item) => {
        const entry = object(item);
        return { ...described(entry), orderIndex: integer(entry.orderIndex) };
      }),
      textTypes: list(catalogs.textTypes, (item) => described(object(item))),
      languages: list(catalogs.languages, (item) => {
        const entry = object(item);
        return { ...named(entry), code: string(entry.code) };
      }),
    },
    filters,
    texts,
  };
}

const noStore = { 'Cache-Control': 'no-store' };

export async function GET() {
  const signal = AbortSignal.timeout(8_000);
  try {
    const origin = process.env.PRACTICE_API_ORIGIN ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    const response = await fetch(new URL('/practice/bootstrap', origin), {
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'error',
      signal,
    });
    if (!response.ok) throw new Error('La API no respondió correctamente');

    const snapshot = publicSnapshot(await response.json());
    const ttl = Math.min(55, Math.floor((Date.parse(snapshot.expiresAt) - Date.now()) / 1000));
    if (!Number.isFinite(ttl) || ttl < 1) {
      return Response.json({ message: 'La selección de práctica venció' }, { status: 503, headers: noStore });
    }

    return Response.json(snapshot, {
      headers: snapshot.texts.length ? {
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'Vercel-CDN-Cache-Control': `public, s-maxage=${ttl}, must-revalidate`,
        'Vercel-Cache-Tag': 'practice-bootstrap',
      } : noStore,
    });
  } catch {
    return Response.json({ message: 'No se pudo conectar con el servidor de práctica' }, {
      status: signal.aborted ? 504 : 502,
      headers: noStore,
    });
  }
}
