/**
 * Tipos del módulo de Typing - Estado y Props de componentes
 */

import type { Difficulty, TextType, Language } from './api.types';

// ── Estado de filtros (almacena IDs numéricos que coinciden con la BD) ───

export interface FilterState {
  /** ID del tipo de texto (modelo TextType) */
  typeId: number | null;
  /** ID de la dificultad (modelo Difficulty) */
  difficultyId: number | null;
  /** ID del idioma (modelo Language) */
  languageId: number | null;
}

// ── Catálogos cargados desde la API ──────────────────────────

export interface Catalogs {
  textTypes: TextType[];
  difficulties: Difficulty[];
  languages: Language[];
}

// ── Props de componentes ─────────────────────────────────────

export interface TypingDisplayProps {
  filters: FilterState;
  isStarted: boolean;
  onStart: () => void;
  onReset: () => void;
}

export interface TextFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  disabled?: boolean;
  catalogs: Catalogs;
  loadingCatalogs?: boolean;
}
