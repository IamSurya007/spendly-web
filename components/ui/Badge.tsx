import clsx from 'clsx';

type BadgeVariant =
  | 'ok'
  | 'warning'
  | 'exceeded'
  | 'active'
  | 'paid'
  | 'overdue'
  | 'partial'
  | 'income'
  | 'expense'
  | 'default';

const variantStyles: Record<BadgeVariant, string> = {
  ok: 'bg-[#1A7A4A]/10 text-[#1A7A4A]',
  warning: 'bg-amber-100 text-amber-700',
  exceeded: 'bg-[#C0293E]/10 text-[#C0293E]',
  active: 'bg-[#1A7A4A]/10 text-[#1A7A4A]',
  paid: 'bg-[#3D7FE8]/10 text-[#3D7FE8]',
  overdue: 'bg-[#C0293E]/10 text-[#C0293E]',
  partial: 'bg-amber-100 text-amber-700',
  income: 'bg-[#1A7A4A]/10 text-[#1A7A4A]',
  expense: 'bg-[#C0293E]/10 text-[#C0293E]',
  default: 'bg-[#E4E7EF] text-[#7B8399]',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export default function Badge({
  variant = 'default',
  children,
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full',
            variant === 'ok' || variant === 'active' || variant === 'income'
              ? 'bg-[#1A7A4A]'
              : variant === 'exceeded' || variant === 'overdue' || variant === 'expense'
              ? 'bg-[#C0293E]'
              : variant === 'warning' || variant === 'partial'
              ? 'bg-amber-500'
              : variant === 'paid'
              ? 'bg-[#3D7FE8]'
              : 'bg-[#7B8399]'
          )}
        />
      )}
      {children}
    </span>
  );
}
