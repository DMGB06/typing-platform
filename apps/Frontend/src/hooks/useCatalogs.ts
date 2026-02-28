"use client";

import { useState, useEffect } from "react";
import type { Catalogs } from "@/types";
import { getDifficulties, getTextTypes, getLanguages } from "@/lib/api/texts";

/**
 * Hook que carga los catálogos (dificultades, tipos de texto, idiomas)
 * desde la API pública /catalogs/* una sola vez al montar.
 *
 * Retorna:
 * - catalogs: datos de los 3 catálogos
 * - loading: true mientras se cargan
 * - error: mensaje de error si falla
 */
export function useCatalogs() {
  const [catalogs, setCatalogs] = useState<Catalogs>({
    difficulties: [],
    textTypes: [],
    languages: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCatalogs() {
      try {
        const [difficulties, textTypes, languages] = await Promise.all([
          getDifficulties(),
          getTextTypes(),
          getLanguages(),
        ]);

        if (!cancelled) {
          setCatalogs({ difficulties, textTypes, languages });
        }
      } catch (err) {
        console.error("Error fetching catalogs:", err);
        if (!cancelled) {
          setError("Error al cargar los catálogos.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCatalogs();
    return () => {
      cancelled = true;
    };
  }, []);

  return { catalogs, loading, error };
}
