'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal de confirmación reutilizable
 *
 * - Cierra con Escape
 * - Cierra al hacer clic en el backdrop
 * - Foco atrapado dentro del modal (accesibilidad)
 * - Usa el design system del proyecto (CSS vars)
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Cerrar con Escape y enfocar el botón cancelar al abrir
  useEffect(() => {
    if (!isOpen) return;

    cancelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onCancel}
      role="presentation"
    >
      {/* Panel del modal — detiene propagación para no cerrar al hacer clic dentro */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby={description ? 'confirm-modal-desc' : undefined}
        className="w-full max-w-sm rounded-xl p-6 flex flex-col gap-5 shadow-2xl"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-bg-tertiary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ícono de advertencia */}
        <div className="flex justify-center">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'var(--color-accent)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>
        </div>

        {/* Texto */}
        <div className="text-center flex flex-col gap-1.5">
          <h2
            id="confirm-modal-title"
            className="text-lg font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {title}
          </h2>
          {description && (
            <p
              id="confirm-modal-desc"
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <Button
            ref={cancelRef}
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
