/**
 * API Service para Sesiones de Typing
 *
 * Endpoints:
 * - POST /typing-sessions — Guarda el resultado de una sesión completa
 * - GET /typing-sessions  — Sesiones recientes del usuario autenticado
 */

import type {
  CreateTypingSessionRequest,
  TypingSessionResponse,
} from "@/types";
import { apiClient } from "./client";

export function createTypingSession(
  data: CreateTypingSessionRequest,
): Promise<TypingSessionResponse> {
  return apiClient<TypingSessionResponse>("/typing-sessions", {
    method: "POST",
    body: data,
  });
}

export function getMyRecentSessions(): Promise<TypingSessionResponse[]> {
  return apiClient<TypingSessionResponse[]>("/typing-sessions");
}
