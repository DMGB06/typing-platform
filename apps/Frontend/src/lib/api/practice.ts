import type { PracticeBootstrap } from '@/types';
import { ApiError } from './client';

let snapshot: PracticeBootstrap | undefined;
let pending: Promise<PracticeBootstrap> | undefined;

export function getCachedPracticeCatalogs() {
  return snapshot && Date.parse(snapshot.expiresAt) > Date.now() ? snapshot.catalogs : undefined;
}

export function getPracticeBootstrap(refresh = false): Promise<PracticeBootstrap> {
  if (refresh) snapshot = undefined;
  if (snapshot && Date.parse(snapshot.expiresAt) > Date.now()) {
    return Promise.resolve(snapshot);
  }
  if (pending) return pending;

  pending = fetch('/api/practice/bootstrap', {
    credentials: 'omit',
    headers: refresh ? { Pragma: 'no-cache' } : undefined,
  }).then(async (response) => {
    if (!response.ok) {
      throw new ApiError('No se pudo cargar la práctica', response.status);
    }
    const result = await response.json() as PracticeBootstrap;
    if (!(Date.parse(result.expiresAt) > Date.now())) {
      throw new ApiError('La selección de práctica venció', 503);
    }
    snapshot = result.texts.length ? result : undefined;
    return result;
  }).finally(() => { pending = undefined; });

  return pending;
}
