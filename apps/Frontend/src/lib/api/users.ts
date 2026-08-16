/**
 * API Service para el Usuario Autenticado
 *
 * Endpoints:
 * - GET /users/me/stats — Estadísticas propias por dificultad
 * - GET /users/me/preferences — Preferencias propias (dificultad por defecto)
 * - PUT /users/me/preferences — Actualizar preferencias propias
 * - PUT /users/me — Actualizar username y/o email propios
 * - PUT /users/me/password — Cambiar la contraseña propia
 * - PUT /users/me/deactivate — Desactivar (eliminar) la cuenta propia
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

export function updateMyAccount(data: {
  username?: string;
  email?: string;
}): Promise<{ username: string; email: string; role: string; isActive: boolean }> {
  return apiClient("/users/me", { method: "PUT", body: data });
}

export function updateMyPassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean }> {
  return apiClient("/users/me/password", {
    method: "PUT",
    body: { currentPassword, newPassword },
  });
}

export function deactivateMyAccount(): Promise<{ username: string; isActive: boolean }> {
  return apiClient("/users/me/deactivate", { method: "PUT" });
}
