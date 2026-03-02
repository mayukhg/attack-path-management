import { useState } from 'react';
import { AlertTriangle, X, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import { Badge } from './Badge';
import type { Alert } from '../../types';

interface AlertBannerProps {
  alerts: Alert[];
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const active = alerts.filter(a => !a.acknowledged && !dismissed.has(a.id));
  if (active.length === 0) return null;

  const shown = expanded ? active : active.slice(0, 1);

  return (
    <div className="mx-4 mt-3 rounded-xl border border-red-500/30 bg-red-950/20 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2 text-red-400 flex-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <Bell size={14} />
          <span className="text-sm font-semibold">{active.length} Active {active.length === 1 ? 'Alert' : 'Alerts'}</span>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-red-400/70 hover:text-red-400 transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      <div className="border-t border-red-500/20">
        {shown.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 px-4 py-3 border-b border-red-500/10 last:border-0">
            <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge label={alert.severity} variant={alert.severity} />
                <span className="text-xs font-semibold text-slate-200 truncate">{alert.title}</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{alert.description}</p>
              <p className="text-[10px] text-slate-600 mt-1 font-mono">{new Date(alert.timestamp).toLocaleString()}</p>
            </div>
            <button
              onClick={() => setDismissed(d => new Set([...d, alert.id]))}
              className={clsx('text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0')}
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
