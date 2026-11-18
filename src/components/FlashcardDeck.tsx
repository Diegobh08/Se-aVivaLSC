import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Flame,
  Hand,
  Lightbulb,
  MapPin,
  Move,
  RotateCcw,
  RotateCw,
  Shuffle,
  Smile,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { LessonId, LscLessonMeta, LscSign, MasteryStatus, QuizScope } from '../types/lsc';

interface FlashcardDeckProps {
  lessons: LscLessonMeta[];
  signs: LscSign[];
  statuses: Record<string, MasteryStatus>;
  initialLessonFilter: LessonId | 'all';
  initialSignId?: string;
  xp: number;
  streak: number;
  onMarkStatus: (signId: string, status: MasteryStatus) => void;
  onOpenLessonQuiz: (scope: QuizScope) => void;
  onOpenPdfGuide: (lessonId: LessonId) => void;
}

type DeckMode = 'all' | 'review' | 'unseen';

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  lessons,
  signs,
  statuses,
  initialLessonFilter,
  initialSignId,
  xp,
  streak,
  onMarkStatus,
  onOpenLessonQuiz,
  onOpenPdfGuide,
}) => {
  const [lessonFilter, setLessonFilter] = useState<LessonId | 'all'>(initialLessonFilter);
  const [deckMode, setDeckMode] = useState<DeckMode>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<string[] | null>(null);
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLessonFilter(initialLessonFilter);
    setDeckMode('all');
    setShuffledOrder(null);
    setIsFlipped(false);
  }, [initialLessonFilter]);

  const baseDeck = useMemo(() => {
    const filtered = signs.filter((sign) => {
      if (lessonFilter !== 'all' && sign.lessonId !== lessonFilter) return false;
      const st = statuses[sign.id] ?? 'unseen';
      if (deckMode === 'review' && st !== 'review') return false;
      if (deckMode === 'unseen' && st !== 'unseen') return false;
      return true;
    });

    if (!shuffledOrder) return filtered;
    const rank = new Map(shuffledOrder.map((id, idx) => [id, idx]));
    return [...filtered].sort((a, b) => (rank.get(a.id) ?? 9999) - (rank.get(b.id) ?? 9999));
  }, [signs, lessonFilter, deckMode, statuses, shuffledOrder]);

  useEffect(() => {
    if (initialSignId) {
      const idx = baseDeck.findIndex((s) => s.id === initialSignId);
      if (idx >= 0) {
        setCurrentIndex(idx);
        setIsFlipped(false);
      }
    }
  }, [initialSignId, baseDeck]);

  const safeIndex = baseDeck.length > 0 ? Math.min(currentIndex, baseDeck.length - 1) : 0;
  const currentSign = baseDeck[safeIndex];
  const currentLesson = currentSign
    ? lessons.find((l) => l.id === currentSign.lessonId) ?? lessons[0]
    : null;

  const lessonPreviewSigns = useMemo(() => {
    if (!currentLesson) return [];
    return signs.filter((s) => s.lessonId === currentLesson.id).slice(0, 4);
  }, [signs, currentLesson]);

  const deckStripWindow = useMemo(() => {
    if (baseDeck.length === 0) return [];
    const total = baseDeck.length;
    const windowSize = Math.min(8, total);
    let start = Math.max(0, safeIndex - 2);
    if (start + windowSize > total) {
      start = Math.max(0, total - windowSize);
    }
    return baseDeck.slice(start, start + windowSize).map((sign, offset) => ({
      sign,
      index: start + offset,
    }));
  }, [baseDeck, safeIndex]);

  const progressPct = baseDeck.length > 0 ? Math.round(((safeIndex + 1) / baseDeck.length) * 100) : 0;

  const handleNext = useCallback(() => {
    if (baseDeck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % baseDeck.length);
  }, [baseDeck.length]);

  const handlePrev = useCallback(() => {
    if (baseDeck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + baseDeck.length) % baseDeck.length);
  }, [baseDeck.length]);

  const handleShuffle = () => {
    const ids = baseDeck.map((s) => s.id);
    for (let i = ids.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = ids[i];
      ids[i] = ids[j];
      ids[j] = tmp;
    }
    setShuffledOrder(ids);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handlePrev]);

  const handleDecision = (status: MasteryStatus) => {
    if (!currentSign) return;
    onMarkStatus(currentSign.id, status);
    handleNext();
  };

  return (
    <div className="space-y-6">
      {/* Duolingo-style Top Progress & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              aria-label="Seleccionar lección para practicar"
              value={lessonFilter}
              onChange={(e) => {
                const v = e.target.value;
                setLessonFilter(v === 'all' ? 'all' : (Number(v) as LessonId));
                setCurrentIndex(0);
                setIsFlipped(false);
                setShuffledOrder(null);
              }}
              className="px-3 py-2 text-sm font-bold bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todas las lecciones (1–11)</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  Lección {l.id}: {l.title}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              {(
                [
                  { id: 'all', label: 'Todas' },
                  { id: 'review', label: 'Por repasar' },
                  { id: 'unseen', label: 'Nuevas' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setDeckMode(tab.id);
                    setCurrentIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    deckMode === tab.id
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentLesson && (
              <button
                type="button"
                onClick={() => onOpenPdfGuide(currentLesson.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Guía PDF Lección {currentLesson.id}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShuffle}
              disabled={baseDeck.length < 2}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Mezclar</span>
            </button>
          </div>
        </div>

        {/* Duolingo Lesson Progress Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="font-mono text-xs font-bold tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
            {baseDeck.length > 0 ? `${safeIndex + 1} / ${baseDeck.length}` : '0 / 0'}
          </span>
          <div className="hidden sm:flex items-center gap-3 text-xs font-bold">
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 tabular-nums">
              <Flame className="w-4 h-4" />
              {streak}
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 tabular-nums">
              <Zap className="w-4 h-4" />
              {xp} XP
            </span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!currentSign ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            ¡Al día con este filtro!
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Cambia a &ldquo;Todas&rdquo; o selecciona otra lección para seguir sumando XP.
          </p>
          <button
            type="button"
            onClick={() => setDeckMode('all')}
            className="mt-5 px-5 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 rounded-xl cursor-pointer"
          >
            Ver todas las tarjetas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main 3D Flashcard Stage (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="perspective-1200">
              <div
                onClick={() => setIsFlipped((f) => !f)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsFlipped((f) => !f);
                }}
                aria-label={`Tarjeta de ${currentSign.word}. Haz clic para voltear.`}
                className={`relative w-full min-h-[480px] sm:min-h-[500px] transition-transform duration-500 preserve-3d cursor-pointer ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* FRONT FACE — Large, Clear Sign Illustration */}
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">
                      Unidad {currentSign.lessonId} · {currentSign.category}
                    </span>
                    <span
                      className={`font-bold flex items-center gap-1.5 ${
                        statuses[currentSign.id] === 'learned'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : statuses[currentSign.id] === 'review'
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {statuses[currentSign.id] === 'learned' && (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Dominada</span>
                        </>
                      )}
                      {statuses[currentSign.id] === 'review' && (
                        <>
                          <RotateCcw className="w-4 h-4" />
                          <span>Repasar pronto</span>
                        </>
                      )}
                      {(!statuses[currentSign.id] || statuses[currentSign.id] === 'unseen') && (
                        <span>Nueva seña</span>
                      )}
                    </span>
                  </div>

                  <div className="my-auto py-2 flex flex-col items-center text-center">
                    {currentSign.imageUrl && !imgFailed[currentSign.id] ? (
                      <div className="lsc-sign-frame mb-4 w-full max-w-[260px] sm:max-w-sm md:max-w-md h-48 sm:h-60 md:h-64 bg-white border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-2.5 sm:p-3 flex items-center justify-center overflow-hidden shadow-xs">
                        <img
                          src={currentSign.imageUrl}
                          alt={`Ilustración de seña ${currentSign.word}`}
                          onError={() =>
                            setImgFailed((prev) => ({ ...prev, [currentSign.id]: true }))
                          }
                          className="lsc-sign-img w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="mb-5 w-24 h-24 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                        <Hand className="w-10 h-10" />
                      </div>
                    )}

                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
                      {currentSign.word}
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Imita la seña observando la imagen y toca para ver los 4 parámetros LSC.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Barra espaciadora o clic para girar</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Ver explicación</span>
                    </span>
                  </div>
                </div>

                {/* BACK FACE (4 LSC Parameters + Reference Thumbnail + Mnemonic) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white dark:bg-slate-900 border-2 border-emerald-500/70 dark:border-emerald-500/60 rounded-2xl p-6 sm:p-7 flex flex-col justify-between overflow-y-auto">
                  <div>
                    <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {currentSign.imageUrl && !imgFailed[currentSign.id] && (
                          <div className="lsc-sign-frame w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border border-slate-200 dark:border-slate-700 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                            <img
                              src={currentSign.imageUrl}
                              alt={`Miniatura ${currentSign.word}`}
                              className="lsc-sign-img w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Lección {currentSign.lessonId} · 4 Parámetros LSC
                          </span>
                          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
                            {currentSign.word}
                          </h3>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Imagen</span>
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-300">
                          <Hand className="w-4 h-4 shrink-0" />
                          <span>1. Forma de la mano</span>
                        </div>
                        <p className="mt-1.5 text-sm text-slate-800 dark:text-slate-200 leading-snug">
                          {currentSign.handshape}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-xs font-bold text-sky-700 dark:text-sky-300">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span>2. Ubicación espacial</span>
                        </div>
                        <p className="mt-1.5 text-sm text-slate-800 dark:text-slate-200 leading-snug">
                          {currentSign.location}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                          <Move className="w-4 h-4 shrink-0" />
                          <span>3. Movimiento</span>
                        </div>
                        <p className="mt-1.5 text-sm text-slate-800 dark:text-slate-200 leading-snug">
                          {currentSign.movement}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300">
                          <Smile className="w-4 h-4 shrink-0" />
                          <span>4. Expresión facial (RNM)</span>
                        </div>
                        <p className="mt-1.5 text-sm text-slate-800 dark:text-slate-200 leading-snug">
                          {currentSign.facialExpression}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        Truco para recordar:{' '}
                      </span>
                      {currentSign.mnemonic}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tactile Duolingo Spaced-Repetition Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1 px-3.5 py-2.5 text-sm font-bold bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 border-b-4 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 active:translate-y-0.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFlipped((f) => !f)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-bold bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 border-b-4 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 active:translate-y-0.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Girar</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1 px-3.5 py-2.5 text-sm font-bold bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 border-b-4 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 active:translate-y-0.5 cursor-pointer"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDecision('review')}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 border-b-4 border-amber-700 active:border-b-0 active:translate-y-0.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Repasar luego (+5 XP)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision('learned')}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-0.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡La sé! (+15 XP)</span>
                </button>
              </div>
            </div>
            {/* Interactive Visual Deck Strip */}
            {deckStripWindow.length > 1 && (
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>Tira visual del mazo (toca para saltar)</span>
                  <span className="tabular-nums">
                    {safeIndex + 1} de {baseDeck.length}
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {deckStripWindow.map(({ sign, index }) => {
                    const isActive = index === safeIndex;
                    return (
                      <button
                        key={sign.id}
                        type="button"
                        onClick={() => {
                          setCurrentIndex(index);
                          setIsFlipped(false);
                        }}
                        title={sign.word}
                        className={`p-1 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          isActive
                            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="lsc-sign-frame w-full h-12 bg-white border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 flex items-center justify-center overflow-hidden">
                          <img
                            src={sign.imageUrl}
                            alt={`Seña ${sign.word}`}
                            loading="lazy"
                            className="lsc-sign-img w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                          {sign.word}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Duolingo Coach Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-4">
            {currentLesson && (
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                    Tip de Unidad {currentLesson.id}
                  </span>
                  <h4 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                    {currentLesson.title}
                  </h4>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentLesson.grammarTip}
                  </p>
                </div>

                {lessonPreviewSigns.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
                      Señas ilustradas de esta unidad
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {lessonPreviewSigns.map((ps) => (
                        <button
                          key={ps.id}
                          type="button"
                          onClick={() => {
                            const targetIdx = baseDeck.findIndex((s) => s.id === ps.id);
                            if (targetIdx >= 0) {
                              setCurrentIndex(targetIdx);
                              setIsFlipped(false);
                            }
                          }}
                          title={ps.word}
                          className="lsc-sign-frame h-14 rounded-lg bg-white border border-slate-200 dark:border-slate-700 p-0.5 flex items-center justify-center overflow-hidden hover:border-emerald-500 cursor-pointer"
                        >
                          <img
                            src={ps.imageUrl}
                            alt={`Seña ${ps.word}`}
                            loading="lazy"
                            className="lsc-sign-img w-full h-full object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onOpenLessonQuiz(currentLesson.id)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 border-b-4 border-sky-700 active:border-b-0 active:translate-y-0.5 rounded-xl transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Probar Quiz de Lección {currentLesson.id}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Atajos de práctica rápida
              </p>
              <div className="flex items-center justify-between">
                <span>Girar tarjeta</span>
                <kbd className="px-2 py-0.5 font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                  Espacio
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Seña anterior / siguiente</span>
                <div className="flex items-center gap-1">
                  <kbd className="px-2 py-0.5 font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                    ←
                  </kbd>
                  <kbd className="px-2 py-0.5 font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                    →
                  </kbd>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
