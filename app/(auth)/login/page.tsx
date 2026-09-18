'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Wallet, Eye, EyeOff, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const afterAuth = () => {
    document.cookie = 'fiscora-session=1; path=/; max-age=3600; SameSite=Lax';
    router.replace('/dashboard');
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      afterAuth();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      toast.error(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      afterAuth();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      toast.error(message.replace('Firebase: ', '').replace(/ \(auth\/.*\)\.?/, ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl flex rounded-3xl overflow-hidden shadow-[0_24px_80px_-12px_rgba(13,27,62,0.35)] animate-scale-in">
      {/* Left panel — branding */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-[#0D1B3E] p-10 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3D7FE8]/20 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#3D7FE8]/10 rounded-full translate-y-24 -translate-x-24" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3D7FE8] rounded-2xl flex items-center justify-center shadow-lg">
            <Wallet size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Fiscora</span>
        </div>

        {/* Stats previews */}
        <div className="relative space-y-4">
          {[
            { icon: BarChart3, label: 'Track expenses', desc: 'Categorize & analyze your spending' },
            { icon: PieChart, label: 'Budget smarter', desc: 'Set limits and stay on track' },
            { icon: TrendingUp, label: 'Grow wealth', desc: 'Monitor investments & loans' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={17} className="text-[#3D7FE8]" />
              </div>
              <div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-white/50">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative text-white/30 text-xs">
          Your personal finance OS — all in one place.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 bg-white p-8 md:p-10 flex flex-col justify-center">
        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-[#3D7FE8] rounded-xl flex items-center justify-center">
            <Wallet size={16} className="text-white" />
          </div>
          <span className="text-xl font-bold text-[#0D1B3E]">Fiscora</span>
        </div>

        <h2 className="text-2xl font-bold text-[#0D1B3E] mb-1">
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-sm text-[#7B8399] mb-7">
          {mode === 'signin'
            ? 'Sign in to your personal finance OS'
            : 'Start managing your finances today'}
        </p>

        {/* Google sign in */}
        <Button
          variant="secondary"
          fullWidth
          onClick={handleGoogle}
          loading={googleLoading}
          className="mb-5 gap-3 justify-center"
          id="google-signin-btn"
        >
          {!googleLoading && (
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#E4E7EF]" />
          <span className="text-xs text-[#7B8399]">or</span>
          <div className="flex-1 h-px bg-[#E4E7EF]" />
        </div>

        {/* Email/Password form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'signup' && (
            <Input
              id="auth-name"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <Input
            id="auth-email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="relative">
            <Input
              id="auth-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-8 text-[#7B8399] hover:text-[#0D1B3E] transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            id="auth-submit-btn"
            className="mt-2"
          >
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-[#7B8399] mt-5">
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-[#3D7FE8] font-medium hover:underline"
            id="auth-toggle-mode-btn"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
