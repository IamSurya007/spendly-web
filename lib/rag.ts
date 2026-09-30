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
  /** Set when the exchange was saved to chat history. */
  conversationId?: string;
  conversationTitle?: string;
  messageId?: string;
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

export interface ChatConversationSummary {
  id: string;
  title: string;
  lastMessageAt: string;
  preview: string;
}

interface ServerChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: RagSource[];
  grounded: boolean;
  createdAt: string;
}

function ragBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_RAG_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://fiscora-api.duckdns.org';
  return base.replace(/\/$/, '');
}

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  // Wait for Firebase Auth state to resolve before requesting ID token
  if (typeof window !== 'undefined') {
    try {
      if (typeof auth.authStateReady === 'function') {
        await auth.authStateReady();
      }
      const user = auth.currentUser;
      if (user) {
        headers['Authorization'] = `Bearer ${await user.getIdToken()}`;
      }
    } catch (e) {
      console.warn('[Fiscora AI] Could not retrieve Firebase ID token:', e);
    }
  }
  return headers;
}

async function ragFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${ragBaseUrl()}${path}`, {
    ...init,
    headers: { ...(await authHeaders()), ...(init.headers as Record<string, string> | undefined) },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message =
      errorBody.message ||
      (res.status === 401
        ? 'Authentication required. Please sign in again.'
        : res.status === 404
        ? 'This conversation no longer exists.'
        : `RAG service error (${res.status})`);
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Ask a question; pass `conversationId` to continue a saved conversation. */
export async function askRagQuestion(question: string, conversationId?: string): Promise<RagAskResponse> {
  return ragFetch<RagAskResponse>('/rag/ask', {
    method: 'POST',
    body: JSON.stringify(conversationId ? { question, conversationId } : { question }),
  });
}

export async function listConversations(cursor?: string): Promise<{
  items: ChatConversationSummary[];
  nextCursor: string | null;
}> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
  return ragFetch(`/rag/conversations${qs}`);
}

export async function getConversationMessages(
  conversationId: string,
): Promise<{ title: string; messages: RagChatMessage[] }> {
  const data = await ragFetch<{ title: string; messages: ServerChatMessage[] }>(
    `/rag/conversations/${conversationId}/messages`,
  );
  return {
    title: data.title,
    messages: data.messages.map((m) => ({
      id: m.id,
      sender: m.role === 'user' ? 'user' : 'ai',
      text: m.content,
      sources: m.sources ?? [],
      grounded: m.grounded,
      timestamp: new Date(m.createdAt),
    })),
  };
}

export async function renameConversation(conversationId: string, title: string): Promise<void> {
  await ragFetch(`/rag/conversations/${conversationId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await ragFetch(`/rag/conversations/${conversationId}`, { method: 'DELETE' });
}
