/**
 * API Service para Sesiones de Typing
 *
 * Endpoints:
 * - POST /typing-sessions — Guarda el resultado de una sesión completa
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
