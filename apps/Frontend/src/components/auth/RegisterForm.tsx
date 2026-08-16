'use client';

import React from 'react';
import { FiUser, FiMail, FiLock, FiUserPlus, FiAlertCircle } from 'react-icons/fi';
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
    username: <FiUser className="w-4 h-4" />,
    email: <FiMail className="w-4 h-4" />,
    confirmEmail: <FiMail className="w-4 h-4" />,
    password: <FiLock className="w-4 h-4" />,
    confirmPassword: <FiLock className="w-4 h-4" />,
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
                    className="flex items-center justify-center w-8 h-8 rounded-lg border"
                    style={{
                        borderColor: 'var(--color-bg-tertiary)',
                        backgroundColor: 'var(--color-bg-primary)',
                        color: 'var(--color-text-secondary)',
                    }}
                >
                    <FiUserPlus className="w-4 h-4" />
                </div>
                <div>
                    <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        Crear cuenta
                    </h2>
                    <p className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
                        Únete a la comunidad
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
                            <FiUserPlus className="w-4 h-4" />
                            Crear cuenta
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};
