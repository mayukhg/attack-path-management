import clsx from 'clsx';
import type { Severity } from '../../types';

interface BadgeProps {
  label: string;
  variant?: Severity | 'neutral' | 'toxic' | 'choke' | 'shadow' | 'crown';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const variantClasses: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-400 border border-red-500/30',
  high: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  low: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  info: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
  neutral: 'bg-slate-700/50 text-slate-300 border border-slate-600/30',
  toxic: 'bg-red-900/30 text-red-300 border border-red-500/50',
  choke: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  shadow: 'bg-purple-900/30 text-purple-300 border border-purple-500/50',
  crown: 'bg-amber-500/15 text-amber-300 border border-amber-500/40',
};

const pulseClasses: Record<string, string> = {
  critical: 'before:bg-red-500',
  high: 'before:bg-orange-500',
  medium: 'before:bg-amber-500',
};

export function Badge({ label, variant = 'neutral', size = 'sm', pulse = false }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-mono font-medium rounded tracking-wide uppercase',
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1',
        variantClasses[variant] ?? variantClasses.neutral,
        pulse && 'relative'
      )}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={clsx('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', pulseClasses[variant] ?? 'before:bg-slate-500')} />
          <span className={clsx('relative inline-flex rounded-full h-1.5 w-1.5', pulseClasses[variant]?.replace('before:', '') ?? 'bg-slate-500')} />
        </span>
      )}
      {label}
    </span>
  );
}
