import React, { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  AlertTriangle,
  ExternalLink,
  Globe,
  LogOut,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
} from 'lucide-react';
import {
  ChatApiError,
  GOOGLE_CHAT_CONSOLE_URL,
  initChatAuth,
  listChatSpaces,
  listSpaceMessages,
  postSpaceMessage,
  signInWithGoogleForChat,
  signOutFromChat,
} from '../services/firebaseChat';
import type { ChatMessage, ChatSpace, LscSearchResponse, LscSign } from '../types/lsc';

interface CommunityAndSearchProps {
  signs: LscSign[];
  xp: number;
  streak: number;
  learnedCount: number;
  totalCount: number;
}

const SUGGESTED_SEARCHES = [
  '¿Cómo varía la seña de algunas frutas o colores entre Bogotá y Medellín según el INSOR?',
  '¿Qué es el Diccionario Básico de la Lengua de Señas Colombiana del INSOR?',
  'Importancia de la seña personal y la cultura sorda en Colombia',
];

export const CommunityAndSearch: React.FC<CommunityAndSearchProps> = ({
  signs,
  xp,
  streak,
  learnedCount,
  totalCount,
}) => {
  const [sampleOffset, setSampleOffset] = useState(0);
  const [selectedSign, setSelectedSign] = useState<LscSign | null>(null);

  // Gemini Search Grounding state
  const [searchInput, setSearchInput] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<LscSearchResponse | null>(null);

  // Google Chat Workspace state
  const [chatUser, setChatUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [chatError, setChatError] = useState<{ status?: number; message: string } | null>(null);
  const [spaces, setSpaces] = useState<ChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draftMessage, setDraftMessage] = useState(
    `Hola grupo de estudio LSC: hoy llevo ${learnedCount}/${totalCount} señas dominadas (${xp} XP, racha de ${streak} días). ¿Practicamos las señas de esta semana?`
  );
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  useEffect(() => {
    setDraftMessage(
      `Hola grupo de estudio LSC: hoy llevo ${learnedCount}/${totalCount} señas dominadas (${xp} XP, racha de ${streak} días). ¿Practicamos las señas de esta semana?`
    );
  }, [learnedCount, totalCount, xp, streak]);

  useEffect(() => {
    const unsubscribe = initChatAuth(
      (user) => {
        setChatUser(user);
        setNeedsAuth(false);
      },
      () => {
        setChatUser(null);
        setNeedsAuth(true);
        setSpaces([]);
        setMessages([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleRunSearch = async (queryOverride?: string) => {
    const q = (queryOverride ?? searchInput).trim();
    if (!q) return;
    if (queryOverride) setSearchInput(queryOverride);
    setSearchLoading(true);
    setSearchError(null);
    try {
      const res = await fetch('/api/lsc-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = (await res.json()) as LscSearchResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo completar la búsqueda en este momento.');
      }
      setSearchResult({ answer: data.answer, sources: data.sources ?? [] });
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Error al consultar el servicio.');
    } finally {
      setSearchLoading(false);
    }
  };

  const loadSpaces = async () => {
    setLoadingSpaces(true);
    setChatError(null);
    try {
      const list = await listChatSpaces();
      setSpaces(list);
      if (list.length > 0) {
        const first = list[0].name;
        setSelectedSpace(first);
        await loadMessagesForSpace(first);
      }
    } catch (err) {
      if (err instanceof ChatApiError) {
        setChatError({ status: err.status, message: err.message });
        if (err.status === 401) setNeedsAuth(true);
      } else {
        setChatError({
          message: err instanceof Error ? err.message : 'Error al cargar espacios de Google Chat.',
        });
      }
    } finally {
      setLoadingSpaces(false);
    }
  };

  const loadMessagesForSpace = async (spaceName: string) => {
    if (!spaceName) return;
    setLoadingMessages(true);
    setChatError(null);
    try {
      const list = await listSpaceMessages(spaceName);
      setMessages(list);
    } catch (err) {
      if (err instanceof ChatApiError) {
        setChatError({ status: err.status, message: err.message });
        if (err.status === 401) setNeedsAuth(true);
      } else {
        setChatError({
          message: err instanceof Error ? err.message : 'Error al cargar mensajes.',
        });
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setChatError(null);
    try {
      const { user } = await signInWithGoogleForChat();
      setChatUser(user);
      setNeedsAuth(false);
      await loadSpaces();
    } catch (err) {
      setChatError({
        message:
          err instanceof Error
            ? err.message
            : 'No se pudo iniciar sesión con Google Workspace.',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOutFromChat();
    setChatUser(null);
    setNeedsAuth(true);
    setSpaces([]);
    setMessages([]);
    setSelectedSpace('');
  };

  const handleConfirmSendMessage = async () => {
    if (!selectedSpace || !draftMessage.trim()) return;
    setSendingMessage(true);
    setChatError(null);
    setSendSuccess(null);
    try {
      await postSpaceMessage(selectedSpace, draftMessage.trim());
      setConfirmSendOpen(false);
      setSendSuccess('Mensaje publicado en el espacio de Google Chat.');
      await loadMessagesForSpace(selectedSpace);
    } catch (err) {
      setConfirmSendOpen(false);
      if (err instanceof ChatApiError) {
        setChatError({ status: err.status, message: err.message });
        if (err.status === 401) setNeedsAuth(true);
      } else {
        setChatError({
          message: err instanceof Error ? err.message : 'No se pudo enviar el mensaje.',
        });
      }
    } finally {
      setSendingMessage(false);
    }
  };

  const selectedSpaceObj = spaces.find((s) => s.name === selectedSpace);

  const featuredSigns = signs.length > 0
    ? Array.from({ length: Math.min(6, signs.length) }, (_, idx) => {
        const index = (sampleOffset + idx * 19) % signs.length;
        return signs[index];
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Visual Vocabulary Strip for Community Practice */}
      {featuredSigns.length > 0 && (
        <section className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Señas ilustradas para practicar o consultar en grupo
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Toca cualquier ilustración para consultar su variación regional o compartirla como reto del día.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSampleOffset((o) => (o + 6) % Math.max(1, signs.length))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-b-2 border-slate-300 dark:border-slate-950 rounded-xl cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ver otras señas</span>
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {featuredSigns.map((sign) => {
              const isSelected = selectedSign?.id === sign.id;
              return (
                <button
                  key={sign.id}
                  type="button"
                  onClick={() => setSelectedSign(isSelected ? null : sign)}
                  className={`p-2 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-emerald-400'
                  }`}
                >
                  <div className="lsc-sign-frame h-20 bg-white rounded-lg p-1 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800">
                    <img
                      src={sign.imageUrl}
                      alt={`Seña ${sign.word}`}
                      loading="lazy"
                      className="lsc-sign-img max-h-full max-w-full object-contain"
                    />
                  </div>
                  <span className="mt-1.5 block text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {sign.word}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedSign && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
              <div className="lsc-sign-frame w-24 h-24 rounded-xl bg-white border border-slate-200 dark:border-slate-700 p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedSign.imageUrl}
                  alt={`Detalle de ${selectedSign.word}`}
                  className="lsc-sign-img max-h-full max-w-full object-contain"
                />
              </div>
              <div className="flex-1 text-xs sm:text-sm space-y-1">
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedSign.word} · Lección {selectedSign.lessonId}
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  {selectedSign.handshape} {selectedSign.movement}
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void handleRunSearch(
                        `¿Cómo es la seña "${selectedSign.word}" en Lengua de Señas Colombiana (INSOR) y tiene variaciones regionales?`
                      )
                    }
                    className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 border-b-2 border-emerald-700 rounded-lg cursor-pointer"
                  >
                    Consultar variación en Colombia
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraftMessage(
                        `¡Reto LSC del día! Practiquemos la seña "${selectedSign.word}" (Lección ${selectedSign.lessonId}): ${selectedSign.handshape} (${selectedSign.location}). Llevo ${learnedCount}/${totalCount} señas dominadas.`
                      )
                    }
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-sky-500 rounded-lg cursor-pointer"
                  >
                    Usar en mensaje del grupo
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Gemini + Google Search Grounding for LSC */}
        <section className="lg:col-span-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-medium text-teal-700 dark:text-teal-300">
            <Globe className="w-4 h-4" />
            <span>Búsqueda Web en tiempo real · INSOR y Cultura Sorda</span>
          </div>
          <h2 className="mt-1.5 text-xl font-bold text-slate-900 dark:text-slate-100">
            Consulta Cultural y Variaciones LSC
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Investiga variaciones regionales en Colombia, definiciones oficiales del INSOR o dudas de cultura sorda con fuentes web verificadas.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleRunSearch();
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ej. Variación regional de la seña BUS en Colombia..."
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
          <button
            type="submit"
            disabled={searchLoading || !searchInput.trim()}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            {searchLoading ? 'Buscando...' : 'Consultar'}
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {SUGGESTED_SEARCHES.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void handleRunSearch(suggestion)}
              className="text-left text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {searchError && (
          <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-sm text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{searchError}</span>
          </div>
        )}

        {searchResult && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
              {searchResult.answer}
            </div>

            {searchResult.sources.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Fuentes encontradas en Google Search ({searchResult.sources.length})
                </h3>
                <ul className="space-y-1.5">
                  {searchResult.sources.map((src) => (
                    <li key={src.uri}>
                      <a
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-300 hover:underline break-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span>{src.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Right: Google Chat Study Group Integration */}
      <section className="lg:col-span-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-sky-700 dark:text-sky-300">
              <MessageSquare className="w-4 h-4" />
              <span>Google Chat · Grupo de Estudio LSC</span>
            </div>
            <h2 className="mt-1.5 text-xl font-bold text-slate-900 dark:text-slate-100">
              Comparte retos y progreso en Google Chat
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Conecta tu cuenta de Google Workspace Business o Enterprise para leer mensajes y compartir tu avance en un espacio.
            </p>
          </div>

          {!needsAuth && chatUser && (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          )}
        </div>

        {/* Workspace Prerequisites Note */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p>
            <strong className="text-slate-800 dark:text-slate-200">Requisitos de Google Chat API:</strong>{' '}
            Requiere una cuenta de Google Workspace Business o Enterprise (las cuentas personales @gmail.com no tienen acceso a la API de Chat) y tener configurada la app de Chat en Google Cloud Console.
          </p>
          <a
            href={GOOGLE_CHAT_CONSOLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-300 hover:underline font-medium"
          >
            <span>Abrir configuración de Google Chat en Cloud Console</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {needsAuth ? (
          <div className="py-6 flex flex-col items-start gap-4">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Inicia sesión con tu cuenta de Google para conectar con tus espacios de Google Chat.
            </p>
            <button
              type="button"
              disabled={isLoggingIn}
              onClick={handleGoogleLogin}
              className="gsi-material-button"
            >
              <div className="gsi-material-button-state" />
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={{ display: 'block' }}
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  {isLoggingIn ? 'Conectando...' : 'Sign in with Google'}
                </span>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span>
                Conectado como <strong className="text-slate-900 dark:text-slate-100">{chatUser?.email}</strong>
              </span>
              <button
                type="button"
                onClick={loadSpaces}
                disabled={loadingSpaces}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSpaces ? 'animate-spin' : ''}`} />
                <span>Actualizar espacios</span>
              </button>
            </div>

            {spaces.length > 0 && (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="chat-space-select"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1"
                  >
                    Espacio de Google Chat
                  </label>
                  <select
                    id="chat-space-select"
                    value={selectedSpace}
                    onChange={(e) => {
                      setSelectedSpace(e.target.value);
                      void loadMessagesForSpace(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    {spaces.map((sp) => (
                      <option key={sp.name} value={sp.name}>
                        {sp.displayName || sp.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recent Messages */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2.5 bg-slate-50 dark:bg-slate-950">
                  {loadingMessages ? (
                    <p className="text-xs text-slate-500">Cargando mensajes...</p>
                  ) : messages.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No hay mensajes recientes en este espacio.
                    </p>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.name} className="text-xs border-b last:border-b-0 border-slate-200 dark:border-slate-800 pb-2 last:pb-0">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {msg.sender?.displayName || 'Participante'}:{' '}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {msg.text || '(Mensaje sin texto)'}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Compose Message */}
                <div className="space-y-2">
                  <label
                    htmlFor="chat-message-draft"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
                  >
                    Publicar avance o reto LSC en el grupo
                  </label>
                  <textarea
                    id="chat-message-draft"
                    rows={3}
                    value={draftMessage}
                    onChange={(e) => setDraftMessage(e.target.value)}
                    className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      disabled={!selectedSpace || !draftMessage.trim()}
                      onClick={() => setConfirmSendOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publicar en Google Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {sendSuccess && (
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
            {sendSuccess}
          </p>
        )}

        {chatError && (
          <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{chatError.message}</span>
            </div>
            {(chatError.status === 404 ||
              chatError.message.toLowerCase().includes('not found') ||
              chatError.message.toLowerCase().includes('chat app')) && (
              <a
                href={GOOGLE_CHAT_CONSOLE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold underline"
              >
                <span>Configurar la app de Google Chat en Cloud Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </section>

      {/* Mandatory Confirmation Dialog before sending message to Google Chat */}
      {confirmSendOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-chat-title"
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3
              id="confirm-chat-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Confirmar envío a Google Chat
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Se publicará el siguiente mensaje en el espacio{' '}
              <strong className="text-slate-900 dark:text-slate-100">
                {selectedSpaceObj?.displayName || selectedSpace}
              </strong>
              :
            </p>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {draftMessage}
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={sendingMessage}
                onClick={() => setConfirmSendOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={sendingMessage}
                onClick={() => void handleConfirmSendMessage()}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg cursor-pointer"
              >
                {sendingMessage ? 'Enviando...' : 'Confirmar y enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};
