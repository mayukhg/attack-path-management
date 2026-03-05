import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { crownJewelRisks, executiveTrendData, boardRecommendations, attackPaths } from '../../data/mockData';
import { Badge } from '../../components/shared/Badge';
import { RiskScore } from '../../components/shared/RiskScore';
import {
  Crown, TrendingUp, TrendingDown, DollarSign,
  AlertTriangle, CheckCircle2, ChevronRight, Shield,
  ArrowUpRight, Target,
} from 'lucide-react';
import { Tooltip } from '../../components/shared/Tooltip';
import clsx from 'clsx';

function BreachNarrativeCard() {
  const topPath = attackPaths[0];
  return (
    <div className="bg-gradient-to-br from-red-950/40 to-surface-2 rounded-xl border border-red-500/30 p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-red-400" />
        <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Most Likely Breach Scenario</span>
        <Badge label="VERIFIED" variant="critical" pulse />
      </div>
      <h2 className="text-lg font-bold text-slate-100 mb-2 leading-snug">
        An attacker can reach your <span className="text-amber-400">Production Database</span> from the internet in <span className="text-red-400">5 hops</span>
      </h2>
      <p className="text-sm text-slate-400 mb-4 leading-relaxed">
        A publicly known Apache vulnerability on your web portal allows an attacker to read SSH keys from a misconfigured AWS S3 bucket, authenticate to your internal network, escalate to Domain Admin via Active Directory, and exfiltrate your entire production database — without triggering any existing alerts.
      </p>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['Internet', 'Web Portal', 'S3 Bucket', 'Dev Server', 'Domain Controller', 'Production DB'].map((step, i, arr) => (
          <div key={step} className="flex items-center gap-2 flex-shrink-0">
            <div className={clsx(
              'text-[10px] font-mono px-2 py-1 rounded border',
              i === 0 ? 'bg-red-500/20 text-red-400 border-red-500/40' :
              i === arr.length - 1 ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
              'bg-surface-3 text-slate-400 border-border'
            )}>{step}</div>
            {i < arr.length - 1 && <ChevronRight size={12} className="text-slate-600 flex-shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function CrownJewelCard({ cj }: { cj: typeof crownJewelRisks[0] }) {
  const fmt = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${(n / 1e3).toFixed(0)}K`;
  return (
    <div className="bg-surface-2 rounded-xl border border-amber-500/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Crown size={14} className="text-amber-400" />
        <span className="text-xs font-semibold text-slate-200 flex-1 truncate">{cj.assetName}</span>
        <div className="flex items-center gap-1 text-[10px]">
          {cj.trend === 'up'
            ? <TrendingUp size={11} className="text-red-400" />
            : cj.trend === 'down'
            ? <TrendingDown size={11} className="text-emerald-400" />
            : null}
          <span className={cj.trend === 'up' ? 'text-red-400' : cj.trend === 'down' ? 'text-emerald-400' : 'text-slate-500'}>
            {cj.trend === 'up' ? `+${cj.trendDelta}%` : cj.trend === 'down' ? `-${cj.trendDelta}%` : 'Stable'}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center p-2 bg-surface-3 rounded-lg">
          <p className="text-2xl font-mono font-bold text-red-400">{cj.breachProbability}%</p>
          <div className="flex items-center justify-center gap-1 mt-0.5">
          <p className="text-[9px] text-slate-500">Breach Probability</p>
          <Tooltip text="Modeled likelihood of a successful breach based on path count, exploitability, and asset exposure. Factors in attacker skill level and detection probability." />
        </div>
        </div>
        <div className="text-center p-2 bg-surface-3 rounded-lg">
          <p className="text-2xl font-mono font-bold text-amber-400">{cj.hopsFromInternet}</p>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <p className="text-[9px] text-slate-500">Hops from Internet</p>
            <Tooltip text="Minimum number of lateral movement steps needed for an attacker to reach this asset from an internet-facing entry point." />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <DollarSign size={12} className="text-red-400" />
          <span>Est. Impact: <span className="text-red-400 font-mono font-bold">{fmt(cj.financialImpact)}</span></span>
          <Tooltip text="Estimated business impact of a successful breach, based on asset data classification, regulatory exposure, incident response cost, and business downtime." />
        </div>
        <span className="text-slate-600 font-mono">{cj.pathCount} active path{cj.pathCount > 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}

export function CISOView() {
  const [activeRecommendation, setActiveRecommendation] = useState<string | null>(null);
  const totalImpact = crownJewelRisks.reduce((s, c) => s + c.financialImpact, 0);
  const fmt = (n: number) => `$${(n / 1e6).toFixed(1)}M`;

  return (
    <div className="flex flex-col gap-5 p-6 overflow-y-auto h-full">
      {/* Persona Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className="p-2 bg-amber-500/15 rounded-lg">
          <Shield size={18} className="text-amber-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-100">CISO Executive View</h2>
          <p className="text-xs text-slate-500">Board-ready risk posture · Crown Jewel breach scenarios · Recommended actions</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-slate-500">Total Potential Impact</p>
            <p className="text-xl font-mono font-bold text-red-400">{fmt(totalImpact)}</p>
          </div>
          <RiskScore score={87} size="md" />
        </div>
      </div>

      {/* Breach Narrative */}
      <BreachNarrativeCard />

      {/* Crown Jewels at Risk */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200">Crown Jewels at Risk</h3>
          <Badge label={`${crownJewelRisks.length} assets`} variant="critical" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {crownJewelRisks.map(cj => <CrownJewelCard key={cj.assetId} cj={cj} />)}
        </div>
      </div>

      {/* Risk Trend + Board Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-surface-2 rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Organizational Risk Trend</h3>
              <p className="text-xs text-slate-500">6-month rolling · Score, active paths, Crown Jewels at risk</p>
            </div>
            <div className="flex items-center gap-1.5 text-red-400 text-xs font-mono">
              <ArrowUpRight size={14} />
              <span>+31% since Sep</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={executiveTrendData}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={28} />
              <RechartsTooltip contentStyle={{ background: '#1e2640', border: '1px solid #2a3350', borderRadius: '8px', fontSize: '11px' }} />
              <Area type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} fill="url(#riskGrad)" dot={{ fill: '#ef4444', r: 3 }} name="Risk Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface-2 rounded-xl border border-border p-5 flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-200">Board Summary</h3>
          {[
            { label: 'Critical Attack Paths', value: '4', color: 'text-red-400', icon: Target, tooltip: 'Complete adversarial chains with a verified exploitable route from an internet entry point to a Crown Jewel asset.' },
            { label: 'Crown Jewels Exposed', value: '3 / 3', color: 'text-amber-400', icon: Crown, tooltip: 'All 3 Crown Jewel assets are currently reachable via at least one active attack path. 3/3 indicates total exposure.' },
            { label: 'Avg. Hops to Breach', value: '4.3', color: 'text-orange-400', icon: ChevronRight, tooltip: 'Average number of lateral movement steps across all active paths from an internet entry point to a Crown Jewel.' },
            { label: 'Max Financial Impact', value: fmt(totalImpact), color: 'text-red-400', icon: DollarSign, tooltip: 'Combined estimated breach impact across all exposed Crown Jewels, based on data classification, regulatory fines, and incident response cost.' },
            { label: 'Paths Eliminated (30d)', value: '12', color: 'text-emerald-400', icon: CheckCircle2, tooltip: 'Attack chains closed this month through remediation. Tracks program effectiveness and remediation velocity.' },
          ].map(({ label, value, color, icon: Icon, tooltip }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={13} className={color} />
              <span className="text-[11px] text-slate-400 flex-1">{label}</span>
              <Tooltip text={tooltip} />
              <span className={clsx('text-sm font-mono font-bold', color)}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Board Recommendations */}
      <div className="bg-surface-2 rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200">Recommended Actions for Board</h3>
          <span className="text-xs text-slate-500">Sorted by risk reduction impact</span>
        </div>
        <div className="space-y-2">
          {boardRecommendations.map((rec) => (
            <button
              key={rec.id}
              onClick={() => setActiveRecommendation(activeRecommendation === rec.id ? null : rec.id)}
              className={clsx(
                'w-full text-left p-4 rounded-lg border transition-all',
                activeRecommendation === rec.id ? 'border-blue-500/40 bg-blue-600/10' : 'border-border bg-surface-3 hover:border-slate-600'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={clsx(
                  'w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs flex-shrink-0',
                  rec.priority === 1 ? 'bg-red-500/20 text-red-400' : rec.priority === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'
                )}>P{rec.priority}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200">{rec.action}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{rec.impact}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500">Risk Reduction</p>
                    <p className="text-base font-mono font-bold text-emerald-400">-{rec.riskReduction} pts</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500">Effort</p>
                    <Badge label={rec.effort} variant={rec.effort === 'Low' ? 'low' : rec.effort === 'Medium' ? 'medium' : 'high'} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500">Owner</p>
                    <p className="text-[11px] text-slate-300 font-medium">{rec.owner}</p>
                  </div>
                </div>
              </div>
              {activeRecommendation === rec.id && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Applying this action would reduce the global risk score by</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">{rec.riskReduction} points</span>
                    <span className="text-[10px] text-slate-500">bringing it from</span>
                    <span className="text-sm font-mono font-bold text-red-400">87</span>
                    <span className="text-[10px] text-slate-500">to</span>
                    <span className="text-sm font-mono font-bold text-amber-400">{87 - rec.riskReduction}</span>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
