'use client';

import clsx from 'clsx';
import { CompanionStatus } from '@/hooks/useOrbitCompanion';
import { Radio, RefreshCw, AlertCircle } from 'lucide-react';

interface OrbitStatusBadgeProps {
  status: CompanionStatus;
  showText?: boolean;
  className?: string;
}

export function OrbitStatusBadge({ status, showText = true, className }: OrbitStatusBadgeProps) {
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200',
        status === 'CONNECTED' && 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm',
        status === 'CONNECTING' && 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm',
        status === 'DISCONNECTED' && 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm',
        className
      )}
    >
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        {status === 'CONNECTED' && (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </>
        )}
        {status === 'CONNECTING' && (
          <RefreshCw className="h-3 w-3 animate-spin text-amber-600" />
        )}
        {status === 'DISCONNECTED' && (
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
        )}
      </span>

      {showText && (
        <span className="tracking-wide">
          {status === 'CONNECTED' && '🟢 Connected to Local Companion'}
          {status === 'CONNECTING' && '🟡 Connecting to Companion...'}
          {status === 'DISCONNECTED' && '🔴 Companion Offline'}
        </span>
      )}
    </div>
  );
}
