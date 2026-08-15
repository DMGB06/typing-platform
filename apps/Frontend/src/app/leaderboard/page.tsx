'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCatalogs } from '@/hooks/useCatalogs';
import { getLeaderboard } from '@/lib/api/leaderboard';
import type { LeaderboardEntry } from '@/types';

export default function LeaderboardPage() {
  const { catalogs, loading: loadingCatalogs, error: catalogsError } = useCatalogs();

  const [difficultyId, setDifficultyId] = useState<number | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Elegir dificultad por defecto una vez que useCatalogs resolvió
  useEffect(() => {
    if (difficultyId !== null || catalogs.difficulties.length === 0) return;
    const defaultId =
      catalogs.difficulties.find((d) => d.name === 'Intermedio')?.id ??
      catalogs.difficulties[0]?.id ??
      null;
    setDifficultyId(defaultId);
  }, [catalogs.difficulties, difficultyId]);

  // Pedir el ranking cada vez que cambia la dificultad seleccionada
  useEffect(() => {
    if (difficultyId === null) return;

    let cancelled = false;

    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getLeaderboard(difficultyId);
        if (!cancelled) setEntries(data);
      } catch (err) {
        console.error('Error al cargar el leaderboard:', err);
        if (!cancelled) setError('No se pudo cargar la clasificación.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLeaderboard();
    return () => {
      cancelled = true;
    };
  }, [difficultyId]);

  return (
    <div className="min-h-screen min-w-full flex flex-col px-2 lg:px-24">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1
              className="text-xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Clasificación
            </h1>
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Top 10 por mejor WPM en cada dificultad.
            </p>
          </div>

          {catalogsError && (
            <p
              className="text-center text-sm"
              style={{ color: 'var(--color-error)' }}
            >
              {catalogsError}
            </p>
          )}

          {!loadingCatalogs && !catalogsError && catalogs.difficulties.length > 0 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {catalogs.difficulties.map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => setDifficultyId(diff.id)}
                  className="px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor:
                      difficultyId === diff.id
                        ? 'var(--color-accent)'
                        : 'var(--color-bg-secondary)',
                    color:
                      difficultyId === diff.id
                        ? 'var(--color-bg-primary)'
                        : 'var(--color-text-secondary)',
                  }}
                >
                  {diff.name}
                </button>
              ))}
            </div>
          )}

          {(loading || loadingCatalogs) && !catalogsError && (
            <p
              className="text-center text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Cargando clasificación...
            </p>
          )}

          {error && !loading && (
            <p
              className="text-center text-sm"
              style={{ color: 'var(--color-error)' }}
            >
              {error}
            </p>
          )}

          {!loading && !error && entries.length === 0 && difficultyId !== null && (
            <div className="text-center space-y-4">
              <div
                className="flex items-center justify-center w-16 h-16 rounded-2xl mx-auto border"
                style={{
                  borderColor: 'var(--color-bg-tertiary)',
                  backgroundColor: 'var(--color-bg-secondary)',
                }}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.853m0 0a6.023 6.023 0 01-2.77-.853"
                  />
                </svg>
              </div>
              <h2
                className="text-lg font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Todavía nadie completó una sesión en esta dificultad
              </h2>
            </div>
          )}

          {!loading && !error && entries.length > 0 && (
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <div
                  key={entry.username}
                  className="flex items-center gap-4 rounded-lg px-4 py-3 text-sm"
                  style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                >
                  <span
                    className="w-6 text-center font-semibold"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    {index + 1}
                  </span>
                  <span
                    className="flex-1 font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {entry.username}
                  </span>
                  <span style={{ color: 'var(--color-accent)' }}>
                    {entry.bestWpm} WPM
                  </span>
                  <span style={{ color: 'var(--color-success)' }}>
                    {Math.round(entry.avgAccuracy)}%
                  </span>
                  <span style={{ color: 'var(--color-text-tertiary)' }}>
                    {entry.totalSessions} sesiones
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
