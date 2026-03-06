'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { Navbar } from '@/components/layout/Navbar';
import { GiKeyboard } from 'react-icons/gi';

/**
 * Página de Autenticación
 *
 * Desktop: dos columnas lado a lado (Register | Login)
 * Mobile: tabs para alternar entre ambos formularios
 */
export default function AuthPage() {
  const router = useRouter();
  const [mobileTab, setMobileTab] = useState<'register' | 'login'>('login');

  const handleSuccess = () => {
    router.push('/');
  };

  const handleForgotPassword = () => {
    // Placeholder para futura implementación
    alert('Funcionalidad próximamente disponible');
  };

  return (
    <div className="min-h-screen flex flex-col px-2 lg:px-24" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-5xl">

          {/* ── Encabezado de sección ─────────────────────── */}
          <div className="text-center mb-5 sm:mb-7 pb-3">
            <div className="flex items-center justify-center gap-2.5 mb-2">
              <GiKeyboard className="text-2xl sm:text-3xl" style={{ color: 'var(--color-text-secondary)' }} />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                typingpro
              </h1>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Practica, mejora y domina tu velocidad de escritura
            </p>
          </div>

          {/* ── Mobile: Tabs ──────────────────────────────── */}
          <div className="lg:hidden mb-6">
            <div
              className="flex rounded-lg p-1 gap-1"
              style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
              <button
                type="button"
                onClick={() => setMobileTab('login')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: mobileTab === 'login' ? 'var(--color-bg-tertiary)' : 'transparent',
                  color: mobileTab === 'login' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('register')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: mobileTab === 'register' ? 'var(--color-bg-tertiary)' : 'transparent',
                  color: mobileTab === 'register' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Crear cuenta
              </button>
            </div>
          </div>

          {/* ── Layout principal ──────────────────────────── */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-0 items-stretch">

            {/* Register (izquierda en desktop) */}
            <div
              className={`
                lg:flex-1 lg:block
                ${mobileTab === 'register' ? 'block' : 'hidden'}
              `}
            >
              <div
                className="h-full rounded-xl lg:rounded-r-none border p-5 sm:p-6"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-bg-tertiary)',
                }}
              >
                <RegisterForm onSuccess={handleSuccess} />
              </div>
            </div>

            {/* Separador vertical (desktop only) */}
            <div className="hidden lg:flex flex-col items-center justify-center relative" style={{ width: '1px' }}>
              <div
                className="absolute inset-y-8 w-px"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
              />
              <div
                className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-tertiary)',
                  border: '1px solid var(--color-bg-tertiary)',
                }}
              >
                o
              </div>
            </div>

            {/* Login (derecha en desktop) */}
            <div
              className={`
                lg:flex-1 lg:block
                ${mobileTab === 'login' ? 'block' : 'hidden'}
              `}
            >
              <div
                className="h-full rounded-xl lg:rounded-l-none border p-5 sm:p-6 flex flex-col"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-bg-tertiary)',
                }}
              >
                <LoginForm
                  onSuccess={handleSuccess}
                  onForgotPassword={handleForgotPassword}
                />

                {/* Extra space filler + decorative element for Login (shorter form) */}
                <div className="flex-1 flex flex-col justify-end mt-6">
                  <div
                    className="rounded-lg p-4 border"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.015)',
                      borderColor: 'var(--color-bg-tertiary)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        style={{ color: 'var(--color-text-tertiary)' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                          ¿Sabías que...?
                        </p>
                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                          Los mecanógrafos profesionales alcanzan velocidades superiores a 120 WPM.
                          Con práctica constante puedes mejorar significativamente tu velocidad.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Mobile: Toggle hint ───────────────────────── */}
          <div className="lg:hidden text-center mt-6">
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              {mobileTab === 'login' ? (
                <>
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setMobileTab('register')}
                    className="font-medium transition-colors duration-200 hover:underline"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Regístrate aquí
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setMobileTab('login')}
                    className="font-medium transition-colors duration-200 hover:underline"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Inicia sesión
                  </button>
                </>
              )}
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
