import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { assets, whatIfScenarios, attackPaths } from '../../data/mockData';
import { Badge } from '../../components/shared/Badge';
import { RiskScore } from '../../components/shared/RiskScore';
import { RiskBar } from '../../components/shared/RiskScore';
import {
  ClipboardList, Zap, FlaskConical, Wrench,
  TrendingDown, CheckCircle2, AlertTriangle, ChevronRight, Target,
} from 'lucide-react';
import clsx from 'clsx';

const effortColors = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };

const patchQueue = [
  { id: 'pq1', title: 'Fix S3 Bucket Public Access + Rotate SSH Key', asset: 'acme-devops-artifacts', roiScore: 98, pathsBroken: 3, effort: 'Low' as const, riskReduction: 31, owner: 'DevOps', sprint: 'Current', status: 'in-progress' as const },
  { id: 'pq2', title: 'Patch CVE-2021-42278 (noPac) on DC01', asset: 'DC01.acme.local', roiScore: 95, pathsBroken: 4, effort: 'Medium' as const, riskReduction: 18, owner: 'IT Ops', sprint: 'Current', status: 'pending' as const },
  { id: 'pq3', title: 'Remediate Docker Socket ACL on Dev Server', asset: 'dev-server-01', roiScore: 91, pathsBroken: 2, effort: 'Low' as const, riskReduction: 12, owner: 'Engineering', sprint: 'Next', status: 'pending' as const },
  { id: 'pq4', title: 'Patch CVE-2021-41773 on Apache Portal', asset: 'portal.acme.com', roiScore: 88, pathsBroken: 1, effort: 'Low' as const, riskReduction: 10, owner: 'Platform', sprint: 'Current', status: 'pending' as const },
  { id: 'pq5', title: 'Disable Kerberoastable SPNs on DC01', asset: 'DC01.acme.local', roiScore: 82, pathsBroken: 2, effort: 'Medium' as const, riskReduction: 9, owner: 'IT Ops', sprint: 'Next', status: 'pending' as const },
  { id: 'pq6', title: 'Segment IT/OT via Palo Alto Firewall ACL', asset: 'scada-hmi-01', roiScore: 76, pathsBroken: 1, effort: 'High' as const, riskReduction: 8, owner: 'OT Engineering', sprint: 'Backlog', status: 'blocked' as const },
];

