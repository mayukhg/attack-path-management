import { useState } from 'react';
import { assets, networkBoundaries, attackPaths } from '../data/mockData';
import { Badge } from '../components/shared/Badge';
import { RiskScore } from '../components/shared/RiskScore';
import type { GraphAsset, NetworkBoundary } from '../types';
import {
  Eye,
  Globe,
  Cloud,
  Server,
  Cpu,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import clsx from 'clsx';

const segmentIcons: Record<string, React.ElementType> = {
  internet: Globe,
  'cloud-aws': Cloud,
  'cloud-azure': Cloud,
  corporate: Server,
  datacenter: Server,
  ot: Cpu,
  dmz: Globe,
};

const segmentColors: Record<string, string> = {
  internet: '#ef4444',
  'cloud-aws': '#f97316',
  'cloud-azure': '#0ea5e9',
  corporate: '#3b82f6',
  datacenter: '#8b5cf6',
  ot: '#10b981',
  dmz: '#f59e0b',
};

interface BoundaryCardProps {
  boundary: NetworkBoundary;
  boundaryAssets: GraphAsset[];
  selected: boolean;
  onClick: () => void;
}

function BoundaryCard({ boundary, boundaryAssets, selected, onClick }: BoundaryCardProps) {
  const shadowIT = boundaryAssets.filter(a => a.isShadowIT);
  const toxic = boundaryAssets.filter(a => a.isToxicCombination);
  const maxRisk = Math.max(...boundaryAssets.map(a => a.riskScore), 0);

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left p-4 rounded-xl border transition-all',
        selected ? 'border-blue-500/50 bg-blue-600/10' : 'border-border bg-surface-2 hover:border-slate-600'
      )}
      style={selected ? { boxShadow: `0 0 20px ${boundary.color}20` } : {}}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: boundary.color }} />
        <span className="text-sm font-semibold text-slate-200">{boundary.name}</span>
        <span className="ml-auto text-xs font-mono font-bold" style={{ color: boundary.color }}>{maxRisk}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="text-center">
          <p className="text-lg font-bold font-mono text-slate-200">{boundaryAssets.length}</p>
          <p className="text-[10px] text-slate-500">Assets</p>
        </div>
        <div className="text-center">
          <p className={clsx('text-lg font-bold font-mono', shadowIT.length > 0 ? 'text-fuchsia-400' : 'text-slate-600')}>{shadowIT.length}</p>
          <p className="text-[10px] text-slate-500">Shadow IT</p>
        </div>
        <div className="text-center">
          <p className={clsx('text-lg font-bold font-mono', toxic.length > 0 ? 'text-red-400' : 'text-slate-600')}>{toxic.length}</p>
          <p className="text-[10px] text-slate-500">Toxic</p>
        </div>
      </div>
      {shadowIT.length > 0 && (
        <div className="flex items-center gap-1.5 text-fuchsia-400 text-[10px]">
          <Eye size={10} />
          Shadow IT detected in this segment
        </div>
      )}
    </button>
  );
}

