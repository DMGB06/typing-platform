import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const TECNOLOGIAS = [
  { nombre: 'Next.js', detalle: '16 · Frontend (App Router)' },
  { nombre: 'React', detalle: '19' },
  { nombre: 'TypeScript', detalle: 'Frontend y backend' },
  { nombre: 'Tailwind CSS', detalle: '4 · Estilos' },
  { nombre: 'NestJS', detalle: '11 · Backend' },
  { nombre: 'Prisma', detalle: '5 · ORM' },
  { nombre: 'PostgreSQL', detalle: 'Base de datos' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen min-w-full flex flex-col px-2 lg:px-24">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Acerca de typingpro
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Una plataforma para practicar y mejorar tu velocidad de escritura en español,
              con estadísticas por dificultad, clasificación entre usuarios y seguimiento de tu progreso.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Tecnologías utilizadas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TECNOLOGIAS.map((tech) => (
                <div
                  key={tech.nombre}
                  className="rounded-lg px-4 py-2"
                  style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                >
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {tech.nombre}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    {tech.detalle}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Créditos
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Desarrollado por DMGB.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Repositorio
            </h2>
            <a
              href="https://github.com/DMGB06/typing-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline"
              style={{ color: 'var(--color-accent)' }}
            >
              github.com/DMGB06/typing-platform
            </a>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
