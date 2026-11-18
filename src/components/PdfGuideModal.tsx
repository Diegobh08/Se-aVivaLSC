import React from 'react';
import { ExternalLink, X } from 'lucide-react';
import type { LscLessonMeta } from '../types/lsc';

interface PdfGuideModalProps {
  lesson: LscLessonMeta | null;
  onClose: () => void;
}

export const PdfGuideModal: React.FC<PdfGuideModalProps> = ({ lesson, onClose }) => {
  if (!lesson) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-5xl h-[86vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Guía ilustrada oficial · Lección {lesson.id}
            </p>
            <h2
              id="pdf-modal-title"
              className="text-base font-bold text-slate-900 dark:text-slate-100"
            >
              {lesson.title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={lesson.pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 dark:text-teal-300 hover:underline whitespace-nowrap"
            >
              <span>Abrir PDF en pestaña</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar visor PDF"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
          Guía completa en PDF original para repaso adicional; todas las ilustraciones ya están integradas en tus tarjetas, diccionario y quizzes.
        </div>

        <div className="flex-1 bg-slate-100 dark:bg-slate-950">
          <iframe
            title={`Guía PDF Lección ${lesson.id}`}
            src={lesson.pdfPath}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};
