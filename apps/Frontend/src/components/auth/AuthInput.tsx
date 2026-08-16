'use client';

import React, { useState, type ChangeEvent } from 'react';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

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
              <FiEyeOff className="w-4 h-4" />
            ) : (
              <FiEye className="w-4 h-4" />
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
          <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};
