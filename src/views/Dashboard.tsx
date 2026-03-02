import {
  AlertTriangle,
  Crown,
  Eye,
  GitFork,
  Globe,
  Layers,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { MetricCard } from '../components/shared/MetricCard';
import { Badge } from '../components/shared/Badge';
import { RiskScore } from '../components/shared/RiskScore';
import { AlertBanner } from '../components/shared/AlertBanner';
import {
  dashboardStats,
  riskTrendData,
  severityDistribution,
  attackPaths,
  alerts,
  assets,
} from '../data/mockData';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-3 border border-border rounded-lg px-3 py-2 text-xs">
        <p className="text-slate-400">{label}</p>
        <p className="text-red-400 font-mono font-bold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const criticalAssets = assets.filter(a => a.criticality === 'critical');
  const chokePoints = assets.filter(a => a.isChokePoint);
  const toxicNodes = assets.filter(a => a.isToxicCombination);

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
      <AlertBanner alerts={alerts} />

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Global Risk Score"
          value={dashboardStats.riskScore}
          subtitle="↑ +3.2 vs last week"
          icon={Shield}
          severity="critical"
          trend={dashboardStats.riskTrend}
          highlight
        />
        <MetricCard
          title="Critical Attack Paths"
          value={dashboardStats.criticalPaths}
          subtitle="4 active, verified paths"
          icon={GitFork}
          severity="critical"
        />
        <MetricCard
          title="Crown Jewels at Risk"
          value={dashboardStats.crownJewels}
          subtitle="Production DB · DC · Data Lake"
          icon={Crown}
          severity="high"
        />
        <MetricCard
          title="Shadow IT Detected"
          value={dashboardStats.shadowITAssets}
          subtitle="Not in CMDB · Internet-reachable"
          icon={Eye}
          severity="high"
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Toxic Combinations"
          value={dashboardStats.toxicCombinations}
          subtitle="3+ critical risk factors intersecting"
          icon={Layers}
          severity="critical"
        />
        <MetricCard
          title="Choke Points"
          value={dashboardStats.chokePoints}
          subtitle="Multi-path convergence nodes"
          icon={Zap}
          severity="medium"
        />
        <MetricCard
          title="Internet-Reachable Assets"
          value={dashboardStats.assetsReachableFromInternet}
          subtitle={`of ${dashboardStats.totalAssets} total assets`}
          icon={Globe}
          severity="high"
        />
        <MetricCard
          title="Paths Eliminated (30d)"
          value={dashboardStats.pathsEliminated30d}
          subtitle="Avg. time to remediate: 4.2d"
          icon={TrendingUp}
          severity="neutral"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Risk Trend */}
        <div className="col-span-2 bg-surface-2 rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Global Risk Score Trend</h3>
              <p className="text-xs text-slate-500">30-day rolling risk posture</p>
            </div>
            <Badge label="LIVE" variant="critical" pulse />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={riskTrendData}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Distribution */}
        <div className="bg-surface-2 rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">Path Severity</h3>
          <p className="text-xs text-slate-500 mb-4">Distribution by severity level</p>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={severityDistribution} dataKey="count" cx="50%" cy="50%" outerRadius={50} strokeWidth={2} stroke="transparent">
                {severityDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1e2640', border: '1px solid #2a3350', borderRadius: '8px', fontSize: '11px' }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#f1f5f9' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {severityDistribution.map((s) => (
              <div key={s.severity} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-[10px] text-slate-400">{s.severity}: <span className="font-mono font-semibold">{s.count}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Attack Paths Table */}
      <div className="bg-surface-2 rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Active Attack Paths</h3>
            <p className="text-xs text-slate-500">{attackPaths.length} paths detected · {attackPaths.filter(p => p.verified).length} verified exploitable</p>
          </div>
        </div>
        <div className="space-y-2">
          {attackPaths.map((path) => (
            <div key={path.id} className="flex items-center gap-4 px-4 py-3 bg-surface-3 rounded-lg border border-border hover:border-slate-600 transition-colors">
              <div className="flex-shrink-0">
                <RiskScore score={path.riskScore} size="sm" showLabel={false} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge label={path.severity} variant={path.severity} />
                  {path.verified && <Badge label="Verified" variant="neutral" />}
                  <span className="text-xs font-semibold text-slate-200 truncate">{path.name}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{path.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-slate-500 font-mono">{path.nodes.length} hops</span>
                <div className="flex gap-1">
                  {path.mitreTactics.slice(0, 3).map((t, i) => (
                    <span key={i} className="text-[9px] bg-slate-700/50 text-slate-500 px-1.5 py-0.5 rounded font-mono">{t.slice(0, 8)}</span>
                  ))}
                </div>
              </div>
              <AlertTriangle size={14} className={path.severity === 'critical' ? 'text-red-400' : 'text-orange-400'} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row: Critical Assets & MITRE Tactics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Critical Assets */}
        <div className="bg-surface-2 rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">High-Priority Assets</h3>
          <p className="text-xs text-slate-500 mb-4">Choke points · Toxic combos · Crown Jewels</p>
          <div className="space-y-2">
            {[...chokePoints, ...toxicNodes.filter(a => !a.isChokePoint)].slice(0, 5).map((asset) => (
              <div key={asset.id} className="flex items-center gap-3 px-3 py-2 bg-surface-3 rounded-lg">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  asset.criticality === 'critical' ? 'bg-red-500' : asset.criticality === 'high' ? 'bg-orange-500' : 'bg-amber-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{asset.label}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{asset.ip ?? asset.hostname}</p>
                </div>
                <div className="flex gap-1">
                  {asset.isChokePoint && <Badge label="Choke" variant="choke" size="sm" />}
                  {asset.isToxicCombination && <Badge label="Toxic" variant="toxic" size="sm" />}
                </div>
                <span className={`text-xs font-mono font-bold ${asset.riskScore >= 85 ? 'text-red-400' : 'text-orange-400'}`}>{asset.riskScore}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Attack ROI Bar Chart */}
        <div className="bg-surface-2 rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">Remediation ROI by Choke Point</h3>
          <p className="text-xs text-slate-500 mb-4">Downstream paths eliminated per patch</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={[
              { name: 'DC01', roi: 98, paths: 7 },
              { name: 'Dev Server', roi: 91, paths: 4 },
              { name: 'S3 Bucket', roi: 85, paths: 3 },
              { name: 'API GW', roi: 72, paths: 2 },
            ]} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip
                contentStyle={{ background: '#1e2640', border: '1px solid #2a3350', borderRadius: '8px', fontSize: '11px' }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#a855f7' }}
                formatter={(value) => [`${value} ROI Score`, '']}
              />
              <Bar dataKey="roi" fill="#a855f7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