function NetworkDiagram() {
  const segments = [
    { id: 'internet', x: 0, label: 'Internet', color: '#ef4444' },
    { id: 'cloud-aws', x: 1, label: 'AWS Cloud', color: '#f97316' },
    { id: 'cloud-azure', x: 1, label: 'Azure Cloud', color: '#0ea5e9', y: 1 },
    { id: 'corporate', x: 2, label: 'Corporate LAN', color: '#3b82f6' },
    { id: 'datacenter', x: 3, label: 'Datacenter', color: '#8b5cf6' },
    { id: 'ot', x: 2, label: 'OT/ICS', color: '#10b981', y: 1 },
  ];

  return (
    <div className="bg-surface-0 rounded-xl border border-border p-6 relative overflow-hidden" style={{ minHeight: 340 }}>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-6">Network Topology – Cross-Boundary Traversal</p>
      <div className="flex items-center justify-between gap-4 relative">
        {/* Cross-boundary arrows */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {/* Internet → AWS */}
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#ef4444" opacity="0.6" />
            </marker>
          </defs>
          <line x1="16%" y1="35%" x2="30%" y2="28%" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.5" markerEnd="url(#arr)" />
          <line x1="16%" y1="35%" x2="30%" y2="62%" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.3" markerEnd="url(#arr)" />
          <line x1="44%" y1="28%" x2="58%" y2="35%" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.5" markerEnd="url(#arr)" />
          <line x1="44%" y1="62%" x2="58%" y2="35%" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.4" markerEnd="url(#arr)" />
          <line x1="72%" y1="35%" x2="84%" y2="35%" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.5" markerEnd="url(#arr)" />
          <line x1="72%" y1="62%" x2="84%" y2="50%" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.4" markerEnd="url(#arr)" />
        </svg>

        {/* Segment boxes */}
        {[
          { label: 'Internet', color: '#ef4444', assets: ['portal.acme.com', 'api-gw-prod'], icon: Globe },
          { label: 'Cloud (AWS/Azure)', color: '#f97316', assets: ['S3 Bucket', 'EC2 API GW', 'Azure Data Lake'], icon: Cloud },
          { label: 'Corporate LAN', color: '#3b82f6', assets: ['Dev Server', 'Shadow NAS', 'Workstation'], icon: Server },
          { label: 'Datacenter / OT', color: '#8b5cf6', assets: ['Domain Controller', 'Prod DB', 'SCADA HMI'], icon: Cpu },
        ].map((seg, idx) => {
          const Icon = seg.icon;
          return (
            <div
              key={idx}
              className="relative flex-1 rounded-xl border-2 px-4 py-4 z-10"
              style={{ borderColor: `${seg.color}60`, backgroundColor: `${seg.color}08` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: seg.color }} />
                <span className="text-[11px] font-semibold" style={{ color: seg.color }}>{seg.label}</span>
              </div>
              <div className="space-y-1">
                {seg.assets.map((a, i) => (
                  <div key={i} className="text-[10px] bg-surface-0/60 text-slate-400 px-2 py-1 rounded font-mono flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: seg.color, opacity: 0.6 }} />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Traversal paths legend */}
      <div className="mt-4 flex items-center gap-4 justify-center">
        {[
          { label: 'Attack Path', color: '#ef4444' },
          { label: 'Cross-Cloud', color: '#0ea5e9' },
          { label: 'IT→OT Boundary', color: '#10b981' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-6 border-t-2 border-dashed" style={{ borderColor: l.color, opacity: 0.7 }} />
            <span className="text-[10px] text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NetworkMap() {
  const [selectedBoundary, setSelectedBoundary] = useState<string | null>(null);

  const getBoundaryAssets = (boundary: NetworkBoundary) =>
    assets.filter(a => boundary.assets.includes(a.id));

  const shadowITAssets = assets.filter(a => a.isShadowIT);
  const selectedBoundaryObj = networkBoundaries.find(b => b.id === selectedBoundary);
  const displayAssets = selectedBoundaryObj
    ? getBoundaryAssets(selectedBoundaryObj)
    : assets;

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto p-6 gap-6">
        {/* Topology diagram */}
        <NetworkDiagram />

        {/* Boundary Cards */}
        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Network Segments</h3>
          <div className="grid grid-cols-3 gap-3">
            {networkBoundaries.map((boundary) => (
              <BoundaryCard
                key={boundary.id}
                boundary={boundary}
                boundaryAssets={getBoundaryAssets(boundary)}
                selected={selectedBoundary === boundary.id}
                onClick={() => setSelectedBoundary(selectedBoundary === boundary.id ? null : boundary.id)}
              />
            ))}
          </div>
        </div>

        {/* Shadow IT Panel */}
        <div className="bg-surface-2 rounded-xl border border-fuchsia-500/20 p-5">
          <div className="flex items-center gap-3 mb-4">
            <Eye size={16} className="text-fuchsia-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Shadow IT Detection</h3>
              <p className="text-xs text-slate-500">{shadowITAssets.length} unmanaged assets discovered · Not in CMDB · Internet-reachable</p>
            </div>
            <Badge label={`${shadowITAssets.length} detected`} variant="shadow" size="md" />
          </div>
          <div className="space-y-2">
            {shadowITAssets.map((asset) => (
              <div key={asset.id} className="flex items-center gap-4 p-3 bg-fuchsia-950/10 border border-fuchsia-500/15 rounded-lg">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Eye size={13} className="text-fuchsia-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{asset.label}</p>
                    <p className="text-[10px] font-mono text-slate-500">{asset.ip ?? asset.hostname} · {asset.segment}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 text-[10px]">
                    <XCircle size={10} className="text-red-400" />
                    <span className="text-slate-500">Not in CMDB</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <AlertTriangle size={10} className="text-red-400" />
                    <span className="text-red-400 font-semibold">Reachable from Internet</span>
                  </div>
                  {asset.vulnerabilities.length > 0 && (
                    <Badge label={`${asset.vulnerabilities.length} CVE`} variant="critical" size="sm" />
                  )}
                  <RiskScore score={asset.riskScore} size="sm" showLabel={false} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel – Asset Table */}
      <div className="w-80 flex-shrink-0 border-l border-border bg-surface-1 flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-sm font-semibold text-slate-200">
            {selectedBoundaryObj ? selectedBoundaryObj.name : 'All Assets'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{displayAssets.length} assets · Click segment to filter</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {displayAssets.map((asset) => {
            const Icon = segmentIcons[asset.segment] ?? Server;
            return (
              <div
                key={asset.id}
                className="p-3 rounded-lg border border-border bg-surface-2 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${segmentColors[asset.segment]}20` }}>
                    <Icon size={11} style={{ color: segmentColors[asset.segment] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 leading-tight truncate">{asset.label}</p>
                    <p className="text-[10px] font-mono text-slate-500 truncate">{asset.ip ?? asset.hostname}</p>
                  </div>
                  <span className={clsx('text-xs font-mono font-bold flex-shrink-0',
                    asset.riskScore >= 85 ? 'text-red-400' : asset.riskScore >= 70 ? 'text-orange-400' : 'text-amber-400'
                  )}>{asset.riskScore}</span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <Badge label={asset.criticality} variant={asset.criticality} size="sm" />
                  {asset.isShadowIT && <Badge label="Shadow IT" variant="shadow" size="sm" />}
                  {asset.isToxicCombination && <Badge label="Toxic" variant="toxic" size="sm" />}
                  {!asset.cmdbPresent && (
                    <span className="text-[9px] text-red-400 font-mono">∅ CMDB</span>
                  )}
                  {asset.cmdbPresent && (
                    <span className="text-[9px] text-emerald-400 font-mono">✓ CMDB</span>
                  )}
                </div>
                {/* CMDB enrichment */}
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className="text-slate-600">BV: <span className="text-slate-400 font-mono">{asset.businessValue}/100</span></span>
                  <span className="text-slate-600">Owner: <span className="text-slate-400">{asset.owner ?? 'Unknown'}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
