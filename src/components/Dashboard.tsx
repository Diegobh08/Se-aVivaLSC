import React, { useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Flame,
  Play,
  RotateCcw,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { LessonId, LscLessonMeta, LscSign, UserProgressState } from '../types/lsc';

interface DashboardProps {
  lessons: LscLessonMeta[];
  signs: LscSign[];
  progress: UserProgressState;
  onOpenLessonFlashcards: (lessonId: LessonId | 'all', startSignId?: string) => void;
}

interface XpDayPoint {
  dateKey: string;
  label: string;
  xp: number;
}

interface LessonMasteryPoint {
  lessonId: LessonId;
  name: string;
  shortName: string;
  learned: number;
  review: number;
  total: number;
  pct: number;
  color: string;
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatShortDayLabel(date: Date, isToday: boolean): string {
  if (isToday) return 'Hoy';
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
  });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: XpDayPoint | LessonMasteryPoint;
  }>;
}

const XpLineTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0]?.payload as XpDayPoint | undefined;
  if (!item) return null;

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-slate-900 dark:text-slate-100">{item.label}</p>
      <p className="text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-0.5">
        +{item.xp} XP
      </p>
    </div>
  );
};

const LessonPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0]?.payload as LessonMasteryPoint | undefined;
  if (!item) return null;

  return (
    <div className="rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 px-3 py-2 shadow-lg text-xs space-y-0.5">
      <p className="font-bold text-slate-900 dark:text-slate-100">{item.name}</p>
      <p className="text-slate-600 dark:text-slate-300 tabular-nums">
        Dominio: <strong className="text-emerald-600 dark:text-emerald-400">{item.pct}%</strong> ({item.learned}/{item.total} señas)
      </p>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({
  lessons,
  signs,
  progress,
  onOpenLessonFlashcards,
}) => {
  const [dayRange, setDayRange] = useState<7 | 14>(7);
  const [selectedLessonId, setSelectedLessonId] = useState<LessonId>(1);

  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const todayXp = progress.xpByDate?.[todayKey] ?? 0;

  const xpSeries: XpDayPoint[] = useMemo(() => {
    const points: XpDayPoint[] = [];
    const base = new Date();
    for (let offset = dayRange - 1; offset >= 0; offset -= 1) {
      const dt = new Date(base);
      dt.setDate(base.getDate() - offset);
      const key = formatDateKey(dt);
      points.push({
        dateKey: key,
        label: formatShortDayLabel(dt, offset === 0),
        xp: progress.xpByDate?.[key] ?? 0,
      });
    }
    return points;
  }, [progress.xpByDate, dayRange]);

  const { lessonStats, totalLearned, totalReview, globalPct } = useMemo(() => {
    let learnedAcc = 0;
    let reviewAcc = 0;

    const stats: LessonMasteryPoint[] = lessons.map((lesson) => {
      const lessonSigns = signs.filter((s) => s.lessonId === lesson.id);
      let learned = 0;
      let review = 0;
      for (const sign of lessonSigns) {
        const st = progress.statuses[sign.id];
        if (st === 'learned') learned += 1;
        if (st === 'review') review += 1;
      }
      learnedAcc += learned;
      reviewAcc += review;
      const pct = lessonSigns.length > 0 ? Math.round((learned / lessonSigns.length) * 100) : 0;

      return {
        lessonId: lesson.id,
        name: `Lección ${lesson.id}: ${lesson.title}`,
        shortName: `L${lesson.id}`,
        learned,
        review,
        total: lessonSigns.length,
        pct,
        color: lesson.accentHex,
      };
    });

    const pctGlobal = signs.length > 0 ? Math.round((learnedAcc / signs.length) * 100) : 0;
    return {
      lessonStats: stats,
      totalLearned: learnedAcc,
      totalReview: reviewAcc,
      globalPct: pctGlobal,
    };
  }, [lessons, signs, progress.statuses]);

  const pieData = useMemo(
    () => lessonStats.filter((item) => item.learned > 0),
    [lessonStats]
  );

  const spotlightSigns = useMemo(() => {
    const reviewList = signs.filter((s) => progress.statuses[s.id] === 'review');
    if (reviewList.length > 0) return { mode: 'review' as const, items: reviewList.slice(0, 6) };
    const lessonPool = signs.filter((s) => s.lessonId === selectedLessonId);
    return { mode: 'lesson' as const, items: lessonPool.slice(0, 6) };
  }, [signs, progress.statuses, selectedLessonId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Analítica de aprendizaje · SeñaViva LSC
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
            Dashboard de Progreso
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Visualiza tu ritmo diario de XP y el porcentaje de dominio en cada una de las 11 lecciones.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenLessonFlashcards(selectedLessonId)}
          className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-0.5 rounded-xl transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Practicar Lección {selectedLessonId}</span>
        </button>
      </section>

      {/* Top KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>XP Total</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="mt-2 font-mono text-2xl sm:text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {progress.xp}
          </p>
          <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{todayXp} XP hoy
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Racha diaria</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-2 font-mono text-2xl sm:text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {progress.streak} {progress.streak === 1 ? 'día' : 'días'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Constancia activa
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Dominio global</span>
            <CheckCircle2 className="w-4 h-4 text-sky-500" />
          </div>
          <p className="mt-2 font-mono text-2xl sm:text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {globalPct}%
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {totalLearned} / {signs.length} señas · {totalReview} por repasar
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Retos y Sintaxis</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <p className="mt-2 font-mono text-2xl sm:text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {progress.bestQuizScore} pts
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {progress.quizzesCompleted} quices · {progress.syntaxSolvedIds.length} frases
          </p>
        </div>
      </section>

      {/* Main Recharts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line Chart: XP per day */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span>Actividad diaria</span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                XP ganado por día
              </h2>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
              {([7, 14] as const).map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDayRange(days)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    dayRange === days
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {days} días
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={xpSeries} margin={{ top: 10, right: 16, left: -12, bottom: 5 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#cbd5e1" opacity={0.45} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<XpLineTooltip />} />
                <Line
                  type="monotone"
                  dataKey="xp"
                  name="XP ganado"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7, fill: '#059669', strokeWidth: 2, stroke: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Mastery by Lesson */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sky-600 dark:text-sky-400">
              <BookOpen className="w-4 h-4" />
              <span>Distribución de dominio</span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
              Dominio por lección (1–11)
            </h2>
          </div>

          {pieData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center px-4">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[{ name: 'Sin señas dominadas aún', value: 1 }]}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={66}
                      stroke="none"
                    >
                      <Cell fill="#e2e8f0" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                Aún no marcas señas como &ldquo;¡La sé!&rdquo;
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Completa tarjetas o acierta en el Reto Relámpago para ver tu gráfica circular por lección.
              </p>
            </div>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="learned"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={88}
                    paddingAngle={3}
                    onClick={(entry) => {
                      const clicked = entry as unknown as LessonMasteryPoint;
                      if (clicked?.lessonId) {
                        setSelectedLessonId(clicked.lessonId);
                      }
                    }}
                    className="cursor-pointer outline-none"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.lessonId} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<LessonPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Compact Lesson Legend Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {lessonStats.map((ls) => {
              const isSelected = ls.lessonId === selectedLessonId;
              return (
                <button
                  key={ls.lessonId}
                  type="button"
                  onClick={() => setSelectedLessonId(ls.lessonId)}
                  className={`px-2 py-1.5 rounded-xl text-left text-xs transition-colors flex items-center justify-between gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: ls.color }}
                    />
                    <span className="text-slate-700 dark:text-slate-200 truncate">
                      {ls.shortName}
                    </span>
                  </span>
                  <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    {ls.pct}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Per-Lesson Progress Bars + Visual Vocabulary Spotlight */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-3.5">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Avance detallado por unidad
          </h3>
          <div className="space-y-3">
            {lessonStats.map((ls) => (
              <div key={ls.lessonId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => onOpenLessonFlashcards(ls.lessonId)}
                    className="font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 text-left cursor-pointer truncate"
                  >
                    {ls.name}
                  </button>
                  <span className="font-mono font-bold tabular-nums text-slate-600 dark:text-slate-300 shrink-0 ml-2">
                    {ls.learned}/{ls.total} ({ls.pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${ls.pct}%`, backgroundColor: ls.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Sign Spotlight */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {spotlightSigns.mode === 'review' ? (
                  <>
                    <RotateCcw className="w-4 h-4 text-rose-500" />
                    <span>Señas pendientes por repasar</span>
                  </>
                ) : (
                  <span>Muestra visual · Lección {selectedLessonId}</span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Toca cualquier ilustración para practicarla al instante.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {spotlightSigns.items.map((sign) => (
              <button
                key={sign.id}
                type="button"
                onClick={() => onOpenLessonFlashcards(sign.lessonId, sign.id)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-emerald-500 text-center transition-colors cursor-pointer"
              >
                <div className="lsc-sign-frame h-20 bg-white rounded-lg border border-slate-200 dark:border-slate-800 p-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={sign.imageUrl}
                    alt={`Seña ${sign.word}`}
                    loading="lazy"
                    className="lsc-sign-img max-h-full max-w-full object-contain"
                  />
                </div>
                <span className="mt-1 block text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                  {sign.word}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
