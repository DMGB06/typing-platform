"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/types";
import { subscribeUser, getUserSnapshot } from "@/lib/api/client";
import { logout as logoutRequest } from "@/lib/api/auth";

// Truco: useSyncExternalStore con suscripción vacía devuelve
// false en servidor y true en cliente → evita mismatch SSR/CSR sin useEffect
const noopSubscribe = () => () => {};

// user viene de un store compartido a nivel de módulo (client.ts), no de un
// useState local: así, un logout o una sesión vencida detectada en cualquier
// fetch se reflejan de inmediato en todos los componentes que usan este hook,
// no solo en el que disparó el cambio.
const getServerUserSnapshot = () => null;

export interface UseAuthReturn {
  user: AuthUser | null;
  isLoggedIn: boolean;
  ready: boolean;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();

  const user = useSyncExternalStore(
    subscribeUser,
    () => getUserSnapshot<AuthUser>(),
    getServerUserSnapshot,
  );

  // ready: false en SSR, true en cliente — impide hydration mismatch en Navbar
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error("No se pudo cerrar sesión en el servidor, se limpió la sesión localmente:", error);
    } finally {
      // logoutRequest() ya limpia el store compartido (client.ts) en su
      // propio finally, tanto si el backend respondió bien como si falló.
      router.push("/");
    }
  }, [router]);

  return { user, isLoggedIn: !!user, ready, logout };
}
