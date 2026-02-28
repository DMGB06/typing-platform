"use client";

import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";

// ── Tipos ────────────────────────────────────────────────────

export interface FieldConfig {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  validate?: (
    value: string,
    allValues: Record<string, string>,
  ) => string | null;
}

export interface UseAuthFormReturn {
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  serverError: string | null;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  setServerError: (error: string | null) => void;
  resetForm: () => void;
}

// ── Validadores reutilizables ────────────────────────────────

export const validators = {
  required: (label: string) => (value: string) =>
    value.trim() ? null : `${label} es obligatorio`,

  email: (value: string) => {
    if (!value.trim()) return "El email es obligatorio";
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value) ? null : "Ingresa un email válido";
  },

  minLength: (min: number, label: string) => (value: string) =>
    value.length >= min
      ? null
      : `${label} debe tener al menos ${min} caracteres`,

  maxLength: (max: number, label: string) => (value: string) =>
    value.length <= max ? null : `${label} no puede superar ${max} caracteres`,

  password: (value: string) => {
    if (!value) return "La contraseña es obligatoria";
    if (value.length < 6) return "Mínimo 6 caracteres";
    if (!/[A-Z]/.test(value)) return "Debe incluir al menos una mayúscula";
    if (!/[0-9]/.test(value)) return "Debe incluir al menos un número";
    return null;
  },

  match:
    (fieldName: string, label: string) =>
    (value: string, all: Record<string, string>) =>
      value === all[fieldName] ? null : `${label} no coinciden`,

  username: (value: string) => {
    if (!value.trim()) return "El nombre de usuario es obligatorio";
    if (value.length < 3) return "Mínimo 3 caracteres";
    if (value.length > 20) return "Máximo 20 caracteres";
    if (!/^[a-zA-Z0-9_]+$/.test(value))
      return "Solo letras, números y guiones bajos";
    return null;
  },
};

// ── Combinar validadores ─────────────────────────────────────

export function combineValidators(
  ...fns: Array<(value: string, all: Record<string, string>) => string | null>
) {
  return (value: string, all: Record<string, string>): string | null => {
    for (const fn of fns) {
      const error = fn(value, all);
      if (error) return error;
    }
    return null;
  };
}

// ── Hook principal ───────────────────────────────────────────

export function useAuthForm(
  fields: FieldConfig[],
  onSubmit: (values: Record<string, string>) => Promise<void>,
): UseAuthFormReturn {
  const initialValues = fields.reduce<Record<string, string>>((acc, f) => {
    acc[f.name] = "";
    return acc;
  }, {});

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const validateField = useCallback(
    (name: string, val: string, allVals: Record<string, string>) => {
      const field = fields.find((f) => f.name === name);
      return field?.validate?.(val, allVals) ?? null;
    },
    [fields],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        // Re-validate on change if field was already touched
        if (touched[name]) {
          const err = validateField(name, value, next);
          setErrors((prevErr) => ({ ...prevErr, [name]: err ?? "" }));
        }
        return next;
      });
      if (serverError) setServerError(null);
    },
    [touched, validateField, serverError],
  );

  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const err = validateField(name, value, values);
      setErrors((prev) => ({ ...prev, [name]: err ?? "" }));
    },
    [validateField, values],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setServerError(null);

      // Validate all
      const newErrors: Record<string, string> = {};
      const newTouched: Record<string, boolean> = {};
      let hasError = false;

      for (const field of fields) {
        newTouched[field.name] = true;
        const err = validateField(field.name, values[field.name], values);
        if (err) {
          newErrors[field.name] = err;
          hasError = true;
        }
      }

      setTouched(newTouched);
      setErrors(newErrors);
      if (hasError) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Ha ocurrido un error inesperado";
        setServerError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [fields, values, validateField, onSubmit],
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setServerError(null);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    serverError,
    handleChange,
    handleBlur,
    handleSubmit,
    setServerError,
    resetForm,
  };
}
