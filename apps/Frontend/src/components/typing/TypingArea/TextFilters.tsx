'use client';

import React from 'react';
import { FilterState } from './TypingArea';

interface TextFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  disabled?: boolean;
}

/**
 * Componente TextFilters - Filtros de texto estilo Monkeytype
 * 
 * Permite seleccionar:
 * - Tipo de texto (words, quotes, custom)
 * - Cantidad de palabras (10, 25, 50, 100)
 * - Dificultad (easy, medium, hard)
 * - Idioma (spanish, english, etc.)
 */
export const TextFilters: React.FC<TextFiltersProps> = ({
  filters,
  onFilterChange,
  disabled = false,
}) => {
  const textTypes = [
    { id: 'punctuation', label: '@', tooltip: 'punctuation' },
    { id: 'numbers', label: '#', tooltip: 'numbers' },
    { id: 'time', label: '🕐', tooltip: 'time' },
    { id: 'words', label: 'A', tooltip: 'words' },
    { id: 'quote', label: '""', tooltip: 'quote' },
    { id: 'zen', label: '△', tooltip: 'zen' },
    { id: 'custom', label: '✏️', tooltip: 'custom' },
  ];

  const wordCounts = [15, 30, 60, 120];

  const difficulties = [
    { id: 'easy', label: 'Easy' },
    { id: 'medium', label: 'Medium' },
    { id: 'hard', label: 'Hard' },
  ];

  const languages = [
    { id: 'spanish', label: 'Español', flag: '🇪🇸' },
    { id: 'english', label: 'English', flag: '🇺🇸' },
    { id: 'french', label: 'Français', flag: '🇫🇷' },
  ];

  const FilterButton = ({ 
    active, 
    onClick, 
    children, 
    tooltip 
  }: { 
    active: boolean; 
    onClick: () => void; 
    children: React.ReactNode;
    tooltip?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`
        px-3 py-1.5 text-sm font-medium rounded transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${active 
          ? 'text-[var(--color-bg-primary)]' 
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
        }
      `}
      style={{
        backgroundColor: active ? 'var(--color-accent)' : 'transparent',
      }}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-4 mb-8">
      
      {/* Tipo de Texto */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {textTypes.map((type) => (
          <FilterButton
            key={type.id}
            active={filters.textType === type.id}
            onClick={() => onFilterChange({ textType: type.id })}
            tooltip={type.tooltip}
          >
            {type.label} {type.tooltip}
          </FilterButton>
        ))}
      </div>

      {/* Cantidad de Palabras */}
      <div className="flex items-center justify-center gap-2">
        {wordCounts.map((count) => (
          <FilterButton
            key={count}
            active={filters.wordCount === count}
            onClick={() => onFilterChange({ wordCount: count })}
          >
            {count}
          </FilterButton>
        ))}
      </div>

      {/* Dificultad */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm mr-2" style={{ color: 'var(--color-text-tertiary)' }}>
          Difficulty:
        </span>
        {difficulties.map((diff) => (
          <FilterButton
            key={diff.id}
            active={filters.difficulty === diff.id}
            onClick={() => onFilterChange({ difficulty: diff.id })}
          >
            {diff.label}
          </FilterButton>
        ))}
      </div>

      {/* Idioma con dropdown visual */}
      <div className="flex items-center justify-center gap-2">
        <div className="relative">
          <button
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[var(--color-hover)]"
            style={{ 
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-bg-secondary)'
            }}
          >
            <span className="text-lg">🌐</span>
            <span className="text-sm">
              {languages.find(l => l.id === filters.language)?.label || 'spanish'}
            </span>
          </button>
          
          {/* Aquí podrías agregar un dropdown real más adelante */}
        </div>
      </div>
    </div>
  );
};
