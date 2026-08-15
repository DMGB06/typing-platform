'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { getMyStats } from '@/lib/api/users';
import { getMyRecentSessions } from '@/lib/api/typing-sessions';
import type { UserStatsResponse, TypingSessionResponse } from '@/types';

export default function ProfilePage() {
  const { ready, isLoggedIn } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStatsResponse[]>([]);
  const [sessions, setSessions] = useState<TypingSessionResponse[]>([]);

  useEffect(() => {
    if (!ready) return;

    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }

    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsData, sessionsData] = await Promise.all([
          getMyStats(),
          getMyRecentSessions(),
        ]);
        setStats(statsData);
        setSessions(sessionsData);
      } catch (err) {
        console.error('Error al cargar el perfil:', err);
        setError('No se pudo cargar tu perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [ready, isLoggedIn, router]);

  return (
    <div className="min-h-screen min-w-full flex flex-col px-2 lg:px-24">
      <Navbar />

      <main className="flex-1 py-12">
        {ready && isLoggedIn && (
          <>
            {loading && (
              <p
                className="text-center text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Cargando tu perfil...
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

            {!loading && !error && stats.length === 0 && (
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
                      d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h1
                  className="text-xl font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Todavía no practicaste ningún texto
                </h1>
                <p
                  className="text-sm max-w-xs mx-auto"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Cuando termines tu primera sesión de práctica, tus
                  estadísticas van a aparecer acá.
                </p>
                <Link
                  href="/"
                  className="inline-block px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Empezar a practicar
                </Link>
              </div>
            )}

            {!loading && !error && stats.length > 0 && (
              <div className="max-w-3xl mx-auto space-y-12">
                <section>
                  <h2
                    className="text-lg font-semibold mb-4"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Estadísticas por dificultad
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {stats.map((s) => (
                      <div
                        key={s.difficultyId}
                        className="rounded-xl p-5"
                        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                      >
                        <h3
                          className="text-base font-semibold mb-3"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {s.difficultyName}
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div
                              className="text-2xl font-bold"
                              style={{ color: 'var(--color-accent)' }}
                            >
                              {s.bestWpm}
                            </div>
                            <div style={{ color: 'var(--color-text-tertiary)' }}>
                              Mejor WPM
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-2xl font-bold"
                              style={{ color: 'var(--color-accent)' }}
                            >
                              {Math.round(s.avgWpm)}
                            </div>
                            <div style={{ color: 'var(--color-text-tertiary)' }}>
                              WPM promedio
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-2xl font-bold"
                              style={{ color: 'var(--color-success)' }}
                            >
                              {Math.round(s.avgAccuracy)}%
                            </div>
                            <div style={{ color: 'var(--color-text-tertiary)' }}>
                              Precisión promedio
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-2xl font-bold"
                              style={{ color: 'var(--color-info)' }}
                            >
                              {s.totalSessions}
                            </div>
                            <div style={{ color: 'var(--color-text-tertiary)' }}>
                              Sesiones
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2
                    className="text-lg font-semibold mb-4"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Sesiones recientes
                  </h2>
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between rounded-lg px-4 py-3 text-sm"
                        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                      >
                        <span style={{ color: 'var(--color-text-tertiary)' }}>
                          {new Date(session.createdAt).toLocaleDateString(
                            'es',
                            { day: '2-digit', month: '2-digit', year: 'numeric' },
                          )}
                        </span>
                        <span style={{ color: 'var(--color-accent)' }}>
                          {session.wpm ?? '—'} WPM
                        </span>
                        <span style={{ color: 'var(--color-success)' }}>
                          {session.accuracy !== null
                            ? `${Math.round(session.accuracy)}%`
                            : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
