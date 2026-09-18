'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * After sign-in, sync user profile to the NestJS backend.
   * The backend uses TypeORM synchronize:true so this triggers table creation on first run.
   */
  const syncUserToBackend = useCallback(async (firebaseUser: User) => {
    try {
      await api.post('/users/me', {
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email,
        photoUrl: firebaseUser.photoURL,
      });
    } catch (error) {
      // Non-fatal: user may already exist (409 Conflict is OK), or backend may be down
      console.warn('[Auth] Could not sync user to backend:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        // Sync session cookie immediately so proxy knows user is authenticated
        document.cookie = 'fiscora-session=1; path=/; max-age=3600; SameSite=Lax';
        // Sync profile after every fresh sign-in
        await syncUserToBackend(firebaseUser);
      } else {
        // Clear cookie if user logs out or session expires
        document.cookie = 'fiscora-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        document.cookie = 'spendly-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      }
    });

    return () => unsubscribe();
  }, [syncUserToBackend]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
