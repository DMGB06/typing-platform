/**
 * API Service para Notificaciones
 *
 * Endpoints:
 * - GET /notifications/me — Notificaciones propias (últimas 30)
 * - GET /notifications/me/unread-count — Cantidad de no leídas
 * - PUT /notifications/me/read-all — Marcar todas como leídas
 */

import type { NotificationResponse } from "@/types";
import { apiClient } from "./client";

export function getMyNotifications(): Promise<NotificationResponse[]> {
  return apiClient<NotificationResponse[]>("/notifications/me");
}

export function getUnreadCount(): Promise<{ count: number }> {
  return apiClient<{ count: number }>("/notifications/me/unread-count");
}

export function markAllAsRead(): Promise<{ count: number }> {
  return apiClient<{ count: number }>("/notifications/me/read-all", {
    method: "PUT",
  });
}
