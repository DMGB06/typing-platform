'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

/**
 * Página de Notificaciones
 *
 * TODO: Implementar con:
 * - Lista de notificaciones (nuevos logros, records personales, etc.)
 * - Marcar como leída / no leída
 * - Filtros por tipo de notificación
 * - Paginación o scroll infinito
 * - Requiere autenticación
 */
export default function NotificationsPage() {
  return (
    <div className="min-h-screen min-w-full flex flex-col px-2 lg:px-24">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl mx-auto border"
            style={{
              borderColor: 'var(--color-bg-tertiary)',
              backgroundColor: 'var(--color-bg-secondary)',
            }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} style={{ color: 'var(--color-text-tertiary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Notificaciones
          </h1>
          <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--color-text-tertiary)' }}>
            Aquí verás tus logros, records personales y novedades. Inicia sesión para comenzar.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
