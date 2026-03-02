import clsx from 'clsx';

interface RiskScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  projected?: boolean;
}

function getRiskColor(score: number): string {
  if (score >= 85) return 'text-red-400';
  if (score >= 70) return 'text-orange-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-blue-400';
}

function getRiskBg(score: number): string {
  if (score >= 85) return 'from-red-500/20 to-red-600/10 border-red-500/30';
  if (score >= 70) return 'from-orange-500/20 to-orange-600/10 border-orange-500/30';
  if (score >= 50) return 'from-amber-500/20 to-amber-600/10 border-amber-500/30';
  return 'from-blue-500/20 to-blue-600/10 border-blue-500/30';
}

function getRiskLabel(score: number): string {
  if (score >= 85) return 'CRITICAL';
  if (score >= 70) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  return 'LOW';
}

export function RiskScore({ score, size = 'md', showLabel = true, projected = false }: RiskScoreProps) {
  const sizeClasses = {
    sm: 'text-lg font-bold w-10 h-10',
    md: 'text-2xl font-bold w-14 h-14',
    lg: 'text-4xl font-bold w-20 h-20',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={clsx(
          'flex items-center justify-center rounded-xl border bg-gradient-to-br font-mono',
          sizeClasses[size],
          getRiskBg(score)
        )}
      >
        <span className={clsx(getRiskColor(score), projected && 'opacity-80')}>
          {projected && <span className="text-xs mr-0.5 opacity-70">→</span>}
          {score}
        </span>
      </div>
      {showLabel && (
        <span className={clsx('text-[10px] font-mono font-semibold tracking-widest', getRiskColor(score))}>
          {getRiskLabel(score)}
        </span>
      )}
    </div>
  );
}

interface RiskBarProps {
  score: number;
  label?: string;
  projected?: number;
}

export function RiskBar({ score, label, projected }: RiskBarProps) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-slate-400">{label}</span>
          <span className={clsx('text-xs font-mono font-semibold', getRiskColor(score))}>{score}</span>
        </div>
      )}
      <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-700',
            score >= 85 ? 'bg-red-500' : score >= 70 ? 'bg-orange-500' : score >= 50 ? 'bg-amber-500' : 'bg-blue-500'
          )}
          style={{ width: `${score}%` }}
        />
        {projected !== undefined && (
          <div
            className="absolute top-0 h-full bg-emerald-400/50 rounded-full transition-all duration-700"
            style={{ width: `${projected}%` }}
          />
        )}
      </div>
    </div>
  );
}
