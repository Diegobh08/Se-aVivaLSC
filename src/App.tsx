import { useCallback, useEffect, useMemo, useState } from 'react';
import { BlitzQuiz } from './components/BlitzQuiz';
import { CommunityAndSearch } from './components/CommunityAndSearch';
import { Dashboard } from './components/Dashboard';
import { FlashcardDeck } from './components/FlashcardDeck';
import { LessonBentoGrid } from './components/LessonBentoGrid';
import { type AppView, Navbar } from './components/Navbar';
import { PdfGuideModal } from './components/PdfGuideModal';
import { SyntaxBuilder } from './components/SyntaxBuilder';
import { ALL_LSC_SIGNS, LSC_LESSONS, getLessonMeta } from './data/lscVocabulary';
import type { LessonId, MasteryStatus, QuizScope, UserProgressState } from './types/lsc';

const PROGRESS_STORAGE_KEY = 'manos_lsc_progress_v1';
const THEME_STORAGE_KEY = 'manos_lsc_theme_v1';
const SIGN_CONTRAST_STORAGE_KEY = 'manos_lsc_sign_contrast_v1';

function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getYesterdayDateStr(): string {
  const dt = new Date();
  dt.setDate(dt.getDate() - 1);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function loadInitialProgress(): UserProgressState {
  const today = getTodayDateStr();
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      return {
        xp: 0,
        xpByDate: {},
        streak: 1,
        lastActiveDate: today,
        statuses: {},
        quizzesCompleted: 0,
        bestQuizScore: 0,
        syntaxSolvedIds: [],
      };
    }
    const parsed = JSON.parse(raw) as Partial<UserProgressState>;
    let streak = typeof parsed.streak === 'number' ? parsed.streak : 1;
    const lastActive = parsed.lastActiveDate || today;
    if (lastActive !== today) {
      if (lastActive === getYesterdayDateStr()) {
        streak += 1;
      } else {
        streak = 1;
      }
    }
    const totalXp = typeof parsed.xp === 'number' ? parsed.xp : 0;
    const parsedXpByDate =
      parsed.xpByDate && typeof parsed.xpByDate === 'object'
        ? parsed.xpByDate
        : totalXp > 0
          ? { [lastActive]: totalXp }
          : {};
    return {
      xp: totalXp,
      xpByDate: parsedXpByDate,
      streak,
      lastActiveDate: today,
      statuses: parsed.statuses ?? {},
      quizzesCompleted: typeof parsed.quizzesCompleted === 'number' ? parsed.quizzesCompleted : 0,
      bestQuizScore: typeof parsed.bestQuizScore === 'number' ? parsed.bestQuizScore : 0,
      syntaxSolvedIds: Array.isArray(parsed.syntaxSolvedIds) ? parsed.syntaxSolvedIds : [],
    };
  } catch {
    return {
      xp: 0,
      xpByDate: {},
      streak: 1,
      lastActiveDate: today,
      statuses: {},
      quizzesCompleted: 0,
      bestQuizScore: 0,
      syntaxSolvedIds: [],
    };
  }
}

function loadInitialDarkMode(): boolean {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  } catch {
    return false;
  }
}

