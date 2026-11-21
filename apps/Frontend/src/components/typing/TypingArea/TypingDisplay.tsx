'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { FiRotateCcw } from 'react-icons/fi';
import type { TypingDisplayProps, Text, CreateTypingSessionRequest } from '@/types';
import { getRandomText } from '@/lib/api/texts';
import { ApiError } from '@/lib/api/client';
import { createTypingSession, startTypingSession } from '@/lib/api/typing-sessions';
import { useAuth } from '@/hooks/useAuth';

function measureTyping(input: string[], target: string[], startTime: number) {
  const elapsed = Math.max(1, (Date.now() - startTime) / 1000);
  const correct = input.filter((char, index) => char === target[index]).length;
  return {
    wpm: Math.round((correct / 5) * (60 / elapsed)),
    timeSeconds: Math.ceil(elapsed),
  };
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
  const { isLoggedIn } = useAuth();

  // Estado del texto y tipeo
  const [textData, setTextData] = useState<Text | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showLoginHint, setShowLoginHint] = useState(false);

  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [finished, setFinished] = useState(false);
  const [retry, setRetry] = useState<CreateTypingSessionRequest | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const generation = useRef(0);
  const busy = useRef(false);
  const input = useRef<string[]>([]);
  const events = useRef<string[]>([]);
  const attemptId = useRef<string | null>(null);
  const insertions = useRef(0);
  const correctInsertions = useRef(0);
  const target = useMemo(
    () => Array.from(textData?.content.replace(/\r\n?/g, '\n') ?? ''),
    [textData],
  );
  const { typeId, difficultyId, languageId } = filters;

  useEffect(() => {
    if (!typeId && !difficultyId && !languageId) return;
    let cancelled = false;

    const fetchText = async () => {
      setLoading(true);
      try {
        const randomText = await getRandomText({
          difficultyId: difficultyId ?? undefined,
          typeId: typeId ?? undefined,
          languageId: languageId ?? undefined,
        });
        if (cancelled) return;
        setTextData(randomText);
      } catch {
        if (!cancelled) setError('Sin resultados para esta combinaci\u00f3n.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchText();
    const invalidate = () => { generation.current++; };
    return () => {
      cancelled = true;
      invalidate();
    };
  }, [typeId, difficultyId, languageId]);

  // Timer
  useEffect(() => {
    if (!isStarted || !startTime) return;

    const interval = setInterval(() => {
      const metrics = measureTyping(input.current, target, startTime);
      setWpm(metrics.wpm);
      setTimeSeconds(metrics.timeSeconds);
    }, 100);

    return () => clearInterval(interval);
  }, [isStarted, startTime, target]);

  const begin = async () => {
    if (!textData || !target.length || busy.current || isStarted || finished) return;
    const version = generation.current;
    busy.current = true;
    setStarting(true);
    setSaveError(null);
    try {
      const attempt = isLoggedIn ? await startTypingSession(textData.id) : null;
      if (version !== generation.current) return;
      attemptId.current = attempt?.attemptId ?? null;
      setStartTime(Date.now());
      onStart();
      area.current?.focus();
    } catch {
      if (version === generation.current) {
        setSaveError('No se pudo iniciar el intento. Vuelve a intentarlo.');
      }
    } finally {
      if (version === generation.current) {
        busy.current = false;
        setStarting(false);
      }
    }
  };

  const save = async (request: CreateTypingSessionRequest) => {
    if (busy.current) return;
    const version = generation.current;
    busy.current = true;
    setSaveError(null);
    setRetry(null);
    setSaving(true);
    try {
      const result = await createTypingSession(request);
      if (version !== generation.current) return;
      setWpm(result.wpm ?? 0);
      setAccuracy(result.accuracy ?? 0);
      setTimeSeconds(result.timeSeconds ?? 0);
      setSaved(true);
    } catch (error) {
      if (version !== generation.current) return;
      const transient = !(error instanceof ApiError) || error.status >= 500 || error.status === 429;
      if (transient) setRetry(request);
      setSaveError(transient ? 'No se pudo guardar tu resultado.' : error.message);
    } finally {
      if (version === generation.current) {
        busy.current = false;
        setSaving(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.ctrlKey || e.altKey || e.metaKey || e.nativeEvent.isComposing) return;
    if (loading || !textData || finished || input.current.length === target.length) return;

    const expected = target[input.current.length];
    const key = e.key === 'Enter' && expected === '\n' ? '\n'
      : e.key === 'Tab' && expected === '\t' && !e.shiftKey ? '\t'
      : e.key;
    if (key !== 'Backspace' && !/^(?:[\t\n]|[^\p{Cc}\p{Cs}])$(?![\s\S])/u.test(key)) return;
    e.preventDefault();
    if (!isStarted || startTime === null) {
      if (key !== 'Backspace') void begin();
      return;
    }
    if (key === 'Backspace' && input.current.length === 0) return;
    if (attemptId.current && events.current.length >= target.length * 10) {
      setFinished(true);
      setSaveError('Se alcanz\u00f3 el l\u00edmite de eventos. Reinicia el intento.');
      onReset();
      return;
    }

    if (attemptId.current) events.current.push(key);
    if (key === 'Backspace') {
      input.current.pop();
    } else {
      input.current.push(key);
      insertions.current++;
      if (key === expected) correctInsertions.current++;
    }
    setUserInput([...input.current]);

    const isComplete = input.current.length === target.length;
    if (!isComplete || !attemptId.current) {
      const metrics = measureTyping(input.current, target, startTime);
      setWpm(metrics.wpm);
      setAccuracy((correctInsertions.current / insertions.current) * 100);
      setTimeSeconds(metrics.timeSeconds);
    }
    if (!isComplete) return;

    setFinished(true);
    onReset();
    if (attemptId.current) {
      void save({ attemptId: attemptId.current, events: [...events.current] });
    } else {
      setShowLoginHint(true);
    }
  };

  const handleRestart = () => {
    generation.current++;
    busy.current = false;
    input.current = [];
    events.current = [];
    attemptId.current = null;
    insertions.current = 0;
    correctInsertions.current = 0;
    setUserInput([]);
    setWpm(0);
    setAccuracy(100);
    setTimeSeconds(0);
    setStartTime(null);
    setSaveError(null);
    setRetry(null);
    setShowLoginHint(false);
    setStarting(false);
    setSaving(false);
    setSaved(false);
    setFinished(false);
    onReset();
    area.current?.focus();
  };

  return (
    <div className="space-y-12">

      {/* Área de Texto */}
      <div
        className="rounded-xl p-8 relative focus-within:ring-2 focus-within:ring-(--color-accent) transition-all duration-300"
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        ref={area}
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
            {!isStarted && !finished && !starting && textData && (
              <div className="text-center mb-6">
                <button type="button" onClick={() => void begin()} className="underline">
                  Iniciar
                </button>
              </div>
            )}
            {starting && <p role="status" className="text-center mb-6">Iniciando...</p>}

            {/* Texto */}
            <div className="typing-text text-center">
              {target.map((char, index) => {
                let charClass = 'char-pending';

                if (index < userInput.length) {
                  // Ya fue escrito
                  charClass = userInput[index] === char ? 'char-correct' : 'char-incorrect';
                } else if (index === userInput.length) {
                  // Carácter actual — clase con el pulso animado del cursor
                  charClass = 'char-current';
                }

                return (
                  <span key={index} className={charClass}>
                    {char}
                  </span>
                );
              })}
            </div>

            {/* Botón Restart */}
            {(isStarted || starting || finished) && (
              <div className="absolute top-4 right-4">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-1.5 text-sm transition-colors duration-200 hover:opacity-70"
                  style={{ color: 'var(--color-text-tertiary)' }}
                  title="Reiniciar intento"
                >
                  <FiRotateCcw className="w-3.5 h-3.5" />
                  restart
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
            {Number(accuracy.toFixed(2))}%
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

      {/* Aviso de guardado (login o error) */}
      {showLoginHint && (
        <p className="text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          <Link href="/auth/login" className="underline hover:opacity-80">
            Inicia sesión
          </Link>{' '}
          para guardar tu progreso.
        </p>
      )}
      {saving && <p role="status" className="text-center text-sm">Guardando resultado...</p>}
      {saved && <p role="status" className="text-center text-sm">Resultado guardado.</p>}
      {saveError && (
        <div className="text-center text-sm" style={{ color: 'var(--color-error)' }}>
          <p role="alert">{saveError}</p>
          {retry && (
            <button type="button" className="underline" onClick={() => void save(retry)}>
              Reintentar guardado
            </button>
          )}
        </div>
      )}
    </div>
  );
};
