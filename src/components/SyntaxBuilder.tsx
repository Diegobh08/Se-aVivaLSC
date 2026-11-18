import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  Smile,
  XCircle,
} from 'lucide-react';
import { SYNTAX_CHALLENGES } from '../data/lscQuizzesAndSyntax';
import type { LscSign } from '../types/lsc';

interface SyntaxBuilderProps {
  signs: LscSign[];
  solvedIds: string[];
  onSolveChallenge: (challengeId: string) => void;
}

function deterministicShuffle(tokens: string[], seedStr: string): string[] {
  const arr = [...tokens];
  let seed = 0;
  for (let i = 0; i < seedStr.length; i += 1) {
    seed += seedStr.charCodeAt(i);
  }
  for (let i = arr.length - 1; i > 0; i -= 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = seed % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  if (arr.length > 1 && arr.every((t, idx) => t === tokens[idx])) {
    const first = arr.shift()!;
    arr.push(first);
  }
  return arr;
}

function normalizeToken(text: string): string {
  return text
    .toUpperCase()
    .replace(/[¿?¡!.,]/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function findSignForToken(token: string, signs: LscSign[]): LscSign | undefined {
  const norm = normalizeToken(token);
  if (!norm) return undefined;
  const aliasMap: Record<string, string> = {
    LSC: 'LENGUAJE MANUAL',
  };
  const target = aliasMap[norm] ?? norm;
  return signs.find((s) => {
    const w = normalizeToken(s.word);
    return w === target || w.split(/[\/\-()]/)[0].trim() === target;
  });
}

export const SyntaxBuilder: React.FC<SyntaxBuilderProps> = ({
  signs,
  solvedIds,
  onSolveChallenge,
}) => {
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [pickedIndices, setPickedIndices] = useState<number[]>([]);
  const [checkResult, setCheckResult] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const current = SYNTAX_CHALLENGES[challengeIdx];

  const bankTokens = useMemo(
    () => deterministicShuffle(current.glossTokens, current.id),
    [current]
  );

  const tokenSignMap = useMemo(() => {
    const map = new Map<string, LscSign>();
    for (const token of current.glossTokens) {
      if (!map.has(token)) {
        const match = findSignForToken(token, signs);
        if (match) map.set(token, match);
      }
    }
    return map;
  }, [current, signs]);

  const selectedTokens = pickedIndices.map((i) => bankTokens[i]);

  const handleToggleBankToken = (idx: number) => {
    if (checkResult === 'correct') return;
    setCheckResult('idle');
    if (pickedIndices.includes(idx)) {
      setPickedIndices((prev) => prev.filter((p) => p !== idx));
    } else {
      setPickedIndices((prev) => [...prev, idx]);
    }
  };

  const handleRemovePicked = (pos: number) => {
    if (checkResult === 'correct') return;
    setCheckResult('idle');
    setPickedIndices((prev) => prev.filter((_, idx) => idx !== pos));
  };

  const handleCheck = () => {
    if (selectedTokens.length !== current.glossTokens.length) return;
    const isMatch = selectedTokens.every((t, idx) => t === current.glossTokens[idx]);
    if (isMatch) {
      setCheckResult('correct');
      onSolveChallenge(current.id);
    } else {
      setCheckResult('wrong');
    }
  };

  const handleReset = () => {
    setPickedIndices([]);
    setCheckResult('idle');
  };

  const handleSelectChallenge = (idx: number) => {
    setChallengeIdx(idx);
    setPickedIndices([]);
    setCheckResult('idle');
  };

  const handleNext = () => {
    handleSelectChallenge((challengeIdx + 1) % SYNTAX_CHALLENGES.length);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Constructor de Sintaxis LSC · Lección {current.lessonId}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              Ordena las glosas como en Duolingo
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Toca las fichas en el orden gramatical correcto de la Lengua de Señas Colombiana.
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">
              Oraciones dominadas
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {solvedIds.length} / {SYNTAX_CHALLENGES.length}
            </span>
          </div>
        </div>

        {/* Challenge Selector Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {SYNTAX_CHALLENGES.map((ch, idx) => {
            const isSolved = solvedIds.includes(ch.id);
            const isActive = idx === challengeIdx;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => handleSelectChallenge(idx)}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl border-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'border-emerald-600 bg-emerald-500 text-white'
                    : isSolved
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span>#{idx + 1}</span>
                {isSolved && !isActive && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>

        {/* Target Spanish Sentence */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            Traduce esta oración al orden de glosas LSC:
          </span>
          <p className="mt-1.5 text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            &ldquo;{current.spanishMeaning}&rdquo;
          </p>
        </div>

        {/* Answer Construction Dropzone with Live Visual Sign Cards */}
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
            Tu secuencia ({selectedTokens.length}/{current.glossTokens.length}):
          </span>
          <div className="min-h-[112px] p-3.5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-wrap items-center gap-3">
            {selectedTokens.length === 0 ? (
              <span className="text-sm text-slate-400 dark:text-slate-500 px-2">
                Toca las señas ilustradas de abajo en orden para armar la frase...
              </span>
            ) : (
              selectedTokens.map((token, pos) => {
                const sign = tokenSignMap.get(token);
                return (
                  <button
                    key={`picked-${pos}-${token}`}
                    type="button"
                    onClick={() => handleRemovePicked(pos)}
                    className="w-24 p-2 bg-emerald-50 dark:bg-emerald-950/60 border-2 border-b-4 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-400 transition-colors cursor-pointer flex flex-col items-center gap-1.5"
                  >
                    {sign ? (
                      <div className="lsc-sign-frame w-full h-16 bg-white rounded-lg p-1 flex items-center justify-center overflow-hidden border border-emerald-200/80 dark:border-emerald-800">
                        <img
                          src={sign.imageUrl}
                          alt={`Seña ${token}`}
                          className="lsc-sign-img max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-16 bg-white/80 dark:bg-slate-900 rounded-lg flex items-center justify-center border border-emerald-200/80 dark:border-emerald-800 text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                        Glosa LSC
                      </div>
                    )}
                    <span className="text-xs font-mono font-bold truncate w-full text-center">
                      {token}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Available Illustrated Bank */}
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
            Fichas visuales disponibles (toca para agregar):
          </span>
          <div className="flex flex-wrap items-stretch gap-3">
            {bankTokens.map((token, idx) => {
              const isUsed = pickedIndices.includes(idx);
              const sign = tokenSignMap.get(token);
              return (
                <button
                  key={`bank-${idx}-${token}`}
                  type="button"
                  disabled={isUsed}
                  onClick={() => handleToggleBankToken(idx)}
                  className={`w-28 p-2 rounded-2xl border-2 border-b-4 transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    isUsed
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-300 dark:text-slate-700 opacity-45 cursor-default'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 hover:border-emerald-500 active:translate-y-0.5'
                  }`}
                >
                  {sign ? (
                    <div className="lsc-sign-frame w-full h-20 bg-white rounded-xl p-1 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800">
                      <img
                        src={sign.imageUrl}
                        alt={`Seña ${token}`}
                        className="lsc-sign-img max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-20 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                      Seña LSC
                    </div>
                  )}
                  <span className="text-xs font-mono font-bold truncate w-full text-center">
                    {token}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Banner */}
        {checkResult === 'correct' && (
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>¡Excelente! Estructura LSC correcta (+20 XP)</span>
            </div>

            <p className="text-sm text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{current.grammarRule}</span>
            </p>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
              <Smile className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Expresión no manual: {current.nonManualNote}</span>
            </p>
          </div>
        )}

        {checkResult === 'wrong' && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 flex items-start gap-2.5 text-sm text-rose-800 dark:text-rose-200">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Ese orden aún no coincide con la estructura LSC.</span>
              <span className="text-xs block mt-1">
                Pista: {current.grammarRule}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-b-4 border-slate-300 dark:border-slate-950 active:border-b-0 active:translate-y-0.5 rounded-xl cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Limpiar fichas</span>
          </button>

          <div className="flex items-center gap-2.5">
            {checkResult !== 'correct' ? (
              <button
                type="button"
                disabled={selectedTokens.length !== current.glossTokens.length}
                onClick={handleCheck}
                className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-0.5 disabled:opacity-45 rounded-xl transition-all cursor-pointer disabled:cursor-default"
              >
                Comprobar
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-0.5 rounded-xl transition-all cursor-pointer"
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
