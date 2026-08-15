/**
 * API Service para el Leaderboard público
 *
 * Endpoints:
 * - GET /leaderboard/difficulty/:difficultyId — top 10 por dificultad
 */

import type { LeaderboardEntry } from "@/types";
import { apiClient } from "./client";

export function getLeaderboard(
  difficultyId: number,
): Promise<LeaderboardEntry[]> {
  return apiClient<LeaderboardEntry[]>(
    `/leaderboard/difficulty/${difficultyId}`,
  );
}
