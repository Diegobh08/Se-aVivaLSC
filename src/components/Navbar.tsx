import React, { useState } from 'react';
import { Contrast, Flame, Hand, Moon, Search, Sun, X, Zap } from 'lucide-react';
import logoImg from '../assets/logo_23055035.png';

export type AppView = 'bento' | 'flashcards' | 'quiz' | 'syntax' | 'dashboard' | 'community';

interface NavbarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  xp: number;
  streak: number;
  learnedCount: number;
  totalCount: number;
  reviewCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  highContrastSigns: boolean;
  onToggleHighContrastSigns: () => void;
}

const NAV_ITEMS: Array<{ id: AppView; label: string }> = [
  { id: 'bento', label: 'Lecciones' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'quiz', label: 'Reto Relámpago' },
  { id: 'syntax', label: 'Sintaxis' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'community', label: 'Comunidad' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onSelectView,
  searchQuery,
  onSearchChange,
  xp,
  streak,
  learnedCount,
  totalCount,
  reviewCount,
  darkMode,
  onToggleDarkMode,
  highContrastSigns,
  onToggleHighContrastSigns,
}) => {
  const [logoError, setLogoError] = useState(false);
  const masteryPct = totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      {/* Top Bar */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => onSelectView('bento')}
          className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
        >
          {!logoError ? (
            <img
              src={logoImg}
              alt="Logo SeñaViva LSC"
              onError={() => setLogoError(true)}
              className="w-9 h-9 rounded-lg object-contain bg-white border border-slate-200 dark:border-slate-700 p-0.5 shrink-0"
            />
          ) : (
            <span className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0">
              <Hand className="w-5 h-5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
            </span>
          )}

          <div className="flex flex-col leading-tight text-left">
            <span>SeñaViva LSC</span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Lengua de Señas Colombiana
            </span>
          </div>
        </button>

        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-6 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`py-2 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  isActive
                    ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300 font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onSelectView('flashcards')}
            className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            Estudiar ahora
          </button>
        </div>
      </header>

      {/* Mobile Navigation Row */}
      <div className="md:hidden border-t border-slate-100 dark:border-slate-800 px-4 overflow-x-auto">
        <div className="flex items-center gap-5 py-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`py-1.5 text-sm font-medium border-b-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-300 font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Workspace Bar */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Global Search */}
          <div className="relative flex-1 max-w-xl">
            <Search
              aria-hidden="true"
              className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar cualquiera de las 400+ señas entre las 11 lecciones..."
              aria-label="Buscador global de vocabulario LSC"
              className="w-full pl-10 pr-9 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Metrics and Theme */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-5 text-sm">
            <div className="flex items-center gap-5 text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5" title="Racha diaria">
                <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {streak}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  días racha
                </span>
              </div>

              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                ·
              </span>

              <div className="flex items-center gap-1.5" title="Experiencia acumulada">
                <Zap className="w-4 h-4 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {xp}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  XP
                </span>
              </div>

              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                ·
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Dominio global
                </span>
                <span className="font-mono font-semibold tabular-nums text-teal-700 dark:text-teal-300">
                  {masteryPct}%
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums hidden sm:inline">
                  ({learnedCount}/{totalCount})
                </span>
              </div>

              {reviewCount > 0 && (
                <>
                  <span className="text-slate-300 dark:text-slate-700 hidden sm:inline" aria-hidden="true">
                    ·
                  </span>

                  <button
                    type="button"
                    onClick={() => onSelectView('flashcards')}
                    className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline whitespace-nowrap cursor-pointer tabular-nums"
                  >
                    {reviewCount} por repasar
                  </button>
                </>
              )}
            </div>

            {/* Accessibility and Theme Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                role="switch"
                aria-checked={highContrastSigns}
                aria-label="Modo de Contraste Alto para imágenes de señas"
                title="Modo de Contraste Alto para imágenes de señas: mejora la nitidez de trazos y reduce el brillo en sesiones largas"
                onClick={onToggleHighContrastSigns}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  highContrastSigns
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-amber-400 dark:text-slate-950 dark:border-amber-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Contrast className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />

                <span>Contraste alto señas</span>

                <span
                  aria-hidden="true"
                  className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                    highContrastSigns
                      ? 'bg-emerald-500 dark:bg-slate-950/80'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${
                      highContrastSigns ? 'translate-x-3.5' : 'translate-x-0.5'
                    }`}
                  />
                </span>
              </button>

              <button
                type="button"
                onClick={onToggleDarkMode}
                aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {darkMode ? (
                  <Sun className="w-3.5 h-3.5" />
                ) : (
                  <Moon className="w-3.5 h-3.5" />
                )}

                <span>{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
