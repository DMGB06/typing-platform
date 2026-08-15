/**
 * API Service para el Usuario Autenticado
 *
 * Endpoints:
 * - GET /users/me/stats — Estadísticas propias por dificultad
 * - GET /users/me/preferences — Preferencias propias (dificultad por defecto)
 * - PUT /users/me/preferences — Actualizar preferencias propias
 */

import type { UserStatsResponse, UserPreferences } from "@/types";
import { apiClient } from "./client";

export function getMyStats(): Promise<UserStatsResponse[]> {
  return apiClient<UserStatsResponse[]>("/users/me/stats");
}

export function getMyPreferences(): Promise<UserPreferences> {
  return apiClient<UserPreferences>("/users/me/preferences");
}

export function updateMyPreferences(
  defaultDifficultyId: number,
): Promise<UserPreferences> {
  return apiClient<UserPreferences>("/users/me/preferences", {
    method: "PUT",
    body: { defaultDifficultyId },
  });
}
