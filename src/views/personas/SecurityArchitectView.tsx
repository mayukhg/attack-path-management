import { assets, networkBoundaries, adObjects, attackPaths } from '../../data/mockData';
import { Badge } from '../../components/shared/Badge';
import { RiskScore } from '../../components/shared/RiskScore';
import {
  HardHat, Eye, AlertTriangle, ArrowRight,
  Network, Cloud, Server, Cpu, Globe, Shield,
} from 'lucide-react';
import clsx from 'clsx';

const segmentColors: Record<string, string> = {
  internet: '#ef4444',
  'cloud-aws': '#f97316',
  'cloud-azure': '#0ea5e9',
  corporate: '#3b82f6',
  datacenter: '#8b5cf6',
  ot: '#10b981',
};

const segmentIcons: Record<string, React.ElementType> = {
  internet: Globe, 'cloud-aws': Cloud, 'cloud-azure': Cloud,
  corporate: Server, datacenter: Server, ot: Cpu,
};

// Which paths cross which boundaries
const boundaryTraversals = [
  { from: 'internet', to: 'cloud-aws', paths: 2, severity: 'critical' as const, example: 'portal.acme.com → S3 Bucket via Apache RCE' },
  { from: 'cloud-aws', to: 'corporate', paths: 1, severity: 'critical' as const, example: 'EC2 IAM Role → dev-server-01 via SSH key' },
  { from: 'corporate', to: 'datacenter', paths: 3, severity: 'critical' as const, example: 'dev-server-01 → DC01 via Kerberoasting' },
  { from: 'corporate', to: 'ot', paths: 1, severity: 'critical' as const, example: 'dev-server-01 → SCADA via flat network (port 445)' },
  { from: 'cloud-aws', to: 'cloud-azure', paths: 1, severity: 'high' as const, example: 'EC2 wildcard IAM → Azure Data Lake via SSRF' },
];

