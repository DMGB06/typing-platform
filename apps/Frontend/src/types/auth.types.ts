/**
 * Tipos de Autenticación
 */

// ── Request DTOs ─────────────────────────────────────────────

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// ── Response ─────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: AuthUser;
}
