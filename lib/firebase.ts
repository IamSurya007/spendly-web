import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy singleton — only initializes in the browser.
// Prevents build-time / SSR crashes when NEXT_PUBLIC_FIREBASE_* env vars are missing.
let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;

function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    try {
      const isPlaceholder = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes('your_api_key');
      if (isPlaceholder) {
        console.warn(
          '[Spendly] Firebase API key is missing or using placeholder. ' +
          'Please create/configure your .env.local file and restart the Next.js server.'
        );
      }
      _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    } catch (err) {
      console.warn('[Spendly] Firebase App initialization failed, falling back to mock mode.', err);
      _app = { name: '[DEFAULT]', options: {} } as FirebaseApp;
    }
  }
  return _app;
}

/**
 * Lazily return the Firebase Auth instance.
 * Safe to call from client components — never called during SSR.
 * Returns a mock Auth fallback if config is missing to prevent page crashes.
 */
function getFirebaseAuth(): Auth {
  if (!_auth) {
    try {
      const app = getFirebaseApp();
      // If the app is a mock, getAuth will fail, triggering the catch block
      _auth = getAuth(app);
    } catch (err) {
      console.warn(
        '[Spendly] Firebase Auth failed to initialize. ' +
        'Providing a mock Auth fallback so the page doesn\'t crash. Check your .env.local configuration.',
        err
      );
      
      // Return mock Auth instance so layout loading resolves and page renders
      _auth = {
        currentUser: null,
        onAuthStateChanged: (callback: (user: any) => void) => {
          // Resolve auth state as "not logged in" so loading screen ends
          const timer = setTimeout(() => callback(null), 100);
          return () => clearTimeout(timer);
        },
        signOut: async () => {
          console.warn('[Spendly] Sign out called in mock mode.');
        },
      } as unknown as Auth;
    }
  }
  return _auth;
}

// Export a Proxy that defers initialization until first property access.
// This means server-side code that imports this file won't trigger Firebase init.
export const auth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    return Reflect.get(getFirebaseAuth(), prop);
  },
  set(_target, prop, value) {
    return Reflect.set(getFirebaseAuth(), prop, value);
  },
});

export const googleProvider = new GoogleAuthProvider();