function loadInitialSignContrast(): boolean {
  try {
    return localStorage.getItem(SIGN_CONTRAST_STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('bento');
  const [searchQuery, setSearchQuery] = useState('');
  const [progress, setProgress] = useState<UserProgressState>(loadInitialProgress);
  const [darkMode, setDarkMode] = useState<boolean>(loadInitialDarkMode);
  const [highContrastSigns, setHighContrastSigns] = useState<boolean>(loadInitialSignContrast);

  const [flashcardLesson, setFlashcardLesson] = useState<LessonId | 'all'>('all');
  const [flashcardStartSignId, setFlashcardStartSignId] = useState<string | undefined>(undefined);
  const [quizInitialScope, setQuizInitialScope] = useState<QuizScope>('random_mix');
  const [pdfLessonId, setPdfLessonId] = useState<LessonId | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (highContrastSigns) {
      root.classList.add('sign-high-contrast');
      localStorage.setItem(SIGN_CONTRAST_STORAGE_KEY, 'on');
    } else {
      root.classList.remove('sign-high-contrast');
      localStorage.setItem(SIGN_CONTRAST_STORAGE_KEY, 'off');
    }
  }, [highContrastSigns]);

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [progress]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length > 0 && activeView !== 'bento') {
      setActiveView('bento');
    }
  };

  const handleMarkStatus = useCallback((signId: string, status: MasteryStatus) => {
    const today = getTodayDateStr();
    setProgress((prev) => {
      const gainedXp = status === 'learned' ? 15 : status === 'review' ? 5 : 0;
      const nextStreak =
        prev.lastActiveDate === today
          ? prev.streak
          : prev.lastActiveDate === getYesterdayDateStr()
            ? prev.streak + 1
            : 1;
      return {
        ...prev,
        xp: prev.xp + gainedXp,
        xpByDate: {
          ...prev.xpByDate,
          [today]: (prev.xpByDate[today] ?? 0) + gainedXp,
        },
        streak: nextStreak,
        lastActiveDate: today,
        statuses: {
          ...prev.statuses,
          [signId]: status,
        },
      };
    });
  }, []);

  const handleCompleteQuiz = useCallback((score: number, xpEarned: number) => {
    const today = getTodayDateStr();
    setProgress((prev) => ({
      ...prev,
      xp: prev.xp + xpEarned,
      xpByDate: {
        ...prev.xpByDate,
        [today]: (prev.xpByDate[today] ?? 0) + xpEarned,
      },
      lastActiveDate: today,
      quizzesCompleted: prev.quizzesCompleted + 1,
      bestQuizScore: Math.max(prev.bestQuizScore, score),
    }));
  }, []);

  const handleSolveSyntax = useCallback((challengeId: string) => {
    const today = getTodayDateStr();
    setProgress((prev) => {
      const alreadySolved = prev.syntaxSolvedIds.includes(challengeId);
      const gainedXp = alreadySolved ? 5 : 20;
      return {
        ...prev,
        xp: prev.xp + gainedXp,
        xpByDate: {
          ...prev.xpByDate,
          [today]: (prev.xpByDate[today] ?? 0) + gainedXp,
        },
        lastActiveDate: today,
        syntaxSolvedIds: alreadySolved
          ? prev.syntaxSolvedIds
          : [...prev.syntaxSolvedIds, challengeId],
      };
    });
  }, []);

  const handleOpenLessonFlashcards = (lessonId: LessonId | 'all', startSignId?: string) => {
    setFlashcardLesson(lessonId);
    setFlashcardStartSignId(startSignId);
    setActiveView('flashcards');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLessonQuiz = (scope: QuizScope) => {
    setQuizInitialScope(scope);
    setActiveView('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { learnedCount, reviewCount } = useMemo(() => {
    let learned = 0;
    let review = 0;
    for (const sign of ALL_LSC_SIGNS) {
      const st = progress.statuses[sign.id];
      if (st === 'learned') learned += 1;
      if (st === 'review') review += 1;
    }
    return { learnedCount: learned, reviewCount: review };
  }, [progress.statuses]);

  const activePdfLesson = pdfLessonId ? getLessonMeta(pdfLessonId) : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        activeView={activeView}
        onSelectView={(view) => {
          if (view === 'flashcards') {
            setFlashcardStartSignId(undefined);
          }
          setActiveView(view);
        }}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        xp={progress.xp}
        streak={progress.streak}
        learnedCount={learnedCount}
        totalCount={ALL_LSC_SIGNS.length}
        reviewCount={reviewCount}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        highContrastSigns={highContrastSigns}
        onToggleHighContrastSigns={() => setHighContrastSigns((v) => !v)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'bento' && (
          <LessonBentoGrid
            lessons={LSC_LESSONS}
            signs={ALL_LSC_SIGNS}
            statuses={progress.statuses}
            searchQuery={searchQuery}
            onOpenLessonFlashcards={handleOpenLessonFlashcards}
            onOpenLessonQuiz={handleOpenLessonQuiz}
            onOpenPdfGuide={(id) => setPdfLessonId(id)}
          />
        )}

        {activeView === 'flashcards' && (
          <FlashcardDeck
            lessons={LSC_LESSONS}
            signs={ALL_LSC_SIGNS}
            statuses={progress.statuses}
            initialLessonFilter={flashcardLesson}
            initialSignId={flashcardStartSignId}
            xp={progress.xp}
            streak={progress.streak}
            onMarkStatus={handleMarkStatus}
            onOpenLessonQuiz={handleOpenLessonQuiz}
            onOpenPdfGuide={(id) => setPdfLessonId(id)}
          />
        )}

        {activeView === 'quiz' && (
          <BlitzQuiz
            lessons={LSC_LESSONS}
            signs={ALL_LSC_SIGNS}
            statuses={progress.statuses}
            initialScope={quizInitialScope}
            bestQuizScore={progress.bestQuizScore}
            onCompleteQuiz={handleCompleteQuiz}
            onMarkStatus={handleMarkStatus}
          />
        )}

        {activeView === 'syntax' && (
          <SyntaxBuilder
            signs={ALL_LSC_SIGNS}
            solvedIds={progress.syntaxSolvedIds}
            onSolveChallenge={handleSolveSyntax}
          />
        )}

        {activeView === 'dashboard' && (
          <Dashboard
            lessons={LSC_LESSONS}
            signs={ALL_LSC_SIGNS}
            progress={progress}
            onOpenLessonFlashcards={handleOpenLessonFlashcards}
          />
        )}

        {activeView === 'community' && (
          <CommunityAndSearch
            signs={ALL_LSC_SIGNS}
            xp={progress.xp}
            streak={progress.streak}
            learnedCount={learnedCount}
            totalCount={ALL_LSC_SIGNS.length}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>
            SeñaViva LSC · Lengua de Señas Colombiana interactiva (Lecciones 1–11)
          </span>
          <span className="tabular-nums">
            {ALL_LSC_SIGNS.length} señas ilustradas · Progreso guardado localmente
          </span>
        </div>
      </footer>

      <PdfGuideModal lesson={activePdfLesson} onClose={() => setPdfLessonId(null)} />
    </div>
  );
}
