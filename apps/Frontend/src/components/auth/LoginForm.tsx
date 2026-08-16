'use client';

import React, { useState } from 'react';
import { AuthInput } from './AuthInput';
import {
  useAuthForm,
  validators,
  type FieldConfig,
} from '@/hooks/useAuthForm';
import { login as loginApi } from '@/lib/api/auth';

// ── Campos del formulario ────────────────────────────────────

const fields: FieldConfig[] = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'tu@email.com',
    validate: validators.email,
  },
  {
    name: 'password',
    label: 'Contraseña',
    type: 'password',
    placeholder: '••••••••',
    validate: validators.required('La contraseña'),
  },
];

// ── Iconos ───────────────────────────────────────────────────

const fieldIcons: Record<string, React.ReactNode> = {
  email: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 7l-10 6L2 7" />
    </svg>
  ),
  password: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
};

// ── Componente ───────────────────────────────────────────────

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
}) => {
  const [rememberMe, setRememberMe] = useState(false);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    serverError,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useAuthForm(fields, async (vals) => {
    await loginApi({
      email: vals.email,
      password: vals.password,
    });
    // Si remember me está activo, podríamos guardar algo extra
    if (rememberMe) {
      localStorage.setItem('remember_me', 'true');
    }
    onSuccess?.();
  });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg border"
          style={{
            borderColor: 'var(--color-bg-tertiary)',
            backgroundColor: 'var(--color-bg-primary)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Iniciar sesión
          </h2>
          <p className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
            Bienvenido de vuelta
          </p>
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3 text-[13px] border"
          style={{
            backgroundColor: 'rgba(244, 67, 54, 0.08)',
            borderColor: 'rgba(244, 67, 54, 0.2)',
            color: 'var(--color-error)',
          }}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        {fields.map((field) => (
          <AuthInput
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type}
            placeholder={field.placeholder}
            value={values[field.name]}
            error={errors[field.name]}
            touched={touched[field.name]}
            disabled={isSubmitting}
            icon={fieldIcons[field.name]}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete={
              field.name === 'email' ? 'email' : 'current-password'
            }
          />
        ))}

        {/* Remember me */}
        <div className="flex items-center pt-2 pb-2">
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <button
              type="button"
              role="checkbox"
              aria-checked={rememberMe}
              onClick={() => setRememberMe((p) => !p)}
              className="w-4 h-4 rounded border flex items-center justify-center transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-accent/30"
              style={{
                borderColor: rememberMe ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                backgroundColor: rememberMe ? 'var(--color-accent)' : 'transparent',
              }}
            >
              {rememberMe && (
                <svg className="w-3 h-3" fill="none" stroke="var(--color-bg-primary)" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span
              className="text-xs transition-colors duration-200 group-hover:text-text-primary"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Recordarme
            </span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-[13px]
            transition-all duration-200 active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accent/25"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-bg-secondary)',
          }}
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Iniciando sesión...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Iniciar sesión
            </>
          )}
        </button>
      </form>
    </div>
  );
};
