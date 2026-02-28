/**
 * API Service para Autenticación
 *
 * Endpoints:
 * - POST /auth/register — Registro de usuario
 * - POST /auth/login    — Inicio de sesión
 */

import type { RegisterRequest, LoginRequest, AuthResponse } from "@/types";
import { apiClient, setToken } from "./client";

/**
 * Registra un nuevo usuario y guarda el token
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient<AuthResponse>("/auth/register", {
    method: "POST",
    body: data,
  });

  setToken(response.token);
  return response;
}

/**
 * Inicia sesión y guarda el token
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: data,
  });

  setToken(response.token);
  return response;
}
