'use client';

import React from 'react';
import { GiKeyboard } from "react-icons/gi";
/**
 * Componente Navbar - Estilo Monkeytype
 * 
 * Distribución:s
 * - Logo a la izquierda + navegación junto al logo
 * - Acciones de usuario a la derecha
 * - Responsive: oculta algunos elementos en móvil
 */
export const Navbar: React.FC = () => {

    return (
        <nav className="w-full pt-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo + Navegación (juntos a la izquierda) */}
                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Logo */}
                        <div className="flex items-center gap-3">

                            <GiKeyboard className="text-3xl sm:text-5xl"
                                style={{ color: 'var(--color-accent)' }} />

                            <span
                                className="text-lg sm:text-3xl font-normal tracking-tight text-[#c6c5bb]"

                            >
                                typingpro
                            </span>
                        </div>

                        {/* Navegación junto al logo */}
                        <div className="hidden sm:flex items-center gap-2 md:gap-3">
                            <button
                                className="flex items-center justify-center w-10 h-10 rounded transition-colors duration-200 hover:bg-[var(--color-hover)]"
                                style={{ color: 'var(--color-text-secondary)' }}
                                aria-label="Keyboard"
                                title="Keyboard"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <rect x="2" y="6" width="16" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                    <line x1="5" y1="9" x2="6" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <line x1="8" y1="9" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <line x1="11" y1="9" x2="12" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <line x1="14" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <line x1="7" y1="11.5" x2="13" y2="11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>

                            <button
                                className="flex items-center justify-center w-10 h-10 rounded transition-colors duration-200 hover:bg-[var(--color-hover)]"
                                style={{ color: 'var(--color-text-secondary)' }}
                                aria-label="Leaderboard"
                                title="Leaderboard"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 3L12 8L17 8.5L13 12L14.5 17L10 14L5.5 17L7 12L3 8.5L8 8L10 3Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                                </svg>
                            </button>

                            <button
                                className="flex items-center justify-center w-10 h-10 rounded transition-colors duration-200 hover:bg-[var(--color-hover)]"
                                style={{ color: 'var(--color-text-secondary)' }}
                                aria-label="Info"
                                title="Info"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                                    <circle cx="10" cy="10" r="7" strokeWidth="1.5" />
                                    <path d="M10 9v5M10 7v.5" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>

                            <button
                                className="flex items-center justify-center w-10 h-10 rounded transition-colors duration-200 hover:bg-[var(--color-hover)]"
                                style={{ color: 'var(--color-text-secondary)' }}
                                aria-label="Settings"
                                title="Settings"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                                    <circle cx="10" cy="10" r="2" strokeWidth="1.5" />
                                    <path d="M10 3v2M10 15v2M17 10h-2M5 10H3M15.5 4.5l-1.4 1.4M5.9 14.1l-1.4 1.4M15.5 15.5l-1.4-1.4M5.9 5.9L4.5 4.5" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Acciones de Usuario */}
                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Notificaciones - oculto en móvil pequeño */}
                        <button
                            className="hidden md:flex items-center justify-center w-10 h-10 rounded transition-colors duration-200 hover:bg-[var(--color-hover)]"
                            style={{ color: 'var(--color-text-secondary)' }}
                            aria-label="Notifications"
                            title="Notifications"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                                <path d="M10 3c-1.5 0-3 1-3 3v3c0 1.5-1 2-1 2H14s-1-.5-1-2V6c0-2-1.5-3-3-3zM8 14c0 1 1 2 2 2s2-1 2-2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        {/* Perfil de Usuario - siempre visible */}
                        <button
                            className="flex items-center justify-center w-10 h-10 rounded transition-colors duration-200 hover:bg-[var(--color-hover)]"
                            style={{ color: 'var(--color-text-secondary)' }}
                            aria-label="User profile"
                            title="User profile"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                                <circle cx="10" cy="7" r="3" strokeWidth="1.5" />
                                <path d="M4 17c0-3 2.5-5 6-5s6 2 6 5" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
