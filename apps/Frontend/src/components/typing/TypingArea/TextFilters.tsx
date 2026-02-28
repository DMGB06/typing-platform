'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { TextFiltersProps } from '@/types';

/** Label de grupo de filtros */
const GroupLabel = ({ children }: { children: React.ReactNode }) => (
  <span
    className="text-[10px] uppercase tracking-[0.12em] font-semibold select-none mb-1.5"
    style={{ color: 'var(--color-text-tertiary)' }}
  >
    {children}
  </span>
);

/**
 * Componente TextFilters - Filtros dinámicos cargados desde la BD
 *
 * Recibe los catálogos (textTypes, difficulties, languages) como props
 * y envía IDs numéricos al cambiar un filtro.
 *
 * Layout: fila horizontal con 3 grupos | Idioma como dropdown
 */
export const TextFilters: React.FC<TextFiltersProps> = ({
  filters,
  onFilterChange,
  disabled = false,
  catalogs,
  loadingCatalogs = false,
}) => {
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // ── Cerrar dropdown al interactuar fuera ──

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // ── Componentes internos ──

  const FilterChip = ({
    active,
    onClick,
    children,
    tooltip,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    tooltip?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || loadingCatalogs}
      title={tooltip}
      className={`
        relative px-3 py-1.5 text-[13px] font-medium rounded-md
        transition-all duration-200 cursor-pointer whitespace-nowrap
        disabled:opacity-40 disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-offset-2
        ${active
          ? 'text-[var(--color-bg-primary)] shadow-sm'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
        }
      `}
      style={{
        backgroundColor: active ? 'var(--color-accent)' : undefined,
        outlineColor: active ? 'var(--color-accent)' : undefined,
      }}
    >
      {children}
    </button>
  );

  // Iconos por nombre de tipo de texto
  const typeIcons: Record<string, string> = {
    'Párrafo': '¶',
    'Código': '⟨/⟩',
    'Cita': '❝',
    'Artículo': '§',
  };

  const selectedLang = catalogs.languages.find((l) => l.id === filters.languageId);

  // ── Skeleton loader mientras cargan catálogos ──

  if (loadingCatalogs) {
    return (
      <nav aria-label="Filtros de texto" className="mb-8">
        <div
          className="flex items-center justify-center rounded-xl px-5 py-5 gap-6"
          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-8 w-20 rounded-md animate-pulse"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
              />
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav aria-label="Filtros de texto" className="mb-8">
      <div
        className="rounded-xl px-4 py-4 sm:px-5"
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        {/* Grid de 3 columnas en desktop, 1 columna en mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-center gap-4 sm:gap-5">

          {/* ─── Tipo de texto ─────────────────────────── */}
          <div className="flex flex-col items-center gap-1.5">
            <GroupLabel>Tipo</GroupLabel>
            <div className="flex items-center gap-0.5 flex-wrap justify-center">
              {catalogs.textTypes.map((type) => (
                <FilterChip
                  key={type.id}
                  active={filters.typeId === type.id}
                  onClick={() => onFilterChange({ typeId: type.id })}
                  tooltip={type.description ?? type.name}
                >
                  <span className="mr-1 opacity-60 text-xs">
                    {typeIcons[type.name] ?? '•'}
                  </span>
                  {type.name}
                </FilterChip>
              ))}
            </div>
          </div>

          {/* ─── Dificultad ────────────────────────────── */}
          <div className="flex flex-col items-center gap-1.5">
            <GroupLabel>Dificultad</GroupLabel>
            <div className="flex items-center gap-0.5 flex-wrap justify-center">
              {catalogs.difficulties.map((diff) => (
                <FilterChip
                  key={diff.id}
                  active={filters.difficultyId === diff.id}
                  onClick={() => onFilterChange({ difficultyId: diff.id })}
                  tooltip={diff.description ?? diff.name}
                >
                  {diff.name}
                </FilterChip>
              ))}
            </div>
          </div>

          {/* ─── Idioma (dropdown) ─────────────────────── */}
          <div className="flex flex-col items-center gap-1.5" ref={langRef}>
            <GroupLabel>Idioma</GroupLabel>

            <div className="relative">
              {/* Trigger */}
              <button
                onClick={() => !(disabled || loadingCatalogs) && setLangOpen((prev) => !prev)}
                disabled={disabled || loadingCatalogs}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium
                  transition-all duration-200 cursor-pointer
                  disabled:opacity-40 disabled:cursor-not-allowed
                  focus-visible:outline-2 focus-visible:outline-offset-2
                  hover:bg-[var(--color-bg-tertiary)]
                `}
                style={{
                  color: 'var(--color-text-secondary)',
                  outlineColor: 'var(--color-accent)',
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-60 shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>{selectedLang?.name ?? 'Idioma'}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`opacity-50 shrink-0 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Dropdown */}
              {langOpen && (
                <ul
                  role="listbox"
                  aria-label="Seleccionar idioma"
                  className="
                    absolute z-50 mt-1.5 left-1/2 -translate-x-1/2
                    min-w-[160px] rounded-lg py-1 shadow-lg
                    border overflow-hidden
                  "
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    borderColor: 'rgba(255,255,255,0.06)',
                  }}
                >
                  {catalogs.languages.map((lang) => {
                    const isActive = filters.languageId === lang.id;
                    return (
                      <li
                        key={lang.id}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => {
                          onFilterChange({ languageId: lang.id });
                          setLangOpen(false);
                        }}
                        className={`
                          flex items-center justify-between px-3.5 py-2 text-[13px]
                          cursor-pointer transition-colors duration-150 select-none
                          ${isActive
                            ? 'font-semibold'
                            : 'hover:bg-[var(--color-hover)]'
                          }
                        `}
                        style={{
                          color: isActive
                            ? 'var(--color-accent)'
                            : 'var(--color-text-secondary)',
                          backgroundColor: isActive
                            ? 'rgba(255, 215, 0, 0.08)'
                            : undefined,
                        }}
                      >
                        <span>{lang.name}</span>
                        {isActive && (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="shrink-0 ml-3"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};
