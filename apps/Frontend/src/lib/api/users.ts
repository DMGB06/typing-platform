/**
 * API Service para el Usuario Autenticado
 *
 * Endpoints:
 * - GET /users/me/stats — Estadísticas propias por dificultad
 */

import type { UserStatsResponse } from "@/types";
import { apiClient } from "./client";

export function getMyStats(): Promise<UserStatsResponse[]> {
  return apiClient<UserStatsResponse[]>("/users/me/stats");
}
