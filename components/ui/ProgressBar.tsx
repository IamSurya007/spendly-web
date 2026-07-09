import clsx from 'clsx';

interface ProgressBarProps {
  value: number; // 0-100
  status?: 'ok' | 'warning' | 'exceeded';
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
}

const colorMap = {
  ok: 'bg-[#3D7FE8]',
  warning: 'bg-amber-500',
  exceeded: 'bg-[#C0293E]',
};

export default function ProgressBar({
  value,
  status = 'ok',
  className,
  showLabel = false,
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex justify-between items-center mb-1">
        {showLabel && (
          <span className="text-xs font-medium text-[#7B8399]">{clamped.toFixed(0)}%</span>
        )}
      </div>
      <div className="w-full h-2 bg-[#E4E7EF] rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-700 ease-out',
            colorMap[status],
            animated && 'transition-[width]'
          )}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
