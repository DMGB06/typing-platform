'use client';

import React, { useState, useEffect } from 'react';
import type { TypingDisplayProps, Text } from '@/types';
import { getRandomText } from '@/lib/api/texts';

/**
 * Componente TypingDisplay - Display del texto y estadísticas
 * 
 * Muestra:
 * - Texto a escribir con colores para caracteres correctos/incorrectos
 * - Estadísticas: WPM, Accuracy, Time
 * - Botón de restart
 */
export const TypingDisplay: React.FC<TypingDisplayProps> = ({
  filters,
  isStarted,
  onStart,
  onReset,
}) => {
  // Estado del texto y tipeo
  const [text, setText] = useState('');
  const [, setTextData] = useState<Text | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeSeconds, setTimeSeconds] = useState(0);

  // Obtener texto basado en filtros desde la API
  useEffect(() => {
    // No hacer fetch hasta que los filtros tengan IDs válidos (catálogos cargados)
    if (!filters.typeId && !filters.difficultyId && !filters.languageId) return;

    const fetchText = async () => {
      setLoading(true);
      setError(null);

      try {
        const randomText = await getRandomText({
          difficultyId: filters.difficultyId ?? undefined,
          typeId: filters.typeId ?? undefined,
          languageId: filters.languageId ?? undefined,
        });
        setTextData(randomText);
        setText(randomText.content);
      } catch (err) {
        console.error('Error fetching text:', err);
        setError('No se encontró un texto con esos filtros. Intenta con otra combinación.');
        setText('');
      } finally {
        setLoading(false);
      }
    };

    fetchText();

    // Reset estados
    setUserInput('');
    setCurrentIndex(0);
    setErrors(0);
    setWpm(0);
    setAccuracy(100);
    setTimeSeconds(0);
    setStartTime(null);
  }, [filters]);

  // Timer
  useEffect(() => {
    if (!isStarted || !startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeSeconds(elapsed);

      // Calcular WPM
      const words = userInput.trim().split(' ').length;
      const minutes = elapsed / 60;
      if (minutes > 0) {
        setWpm(Math.round(words / minutes));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isStarted, startTime, userInput]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!isStarted) {
      onStart();
      setStartTime(Date.now());
    }

    // Lógica de tecleo (simplificada)
    if (e.key === 'Backspace') {
      setUserInput(prev => prev.slice(0, -1));
      setCurrentIndex(prev => Math.max(0, prev - 1));
    } else if (e.key.length === 1) {
      const newInput = userInput + e.key;
      setUserInput(newInput);
      setCurrentIndex(newInput.length);

      // Verificar errores
      if (text[newInput.length - 1] !== e.key) {
        setErrors(prev => prev + 1);
      }

      // Calcular accuracy
      const acc = ((newInput.length - errors) / newInput.length) * 100;
      setAccuracy(Math.max(0, Math.round(acc)));

      // Verificar si terminó
      if (newInput.length === text.length) {
        onReset();
      }
    }
  };

  const handleRestart = () => {
    setUserInput('');
    setCurrentIndex(0);
    setErrors(0);
    setWpm(0);
    setAccuracy(100);
    setTimeSeconds(0);
    setStartTime(null);
    onReset();
  };

  return (
    <div className="space-y-12">

      {/* Área de Texto */}
      <div
        className="rounded-xl p-8 relative focus-within:ring-2 focus-within:ring-(--color-accent) transition-all"
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        tabIndex={loading ? -1 : 0}
        onKeyDown={handleKeyPress}
      >
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: 'var(--color-accent)' }}></div>
            <p className="text-sm mt-4" style={{ color: 'var(--color-text-tertiary)' }}>
              Cargando texto...
            </p>
          </div>
        )}

        {/* Empty / Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            {/* Icono */}
            <div
              className="flex items-center justify-center w-16 h-16 rounded-full mb-5"
              style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>

            {/* Mensaje */}
            <p
              className="text-base font-medium mb-1.5"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Sin resultados para esta combinación
            </p>
            <p
              className="text-sm mb-6 max-w-xs text-center"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              No hay textos que coincidan con el tipo, dificultad e idioma seleccionados. Prueba cambiando algún filtro.
            </p>

            {/* Botón */}
            <button
              onClick={() => window.location.reload()}
              className="
                px-5 py-2 rounded-lg text-sm font-medium
                transition-all duration-200 cursor-pointer
                hover:opacity-90 active:scale-[0.97]
              "
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Text Display */}
        {!loading && !error && (
          <>
            {/* Instrucción */}
            {!isStarted && (
              <div className="text-center mb-6">
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  Click here or press any key to start
                </p>
              </div>
            )}

            {/* Texto */}
            <div className="text-2xl leading-relaxed font-mono text-center select-none">
              {text.split('').map((char, index) => {
                let color = 'var(--color-text-tertiary)'; // pendiente

                if (index < userInput.length) {
                  // Ya fue escrito
                  color = userInput[index] === char
                    ? 'var(--color-success)'
                    : 'var(--color-error)';
                } else if (index === currentIndex) {
                  // Carácter actual
                  color = 'var(--color-accent)';
                }

                return (
                  <span
                    key={index}
                    style={{ color }}
                    className={index === currentIndex ? 'border-b-2' : ''}
                  >
                    {char}
                  </span>
                );
              })}
            </div>

            {/* Botón Restart */}
            {isStarted && (
              <div className="absolute top-4 right-4">
                <button
                  onClick={handleRestart}
                  className="text-sm transition-colors duration-200 hover:opacity-70"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  title="Restart (Ctrl + R)"
                >
                  ↻ restart
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Estadísticas */}
      <div className="flex items-center justify-center gap-12 mt-14 pt-4">
        <div className="text-center">
          <div className="text-4xl font-bold" style={{ color: 'var(--color-accent)' }}>
            {wpm}
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
            WPM
          </div>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold" style={{ color: 'var(--color-success)' }}>
            {accuracy}%
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
            Accuracy
          </div>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold" style={{ color: 'var(--color-info)' }}>
            {timeSeconds}s
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
            Time
          </div>
        </div>
      </div>
    </div>
  );
};
