/**
 * Tipos del módulo de Typing - Estado y Props de componentes
 */

import type { Difficulty, TextType, Language, Text } from './api.types';

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

export type PracticeFilters = { [Key in keyof FilterState]: number };

export type PracticeText = Pick<Text, 'id' | 'title' | 'content' | keyof FilterState> & {
  contentHash: string;
};

export interface PracticeBootstrap {
  catalogs: Catalogs;
  filters: PracticeFilters | null;
  texts: PracticeText[];
  expiresAt: string;
}

export interface TypingDisplayProps {
  textData: PracticeText;
  expiresAt?: number;
  isStarted: boolean;
  onBegin: () => void;
  onStart: () => void;
  onReset: () => void;
  onTextUnavailable: () => void;
}

export interface TextFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  disabled?: boolean;
  catalogs: Catalogs;
  loadingCatalogs?: boolean;
}

// ── Sesiones de typing ────────────────────────────────────────

export interface CreateTypingSessionRequest {
  attemptId: string;
  events: string[];
}

export interface TypingSessionResponse {
  id: number;
  userId: number;
  textId: number;
  wpm: number | null;
  accuracy: number | null;
  timeSeconds: number | null;
  errorRate: number | null;
  improvementRate: number | null;
  createdAt: string;
}

export interface UserStatsResponse {
  difficultyId: number;
  difficultyName: string;
  bestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
  totalSessions: number;
  avgErrorRate: number;
}

export interface LeaderboardEntry {
  username: string;
  bestWpm: number;
  avgAccuracy: number;
  totalSessions: number;
}

export interface UserPreferences {
  defaultDifficultyId: number | null;
}

export interface NotificationResponse {
  id: number;
  difficultyId: number;
  difficultyName: string;
  wpm: number;
  isRead: boolean;
  createdAt: string;
}
