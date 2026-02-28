'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

/**
 * Página de Perfil de Usuario
 *
 * TODO: Implementar con:
 * - Información del usuario (username, email, fecha de registro)
 * - Estadísticas personales (WPM promedio, precisión, sesiones)
 * - Historial de sesiones de práctica
 * - Gráficos de progreso
 * - Editar perfil / cambiar contraseña
 * - Requiere autenticación — redirigir a /auth si no hay sesión
 */
export default function ProfilePage() {
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Mi Perfil
          </h1>
          <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--color-text-tertiary)' }}>
            Próximamente podrás ver tus estadísticas, historial y progreso. Inicia sesión para acceder.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
