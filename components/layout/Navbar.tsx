'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useState } from 'react';

interface NavbarProps {
  onMenuClick?: () => void;
  pageTitle?: string;
}

export default function Navbar({ onMenuClick, pageTitle }: NavbarProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    // Clear session cookie
    document.cookie = 'spendly-session=; Max-Age=0; path=/';
    await signOut();
    router.push('/login');
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <header className="bg-white border-b border-[#E4E7EF] px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      {/* Left: burger on mobile + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-[#EEF1F8] text-[#7B8399] hover:text-[#0D1B3E] transition-colors"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        {pageTitle && (
          <h1 className="text-base font-semibold text-[#0D1B3E] hidden md:block">
            {pageTitle}
          </h1>
        )}
      </div>

      {/* Right: user info + sign out */}
      <div className="flex items-center gap-3">
        {/* Avatar + name */}
        <div className="flex items-center gap-2.5">
          {user?.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt={displayName}
              className="w-8 h-8 rounded-full ring-2 ring-[#E4E7EF]"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#3D7FE8] flex items-center justify-center text-white text-sm font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-[#0D1B3E] hidden sm:block">
            {displayName}
          </span>
        </div>

        <div className="w-px h-5 bg-[#E4E7EF]" />

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          loading={signingOut}
          className="text-[#7B8399] hover:text-[#C0293E]"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
