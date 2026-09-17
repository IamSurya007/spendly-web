import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://fiscora-api.duckdns.org',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach fresh Firebase ID token before every request.
// We dynamically require auth so Firebase is never initialized during SSR/build.
api.interceptors.request.use(
  async (config) => {
    try {
      // Dynamic import ensures this never runs on the server
      if (typeof window !== 'undefined') {
        const { auth } = await import('./firebase');
        const user = auth.currentUser;
        if (user) {
          // forceRefresh=true ensures we never send an expired token
          const token = await user.getIdToken(true);
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch (error) {
      // If token fetch fails, proceed without auth header (will 401 on server)
      console.error('[API] Failed to get ID token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      try {
        const { auth } = await import('./firebase');
        await auth.signOut();
        window.location.href = '/login';
      } catch {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

export default api;
