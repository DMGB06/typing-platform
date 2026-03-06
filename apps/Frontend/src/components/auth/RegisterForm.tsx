'use client';

import React from 'react';
import { AuthInput } from './AuthInput';
import {
    useAuthForm,
    validators,
    combineValidators,
    type FieldConfig,
} from '@/hooks/useAuthForm';
import { register as registerApi } from '@/lib/api/auth';

// ── Campos del formulario ────────────────────────────────────

const fields: FieldConfig[] = [
    {
        name: 'username',
        label: 'Nombre de usuario',
        type: 'text',
        placeholder: 'ej. john_doe',
        validate: validators.username,
    },
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'tu@email.com',
        validate: validators.email,
    },
    {
        name: 'confirmEmail',
        label: 'Confirmar email',
        type: 'email',
        placeholder: 'Repite tu email',
        validate: combineValidators(
            validators.email,
            validators.match('email', 'Los emails'),
        ),
    },
    {
        name: 'password',
        label: 'Contraseña',
        type: 'password',
        placeholder: '••••••••',
        validate: validators.password,
    },
    {
        name: 'confirmPassword',
        label: 'Confirmar contraseña',
        type: 'password',
        placeholder: '••••••••',
        validate: combineValidators(
            validators.required('La confirmación'),
            validators.match('password', 'Las contraseñas'),
        ),
    },
];

// ── Iconos para cada campo ───────────────────────────────────

const fieldIcons: Record<string, React.ReactNode> = {
    username: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <circle cx="12" cy="8" r="4" />
            <path strokeLinecap="round" d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
        </svg>
    ),
    email: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 7l-10 6L2 7" />
        </svg>
    ),
    confirmEmail: (
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
    confirmPassword: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
    ),
};

// ── Componente ───────────────────────────────────────────────

interface RegisterFormProps {
    onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
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
        await registerApi({
            username: vals.username,
            email: vals.email,
            password: vals.password,
        });
        onSuccess?.();
    });

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4">
                <div
                    className="flex items-center justify-center w-8 h-8"
                    style={{
                        color: 'var(--color-text-secondary)',
                    }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        Crear cuenta
                    </h2>

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
            <form onSubmit={handleSubmit} noValidate className="space-y-10">
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
                            field.name === 'username'
                                ? 'username'
                                : field.name.includes('email')
                                    ? 'email'
                                    : field.name === 'password'
                                        ? 'new-password'
                                        : 'new-password'
                        }
                    />
                ))}

                {/* Password requirements hint */}
                <div
                    className="text-[11px] flex flex-col gap-0.5 pt-0.5"
                    style={{ color: 'var(--color-text-tertiary)' }}
                >
                    <span>La contraseña debe tener:</span>
                    <span className="flex items-center gap-1.5">
                        <span
                            className="w-1 h-1 rounded-full inline-block"
                            style={{
                                backgroundColor:
                                    values.password?.length >= 6
                                        ? 'var(--color-success)'
                                        : 'var(--color-text-tertiary)',
                            }}
                        />
                        Mínimo 6 caracteres
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span
                            className="w-1 h-1 rounded-full inline-block"
                            style={{
                                backgroundColor: /[A-Z]/.test(values.password || '')
                                    ? 'var(--color-success)'
                                    : 'var(--color-text-tertiary)',
                            }}
                        />
                        Una letra mayúscula
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span
                            className="w-1 h-1 rounded-full inline-block"
                            style={{
                                backgroundColor: /[0-9]/.test(values.password || '')
                                    ? 'var(--color-success)'
                                    : 'var(--color-text-tertiary)',
                            }}
                        />
                        Un número
                    </span>
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
                            Creando cuenta...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Crear cuenta
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};
