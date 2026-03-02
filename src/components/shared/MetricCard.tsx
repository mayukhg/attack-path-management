import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'neutral';
  highlight?: boolean;
}

const severityBorder: Record<string, string> = {
  critical: 'border-red-500/40 hover:border-red-500/60',
  high: 'border-orange-500/40 hover:border-orange-500/60',
  medium: 'border-amber-500/40 hover:border-amber-500/60',
  low: 'border-blue-500/40 hover:border-blue-500/60',
  neutral: 'border-slate-700/60 hover:border-slate-600',
};

const severityIcon: Record<string, string> = {
  critical: 'bg-red-500/15 text-red-400',
  high: 'bg-orange-500/15 text-orange-400',
  medium: 'bg-amber-500/15 text-amber-400',
  low: 'bg-blue-500/15 text-blue-400',
  neutral: 'bg-slate-700/50 text-slate-400',
};

export function MetricCard({ title, value, subtitle, icon: Icon, trend, severity = 'neutral', highlight }: MetricCardProps) {
  return (
    <div
      className={clsx(
        'relative bg-surface-2 rounded-xl border p-5 transition-colors cursor-default',
        severityBorder[severity],
        highlight && 'ring-1 ring-red-500/20'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">{title}</p>
          <p className={clsx(
            'text-3xl font-bold font-mono tracking-tight',
            severity === 'critical' ? 'text-red-400' :
            severity === 'high' ? 'text-orange-400' :
            severity === 'medium' ? 'text-amber-400' :
            severity === 'low' ? 'text-blue-400' : 'text-slate-100'
          )}>
            {value}
          </p>
          {subtitle && <p className="text-xs text-slate-500 mt-1 truncate">{subtitle}</p>}
          {trend !== undefined && (
            <p className={clsx(
              'text-xs font-mono mt-1',
              trend > 0 ? 'text-red-400' : 'text-emerald-400'
            )}>
              {trend > 0 ? `↑ +${trend}` : `↓ ${trend}`} vs last week
            </p>
          )}
        </div>
        <div className={clsx('p-2.5 rounded-lg flex-shrink-0', severityIcon[severity])}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
