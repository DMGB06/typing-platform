/**
 * API Service para Autenticación
 *
 * Endpoints:
 * - POST /auth/register — Registro de usuario
 * - POST /auth/login    — Inicio de sesión
 * - POST /auth/logout   — Cierre de sesión (limpia la cookie httpOnly)
 */

import type { RegisterRequest, LoginRequest, AuthResponse } from "@/types";
import { apiClient, setStoredUser, removeStoredUser } from "./client";

/**
 * Registra un nuevo usuario. El backend setea la cookie de sesión.
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: data,
  });

  setStoredUser(response.user);
  return response;
}

/**
 * Inicia sesión. El backend setea la cookie de sesión.
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: data,
  });

  setStoredUser(response.user);
  return response;
}

/**
 * Cierra sesión: le pide al backend que limpie la cookie httpOnly
 * (el frontend no puede borrarla por su cuenta) y limpia el usuario cacheado.
 */
export async function logout(): Promise<void> {
  await apiClient("/auth/logout", { method: "POST" });
  removeStoredUser();
}
