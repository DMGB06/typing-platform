import { redirect } from 'next/navigation';

/**
 * Redirige a la página unificada de autenticación
 */
export default function LoginPage() {
  redirect('/auth');
}   