const statusConfig = {
  'in-progress': { label: 'In Progress', color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' },
  pending: { label: 'Pending', color: 'text-slate-400 bg-slate-700/40 border-slate-600/30' },
  blocked: { label: 'Blocked', color: 'text-red-400 bg-red-500/15 border-red-500/30' },
};

export function RemediationManagerView() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<'Current' | 'Next' | 'Backlog'>('Current');

  const scenario = whatIfScenarios.find(s => s.id === selectedScenario);
  const currentRisk = 87;
  const filteredQueue = patchQueue.filter(p => p.sprint === selectedSprint);

  const roiChartData = patchQueue.map(p => ({ name: p.title.split(' ').slice(0, 3).join(' ') + '…', roi: p.roiScore, paths: p.pathsBroken }));

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">
      {/* Left – Patch Queue */}
      <div className="w-80 flex-shrink-0 border-r border-border bg-surface-1 flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-slate-200">Remediation Backlog</h2>
          </div>
          <div className="flex gap-1">
            {(['Current', 'Next', 'Backlog'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSelectedSprint(s)}
                className={clsx(
                  'flex-1 text-[10px] py-1.5 rounded border font-medium transition-colors',
                  selectedSprint === s ? 'bg-blue-600/20 border-blue-500/40 text-blue-400' : 'border-border text-slate-500 hover:text-slate-300'
                )}
              >{s}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredQueue.map(item => {
            const sc = statusConfig[item.status];
            return (
              <div key={item.id} className="p-3 bg-surface-2 rounded-lg border border-border hover:border-slate-600 transition-colors">
                <div className="flex items-start gap-2 mb-2">
                  <div className={clsx('text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border flex-shrink-0', sc.color)}>{sc.label}</div>
                  <p className="text-[10px] font-semibold text-slate-200 leading-tight">{item.title}</p>
                </div>
                <p className="text-[9px] font-mono text-slate-500 mb-2">{item.asset}</p>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-surface-3 rounded p-1">
                    <p className="text-xs font-mono font-bold text-purple-400">{item.roiScore}</p>
                    <p className="text-[8px] text-slate-600">ROI</p>
                  </div>
                  <div className="bg-surface-3 rounded p-1">
                    <p className="text-xs font-mono font-bold text-emerald-400">{item.pathsBroken}</p>
                    <p className="text-[8px] text-slate-600">Paths</p>
                  </div>
                  <div className="bg-surface-3 rounded p-1">
                    <p className="text-xs font-mono font-bold" style={{ color: effortColors[item.effort] }}>{item.effort}</p>
                    <p className="text-[8px] text-slate-600">Effort</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-[9px]">
                  <span className="text-slate-600">Owner: <span className="text-slate-400">{item.owner}</span></span>
                  <span className="text-emerald-400 font-mono">-{item.riskReduction} risk</span>
                </div>
              </div>
            );
          })}
          {filteredQueue.length === 0 && (
            <div className="text-center py-8 text-slate-600">
              <CheckCircle2 size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">No items in this sprint</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-border">
          <div className="p-2 bg-blue-500/15 rounded-lg">
            <ClipboardList size={18} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Remediation Manager View</h2>
            <p className="text-xs text-slate-500">ROI-driven patch prioritization · Choke points · What-If simulation · Virtual patching</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-slate-500">Paths Eliminated (30d)</p>
              <p className="text-xl font-mono font-bold text-emerald-400">12</p>
            </div>
            <RiskScore score={currentRisk} size="md" />
          </div>
        </div>

        {/* ROI Chart */}
        <div className="bg-surface-2 rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">Remediation ROI — Choke Point Analysis</h3>
          <p className="text-xs text-slate-500 mb-4">Patch with highest ROI score eliminates the most downstream paths per unit of effort</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={roiChartData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={130} />
              <Tooltip contentStyle={{ background: '#1e2640', border: '1px solid #2a3350', borderRadius: '8px', fontSize: '11px' }} formatter={(v) => [`${v} ROI`, '']} />
              <Bar dataKey="roi" radius={[0, 4, 4, 0]}>
                {roiChartData.map((_, i) => (
                  <Cell key={i} fill={i < 2 ? '#a855f7' : i < 4 ? '#6366f1' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* What-If Simulator */}
        <div className="bg-surface-2 rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <FlaskConical size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">What-If Simulator</h3>
            <p className="text-xs text-slate-500 ml-2">Select a scenario to see projected risk impact before deploying</p>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {whatIfScenarios.map(s => {
              const mitColors: Record<string, string> = { patch: '#10b981', waf: '#3b82f6', firewall: '#f59e0b', ips: '#6366f1', disable: '#ef4444' };
              const color = mitColors[s.mitigationType] ?? '#64748b';
              const isActive = selectedScenario === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedScenario(isActive ? null : s.id)}
                  className={clsx(
                    'text-left p-3 rounded-lg border transition-all',
                    isActive ? 'border-emerald-500/40 bg-emerald-600/10' : 'border-border bg-surface-3 hover:border-slate-600'
                  )}
                >
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded mb-2 inline-block" style={{ background: `${color}20`, color }}>{s.mitigationType.toUpperCase()}</span>
                  <p className="text-[10px] font-semibold text-slate-300 leading-tight mb-1">{s.name}</p>
                  <div className="flex items-center gap-1">
                    <TrendingDown size={10} className="text-emerald-400" />
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">-{currentRisk - s.projectedRiskScore} risk</span>
                    <span className="text-[9px] text-slate-600">· {s.eliminatedPaths} paths</span>
                  </div>
                </button>
              );
            })}
          </div>

          {scenario && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-sm font-semibold text-slate-200">{scenario.name}</span>
                <Badge label="Simulation Active" variant="neutral" />
              </div>
              <div className="grid grid-cols-4 gap-3 mb-3">
                {[
                  { label: 'Current Risk', value: currentRisk, color: 'text-red-400' },
                  { label: 'Projected Risk', value: scenario.projectedRiskScore, color: 'text-emerald-400' },
                  { label: 'Risk Reduction', value: `-${currentRisk - scenario.projectedRiskScore}`, color: 'text-emerald-400' },
                  { label: 'Paths Eliminated', value: scenario.eliminatedPaths, color: 'text-purple-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center p-2 bg-surface-3 rounded-lg">
                    <p className={clsx('text-xl font-mono font-bold', color)}>{value}</p>
                    <p className="text-[9px] text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <RiskBar score={currentRisk} label="Current Global Risk Score" />
                <RiskBar score={scenario.projectedRiskScore} label="Projected Risk (post-mitigation)" projected={scenario.projectedRiskScore} />
              </div>
              {scenario.mitigation && (
                <div className="mt-3 p-2.5 bg-blue-950/20 border border-blue-500/15 rounded">
                  <p className="text-[10px] text-slate-400"><span className="text-blue-400 font-semibold">Virtual Patch: </span>{scenario.mitigation}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Virtual Patching */}
        <div className="bg-surface-2 rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Wrench size={15} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-200">Virtual Patching — When Primary Fix Isn't Feasible</h3>
          </div>
          <div className="space-y-2">
            {[
              { asset: 'portal.acme.com', reason: 'Patch window not until Q2', waf: 'ModSecurity CRS – REQUEST-930-APPLICATION-ATTACK-LFI', riskReduction: 10, type: 'WAF' },
              { asset: 'scada-hmi-01', reason: 'EOL OS – cannot patch EternalBlue', waf: 'Palo Alto: DENY 10.20.0.0/16 → 172.16.100.0/24 (port 445, 502)', riskReduction: 8, type: 'Firewall ACL' },
              { asset: 'dev-server-01', reason: 'runc update breaks container workloads', waf: 'Snort IDS SID 49652 – runc Container Escape Detection', riskReduction: 6, type: 'IPS Rule' },
            ].map((vp, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surface-3 rounded-lg border border-border">
                <AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-200">{vp.asset}</span>
                    <span className="text-[9px] text-amber-400 font-mono">{vp.reason}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[9px] font-mono font-bold text-blue-400 flex-shrink-0 mt-0.5">{vp.type}</span>
                    <span className="text-[10px] font-mono text-slate-400">{vp.waf}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-[9px] text-slate-500">Risk ↓</p>
                  <p className="text-sm font-mono font-bold text-emerald-400">-{vp.riskReduction}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
