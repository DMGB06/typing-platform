'use client';

import React, { useState } from 'react';
import { FiMail, FiLock, FiLogIn, FiAlertCircle, FiCheck } from 'react-icons/fi';
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
  email: <FiMail className="w-4 h-4" />,
  password: <FiLock className="w-4 h-4" />,
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
      rememberMe,
    });
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
          <FiLogIn className="w-4 h-4" />
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
          <FiAlertCircle className="w-4 h-4 shrink-0" />
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
                <FiCheck className="w-3 h-3" style={{ color: 'var(--color-bg-primary)' }} strokeWidth={3} />
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
              <FiLogIn className="w-4 h-4" />
              Iniciar sesión
            </>
          )}
        </button>
      </form>
    </div>
  );
};
