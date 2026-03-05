import { useState } from 'react';
import { FileCheck2, CheckCircle2, AlertTriangle, XCircle, BarChart2, Download } from 'lucide-react';
import { Tooltip } from '../../components/shared/Tooltip';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { complianceControls, crownJewelTrend, crownJewelRisks } from '../../data/mockData';
import type { ComplianceControl } from '../../types';
import clsx from 'clsx';

type Framework = 'all' | 'ISO27001' | 'SOC2' | 'NIST-CSF';
type Status = 'compliant' | 'at-risk' | 'non-compliant';

const statusConfig: Record<Status, { label: string; icon: React.ReactNode; bg: string; border: string; text: string }> = {
  compliant: { label: 'Compliant', icon: <CheckCircle2 size={13} />, bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  'at-risk': { label: 'At Risk', icon: <AlertTriangle size={13} />, bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  'non-compliant': { label: 'Non-Compliant', icon: <XCircle size={13} />, bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
};

const frameworkColor: Record<string, string> = {
  ISO27001: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
  SOC2: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
  'NIST-CSF': 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
};

function ControlRow({ c, expanded, onToggle }: { c: ComplianceControl; expanded: boolean; onToggle: () => void }) {
  const s = statusConfig[c.status];
  return (
    <div className={clsx('border rounded-lg overflow-hidden transition-all', expanded ? 'border-slate-600' : 'border-border hover:border-slate-600')}>
      <button className="w-full flex items-center gap-3 p-3 text-left" onClick={onToggle}>
        <span className={clsx('flex-shrink-0', s.text)}>{s.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={clsx('text-xs px-1.5 py-0.5 rounded border', frameworkColor[c.framework])}>{c.framework}</span>
            <span className="text-xs font-mono text-slate-400">{c.controlId}</span>
            <span className="text-xs text-slate-200 font-medium">{c.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={clsx('text-xs px-2 py-0.5 rounded border font-medium', s.bg, s.border, s.text)}>{s.label}</span>
          {c.evidenceAvailable
            ? <span className="text-xs text-emerald-500">Evidence ✓</span>
            : <span className="text-xs text-slate-600">No Evidence</span>}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border bg-surface-0/50">
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Linked Assets</p>
              <div className="flex flex-wrap gap-1">
                {c.linkedAssets.map(a => (
                  <span key={a} className="text-xs font-mono bg-surface-2 border border-border rounded px-1.5 py-0.5 text-slate-300">{a}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Last Audit</p>
              <p className="text-xs text-slate-300 font-mono">{c.lastAudit}</p>
            </div>
          </div>
          {c.remediationEvidence && (
            <div className="mt-3 p-2 rounded bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-xs text-slate-400 mb-0.5 font-medium">Remediation Evidence</p>
              <p className="text-xs text-emerald-300 leading-relaxed">{c.remediationEvidence}</p>
            </div>
          )}
          {!c.evidenceAvailable && (
            <div className="mt-3 p-2 rounded bg-red-500/5 border border-red-500/20">
              <p className="text-xs text-red-400">No audit evidence available — required for compliance attestation.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function GRCComplianceView() {
  const [activeFramework, setActiveFramework] = useState<Framework>('all');
  const [expandedControl, setExpandedControl] = useState<string | null>('cc2');

  const filtered = activeFramework === 'all'
    ? complianceControls
    : complianceControls.filter(c => c.framework === activeFramework);

  const countByStatus = (s: Status) => complianceControls.filter(c => c.status === s).length;
  const total = complianceControls.length;
  const compliantPct = Math.round((countByStatus('compliant') / total) * 100);

  const frameworks: Framework[] = ['all', 'ISO27001', 'SOC2', 'NIST-CSF'];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Compliant Controls', value: `${compliantPct}%`, sub: `${countByStatus('compliant')} / ${total}`, color: 'text-emerald-400', tooltip: 'Controls with sufficient evidence of implementation and no active attack path currently undermining their stated objective.' },
          { label: 'At-Risk Controls', value: countByStatus('at-risk'), sub: 'Remediation in progress', color: 'text-amber-400', tooltip: 'Controls where remediation is in progress or an active attack path could undermine the control objective. Evidence may be partial.' },
          { label: 'Non-Compliant', value: countByStatus('non-compliant'), sub: 'Immediate action needed', color: 'text-red-400', tooltip: 'Controls with no evidence of implementation and/or open audit findings. Require immediate remediation for regulatory attestation.' },
          { label: 'Evidence Available', value: `${Math.round((complianceControls.filter(c => c.evidenceAvailable).length / total) * 100)}%`, sub: `${complianceControls.filter(c => c.evidenceAvailable).length} of ${total} controls`, color: 'text-blue-400', tooltip: 'Controls with documented audit evidence (tickets, WAF rules, access logs) that can be presented during a regulatory audit or compliance review.' },
        ].map(k => (
          <div key={k.label} className="bg-surface-1 border border-border rounded-xl p-4">
            <p className={clsx('text-2xl font-bold', k.color)}>{k.value}</p>
            <div className="flex items-center gap-1 mt-1">
              <p className="text-xs text-slate-500">{k.label}</p>
              <Tooltip text={k.tooltip} />
            </div>
            <p className="text-xs text-slate-600 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Controls Panel */}
        <div className="bg-surface-1 border border-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 size={15} className="text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-200">Control Status</h3>
            </div>
            <div className="flex gap-1">
              {frameworks.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFramework(f)}
                  className={clsx('px-2 py-0.5 rounded text-xs transition-colors',
                    activeFramework === f ? 'bg-blue-500/30 text-blue-300 border border-blue-500/40' : 'text-slate-500 hover:text-slate-300 border border-transparent')}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filtered.map(c => (
              <ControlRow
                key={c.id}
                c={c}
                expanded={expandedControl === c.id}
                onToggle={() => setExpandedControl(prev => prev === c.id ? null : c.id)}
              />
            ))}
          </div>

          <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-border text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors text-xs">
            <Download size={12} />
            Export Audit Report
          </button>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5">

          {/* Compliance Posture Trend */}
          <div className="bg-surface-1 border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={15} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-200">Compliance Posture Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={crownJewelTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gCompliant" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gAtRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gNonCompliant" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <RechartsTooltip
                  contentStyle={{ background: '#0f1623', border: '1px solid #1e2a3a', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Area type="monotone" dataKey="compliant" name="Compliant" stroke="#10b981" fill="url(#gCompliant)" strokeWidth={2} />
                <Area type="monotone" dataKey="atRisk" name="At Risk" stroke="#f59e0b" fill="url(#gAtRisk)" strokeWidth={2} />
                <Area type="monotone" dataKey="nonCompliant" name="Non-Compliant" stroke="#ef4444" fill="url(#gNonCompliant)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Crown Jewel Risk Exposure */}
          <div className="bg-surface-1 border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={15} className="text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-200">Crown Jewel Compliance Risk</h3>
            </div>

            <div className="space-y-3">
              {crownJewelRisks.map(cj => (
                <div key={cj.assetId} className="flex items-center gap-3 p-3 rounded-lg bg-surface-0 border border-border">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200">{cj.assetName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {cj.hopsFromInternet} hops from internet · {cj.pathCount} active path{cj.pathCount > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={clsx('text-base font-bold', cj.breachProbability >= 90 ? 'text-red-400' : cj.breachProbability >= 75 ? 'text-orange-400' : 'text-amber-400')}>
                      {cj.breachProbability}%
                    </p>
                    <div className="flex items-center justify-end gap-1">
                      <p className="text-xs text-slate-500">breach prob.</p>
                      <Tooltip text="Modeled probability of a successful breach based on path count, exploitability score, and detection coverage. Relevant for risk acceptance decisions." />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 border-l border-border pl-3 ml-1">
                    <p className="text-sm font-bold text-red-300">${(cj.financialImpact / 1_000_000).toFixed(1)}M</p>
                    <div className="flex items-center justify-end gap-1">
                      <p className="text-xs text-slate-500">est. impact</p>
                      <Tooltip text="Estimated business impact of breach, combining data classification, regulatory fines, incident response cost, and operational downtime." />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Framework Summary Bars */}
          <div className="bg-surface-1 border border-border rounded-xl p-5">
            <p className="text-xs font-semibold text-slate-400 mb-3">Compliance by Framework</p>
            {(['ISO27001', 'SOC2', 'NIST-CSF'] as const).map(fw => {
              const fwControls = complianceControls.filter(c => c.framework === fw);
              const compliantCount = fwControls.filter(c => c.status === 'compliant').length;
              const atRiskCount = fwControls.filter(c => c.status === 'at-risk').length;
              const nonCompliantCount = fwControls.filter(c => c.status === 'non-compliant').length;
              const totalFw = fwControls.length;
              return (
                <div key={fw} className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-300 font-medium">{fw}</span>
                    <span className="text-xs text-slate-500">{compliantCount}/{totalFw} compliant</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden gap-px bg-surface-0">
                    <div className="bg-emerald-500" style={{ width: `${(compliantCount / totalFw) * 100}%` }} />
                    <div className="bg-amber-500" style={{ width: `${(atRiskCount / totalFw) * 100}%` }} />
                    <div className="bg-red-500" style={{ width: `${(nonCompliantCount / totalFw) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Compliant</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> At Risk</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Non-Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
