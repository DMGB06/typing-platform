/**
 * API Service para Textos y Catálogos
 *
 * Endpoints:
 * - GET /texts/random          — Texto aleatorio con filtros
 * - GET /texts                 — Textos paginados
 * - GET /catalogs/difficulties — Catálogo de dificultades (público)
 * - GET /catalogs/text-types   — Catálogo de tipos de texto (público)
 * - GET /catalogs/languages    — Catálogo de idiomas (público)
 */

import type {
  Text,
  TextFilters,
  Difficulty,
  TextType,
  Language,
} from "@/types";
import { apiClient } from "./client";

// ── Helpers ──────────────────────────────────────────────────

function buildQuery(filters: TextFilters): string {
  const params = new URLSearchParams();
  if (filters.difficultyId)
    params.append("difficultyId", filters.difficultyId.toString());
  if (filters.typeId) params.append("typeId", filters.typeId.toString());
  if (filters.languageId)
    params.append("languageId", filters.languageId.toString());
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ── Textos ───────────────────────────────────────────────────

export function getRandomText(filters: TextFilters): Promise<Text> {
  return apiClient<Text>(`/texts/random${buildQuery(filters)}`);
}

// ── Catálogos (endpoints públicos, sin auth) ─────────────────

export function getDifficulties(): Promise<Difficulty[]> {
  return apiClient<Difficulty[]>("/catalogs/difficulties");
}

export function getTextTypes(): Promise<TextType[]> {
  return apiClient<TextType[]>("/catalogs/text-types");
}

export function getLanguages(): Promise<Language[]> {
  return apiClient<Language[]>("/catalogs/languages");
}
