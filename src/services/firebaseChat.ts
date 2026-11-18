import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import type { ChatMessage, ChatSpace } from '../types/lsc';

const CHAT_SCOPES = [
  'https://www.googleapis.com/auth/chat.spaces.readonly',
  'https://www.googleapis.com/auth/chat.messages.readonly',
  'https://www.googleapis.com/auth/chat.messages.create',
];

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
for (const scope of CHAT_SCOPES) {
  provider.addScope(scope);
}

// Keep access token strictly in memory — never persist to localStorage or sessionStorage
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const GOOGLE_CHAT_CONSOLE_URL = `https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat?project=${firebaseConfig.projectId}`;

export function initChatAuth(
  onAuthSuccess: (user: User, token: string) => void,
  onAuthFailure: () => void
) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure();
    }
  });
}

export async function signInWithGoogleForChat(): Promise<{ user: User; accessToken: string }> {
  isSigningIn = true;
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google Workspace.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
}

export async function signOutFromChat(): Promise<void> {
  cachedAccessToken = null;
  await signOut(auth);
}

export function getInMemoryChatToken(): string | null {
  return cachedAccessToken;
}

export class ChatApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function chatFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  if (!cachedAccessToken) {
    throw new ChatApiError(401, 'Debes iniciar sesión con tu cuenta de Google Workspace para usar Google Chat.');
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let detail = `Error ${res.status} al comunicarse con Google Chat.`;
    try {
      const payload = (await res.json()) as { error?: { message?: string } };
      if (payload?.error?.message) {
        detail = payload.error.message;
      }
    } catch {
      // Ignore JSON parse fallback
    }
    if (res.status === 401) {
      cachedAccessToken = null;
    }
    throw new ChatApiError(res.status, detail);
  }

  return (await res.json()) as T;
}

export async function listChatSpaces(): Promise<ChatSpace[]> {
  const data = await chatFetch<{ spaces?: ChatSpace[] }>('https://chat.googleapis.com/v1/spaces?pageSize=25');
  return data.spaces ?? [];
}

export async function listSpaceMessages(spaceName: string): Promise<ChatMessage[]> {
  const data = await chatFetch<{ messages?: ChatMessage[] }>(
    `https://chat.googleapis.com/v1/${spaceName}/messages?pageSize=20`
  );
  return data.messages ?? [];
}

export async function postSpaceMessage(spaceName: string, text: string): Promise<ChatMessage> {
  return chatFetch<ChatMessage>(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}
