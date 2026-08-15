"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/types";
import { getStoredUser } from "@/lib/api/client";
import { logout as logoutRequest } from "@/lib/api/auth";

// Truco: useSyncExternalStore con suscripción vacía devuelve
// false en servidor y true en cliente → evita mismatch SSR/CSR sin useEffect
const noopSubscribe = () => () => {};

export interface UseAuthReturn {
  user: AuthUser | null;
  isLoggedIn: boolean;
  ready: boolean;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();

  // Lazy initializer: server → null, cliente → valor real de localStorage
  // No usa useEffect, por lo que no hay renders en cascada
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    return getStoredUser<AuthUser>();
  });

  // ready: false en SSR, true en cliente — impide hydration mismatch en Navbar
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    router.push("/");
  }, [router]);

  return { user, isLoggedIn: !!user, ready, logout };
}
