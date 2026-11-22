'use client';

import { useEffect, useRef, useState } from 'react';
import type { Catalogs, FilterState, PracticeBootstrap, PracticeText } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/api/client';
import { getPracticeBootstrap } from '@/lib/api/practice';
import { getRandomText } from '@/lib/api/texts';
import { getMyPreferences } from '@/lib/api/users';
import { TextFilters } from './TextFilters';
import { TypingDisplay } from './TypingDisplay';

const emptyFilters: FilterState = { typeId: null, difficultyId: null, languageId: null };
const emptyCatalogs: Catalogs = { textTypes: [], difficulties: [], languages: [] };

type Selection = {
  filters: FilterState;
} & (
  | { status: 'loading' | 'empty' | 'error' }
  | { status: 'ready'; text: PracticeText; expiresAt?: number }
);

function initialSelection(snapshot: PracticeBootstrap): Selection {
  const text = snapshot.texts[Math.floor(Math.random() * snapshot.texts.length)];
  return snapshot.filters && text
    ? { status: 'ready', filters: snapshot.filters, text, expiresAt: Date.parse(snapshot.expiresAt) }
    : { status: 'empty', filters: emptyFilters };
}

function requestText(filters: FilterState, signal: AbortSignal) {
  return getRandomText({
    difficultyId: filters.difficultyId ?? undefined,
    typeId: filters.typeId ?? undefined,
    languageId: filters.languageId ?? undefined,
  }, signal);
}

export function TypingArea() {
  const { user } = useAuth();
  const userId = user?.id;
  const [snapshot, setSnapshot] = useState<PracticeBootstrap>();
  const catalogs = snapshot?.catalogs ?? emptyCatalogs;
  const [bootstrapRevision, setBootstrapRevision] = useState(0);
  const [selection, setSelection] = useState<Selection>({ status: 'loading', filters: emptyFilters });
  const [preferredDifficulty, setPreferredDifficulty] = useState<{ userId: number; difficultyId: number }>();
  const [isStarted, setIsStarted] = useState(false);
  const userInteracted = useRef(false);
  const textRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;
    const abortTextRequest = () => textRequest.current?.abort();
    void getPracticeBootstrap(bootstrapRevision > 0).then((data) => {
      if (cancelled) return;
      setSnapshot(data);
      setSelection(initialSelection(data));
    }).catch(() => {
      if (!cancelled) setSelection({ status: 'error', filters: emptyFilters });
    });
    return () => {
      cancelled = true;
      abortTextRequest();
    };
  }, [bootstrapRevision]);

  useEffect(() => {
    if (userId === undefined) return;
    let cancelled = false;
    void getMyPreferences().then(({ defaultDifficultyId }) => {
      if (!cancelled && defaultDifficultyId !== null) {
        setPreferredDifficulty({ userId, difficultyId: defaultDifficultyId });
      }
    }).catch(() => {
      // The public selection can be used immediately.
    });
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    if (!snapshot?.filters || !preferredDifficulty || preferredDifficulty.userId !== userId ||
        userInteracted.current || preferredDifficulty.difficultyId === snapshot.filters.difficultyId ||
        !snapshot.catalogs.difficulties.some(({ id }) => id === preferredDifficulty.difficultyId)) {
      return;
    }

    const controller = new AbortController();
    const filters = { ...snapshot.filters, difficultyId: preferredDifficulty.difficultyId };
    void requestText(filters, controller.signal).then((text) => {
      if (!controller.signal.aborted && !userInteracted.current) {
        setSelection({ status: 'ready', filters, text });
      }
    }).catch(() => {
      // An unavailable preference leaves the current selection playable.
    });
    return () => controller.abort();
  }, [snapshot, preferredDifficulty, userId]);

  function reloadBootstrap() {
    textRequest.current?.abort();
    setSnapshot(undefined);
    setSelection({ status: 'loading', filters: emptyFilters });
    setBootstrapRevision((revision) => revision + 1);
  }

  async function loadText(filters: FilterState, replaceUnavailable = false) {
    userInteracted.current = true;
    textRequest.current?.abort();
    const controller = new AbortController();
    textRequest.current = controller;
    setIsStarted(false);
    setSelection({ status: 'loading', filters });
    try {
      const text = await requestText(filters, controller.signal);
      if (!controller.signal.aborted) setSelection({ status: 'ready', filters, text });
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error instanceof ApiError && error.status === 404) {
        if (replaceUnavailable) reloadBootstrap();
        else setSelection({ status: 'empty', filters });
      } else {
        setSelection({ status: 'error', filters });
      }
    }
  }

  function changeFilters(changes: Partial<FilterState>) {
    userInteracted.current = true;
    const filters = { ...selection.filters, ...changes };
    if (selection.status === 'ready' &&
        filters.typeId === selection.filters.typeId &&
        filters.difficultyId === selection.filters.difficultyId &&
        filters.languageId === selection.filters.languageId) return;
    void loadText(filters);
  }

  function retryLoading() {
    if (selection.filters.typeId || selection.filters.difficultyId || selection.filters.languageId) {
      void loadText(selection.filters);
    } else {
      reloadBootstrap();
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <TextFilters
        filters={selection.filters}
        onFilterChange={changeFilters}
        disabled={isStarted || (selection.status === 'loading' && !snapshot)}
        catalogs={catalogs}
        loadingCatalogs={selection.status === 'loading' && !snapshot}
      />

      {selection.status === 'ready' ? (
        <TypingDisplay
          key={`${selection.text.id}:${selection.text.contentHash}`}
          textData={selection.text}
          expiresAt={selection.expiresAt}
          isStarted={isStarted}
          onBegin={() => { userInteracted.current = true; }}
          onStart={() => setIsStarted(true)}
          onReset={() => setIsStarted(false)}
          onTextUnavailable={() => void loadText(selection.filters, true)}
        />
      ) : (
        <div className="rounded-xl p-8 text-center bg-bg-secondary text-text-secondary">
          {selection.status === 'loading' && <p role="status">Cargando texto...</p>}
          {selection.status === 'empty' && (
            <p role="status">
              {snapshot?.texts.length
                ? 'No hay textos para esta combinación. Cambia algún filtro.'
                : 'Por ahora no hay textos de práctica disponibles.'}
            </p>
          )}
          {selection.status === 'error' && (
            <>
              <p role="alert">No se pudo cargar la práctica. El servidor puede estar iniciando.</p>
              <button type="button" className="mt-3 underline" onClick={retryLoading}>
                Reintentar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
