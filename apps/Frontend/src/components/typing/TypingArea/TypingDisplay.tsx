'use client';

import React, { useState, useEffect } from 'react';
import { FilterState } from './TypingArea';

interface TypingDisplayProps {
  filters: FilterState;
  isStarted: boolean;
  onStart: () => void;
  onReset: () => void;
}

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
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeSeconds, setTimeSeconds] = useState(0);

  // Generar texto basado en filtros (mock - luego conectar con API)
  useEffect(() => {
    // Aquí harías una llamada al backend para obtener el texto según los filtros
    // Por ahora, texto de ejemplo
    const sampleTexts = {
      words: 'ella algunos acto preguntar cosa caliente buscar tal lugar y semana como acerca pequeño nunca nombre menor mujer gente derecho bajo venir un uno son tomar porque madre poco donde dar decir',
      quote: 'La vida es aquello que te va sucediendo mientras te empeñas en hacer otros planes.',
      custom: 'Este es un texto personalizado para practicar mecanografía.',
    };

    const baseText = sampleTexts[filters.textType as keyof typeof sampleTexts] || sampleTexts.words;
    const words = baseText.split(' ').slice(0, filters.wordCount);
    setText(words.join(' '));
    
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
    <div className="space-y-8">
      
      {/* Área de Texto */}
      <div
        className="rounded-xl p-8 relative focus-within:ring-2 focus-within:ring-(--color-accent) transition-all"
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        tabIndex={0}
        onKeyDown={handleKeyPress}
      >
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
      </div>

      {/* Estadísticas */}
      <div className="flex items-center justify-center gap-12">
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
