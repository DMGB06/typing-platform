'use client';

import React from 'react';
import { FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[var(--color-bg-tertiary)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

          {/* Descripción del proyecto */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-accent)' }}>
              typingpro
            </h3>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Desarrollado por{' '}
              <span style={{ color: 'var(--color-text-secondary)' }}>Denilson Miguel Godoy Bautista</span>{' '}
              como proyecto de portafolio. Referencia e inspiración tomada de{' '}
              <span style={{ color: 'var(--color-text-secondary)' }}>MonkeyType</span>.
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              2026 · Con mucho cariño para la comunidad dev
            </p>
          </div>

          {/* Iconos + botón GitHub */}
          <div className="flex flex-col items-start md:items-end gap-4">
            <div className="flex items-center gap-7">

              <a href="https://www.instagram.com/denilson_6_gd/" className="transition-opacity duration-200 hover:opacity-70" aria-label="Twitter">
                <FaInstagram className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              </a>

              <a href="https://www.linkedin.com/in/denilson-miguel-godoy-bautista/" className="transition-opacity duration-200 hover:opacity-70" aria-label="Twitter">
                <FaLinkedin className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              </a>

              <a href="https://github.com/DMGB06" target="_blank" rel="noopener noreferrer" className="transition-opacity duration-200 hover:opacity-70" aria-label="GitHub">
                <FaGithub className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
              </a>
            </div>

            <a
              href="https://github.com/DMGB06/typing-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-opacity duration-200 hover:opacity-80"
              style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }}
            >
              <FaGithub className="w-5 h-5" />
              <span className="text-base font-medium">Ver repositorio</span>
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
};