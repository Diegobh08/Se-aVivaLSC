import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Flame,
  Play,
  RotateCcw,
  Shuffle,
  Timer,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import { buildBlitzQuestions } from '../data/lscQuizzesAndSyntax';
import type {
  LessonId,
  LscLessonMeta,
  LscSign,
  MasteryStatus,
  QuizQuestion,
  QuizScope,
} from '../types/lsc';

interface BlitzQuizProps {
  lessons: LscLessonMeta[];
  signs: LscSign[];
  statuses: Record<string, MasteryStatus>;
  initialScope: QuizScope;
  bestQuizScore: number;
  onCompleteQuiz: (score: number, xpEarned: number) => void;
  onMarkStatus: (signId: string, status: MasteryStatus) => void;
}

type QuizPhase = 'setup' | 'running' | 'finished';

const QUIZ_DURATION_SECONDS = 120;

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export const BlitzQuiz: React.FC<BlitzQuizProps> = ({
  lessons,
  signs,
  statuses,
  initialScope,
  bestQuizScore,
  onCompleteQuiz,
  onMarkStatus,
}) => {
  const [scope, setScope] = useState<QuizScope>(initialScope);
  const [previewTick, setPreviewTick] = useState(0);
  const [phase, setPhase] = useState<QuizPhase>('setup');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState<Array<{ question: QuizQuestion; chosen: number }>>([]);
  const [practicedSignIds, setPracticedSignIds] = useState<string[]>([]);
  const [coveredLessons, setCoveredLessons] = useState<LessonId[]>([]);
  const finishedTriggeredRef = useRef(false);

  useEffect(() => {
    setScope(initialScope);
  }, [initialScope]);

  const reviewSigns = useMemo(
    () => signs.filter((s) => statuses[s.id] === 'review'),
    [signs, statuses]
  );

  const poolSigns = useMemo(() => {
    if (scope === 'review') return reviewSigns;
    if (scope === 'all' || scope === 'random_mix') return signs;
    return signs.filter((s) => s.lessonId === scope);
  }, [scope, signs, reviewSigns]);

  const previewSigns = useMemo(() => {
    if (poolSigns.length === 0) return [];
    if (scope === 'random_mix' || previewTick > 0) {
      const step = Math.max(1, Math.floor(poolSigns.length / 6));
      const offset = (previewTick * 17) % poolSigns.length;
      return Array.from({ length: Math.min(6, poolSigns.length) }, (_, idx) => {
        return poolSigns[(offset + idx * step) % poolSigns.length];
      });
    }
    return poolSigns.slice(0, 6);
  }, [poolSigns, scope, previewTick]);

  const signImageMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of signs) {
      map.set(s.id, s.imageUrl);
    }
    return map;
  }, [signs]);

  const getSignImage = (signId: string) => signImageMap.get(signId) ?? `/assets/signs/${signId}.jpg`;

  // Countdown timer
  useEffect(() => {
    if (phase !== 'running') return;
    if (timeLeft <= 0) {
      if (!finishedTriggeredRef.current) {
        finishedTriggeredRef.current = true;
        setPhase('finished');
        onCompleteQuiz(score, Math.max(10, Math.round(score / 4)));
      }
      return;
    }
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, timeLeft, score, onCompleteQuiz]);

  const startQuiz = () => {
    if (poolSigns.length === 0) return;
    const generated = buildBlitzQuestions(
      poolSigns,
      signs,
      scope === 'review',
      scope === 'random_mix'
    );
    if (generated.length === 0) return;
    finishedTriggeredRef.current = false;
    setQuestions(generated);
    setQIndex(0);
    setTimeLeft(QUIZ_DURATION_SECONDS);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setAnsweredCount(0);
    setSelectedOption(null);
    setMistakes([]);
    setPracticedSignIds([]);
    setCoveredLessons([]);
    setPhase('running');
  };

  const handleSelectOption = (optionIdx: number) => {
    if (selectedOption !== null || phase !== 'running') return;
    const currentQ = questions[qIndex];
    if (!currentQ) return;

    setSelectedOption(optionIdx);
    setAnsweredCount((c) => c + 1);
    if (currentQ.signId) {
      const sid = currentQ.signId;
      setPracticedSignIds((prev) => (prev.includes(sid) ? prev : [...prev, sid]));
    }
    setCoveredLessons((prev) =>
      prev.includes(currentQ.lessonId) ? prev : [...prev, currentQ.lessonId]
    );

    const isCorrect = optionIdx === currentQ.correctIndex;
    if (isCorrect) {
      const nextCombo = combo + 1;
      const points = 20 + Math.min(nextCombo - 1, 5) * 5;
      setCombo(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));
      setCorrectCount((c) => c + 1);
      setScore((s) => s + points);
    } else {
      setCombo(0);
      setMistakes((prev) => [...prev, { question: currentQ, chosen: optionIdx }]);
      if (currentQ.signId) {
        onMarkStatus(currentQ.signId, 'review');
      }
    }

    window.setTimeout(() => {
      if (qIndex + 1 >= questions.length) {
        if (!finishedTriggeredRef.current) {
          finishedTriggeredRef.current = true;
          const finalScore = isCorrect ? score + 20 + Math.min(combo, 5) * 5 : score;
          setPhase('finished');
          onCompleteQuiz(finalScore, Math.max(15, Math.round(finalScore / 4)));
        }
      } else {
        setQIndex((idx) => idx + 1);
        setSelectedOption(null);
      }
    }, 1400);
  };

  const currentQuestion = questions[qIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {phase === 'setup' && (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Desafío visual · 2 minutos · Memoria a largo plazo
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                Reto Relámpago LSC
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Identifica señas al azar mezclando todas las 11 lecciones sin pistas previas para entrenar tu memoria a largo plazo.
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Mejor marca</span>
              <span className="font-mono text-2xl font-bold tabular-nums text-amber-500">
                {bestQuizScore} pts
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block mb-2.5">
                Modo de juego
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setScope('random_mix');
                    setPreviewTick((t) => t + 1);
                  }}
                  className={`p-4 rounded-2xl border-2 border-b-4 text-left transition-all cursor-pointer ${
                    scope === 'random_mix'
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 dark:border-sky-400'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Shuffle className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>Reto Relámpago</span>
                  </span>
                  <span className="mt-1 text-xs text-sky-700 dark:text-sky-300 font-semibold block">
                    Todas las lecciones al azar
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`p-4 rounded-2xl border-2 border-b-4 text-left transition-all cursor-pointer ${
                    scope === 'all'
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 dark:border-emerald-400'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                    Todas las lecciones
                  </span>
                  <span className="mt-1 text-xs text-slate-500 dark:text-slate-400 block tabular-nums">
                    {signs.length} señas + gramática
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setScope('review')}
                  className={`p-4 rounded-2xl border-2 border-b-4 text-left transition-all cursor-pointer ${
                    scope === 'review'
                      ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 dark:border-rose-400'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                    Solo &ldquo;Repasar luego&rdquo;
                  </span>
                  <span className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-bold block tabular-nums">
                    {reviewSigns.length} señas marcadas
                  </span>
                </button>

                <div
                  className={`p-4 rounded-2xl border-2 border-b-4 transition-all ${
                    typeof scope === 'number'
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 dark:border-emerald-400'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <label
                    htmlFor="quiz-lesson-select"
                    className="text-sm font-bold text-slate-900 dark:text-slate-100 block mb-1.5"
                  >
                    Por unidad específica
                  </label>
                  <select
                    id="quiz-lesson-select"
                    value={typeof scope === 'number' ? scope : ''}
                    onChange={(e) => {
                      if (e.target.value) setScope(Number(e.target.value) as LessonId);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                  >
                    <option value="">Elegir lección...</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        Lección {l.id}: {l.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {previewSigns.length > 0 && (
              <div className="pt-2 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {scope === 'random_mix'
                      ? `Mix aleatorio entre las ${poolSigns.length} señas (Lecciones 1–11)`
                      : `Muestra visual del vocabulario en este reto (${poolSigns.length} señas)`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewTick((t) => t + 1)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Mezclar muestra</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {previewSigns.map((s) => (
                    <div
                      key={s.id}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 text-center"
                    >
                      <div className="lsc-sign-frame h-20 bg-white rounded-lg border border-slate-100 dark:border-slate-800 p-1 flex items-center justify-center overflow-hidden">
                        <img
                          src={s.imageUrl}
                          alt={`Seña ${s.word}`}
                          loading="lazy"
                          className="lsc-sign-img max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="mt-1 block text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                        {s.word}
                      </span>
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500">
                        Lec. {s.lessonId}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scope === 'review' && reviewSigns.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300">
                Aún no tienes señas marcadas para repasar. Marca algunas mientras estudias o practica con todas las lecciones.
              </div>
            ) : (
              <div className="pt-2 flex items-center justify-between gap-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Las respuestas incorrectas se guardan automáticamente para tu siguiente repaso.
                </p>
                <button
                  type="button"
                  onClick={startQuiz}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-0.5 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Comenzar reto 2 min</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {phase === 'running' && currentQuestion && (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Timer & Combo Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div
                className={`inline-flex items-center gap-1.5 font-mono text-lg font-bold tabular-nums ${
                  timeLeft <= 15
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                <Timer className="w-5 h-5" />
                <span>{formatTimer(timeLeft)}</span>
              </div>

              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
                ·
              </span>

              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                Pregunta {qIndex + 1}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {combo > 1 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  <Flame className="w-4 h-4" />
                  <span>Racha x{combo}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 font-mono text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                <Zap className="w-4 h-4" />
                <span>{score} pts</span>
              </span>
            </div>
          </div>

          {/* Chunky Duolingo Timer Bar */}
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-1000 linear ${
                timeLeft <= 15 ? 'bg-rose-500' : 'bg-emerald-500 dark:bg-emerald-400'
              }`}
              style={{ width: `${(timeLeft / QUIZ_DURATION_SECONDS) * 100}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {currentQuestion.signId && currentQuestion.showImageDuringQuestion && (
              <div className="lsc-sign-frame w-44 h-44 sm:w-52 sm:h-52 mx-auto sm:mx-0 rounded-2xl bg-white border-2 border-slate-200 dark:border-slate-700 p-2 shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
                <div className="relative inline-block max-h-full max-w-full overflow-hidden">
                  <img
                    src={getSignImage(currentQuestion.signId)}
                    alt="Ilustración de la seña evaluada"
                    className="lsc-sign-img block max-h-40 sm:max-h-48 w-auto h-auto"
                  />
                  {currentQuestion.maskBottomLabel && selectedOption === null && (
                    <div
                      aria-hidden="true"
                      className="lsc-sign-mask absolute inset-x-0 bottom-0 h-[17%] bg-white border-t border-slate-100"
                    />
                  )}
                </div>
              </div>
            )}
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                {scope === 'random_mix' && selectedOption === null
                  ? 'Reto Relámpago · Memoria a largo plazo'
                  : `Unidad ${currentQuestion.lessonId}${
                      currentQuestion.isGrammarOrCulture
                        ? ' · Gramática y cultura LSC'
                        : ' · Reto visual LSC'
                    }`}
              </p>
              <h2 className="mt-2 text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {currentQuestion.prompt}
              </h2>
            </div>
          </div>

          {currentQuestion.optionSignIds && currentQuestion.optionSignIds.length === 4 ? (
            <div className="grid grid-cols-2 gap-3.5">
              {currentQuestion.optionSignIds.map((optSignId, idx) => {
                const isChosen = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctIndex;
                let cardStyle =
                  'border-slate-200 dark:border-slate-800 border-b-4 bg-white dark:bg-slate-950 hover:border-emerald-500 dark:hover:border-emerald-400 active:translate-y-0.5';

                if (selectedOption !== null) {
                  if (isCorrect) {
                    cardStyle =
                      'border-emerald-500 border-b-4 bg-emerald-50 dark:bg-emerald-950/50';
                  } else if (isChosen) {
                    cardStyle =
                      'border-rose-500 border-b-4 bg-rose-50 dark:bg-rose-950/50';
                  } else {
                    cardStyle =
                      'border-slate-200 dark:border-slate-800 opacity-50';
                  }
                }

                return (
                  <button
                    key={`${currentQuestion.id}-visopt-${idx}`}
                    type="button"
                    disabled={selectedOption !== null}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer disabled:cursor-default ${cardStyle}`}
                  >
                    <div className="w-full flex items-center justify-between text-xs font-mono font-bold">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {selectedOption !== null && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      )}
                      {selectedOption !== null && isChosen && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      )}
                    </div>

                    <div className="lsc-sign-frame w-full h-32 sm:h-36 bg-white rounded-xl border border-slate-200 dark:border-slate-800 p-1.5 flex items-center justify-center overflow-hidden">
                      <div className="relative inline-block max-h-full max-w-full overflow-hidden">
                        <img
                          src={getSignImage(optSignId)}
                          alt={`Opción ${idx + 1}`}
                          className="lsc-sign-img block max-h-28 sm:max-h-32 w-auto h-auto"
                        />
                        {selectedOption === null && (
                          <div
                            aria-hidden="true"
                            className="lsc-sign-mask absolute inset-x-0 bottom-0 h-[17%] bg-white border-t border-slate-100"
                          />
                        )}
                      </div>
                    </div>

                    {selectedOption !== null && (
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate w-full text-center">
                        {currentQuestion.options[idx]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((opt, idx) => {
                const isChosen = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctIndex;
                let btnStyle =
                  'border-slate-200 dark:border-slate-800 border-b-4 bg-white dark:bg-slate-950 hover:border-emerald-500 dark:hover:border-emerald-400 text-slate-800 dark:text-slate-100 active:translate-y-0.5';

                if (selectedOption !== null) {
                  if (isCorrect) {
                    btnStyle =
                      'border-emerald-500 border-b-4 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200';
                  } else if (isChosen) {
                    btnStyle =
                      'border-rose-500 border-b-4 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200';
                  } else {
                    btnStyle =
                      'border-slate-200 dark:border-slate-800 opacity-50 text-slate-500 dark:text-slate-400';
                  }
                }

                return (
                  <button
                    key={`${currentQuestion.id}-opt-${idx}`}
                    type="button"
                    disabled={selectedOption !== null}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-2xl border-2 text-sm font-semibold transition-all flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {selectedOption !== null && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                    {selectedOption !== null && isChosen && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {selectedOption !== null && (
            <div
              className={`p-4 rounded-2xl border-2 flex items-center gap-4 ${
                selectedOption === currentQuestion.correctIndex
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
              }`}
            >
              {currentQuestion.signId && (
                <div className="lsc-sign-frame w-20 h-20 rounded-xl bg-white border border-slate-200 dark:border-slate-700 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src={getSignImage(currentQuestion.signId)}
                    alt="Ilustración de referencia"
                    className="lsc-sign-img w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="text-xs sm:text-sm">
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedOption === currentQuestion.correctIndex
                    ? '¡Bien hecho!'
                    : 'A repasar esta seña'}
                </p>
                <p className="mt-1 text-slate-700 dark:text-slate-300">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === 'finished' && (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {scope === 'random_mix'
                    ? '¡Reto Relámpago completado!'
                    : '¡Lección completada!'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                  {correctCount} aciertos de {answeredCount} preguntas respondidas
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">
                Puntaje final
              </span>
              <span className="font-mono text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {score} pts
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Precisión</span>
              <span className="mt-0.5 font-mono text-lg font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0}%
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Racha máxima</span>
              <span className="mt-0.5 font-mono text-lg font-bold tabular-nums text-amber-600 dark:text-amber-400">
                x{maxCombo}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">Lecciones mezcladas</span>
              <span className="mt-0.5 font-mono text-lg font-bold tabular-nums text-sky-600 dark:text-sky-400">
                {coveredLessons.length} / {lessons.length}
              </span>
            </div>
          </div>

          {practicedSignIds.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Señas vistas en esta ronda ({practicedSignIds.length})
              </h3>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {practicedSignIds.map((sid) => {
                  const signObj = signs.find((s) => s.id === sid);
                  if (!signObj) return null;
                  return (
                    <div
                      key={sid}
                      className="w-24 shrink-0 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 text-center"
                    >
                      <div className="lsc-sign-frame h-16 bg-white border border-slate-200 dark:border-slate-800 rounded-lg p-1 flex items-center justify-center overflow-hidden">
                        <img
                          src={signObj.imageUrl}
                          alt={`Seña ${signObj.word}`}
                          className="lsc-sign-img max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="mt-1 block text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">
                        {signObj.word}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {mistakes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Señas enviadas a &ldquo;Repasar luego&rdquo; ({mistakes.length})
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border-2 border-slate-200 dark:border-slate-800 rounded-2xl">
                {mistakes.map((m, i) => (
                  <div key={`${m.question.id}-${i}`} className="p-4 text-sm flex items-start gap-4">
                    {m.question.signId && (
                      <div className="lsc-sign-frame w-16 h-16 rounded-xl bg-white border border-slate-200 dark:border-slate-700 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={getSignImage(m.question.signId)}
                          alt="Ilustración de repaso"
                          className="lsc-sign-img w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {m.question.prompt}
                      </p>
                      <p className="mt-1 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                        Correcta: {m.question.options[m.question.correctIndex]}
                      </p>
                      <p className="mt-1 text-slate-600 dark:text-slate-400 text-xs">
                        {m.question.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={startQuiz}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-0.5 rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jugar otra ronda</span>
            </button>
            <button
              type="button"
              onClick={() => setPhase('setup')}
              className="px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-b-4 border-slate-300 dark:border-slate-950 active:border-b-0 active:translate-y-0.5 rounded-xl cursor-pointer"
            >
              Cambiar filtro
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
