

import { Navbar } from '@/components/layout/Navbar';
import { Footer} from '@/components/layout/Footer';
/**
 * Página principal - Home
 * 
 * Estructura:
 * - Navbar fijo en la parte superior
 * - Área de typing centrada
 * - Footer en la parte inferior
 * 
 * Layout simple y enfocado en la experiencia de escritura
 */
export default function Home() {  
  return (
    <div className="min-h-screen min-w-full flex flex-col px-2 lg:px-24"> {/* agrega bg para ver el padding */}
      
    <Navbar></Navbar>
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12">
        Contenido
      </main>
      
      {/* Footer */}
      <Footer></Footer>

    </div>
  );
}