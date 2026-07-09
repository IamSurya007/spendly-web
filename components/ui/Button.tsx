'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'ghost' | 'danger' | 'secondary';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[#3D7FE8] text-white hover:bg-[#2d6fd8] active:bg-[#2460c0] shadow-sm',
  secondary:
    'bg-[#EEF1F8] text-[#0D1B3E] hover:bg-[#E4E7EF] active:bg-[#dde2ec]',
  ghost:
    'bg-transparent text-[#0D1B3E] hover:bg-[#EEF1F8] active:bg-[#E4E7EF]',
  danger:
    'bg-[#C0293E] text-white hover:bg-[#a8233a] active:bg-[#912030] shadow-sm',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-[#3D7FE8] focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={14} />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
