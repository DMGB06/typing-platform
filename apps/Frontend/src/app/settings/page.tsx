'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useCatalogs } from '@/hooks/useCatalogs';
import { getMyPreferences, updateMyPreferences } from '@/lib/api/users';

export default function SettingsPage() {
  const { ready, isLoggedIn } = useAuth();
  const router = useRouter();
  const { catalogs, loading: loadingCatalogs, error: catalogsError } = useCatalogs();

  const [defaultDifficultyId, setDefaultDifficultyId] = useState<number | null>(null);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }

    const fetchPreferences = async () => {
      setLoadingPreferences(true);
      setError(null);
      try {
        const data = await getMyPreferences();
        setDefaultDifficultyId(data.defaultDifficultyId);
      } catch (err) {
        console.error('Error al cargar las preferencias:', err);
        setError('No se pudieron cargar tus preferencias.');
      } finally {
        setLoadingPreferences(false);
      }
    };

    fetchPreferences();
  }, [ready, isLoggedIn, router]);

  const handleSelectDifficulty = async (difficultyId: number) => {
    setSaving(true);
    setError(null);
    try {
      const data = await updateMyPreferences(difficultyId);
      setDefaultDifficultyId(data.defaultDifficultyId);
    } catch (err) {
      console.error('Error al guardar la preferencia:', err);
      setError('No se pudo guardar tu preferencia.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen min-w-full flex flex-col px-2 lg:px-24">
      <Navbar />

      <main className="flex-1 py-12">
        {ready && isLoggedIn && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h1
                className="text-xl font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Configuración
              </h1>
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Dificultad por defecto al empezar a practicar.
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

            {(loadingCatalogs || loadingPreferences) && !catalogsError && (
              <p
                className="text-center text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Cargando preferencias...
              </p>
            )}

            {error && (
              <p
                className="text-center text-sm"
                style={{ color: 'var(--color-error)' }}
              >
                {error}
              </p>
            )}

            {!loadingCatalogs && !loadingPreferences && !catalogsError && catalogs.difficulties.length > 0 && (
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {catalogs.difficulties.map((diff) => (
                  <button
                    key={diff.id}
                    onClick={() => handleSelectDifficulty(diff.id)}
                    disabled={saving}
                    className="px-3 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      backgroundColor:
                        defaultDifficultyId === diff.id
                          ? 'var(--color-accent)'
                          : 'var(--color-bg-secondary)',
                      color:
                        defaultDifficultyId === diff.id
                          ? 'var(--color-bg-primary)'
                          : 'var(--color-text-secondary)',
                    }}
                  >
                    {diff.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