function BoundaryMatrix() {
  const segments = ['internet', 'cloud-aws', 'cloud-azure', 'corporate', 'datacenter', 'ot'];
  const segLabels: Record<string, string> = {
    internet: 'Internet', 'cloud-aws': 'AWS', 'cloud-azure': 'Azure',
    corporate: 'Corp LAN', datacenter: 'DC', ot: 'OT/ICS',
  };

  const matrix: Record<string, Record<string, number>> = {};
  segments.forEach(s => { matrix[s] = {}; segments.forEach(t => { matrix[s][t] = 0; }); });
  boundaryTraversals.forEach(bt => { matrix[bt.from][bt.to] = bt.paths; });

  return (
    <div className="bg-surface-2 rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-1">Cross-Boundary Reachability Matrix</h3>
      <p className="text-xs text-slate-500 mb-4">Number of attack paths traversing each boundary pair</p>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr>
              <th className="text-left text-slate-600 pb-2 pr-3 font-medium w-24">FROM ↓ TO →</th>
              {segments.map(s => (
                <th key={s} className="pb-2 px-2 font-medium" style={{ color: segmentColors[s] }}>{segLabels[s]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {segments.map(from => (
              <tr key={from} className="border-t border-border/50">
                <td className="py-2 pr-3 font-medium" style={{ color: segmentColors[from] }}>{segLabels[from]}</td>
                {segments.map(to => {
                  const count = matrix[from][to];
                  const isSelf = from === to;
                  return (
                    <td key={to} className="py-2 px-2 text-center">
                      {isSelf ? (
                        <span className="text-slate-700">—</span>
                      ) : count > 0 ? (
                        <span className={clsx(
                          'inline-flex items-center justify-center w-6 h-6 rounded font-mono font-bold',
                          count >= 3 ? 'bg-red-500/20 text-red-400' :
                          count === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-amber-500/20 text-amber-400'
                        )}>{count}</span>
                      ) : (
                        <span className="text-slate-700">0</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ArchitecturalGapCard({ gap }: { gap: typeof boundaryTraversals[0] }) {
  const FromIcon = segmentIcons[gap.from] ?? Server;
  const ToIcon = segmentIcons[gap.to] ?? Server;
  return (
    <div className="p-3 bg-surface-2 rounded-lg border border-border hover:border-slate-600 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <Badge label={gap.severity} variant={gap.severity} size="sm" />
        <span className="text-[10px] text-slate-500 font-mono">{gap.paths} path{gap.paths > 1 ? 's' : ''}</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ backgroundColor: `${segmentColors[gap.from]}15` }}>
          <FromIcon size={11} style={{ color: segmentColors[gap.from] }} />
          <span className="text-[10px] font-mono capitalize" style={{ color: segmentColors[gap.from] }}>{gap.from.replace('-', ' ')}</span>
        </div>
        <ArrowRight size={12} className="text-slate-600 flex-shrink-0" />
        <div className="flex items-center gap-1.5 px-2 py-1 rounded" style={{ backgroundColor: `${segmentColors[gap.to]}15` }}>
          <ToIcon size={11} style={{ color: segmentColors[gap.to] }} />
          <span className="text-[10px] font-mono capitalize" style={{ color: segmentColors[gap.to] }}>{gap.to.replace('-', ' ')}</span>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 font-mono truncate">{gap.example}</p>
    </div>
  );
}

export function SecurityArchitectView() {
  const shadowIT = assets.filter(a => a.isShadowIT);
  const crossBoundaryPaths = attackPaths.filter(p => p.mitreTactics.includes('Lateral Movement'));
  const blastRadiusAsset = assets.find(a => a.id === 'a5')!;
  const affectedAssets = assets.filter(a => ['a6', 'a3', 'a9', 'a4'].includes(a.id));

  return (
    <div className="flex flex-col gap-5 p-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className="p-2 bg-blue-500/15 rounded-lg">
          <HardHat size={18} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-100">Security Architect View</h2>
          <p className="text-xs text-slate-500">Cross-boundary architectural gaps · Shadow IT · Non-obvious privilege escalation</p>
        </div>
        <div className="ml-auto">
          <Badge label={`${boundaryTraversals.length} boundary crossings`} variant="critical" />
        </div>
      </div>

      {/* Top row: matrix + gaps */}
      <div className="grid grid-cols-2 gap-4">
        <BoundaryMatrix />
        <div className="bg-surface-2 rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">Architectural Gap Inventory</h3>
          <p className="text-xs text-slate-500 mb-4">Uncontrolled paths crossing network boundaries</p>
          <div className="space-y-2">
            {boundaryTraversals.map((gap, i) => <ArchitecturalGapCard key={i} gap={gap} />)}
          </div>
        </div>
      </div>

      {/* Shadow IT */}
      <div className="bg-surface-2 rounded-xl border border-fuchsia-500/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <Eye size={16} className="text-fuchsia-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Shadow IT Discovery</h3>
            <p className="text-xs text-slate-500">Assets reachable from internet but absent from official CMDB</p>
          </div>
          <Badge label={`${shadowIT.length} discovered`} variant="shadow" size="md" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {shadowIT.map(asset => (
            <div key={asset.id} className="p-3 bg-fuchsia-950/10 border border-fuchsia-500/15 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={12} className="text-fuchsia-400" />
                <span className="text-xs font-semibold text-slate-200">{asset.label}</span>
                <RiskScore score={asset.riskScore} size="sm" showLabel={false} />
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between"><span className="text-slate-500">IP</span><span className="font-mono text-slate-300">{asset.ip ?? asset.hostname}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Segment</span><span className="font-mono text-slate-300">{asset.segment}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">CMDB</span><span className="text-red-400 font-semibold">NOT REGISTERED</span></div>
                <div className="flex justify-between"><span className="text-slate-500">CVEs</span><span className="text-red-400 font-mono">{asset.vulnerabilities.length}</span></div>
              </div>
              <div className="mt-2 flex gap-1 flex-wrap">
                {asset.vulnerabilities.map(v => (
                  <span key={v.id} className="text-[9px] bg-red-500/15 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-mono">{v.id}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AD Blast Radius */}
      <div className="bg-surface-2 rounded-xl border border-purple-500/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={16} className="text-purple-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-200">AD Blast Radius — DC01 (Tier-0)</h3>
            <p className="text-xs text-slate-500">Assets impacted if Domain Controller is compromised</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-mono text-purple-400">{blastRadiusAsset.chokePointDownstreamPaths} paths</span>
            <RiskScore score={blastRadiusAsset.riskScore} size="sm" showLabel={false} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Non-obvious escalation routes */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-3">Non-Obvious Privilege Escalation Routes</p>
            <div className="space-y-2">
              {[
                { path: 'j.smith → IT-Support-Group → Tier-2-Admins → Tier-1-Admins', hops: 3, severity: 'critical' as const },
                { path: 'svc-jenkins GPO → LocalAdmin on dev-server-01 → System', hops: 2, severity: 'high' as const },
                { path: 'svc-jenkins SPN → Kerberoast → DA via noPac CVE', hops: 2, severity: 'critical' as const },
              ].map((r, i) => (
                <div key={i} className="p-2.5 bg-surface-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge label={r.severity} variant={r.severity} size="sm" />
                    <span className="text-[10px] text-slate-500">{r.hops} AD hops</span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-300">{r.path}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Affected assets */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-3">Assets Within Blast Radius</p>
            <div className="space-y-2">
              {affectedAssets.map(asset => (
                <div key={asset.id} className="flex items-center gap-3 p-2.5 bg-surface-3 rounded-lg border border-border">
                  <div className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0',
                    asset.criticality === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-200 truncate">{asset.label}</p>
                    <p className="text-[9px] text-slate-500 font-mono">{asset.ip ?? asset.hostname}</p>
                  </div>
                  <Badge label={asset.criticality} variant={asset.criticality} size="sm" />
                  <span className="text-[10px] font-mono font-bold text-red-400">{asset.riskScore}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
