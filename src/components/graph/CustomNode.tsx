import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import clsx from 'clsx';
import {
  Globe,
  Server,
  Crown,
  User,
  Cloud,
  AlertTriangle,
  Cpu,
  Shield,
  Eye,
  Target,
  Zap,
} from 'lucide-react';
import type { NodeType } from '../../types';

interface NodeData {
  label: string;
  type: NodeType;
  riskScore: number;
  isChokePoint: boolean;
  isToxicCombination: boolean;
  isShadowIT: boolean;
  segment: string;
  services: string[];
  vulnerabilities: { id: string; cvss: number; severity: string }[];
  misconfigurations: { id: string; title: string; severity: string }[];
  criticality: string;
  reachable: boolean;
  privilegeLevel?: string;
  selected?: boolean;
  patched?: boolean;
}

const nodeIcons: Record<NodeType, React.ElementType> = {
  entryPoint: Globe,
  pivot: Server,
  crownJewel: Crown,
  identity: User,
  cloud: Cloud,
  shadowIT: Eye,
  ot: Cpu,
  firewall: Shield,
};

const nodeColors: Record<NodeType, { border: string; bg: string; icon: string; glow: string }> = {
  entryPoint: { border: 'border-red-500', bg: 'bg-red-500/10', icon: 'text-red-400', glow: 'shadow-red-500/20' },
  pivot: { border: 'border-orange-500', bg: 'bg-orange-500/10', icon: 'text-orange-400', glow: 'shadow-orange-500/20' },
  crownJewel: { border: 'border-amber-400', bg: 'bg-amber-500/10', icon: 'text-amber-400', glow: 'shadow-amber-400/30' },
  identity: { border: 'border-purple-500', bg: 'bg-purple-500/10', icon: 'text-purple-400', glow: 'shadow-purple-500/20' },
  cloud: { border: 'border-sky-500', bg: 'bg-sky-500/10', icon: 'text-sky-400', glow: 'shadow-sky-500/20' },
  shadowIT: { border: 'border-fuchsia-500', bg: 'bg-fuchsia-500/10', icon: 'text-fuchsia-400', glow: 'shadow-fuchsia-500/20' },
  ot: { border: 'border-emerald-500', bg: 'bg-emerald-500/10', icon: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
  firewall: { border: 'border-slate-500', bg: 'bg-slate-500/10', icon: 'text-slate-400', glow: 'shadow-slate-500/20' },
};

function getRiskColor(score: number) {
  if (score >= 85) return 'text-red-400 bg-red-500/20';
  if (score >= 70) return 'text-orange-400 bg-orange-500/20';
  if (score >= 50) return 'text-amber-400 bg-amber-500/20';
  return 'text-blue-400 bg-blue-500/20';
}

export const AttackPathNode = memo(({ data }: { data: NodeData }) => {
  const Icon = nodeIcons[data.type] ?? Server;
  const colors = nodeColors[data.type] ?? nodeColors.pivot;

  const hasCriticalVuln = data.vulnerabilities.some(v => v.severity === 'critical');
  const vulnCount = data.vulnerabilities.length + data.misconfigurations.length;

  return (
    <div
      className={clsx(
        'relative rounded-xl border-2 px-3 py-2.5 min-w-[160px] max-w-[200px] shadow-lg transition-all',
        colors.border,
        colors.bg,
        colors.glow,
        data.patched && 'opacity-40 grayscale',
        data.isChokePoint && 'ring-2 ring-purple-500/50 ring-offset-1 ring-offset-surface-2',
        data.isToxicCombination && 'ring-2 ring-red-500/60 ring-offset-1 ring-offset-surface-2',
        !data.reachable && 'opacity-50'
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-500 !border-slate-600 !w-2 !h-2" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className={clsx('p-1.5 rounded-lg flex-shrink-0', colors.bg, 'border', colors.border, 'border-opacity-50')}>
          <Icon size={12} className={colors.icon} />
        </div>
        <span className="text-[11px] font-semibold text-slate-200 leading-tight truncate flex-1">{data.label}</span>
      </div>

      {/* Segment */}
      <p className="text-[9px] text-slate-500 font-mono mb-2 uppercase tracking-wider">{data.segment}</p>

      {/* Services */}
      {data.services.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {data.services.slice(0, 2).map((s, i) => (
            <span key={i} className="text-[9px] bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded font-mono">{s}</span>
          ))}
          {data.services.length > 2 && (
            <span className="text-[9px] bg-slate-700/50 text-slate-500 px-1.5 py-0.5 rounded font-mono">+{data.services.length - 2}</span>
          )}
        </div>
      )}

      {/* Risk Score & Badges */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          {data.isChokePoint && (
            <span className="text-[8px] bg-purple-500/20 text-purple-400 px-1 py-0.5 rounded font-mono font-bold border border-purple-500/30">CHOKE</span>
          )}
          {data.isToxicCombination && (
            <span className="text-[8px] bg-red-500/20 text-red-400 px-1 py-0.5 rounded font-mono font-bold border border-red-500/30">TOXIC</span>
          )}
          {data.isShadowIT && (
            <span className="text-[8px] bg-fuchsia-500/20 text-fuchsia-400 px-1 py-0.5 rounded font-mono font-bold border border-fuchsia-500/30">SHADOW</span>
          )}
          {data.type === 'crownJewel' && (
            <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded font-mono font-bold border border-amber-500/30">CROWN</span>
          )}
        </div>
        <div className={clsx('text-[11px] font-mono font-bold px-1.5 py-0.5 rounded', getRiskColor(data.riskScore))}>
          {data.riskScore}
        </div>
      </div>

      {/* Vulnerability indicator */}
      {vulnCount > 0 && (
        <div className="flex items-center gap-1 mt-1.5">
          <AlertTriangle size={9} className={hasCriticalVuln ? 'text-red-400' : 'text-orange-400'} />
          <span className="text-[9px] text-slate-500">{vulnCount} finding{vulnCount > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Privilege level for identity nodes */}
      {data.privilegeLevel && (
        <div className="flex items-center gap-1 mt-1.5">
          <Target size={9} className="text-purple-400" />
          <span className="text-[9px] text-purple-300 font-mono">{data.privilegeLevel}</span>
        </div>
      )}

      {/* Patched overlay */}
      {data.patched && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-emerald-900/30">
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-900/60 px-2 py-1 rounded">PATCHED</span>
        </div>
      )}

      {/* Choke glow indicator */}
      {data.isChokePoint && (
        <div className="absolute -top-1.5 -right-1.5">
          <Zap size={12} className="text-purple-400" />
        </div>
      )}

      <Handle type="source" position={Position.Right} className="!bg-slate-500 !border-slate-600 !w-2 !h-2" />
    </div>
  );
});

AttackPathNode.displayName = 'AttackPathNode';
