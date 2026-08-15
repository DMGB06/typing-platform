'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { FilterState } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useCatalogs } from '@/hooks/useCatalogs';
import { getMyPreferences } from '@/lib/api/users';
import { TextFilters } from './TextFilters';
import { TypingDisplay } from './TypingDisplay';

/**
 * Componente TypingArea - Área principal de escritura
 *
 * Incluye:
 * - Carga dinámica de catálogos desde la API (dificultades, tipos, idiomas)
 * - Filtros de texto conectados a la BD
 * - Display del texto a escribir
 * - Estadísticas en tiempo real
 */
export const TypingArea: React.FC = () => {
  const { catalogs, loading: loadingCatalogs } = useCatalogs();
  const { ready, isLoggedIn } = useAuth();

  // Dificultad preferida del usuario logueado (null = no aplica o no hay preferencia)
  const [preferredDifficultyId, setPreferredDifficultyId] = useState<number | null>(null);
  // true una vez que la promesa de getMyPreferences() se resolvió o rechazó
  const [preferenceFetchSettled, setPreferenceFetchSettled] = useState(false);

  useEffect(() => {
    if (!ready) return;

    if (!isLoggedIn) return;

    let cancelled = false;

    getMyPreferences()
      .then((data) => {
        if (!cancelled) setPreferredDifficultyId(data.defaultDifficultyId);
      })
      .catch((err) => {
        console.error('Error al cargar la dificultad preferida:', err);
      })
      .finally(() => {
        if (!cancelled) setPreferenceFetchSettled(true);
      });

    return () => {
      cancelled = true;
    };
  }, [ready, isLoggedIn]);

  // true una vez que ya sabemos si hay (o no hay) preferencia que aplicar
  const preferenceLoaded = !ready
    ? false
    : !isLoggedIn
      ? true
      : preferenceFetchSettled;

  // Calcular defaults derivados de los catálogos y la preferencia guardada (sin efecto propio)
  const defaultFilters = useMemo<FilterState>(() => {
    if (loadingCatalogs || !preferenceLoaded) {
      return { typeId: null, difficultyId: null, languageId: null };
    }

    const preferredDifficultyActive =
      preferredDifficultyId !== null &&
      catalogs.difficulties.some((d) => d.id === preferredDifficultyId);

    return {
      typeId: catalogs.textTypes[0]?.id ?? null,
      difficultyId: preferredDifficultyActive
        ? preferredDifficultyId
        : (catalogs.difficulties.find((d) => d.name === 'Intermedio')?.id ??
          catalogs.difficulties[0]?.id ??
          null),
      languageId:
        catalogs.languages.find((l) => l.code === 'es')?.id ??
        catalogs.languages[0]?.id ??
        null,
    };
  }, [catalogs, loadingCatalogs, preferredDifficultyId, preferenceLoaded]);

  // Los filtros del usuario; null = todavía no personalizó nada
  const [userFilters, setUserFilters] = useState<FilterState | null>(null);
  const filters = userFilters ?? defaultFilters;

  const [isStarted, setIsStarted] = useState(false);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setUserFilters((prev) => ({ ...(prev ?? defaultFilters), ...newFilters }));
    setIsStarted(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Filtros de Texto */}
      <TextFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        disabled={isStarted}
        catalogs={catalogs}
        loadingCatalogs={loadingCatalogs}
      />

      {/* Área de Escritura */}
      <TypingDisplay
        filters={filters}
        isStarted={isStarted}
        onStart={() => setIsStarted(true)}
        onReset={() => setIsStarted(false)}
      />
    </div>
  );
};
