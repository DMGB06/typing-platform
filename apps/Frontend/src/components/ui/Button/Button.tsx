import React from 'react';

/**
 * Variantes del botón
 * - primary: Acción principal (amarillo dorado)
 * - secondary: Acción secundaria (gris)
 * - ghost: Sin fondo, solo hover
 */
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

/**
 * Tamaños del botón
 */
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

/**
 * Componente Button reutilizable
 * 
 * Características:
 * - Múltiples variantes (primary, secondary, ghost)
 * - Tamaños personalizables
 * - Estados hover, active, disabled
 * - Accesibilidad incluida
 * - Transiciones suaves
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      className = '',
      disabled = false,
      ...props
    },
    ref,
  ) => {
    // Estilos base compartidos por todas las variantes
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    // Estilos por variante
    const variantStyles = {
      primary:
        'bg-[var(--color-accent)] text-[var(--color-bg-primary)] hover:opacity-80 focus:ring-[var(--color-accent)] active:scale-95',
      secondary:
        'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-hover)] focus:ring-[var(--color-bg-tertiary)]',
      ghost:
        'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] focus:ring-[var(--color-bg-tertiary)]',
    };

    // Estilos por tamaño
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
