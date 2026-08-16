'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiAward, FiBell } from 'react-icons/fi';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { getMyNotifications, markAllAsRead } from '@/lib/api/notifications';
import type { NotificationResponse } from '@/types';

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Recién';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;

  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} d`;
}

export default function NotificationsPage() {
  const { ready, isLoggedIn } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyNotifications();
        setNotifications(data);
        void markAllAsRead().catch((err) => {
          console.error('Error al marcar notificaciones como leídas:', err);
        });
      } catch (err) {
        console.error('Error al cargar las notificaciones:', err);
        setError('No se pudieron cargar tus notificaciones.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [ready, isLoggedIn, router]);

  return (
    <div className="min-h-screen min-w-full flex flex-col px-2 lg:px-24">
      <Navbar />

      <main className="flex-1 py-12">
        {ready && isLoggedIn && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h1
              className="text-xl font-semibold text-center"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Notificaciones
            </h1>

            {loading && (
              <p
                className="text-center text-sm"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Cargando notificaciones...
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

            {!loading && !error && notifications.length === 0 && (
              <div className="text-center space-y-4">
                <div
                  className="flex items-center justify-center w-16 h-16 rounded-2xl mx-auto border"
                  style={{
                    borderColor: 'var(--color-bg-tertiary)',
                    backgroundColor: 'var(--color-bg-secondary)',
                  }}
                >
                  <FiBell className="w-8 h-8" style={{ color: 'var(--color-text-tertiary)' }} />
                </div>
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text-tertiary)' }}
                >
                  Todavía no tenés notificaciones.
                </p>
              </div>
            )}

            {!loading && !error && notifications.length > 0 && (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-lg p-4 flex items-center gap-3"
                    style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                  >
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                      style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg-primary)' }}
                    >
                      <FiAward className="w-4 h-4" />
                    </div>
                    <p className="text-sm flex-1" style={{ color: 'var(--color-text-primary)' }}>
                      Nuevo récord: {n.wpm} WPM en {n.difficultyName}
                    </p>
                    <span
                      className="text-xs shrink-0"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
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
