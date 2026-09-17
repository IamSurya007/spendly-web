import { auth } from './firebase';

export interface RagSource {
  docId: string;
  title: string;
  category: string;
  score: number;
}

export interface RagAskResponse {
  answer: string;
  sources?: RagSource[];
  grounded?: boolean;
}

export interface RagChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: RagSource[];
  grounded?: boolean;
  timestamp: Date;
  error?: boolean;
}

export async function askRagQuestion(question: string): Promise<RagAskResponse> {
  const ragBaseUrl = process.env.NEXT_PUBLIC_RAG_API_URL || 'http://localhost:3001';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Wait for Firebase Auth state to resolve before requesting ID token
  if (typeof window !== 'undefined') {
    try {
      if (typeof auth.authStateReady === 'function') {
        await auth.authStateReady();
      }
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('[Spendly AI] Could not retrieve Firebase ID token:', e);
    }
  }

  const endpoint = `${ragBaseUrl.replace(/\/$/, '')}/rag/ask`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message =
      errorBody.message ||
      (res.status === 401
        ? 'Authentication required. Please sign in again.'
        : `RAG service error (${res.status})`);
    throw new Error(message);
  }

  return await res.json();
}
