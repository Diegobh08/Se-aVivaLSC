import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Layers,
  Maximize2,
  Play,
  RotateCcw,
  Shuffle,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import type { LessonId, LscLessonMeta, LscSign, MasteryStatus, QuizScope } from '../types/lsc';

interface LessonBentoGridProps {
  lessons: LscLessonMeta[];
  signs: LscSign[];
  statuses: Record<string, MasteryStatus>;
  searchQuery: string;
  onOpenLessonFlashcards: (lessonId: LessonId | 'all', startSignId?: string) => void;
  onOpenLessonQuiz: (scope: QuizScope) => void;
  onOpenPdfGuide: (lessonId: LessonId) => void;
}

type SignFilter = 'all' | 'review' | 'learned';

export const LessonBentoGrid: React.FC<LessonBentoGridProps> = ({
  lessons,
  signs,
  statuses,
  searchQuery,
  onOpenLessonFlashcards,
  onOpenLessonQuiz,
  onOpenPdfGuide,
}) => {
  const [selectedLessonFilter, setSelectedLessonFilter] = useState<LessonId | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<SignFilter>('all');
  const [zoomedSign, setZoomedSign] = useState<LscSign | null>(null);

  const globalStats = useMemo(() => {
    let learned = 0;
    let review = 0;
    for (const sign of signs) {
      const st = statuses[sign.id] ?? 'unseen';
      if (st === 'learned') learned += 1;
      if (st === 'review') review += 1;
    }
    const pct = signs.length > 0 ? Math.round((learned / signs.length) * 100) : 0;
    return { learned, review, pct, total: signs.length };
  }, [signs, statuses]);

  const filteredSigns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return signs.filter((sign) => {
      if (selectedLessonFilter !== 'all' && sign.lessonId !== selectedLessonFilter) {
        return false;
      }
      const st = statuses[sign.id] ?? 'unseen';
      if (statusFilter === 'review' && st !== 'review') return false;
      if (statusFilter === 'learned' && st !== 'learned') return false;

      if (!q) return true;
      return (
        sign.word.toLowerCase().includes(q) ||
        sign.category.toLowerCase().includes(q) ||
        sign.mnemonic.toLowerCase().includes(q) ||
        `leccion ${sign.lessonId}`.includes(q) ||
        `lección ${sign.lessonId}`.includes(q)
      );
    });
  }, [signs, selectedLessonFilter, statusFilter, statuses, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="space-y-10">
      {/* Duolingo-style Hero Unit Summary */}
      {!isSearching && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Ruta de aprendizaje · Lengua de Señas Colombiana
              </p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance max-w-2xl">
                Aprende las {globalStats.total} señas de las Lecciones 1 a 11 paso a paso
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Practica cada unidad con ilustraciones reales de tus guías, tarjetas 3D con los 4 parámetros de la seña, retos cronometrados y construcción de frases en LSC.
              </p>

              {/* Featured Visual Strip at the Top */}
              <div className="mt-5 grid grid-cols-4 gap-2.5">
                {[signs[0], signs[24], signs[82], signs[270]].filter(Boolean).map((featSign) => (
                  <button
                    key={featSign.id}
                    type="button"
                    onClick={() => setZoomedSign(featSign)}
                    title={`Ampliar ${featSign.word}`}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-xl p-1.5 text-center transition-colors cursor-pointer"
                  >
                    <div className="lsc-sign-frame h-16 bg-white rounded-lg border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center overflow-hidden">
                      <img
                        src={featSign.imageUrl}
                        alt={`Seña ${featSign.word}`}
                        className="lsc-sign-img max-h-full max-w-full object-contain"
                      />
                    </div>
                    <span className="mt-1 block text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                      {featSign.word}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onOpenLessonFlashcards('all')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-0.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Empezar lección diaria</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenLessonQuiz('random_mix')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 border-b-4 border-sky-700 active:border-b-0 active:translate-y-0.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                <Shuffle className="w-4 h-4" />
                <span>Reto Relámpago (L1–11)</span>
              </button>
              {globalStats.review > 0 && (
                <button
                  type="button"
                  onClick={() => onOpenLessonQuiz('review')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-800 dark:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-b-4 border-slate-300 dark:border-slate-950 active:border-b-0 active:translate-y-0.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Repasar {globalStats.review} difíciles</span>
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Dominio de la ruta</span>
                </span>
                <span className="font-mono text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {globalStats.pct}%
                </span>
              </div>
              <div className="mt-3 w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(globalStats.pct, 2)}%` }}
                />
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Señas aprendidas
                </span>
                <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {globalStats.learned} / {globalStats.total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  Para repasar pronto
                </span>
                <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {globalStats.review}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  Unidades activas
                </span>
                <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {lessons.length} lecciones
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Duolingo Units Grid (Lessons 1 to 11) */}
      {!isSearching && (
        <section aria-labelledby="lessons-heading">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5">
            <div>
              <h2
                id="lessons-heading"
                className="text-xl font-bold text-slate-900 dark:text-slate-100"
              >
                Unidades del Curso (Lecciones 1 a 11)
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Elige una unidad para practicar sus señas ilustradas o abre un quiz rápido.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson, idx) => {
              const lessonSigns = signs.filter((s) => s.lessonId === lesson.id);
              const previewSigns = lessonSigns.slice(0, 3);
              const learnedInLesson = lessonSigns.filter(
                (s) => statuses[s.id] === 'learned'
              ).length;
              const reviewInLesson = lessonSigns.filter(
                (s) => statuses[s.id] === 'review'
              ).length;
              const pct =
                lessonSigns.length > 0
                  ? Math.round((learnedInLesson / lessonSigns.length) * 100)
                  : 0;
              const isFeaturedSpan = idx === 0 || idx === 8;

              return (
                <article
                  key={lesson.id}
                  className={`bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-slate-700 ${
                    isFeaturedSpan ? 'md:col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  {/* Colored Unit Accent Top Strip */}
                  <div className="h-2 w-full" style={{ backgroundColor: lesson.accentHex }} />

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        <span>
                          Unidad {lesson.id} · {lessonSigns.length} señas
                        </span>
                        <span className="font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
                          {pct}%
                        </span>
                      </div>

                      <h3 className="mt-1.5 text-lg font-bold text-slate-900 dark:text-slate-100">
                        {lesson.title}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-snug">
                        {lesson.subtitle}
                      </p>

                      {/* 3-image Visual Preview Strip from the Unit */}
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {previewSigns.map((ps) => (
                          <button
                            key={ps.id}
                            type="button"
                            onClick={() => onOpenLessonFlashcards(lesson.id, ps.id)}
                            title={`Practicar ${ps.word}`}
                            className="lsc-sign-frame h-20 rounded-xl bg-white border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center overflow-hidden hover:border-emerald-500 transition-colors cursor-pointer"
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

                      {/* Chunky Duolingo Progress Bar */}
                      <div className="mt-4 w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: lesson.accentHex,
                          }}
                        />
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        <span>
                          {learnedInLesson}/{lessonSigns.length} dominadas
                        </span>
                        {reviewInLesson > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-rose-600 dark:text-rose-400 font-semibold">
                              {reviewInLesson} por repasar
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenLessonFlashcards(lesson.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-0.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                        >
                          <span>Practicar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenLessonQuiz(lesson.id)}
                          className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-b-4 border-slate-300 dark:border-slate-950 active:border-b-0 active:translate-y-0.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                        >
                          Quiz
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenPdfGuide(lesson.id)}
                        title={`Abrir guía PDF Lección ${lesson.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Illustrated Dictionary Explorer */}
      <section aria-labelledby="dictionary-heading" className="pt-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <h2
              id="dictionary-heading"
              className="text-xl font-bold text-slate-900 dark:text-slate-100"
            >
              {isSearching
                ? `Resultados para "${searchQuery.trim()}" (${filteredSigns.length})`
                : 'Diccionario Visual de Señas'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Explora las ilustraciones de cada palabra, amplía el dibujo o ábrelo en modo práctica.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="lesson-filter-select">
              Filtrar por lección
            </label>
            <select
              id="lesson-filter-select"
              value={selectedLessonFilter}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedLessonFilter(val === 'all' ? 'all' : (Number(val) as LessonId));
              }}
              className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todas las lecciones (1–11)</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  Lección {l.id}: {l.title}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              {(
                [
                  { id: 'all', label: 'Todas' },
                  { id: 'review', label: 'Por repasar' },
                  { id: 'learned', label: 'Aprendidas' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredSigns.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center">
            <Layers className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">
              No se encontraron señas con ese filtro
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Prueba limpiando la búsqueda o seleccionando otra lección.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSigns.map((sign) => {
              const st = statuses[sign.id] ?? 'unseen';
              return (
                <article
                  key={sign.id}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-2xl p-3.5 transition-colors flex flex-col justify-between gap-3"
                >
                  {/* Large, Crisp Vocabulary Illustration */}
                  <div className="lsc-sign-frame relative w-full h-44 rounded-xl bg-white border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center p-2 group">
                    <img
                      src={sign.imageUrl}
                      alt={`Ilustración de la seña ${sign.word}`}
                      loading="lazy"
                      onClick={() => onOpenLessonFlashcards(sign.lessonId, sign.id)}
                      className="lsc-sign-img w-full h-full object-contain cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setZoomedSign(sign)}
                      aria-label={`Ampliar ilustración de ${sign.word}`}
                      title="Ver imagen grande"
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/75 text-white opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenLessonFlashcards(sign.lessonId, sign.id)}
                    className="text-left cursor-pointer flex-1 flex flex-col justify-between gap-2"
                  >
                    <div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
                        Lección {sign.lessonId} · {sign.category}
                      </span>
                      <h3 className="mt-0.5 text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                        {sign.word}
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {sign.handshape}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs w-full">
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          st === 'learned'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : st === 'review'
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {st === 'learned' && (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Dominada</span>
                          </>
                        )}
                        {st === 'review' && (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Repasar</span>
                          </>
                        )}
                        {st === 'unseen' && <span>Nueva</span>}
                      </span>

                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        Practicar →
                      </span>
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Lightbox Modal for Inspecting Sign Artwork Up Close */}
      {zoomedSign && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setZoomedSign(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  Lección {zoomedSign.lessonId} · {zoomedSign.category}
                </p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {zoomedSign.word}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setZoomedSign(null)}
                aria-label="Cerrar vista ampliada"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="lsc-sign-frame w-full h-80 bg-white rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex items-center justify-center">
              <img
                src={zoomedSign.imageUrl}
                alt={`Ilustración ampliada de ${zoomedSign.word}`}
                className="lsc-sign-img max-h-full max-w-full object-contain"
              />
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="text-slate-900 dark:text-slate-100">Cómo hacerla: </strong>
              {zoomedSign.handshape} {zoomedSign.movement}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const s = zoomedSign;
                  setZoomedSign(null);
                  onOpenLessonFlashcards(s.lessonId, s.id);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 rounded-xl cursor-pointer"
              >
                <span>Practicar en tarjeta 3D</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
