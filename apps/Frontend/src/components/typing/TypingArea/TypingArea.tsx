'use client';

import React, { useState } from 'react';
import { TextFilters } from './TextFilters';
import { TypingDisplay } from './TypingDisplay';

export interface FilterState {
  textType: string;
  difficulty: string;
  language: string;
  wordCount: number;
}

/**
 * Componente TypingArea - Área principal de escritura
 * 
 * Incluye:
 * - Filtros de texto (tipo, dificultad, idioma, longitud)
 * - Display del texto a escribir
 * - Estadísticas en tiempo real
 */
export const TypingArea: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    textType: 'words',
    difficulty: 'medium',
    language: 'spanish',
    wordCount: 25,
  });

  const [isStarted, setIsStarted] = useState(false);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Aquí resetearías el texto y stats cuando cambian los filtros
    setIsStarted(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Filtros de Texto */}
      <TextFilters 
        filters={filters} 
        onFilterChange={handleFilterChange}
        disabled={isStarted}
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
