import { RefreshCw, Clock, Filter, Download } from 'lucide-react';
import { RiskScore } from '../shared/RiskScore';
import type { ViewId } from '../../types';

const viewTitles: Record<ViewId, { title: string; description: string }> = {
  dashboard: { title: 'Executive Dashboard', description: 'Enterprise TrueRisk Management — Attack Path Overview' },
  'attack-paths': { title: 'Attack Path Visualization', description: 'Pillar 1 — End-to-end adversarial chain analysis' },
  'network-map': { title: 'Asset & Network Mapping', description: 'Pillar 2 — Cross-boundary reachability & Shadow IT discovery' },
  identity: { title: 'Identity & Lateral Movement', description: 'Pillar 3 — AD privilege escalation & Blast Radius analysis' },
  remediation: { title: 'Adversarial Enrichment & Remediation', description: 'Pillar 4 — Choke points, What-If analysis & MITRE enrichment' },
  'risk-correlation': { title: 'Risk Factor & Path Correlation', description: 'Pillar 5 — Toxic combinations & contextual risk scoring' },
};

interface HeaderProps {
  activeView: ViewId;
  globalRiskScore: number;
}

export function Header({ activeView, globalRiskScore }: HeaderProps) {
  const { title, description } = viewTitles[activeView];

  return (
    <header className="sticky top-0 z-30 bg-surface-1/90 backdrop-blur border-b border-border px-6 py-3 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-slate-100 leading-tight">{title}</h1>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{description}</p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <Clock size={12} />
          <span className="font-mono">Updated 2m ago</span>
        </div>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors text-xs">
          <Filter size={12} />
          Filter
        </button>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors text-xs">
          <Download size={12} />
          Export
        </button>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition-colors text-xs">
          <RefreshCw size={12} />
          Refresh
        </button>

        <div className="border-l border-border pl-3">
          <RiskScore score={globalRiskScore} size="sm" showLabel={false} />
        </div>
      </div>
    </header>
  );
}
