/**
 * Tipos de la API - Modelos del backend
 */

// ── Filtros ──────────────────────────────────────────────────

export interface TextFilters {
  difficultyId?: number;
  typeId?: number;
  languageId?: number;
}

// ── Modelos ──────────────────────────────────────────────────

export interface Difficulty {
  id: number;
  name: string;
  description?: string;
  orderIndex: number;
}

export interface TextType {
  id: number;
  name: string;
  description?: string;
}

export interface Language {
  id: number;
  code: string;
  name: string;
}

export interface Text {
  id: number;
  title: string;
  content: string;
  difficultyId: number;
  typeId: number;
  languageId: number;
  createdAt: string;
  difficulty: Difficulty;
  type: TextType;
  language: Language;
}
