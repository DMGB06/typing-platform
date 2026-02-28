import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

/**
 * Página "Acerca de"
 *
 * TODO: Implementar con:
 * - Descripción del proyecto
 * - Créditos y agradecimientos
 * - Tecnologías utilizadas
 * - Enlaces al repositorio y redes sociales
 * - FAQ o preguntas frecuentes
 */
export default function AboutPage() {
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Acerca de typingpro
          </h1>
          <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--color-text-tertiary)' }}>
            Próximamente encontrarás información sobre el proyecto, el equipo y las tecnologías utilizadas.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
