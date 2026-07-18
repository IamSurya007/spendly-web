'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Landmark,
  TrendingUp,
  Settings,
  Wallet,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/budgets', label: 'Budgets', icon: PiggyBank },
  { href: '/loans', label: 'Loans', icon: Landmark },
  { href: '/investments', label: 'Investments', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  onNavClick?: () => void;
}

export default function Sidebar({ onNavClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full bg-[#0D1B3E] w-60">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 px-5 py-5 border-b border-white/10 hover:opacity-90 transition-opacity"
      >
        <div className="w-8 h-8 bg-[#3D7FE8] rounded-xl flex items-center justify-center shadow-lg">
          <Wallet size={16} className="text-white" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight">Spendly</span>
      </Link>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[#EEF1F8] text-[#0D1B3E]'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon
                size={18}
                className={clsx(
                  'flex-shrink-0 transition-colors',
                  isActive ? 'text-[#3D7FE8]' : ''
                )}
              />
              <span>{label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#3D7FE8]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-white/30 text-xs">Personal Finance OS</p>
      </div>
    </aside>
  );
}
