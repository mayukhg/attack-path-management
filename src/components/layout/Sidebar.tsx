import clsx from 'clsx';
import {
  LayoutDashboard,
  GitFork,
  Network,
  Users,
  Wrench,
  Layers,
  Shield,
  ChevronRight,
} from 'lucide-react';
import type { ViewId } from '../../types';

interface NavItem {
  id: ViewId;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  pillar?: string;
  badge?: string;
  badgeSeverity?: 'critical' | 'warning';
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    sublabel: 'Executive Overview',
    icon: LayoutDashboard,
  },
  {
    id: 'attack-paths',
    label: 'Attack Paths',
    sublabel: 'Path Visualization',
    icon: GitFork,
    pillar: 'Pillar 1',
    badge: '4',
    badgeSeverity: 'critical',
  },
  {
    id: 'network-map',
    label: 'Network Map',
    sublabel: 'Asset & Boundary Mapping',
    icon: Network,
    pillar: 'Pillar 2',
    badge: 'Shadow IT: 14',
    badgeSeverity: 'warning',
  },
  {
    id: 'identity',
    label: 'Identity & Lateral Movement',
    sublabel: 'AD Escalation & Blast Radius',
    icon: Users,
    pillar: 'Pillar 3',
  },
  {
    id: 'remediation',
    label: 'Remediation',
    sublabel: 'Choke Points & What-If',
    icon: Wrench,
    pillar: 'Pillar 4',
  },
  {
    id: 'risk-correlation',
    label: 'Risk Correlation',
    sublabel: 'Toxic Combinations',
    icon: Layers,
    pillar: 'Pillar 5',
    badge: '6',
    badgeSeverity: 'critical',
  },
];

interface SidebarProps {
  activeView: ViewId;
  onViewChange: (view: ViewId) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 bg-surface-1 border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 leading-tight">Qualys TrueRisk</p>
            <p className="text-[10px] text-slate-500 leading-tight truncate">Attack Path Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        <p className="px-2 py-2 text-[10px] uppercase tracking-widest text-slate-600 font-semibold">Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group relative',
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-3'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-r" />
              )}
              <Icon size={16} className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium leading-tight truncate">{item.label}</p>
                <p className={clsx('text-[10px] leading-tight truncate', isActive ? 'text-blue-400/60' : 'text-slate-600')}>{item.sublabel}</p>
              </div>
              {item.badge && (
                <span className={clsx(
                  'text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0',
                  item.badgeSeverity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                )}>
                  {item.badge}
                </span>
              )}
              {!item.badge && <ChevronRight size={12} className={clsx('flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity', isActive && 'opacity-100')} />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        {navItems.filter(n => n.pillar).map(n => (
          <div key={n.pillar} />
        ))}
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[10px] text-slate-500">Engine Active · Last sync 2m ago</span>
        </div>
        <p className="px-2 text-[9px] text-slate-700 font-mono">ETM-APM-001 · Q3 2026 · P0</p>
      </div>
    </aside>
  );
}
