'use client';

import React, { useState, type ChangeEvent } from 'react';

interface AuthInputProps {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  icon?: React.ReactNode;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Campo de formulario reutilizable para autenticación.
 * Incluye label, input con icono, toggle de password y mensajes de error.
 */
export const AuthInput: React.FC<AuthInputProps> = ({
  name,
  label,
  type,
  placeholder,
  value,
  error,
  touched,
  disabled,
  autoComplete,
  icon,
  onChange,
  onBlur,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const hasError = touched && error;

  return (
    <div className="space-y-1">
      {/* Label */}
      <label
        htmlFor={name}
        className="block text-[10px] font-medium tracking-wide uppercase"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        {label}
      </label>

      {/* Input wrapper */}
      <div className="relative">
        {/* Icono izquierdo */}
        {icon && (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: hasError ? 'var(--color-error)' : 'var(--color-text-tertiary)' }}
          >
            {icon}
          </div>
        )}

        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={!!hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
          className={`
            w-full rounded-lg border px-3 py-[7px] text-[13px]
            transition-all duration-200
            placeholder:text-text-tertiary/60
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${
              hasError
                ? 'border-error/50 focus:ring-error/30 focus:border-error'
                : 'border-bg-tertiary focus:ring-text-tertiary/20 focus:border-text-secondary/40'
            }
          `}
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
          }}
        />

        {/* Toggle password visibility */}
        {isPassword && value.length > 0 && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none transition-colors duration-150"
            style={{ color: 'var(--color-text-tertiary)' }}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <p
          id={`${name}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-xs pt-0.5"
          style={{ color: 'var(--color-error)' }}
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
