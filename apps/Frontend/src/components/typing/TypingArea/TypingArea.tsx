'use client';

import React, { useState, useMemo } from 'react';
import type { FilterState } from '@/types';
import { useCatalogs } from '@/hooks/useCatalogs';
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

  // Calcular defaults derivados de los catálogos (sin efecto)
  const defaultFilters = useMemo<FilterState>(() => {
    if (loadingCatalogs) {
      return { typeId: null, difficultyId: null, languageId: null };
    }
    return {
      typeId: catalogs.textTypes[0]?.id ?? null,
      difficultyId:
        catalogs.difficulties.find((d) => d.name === 'Intermedio')?.id ??
        catalogs.difficulties[0]?.id ??
        null,
      languageId:
        catalogs.languages.find((l) => l.code === 'es')?.id ??
        catalogs.languages[0]?.id ??
        null,
    };
  }, [catalogs, loadingCatalogs]);

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
