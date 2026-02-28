import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

/**
 * Página de Clasificación / Leaderboard
 *
 * TODO: Implementar tabla de clasificación con:
 * - Ranking por WPM (palabras por minuto)
 * - Filtros por dificultad, idioma, período de tiempo
 * - Top 10, Top 50, posición del usuario actual
 * - Estadísticas comparativas
 */
export default function LeaderboardPage() {
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.853m0 0a6.023 6.023 0 01-2.77-.853" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Clasificación
          </h1>
          <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--color-text-tertiary)' }}>
            Próximamente podrás ver el ranking de los mejores mecanógrafos y comparar tu progreso.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
