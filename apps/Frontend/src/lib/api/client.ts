/**
 * Cliente HTTP base — centraliza fetch y headers
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ── Error tipado ─────────────────────────────────────────────
// Preserva el status HTTP para que los callers puedan reaccionar a casos
// específicos (ej. 401 = sesión vencida) sin parsear el mensaje.

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ── Store compartido del usuario ────────────────────────────
// Cache no sensible del usuario, solo para pintar la UI al instante.
// La sesión real vive en la cookie httpOnly, no acá.
// Compartido entre todos los componentes que usan useAuth() (no un
// useState por componente), para que un logout o una sesión vencida
// detectada en cualquier fetch se reflejen en toda la app al instante.

const USER_KEY = "auth_user";

function readStoredUser<T = unknown>(): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

let currentUser: unknown = null;
let currentUserInitialized = false;
const listeners = new Set<() => void>();

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeUser(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getUserSnapshot<T = unknown>(): T | null {
  if (!currentUserInitialized) {
    currentUser = readStoredUser<T>();
    currentUserInitialized = true;
  }
  return currentUser as T | null;
}

export function setStoredUser(user: unknown): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // localStorage puede tirar (ej. modo privado de Safari) - el store en
    // memoria sigue siendo la fuente de verdad para esta pestaña.
  }
  currentUser = user;
  currentUserInitialized = true;
  notifyListeners();
}

export function removeStoredUser(): void {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // Ídem setStoredUser - removeStoredUser ahora corre también desde
    // apiClient en cada 401, no solo desde el logout explícito del usuario.
  }
  currentUser = null;
  currentUserInitialized = true;
  notifyListeners();
}

// ── Fetch wrapper ────────────────────────────────────────────

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    // Un 401 de /auth/login o /auth/register significa "credenciales
    // incorrectas", no "tu sesión existente venció" — no debe borrar una
    // sesión válida que ya estuviera guardada (ej. un usuario logueado que
    // vuelve a /auth y tipea mal la contraseña de otra cuenta).
    const isCredentialsAttempt =
      endpoint === "/auth/login" || endpoint === "/auth/register";

    if (response.status === 401 && !isCredentialsAttempt) {
      // Sesión vencida o inválida: limpiamos el store compartido para que
      // toda la app (no solo el componente que hizo este fetch) deje de
      // mostrar al usuario como logueado.
      removeStoredUser();
    }

    const error = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new ApiError(error.message || `Error ${response.status}`, response.status);
  }

  return response.json();
}
