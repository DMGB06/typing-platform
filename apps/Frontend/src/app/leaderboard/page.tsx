'use client';

import { useEffect, useState } from 'react';
import { FiAward } from 'react-icons/fi';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useCatalogs } from '@/hooks/useCatalogs';
import { getLeaderboard } from '@/lib/api/leaderboard';
import type { LeaderboardEntry } from '@/types';

// Colores de podio para los primeros 3 puestos (index 0-2); el resto usa el
// número plano existente. El 1er puesto reutiliza --color-accent, que ya es
// dorado en esta paleta.
const RANK_COLORS = ['var(--color-accent)', 'var(--color-rank-silver)', 'var(--color-rank-bronze)'];

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
                <FiAward className="w-8 h-8" style={{ color: 'var(--color-text-tertiary)' }} />
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
                  {RANK_COLORS[index] ? (
                    <span
                      className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0"
                      style={{ backgroundColor: RANK_COLORS[index], color: 'var(--color-bg-primary)' }}
                    >
                      {index + 1}
                    </span>
                  ) : (
                    <span
                      className="w-6 text-center font-semibold shrink-0"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {index + 1}
                    </span>
                  )}
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
