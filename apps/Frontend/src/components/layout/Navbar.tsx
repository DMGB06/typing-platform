'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GiKeyboard } from "react-icons/gi";
import {
    FiSun,
    FiMoon,
    FiType,
    FiAward,
    FiInfo,
    FiBell,
    FiUser,
    FiLogOut,
    FiLogIn,
    FiMenu,
    FiX,
} from "react-icons/fi";
import type { IconType } from 'react-icons';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { getUnreadCount } from '@/lib/api/notifications';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface NavItem {
    href: string;
    icon: IconType;
    label: string;
}

const NAV_ITEMS: NavItem[] = [
    { href: '/', icon: FiType, label: 'Práctica de escritura' },
    { href: '/leaderboard', icon: FiAward, label: 'Clasificación' },
    { href: '/about', icon: FiInfo, label: 'Acerca de' },
];

/**
 * Componente Navbar - Estilo Monkeytype
 *
 * Distribución:
 * - Logo a la izquierda + navegación junto al logo
 * - Acciones de usuario a la derecha (Login ó Perfil+Logout según sesión)
 * - Responsive: en mobile la navegación colapsa a un menú desplegable
 */
export const Navbar: React.FC = () => {
    const { isLoggedIn, ready, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

    useEffect(() => {
        if (!ready || !isLoggedIn) return;
        getUnreadCount()
            .then((data) => setUnreadCount(data.count))
            .catch((err) => console.error('Error al cargar notificaciones no leídas:', err));
    }, [ready, isLoggedIn]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileMenuOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Cerrar el menú mobile al cambiar de ruta (ajuste de estado durante el
    // render, no en un efecto, siguiendo el patrón de React para "resetear
    // estado cuando cambia un prop")
    const [prevPathname, setPrevPathname] = useState(pathname);
    if (pathname !== prevPathname) {
        setPrevPathname(pathname);
        setMobileMenuOpen(false);
    }

    return (
        <>
        <nav className="w-full pt-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo + Navegación (juntos a la izquierda) */}
                    <div className="flex items-center gap-2 md:gap-6">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3">

                            <GiKeyboard className="text-3xl sm:text-5xl"
                                style={{ color: 'var(--color-accent)' }} />

                            <span
                                className="text-lg sm:text-3xl font-semibold tracking-tight"
                                style={{ color: 'var(--color-text-primary)' }}
                            >
                                typingpro
                            </span>
                        </Link>

                        {/* Navegación junto al logo (desktop) */}
                        <div className="hidden sm:flex items-center gap-2 md:gap-3">
                            {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="flex items-center justify-center w-10 h-10 rounded transition-colors duration-200 hover:bg-[var(--color-hover)]"
                                    style={{
                                        color: isActive(href) ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                        backgroundColor: isActive(href) ? 'var(--color-bg-tertiary)' : undefined,
                                    }}
                                    aria-label={label}
                                    aria-current={isActive(href) ? 'page' : undefined}
                                    title={label}
                                >
                                    <Icon className="w-6 h-6" />
                                </Link>
                            ))}
                        </div>

                        {/* Botón de menú (mobile) */}
                        <div className="relative sm:hidden" ref={mobileMenuRef}>
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen((prev) => !prev)}
                                className="flex items-center justify-center w-10 h-10 rounded transition-colors duration-200 hover:bg-[var(--color-hover)]"
                                style={{ color: 'var(--color-text-secondary)' }}
                                aria-label="Abrir menú de navegación"
                                aria-expanded={mobileMenuOpen}
                                aria-haspopup="menu"
                            >
                                {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                            </button>

                            {mobileMenuOpen && (
                                <ul
                                    role="menu"
                                    aria-label="Navegación"
                                    className="absolute z-50 mt-1.5 left-0 min-w-[200px] rounded-lg py-1 shadow-lg border overflow-hidden"
                                    style={{
                                        backgroundColor: 'var(--color-bg-tertiary)',
                                        borderColor: 'rgba(255,255,255,0.06)',
                                    }}
                                >
                                    {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
                                        <li key={href} role="none">
                                            <Link
                                                href={href}
                                                role="menuitem"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-[var(--color-hover)]"
                                                style={{
                                                    color: isActive(href) ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                                    fontWeight: isActive(href) ? 600 : 400,
                                                }}
                                            >
                                                <Icon className="w-4 h-4 shrink-0" />
                                                {label}
                                            </Link>
                                        </li>
                                    ))}
                                    {isLoggedIn && (
                                        <li role="none">
                                            <Link
                                                href="/notifications"
                                                role="menuitem"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-[var(--color-hover)]"
                                                style={{
                                                    color: isActive('/notifications') ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                                    fontWeight: isActive('/notifications') ? 600 : 400,
                                                }}
                                            >
                                                <FiBell className="w-4 h-4 shrink-0" />
                                                Notificaciones
                                                {unreadCount > 0 && (
                                                    <span
                                                        className="ml-auto flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-semibold"
                                                        style={{ backgroundColor: 'var(--color-error)', color: 'var(--color-bg-primary)' }}
                                                    >
                                                        {unreadCount > 9 ? '9+' : unreadCount}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Acciones de Usuario */}
                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Toggle de tema claro/oscuro - siempre visible */}
                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-center w-10 h-10 rounded transition-colors duration-200 hover:bg-[var(--color-hover)]"
                            style={{ color: 'var(--color-text-secondary)' }}
                            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                            title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                        >
                            {theme === 'dark' ? (
                                <FiSun className="w-6 h-6" />
                            ) : (
                                <FiMoon className="w-6 h-6" />
                            )}
                        </button>

                        {/* Notificaciones - oculto en mobile (accesible desde el menú) */}
                        <Link
                            href="/notifications"
                            className="hidden sm:flex items-center justify-center w-10 h-10 rounded transition-colors duration-200 hover:bg-[var(--color-hover)] relative"
                            style={{ color: isActive('/notifications') ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
                            aria-label="Notificaciones"
                            aria-current={isActive('/notifications') ? 'page' : undefined}
                            title="Notificaciones"
                        >
                            <FiBell className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span
                                    className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-semibold"
                                    style={{ backgroundColor: 'var(--color-error)', color: 'var(--color-bg-primary)' }}
                                >
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Link>

                        {/* Perfil de Usuario / Login — condicional según sesión */}
                        {ready && (
                            isLoggedIn ? (
                                <>
                                    {/* Botón Perfil */}
                                    <Link
                                        href="/profile"
                                        className="flex items-center justify-center w-10 h-10 rounded transition-colors duration-200 hover:bg-[var(--color-hover)]"
                                        style={{ color: isActive('/profile') ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
                                        aria-label="Mi perfil"
                                        aria-current={isActive('/profile') ? 'page' : undefined}
                                        title="Mi perfil"
                                    >
                                        <FiUser className="w-6 h-6" />
                                    </Link>

                                    {/* Botón Logout */}
                                    <button
                                        onClick={() => setShowLogoutModal(true)}
                                        className="flex items-center justify-center w-10 h-10 rounded transition-colors duration-200 hover:bg-[var(--color-hover)]"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                        aria-label="Cerrar sesión"
                                        title="Cerrar sesión"
                                    >
                                        <FiLogOut className="w-6 h-6" />
                                    </button>
                                </>
                            ) : (
                                /* Botón Login */
                                <Link
                                    href="/auth"
                                    className="flex items-center justify-center w-10 h-10 rounded transition-colors duration-200 hover:bg-[var(--color-hover)]"
                                    style={{ color: isActive('/auth') ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
                                    aria-label="Iniciar sesión"
                                    aria-current={isActive('/auth') ? 'page' : undefined}
                                    title="Iniciar sesión"
                                >
                                    <FiLogIn className="w-6 h-6" />
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>
        </nav>

        {/* Modal de confirmación de logout */}
        <ConfirmModal
            isOpen={showLogoutModal}
            title="¿Cerrar sesión?"
            description="Se eliminará tu sesión activa. Tendrás que iniciar sesión nuevamente."
            confirmLabel="Cerrar sesión"
            cancelLabel="Cancelar"
            onConfirm={() => { setShowLogoutModal(false); void logout(); }}
            onCancel={() => setShowLogoutModal(false)}
        />
    </>
    );
};
