import { useState } from 'react';
import { assets, whatIfScenarios, attackPaths, mitreMappings } from '../data/mockData';
import { Badge } from '../components/shared/Badge';
import { RiskScore } from '../components/shared/RiskScore';
import { RiskBar } from '../components/shared/RiskScore';
import type { WhatIfScenario, GraphAsset } from '../types';
import {
  Zap,
  Target,
  TrendingDown,
  GitFork,
  Shield,
  FlaskConical,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Flame,
} from 'lucide-react';
import clsx from 'clsx';

const mitreTypeColors: Record<string, string> = {
  'Initial Access': '#ef4444',
  'Execution': '#f97316',
  'Credential Access': '#f59e0b',
  'Lateral Movement': '#8b5cf6',
  'Privilege Escalation': '#a855f7',
  'Collection': '#0ea5e9',
  'Exfiltration': '#06b6d4',
  'Impact (ICS)': '#10b981',
  'Defense Evasion': '#64748b',
  'Discovery': '#84cc16',
};

function ChokePointCard({ asset, selected, onClick }: { asset: GraphAsset; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left p-4 rounded-xl border transition-all',
        selected ? 'border-purple-500/50 bg-purple-600/10' : 'border-border bg-surface-2 hover:border-slate-600'
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-1.5 bg-purple-500/15 rounded-lg flex-shrink-0">
          <Zap size={14} className="text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-200 truncate">{asset.label}</p>
          <p className="text-[10px] font-mono text-slate-500">{asset.ip ?? asset.hostname}</p>
        </div>
        <RiskScore score={asset.riskScore} size="sm" showLabel={false} />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="text-center py-1.5 bg-surface-3 rounded-lg">
          <p className="text-lg font-bold font-mono text-purple-400">{asset.chokePointDownstreamPaths}</p>
          <p className="text-[9px] text-slate-500">Downstream Paths</p>
        </div>
        <div className="text-center py-1.5 bg-surface-3 rounded-lg">
          <p className="text-lg font-bold font-mono text-amber-400">{asset.roiScore}</p>
          <p className="text-[9px] text-slate-500">ROI Score</p>
        </div>
      </div>
      <RiskBar score={asset.roiScore ?? 0} label="Remediation ROI" />
    </button>
  );
}

function WhatIfCard({ scenario, active, onClick }: { scenario: WhatIfScenario; active: boolean; onClick: () => void }) {
  const mitTypes: Record<string, { label: string; color: string }> = {
    patch: { label: 'Patch', color: '#10b981' },
    waf: { label: 'WAF Rule', color: '#3b82f6' },
    ips: { label: 'IPS Rule', color: '#6366f1' },
    firewall: { label: 'Firewall ACL', color: '#f59e0b' },
    disable: { label: 'Disable', color: '#ef4444' },
  };
  const mit = mitTypes[scenario.mitigationType];

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left p-3 rounded-lg border transition-all',
        active ? 'border-emerald-500/40 bg-emerald-600/10' : 'border-border bg-surface-2 hover:border-slate-600'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: `${mit.color}20`, color: mit.color }}
        >
          {mit.label}
        </span>
        {active && <CheckCircle2 size={12} className="text-emerald-400" />}
      </div>
      <p className="text-xs font-semibold text-slate-200 leading-tight mb-2">{scenario.name}</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] text-slate-500">Projected Risk</p>
          <p className="text-sm font-mono font-bold text-emerald-400">{scenario.projectedRiskScore}</p>
        </div>
        <div>
          <p className="text-[9px] text-slate-500">Paths Eliminated</p>
          <p className="text-sm font-mono font-bold text-purple-400">{scenario.eliminatedPaths}</p>
        </div>
      </div>
    </button>
  );
}

export function Remediation() {
  const [selectedScenario, setSelectedScenario] = useState<WhatIfScenario | null>(null);
  const [selectedChoke, setSelectedChoke] = useState<GraphAsset | null>(null);
  const [activeTab, setActiveTab] = useState<'choke' | 'whatif' | 'mitre'>('choke');

  const chokePoints = assets.filter(a => a.isChokePoint);
  const currentGlobalRisk = 87;
  const projectedRisk = selectedScenario ? selectedScenario.projectedRiskScore : currentGlobalRisk;
  const riskDelta = currentGlobalRisk - projectedRisk;

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">
      {/* Left Panel */}
      <div className="w-72 flex-shrink-0 border-r border-border bg-surface-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { id: 'choke' as const, label: 'Choke Points', icon: Zap },
            { id: 'whatif' as const, label: 'What-If', icon: FlaskConical },
            { id: 'mitre' as const, label: 'MITRE', icon: Target },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-medium transition-colors border-b-2',
                activeTab === id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              )}
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {activeTab === 'choke' && chokePoints.map((asset) => (
            <ChokePointCard
              key={asset.id}
              asset={asset}
              selected={selectedChoke?.id === asset.id}
              onClick={() => setSelectedChoke(selectedChoke?.id === asset.id ? null : asset)}
            />
          ))}

          {activeTab === 'whatif' && whatIfScenarios.map((scenario) => (
            <WhatIfCard
              key={scenario.id}
              scenario={scenario}
              active={selectedScenario?.id === scenario.id}
              onClick={() => setSelectedScenario(selectedScenario?.id === scenario.id ? null : scenario)}
            />
          ))}

          {activeTab === 'mitre' && mitreMappings.map((m) => (
            <div key={m.techniqueId} className="p-3 bg-surface-2 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${mitreTypeColors[m.tactic] ?? '#64748b'}20`,
                    color: mitreTypeColors[m.tactic] ?? '#64748b',
                  }}
                >
                  {m.techniqueId}
                </span>
                <span className="text-[9px] text-slate-600">{m.tactic}</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-300">{m.techniqueName}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{m.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* What-If Impact Summary */}
        {selectedScenario ? (
          <div className="bg-surface-2 rounded-xl border border-emerald-500/20 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/15 rounded-lg">
                <FlaskConical size={16} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-200">What-If Simulation Active</h3>
                <p className="text-xs text-slate-500">{selectedScenario.name}</p>
              </div>
              <Badge label="Simulated" variant="neutral" />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-surface-3 rounded-lg">
                <p className="text-2xl font-mono font-bold text-red-400">{currentGlobalRisk}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Current Risk</p>
              </div>
              <div className="flex items-center justify-center text-slate-600">
                <ChevronRight size={24} />
              </div>
              <div className="text-center p-3 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
                <p className="text-2xl font-mono font-bold text-emerald-400">{projectedRisk}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Projected Risk</p>
              </div>
              <div className="text-center p-3 bg-surface-3 rounded-lg">
                <p className="text-2xl font-mono font-bold text-emerald-400">-{riskDelta}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Risk Reduction</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface-3 rounded-lg">
                <p className="text-[10px] text-slate-500 mb-1">Paths Eliminated</p>
                <div className="flex items-center gap-2">
                  <GitFork size={14} className="text-purple-400" />
                  <span className="text-lg font-mono font-bold text-purple-400">{selectedScenario.eliminatedPaths}</span>
                  <span className="text-xs text-slate-500">of {attackPaths.length} total</span>
                </div>
              </div>
              <div className="p-3 bg-surface-3 rounded-lg">
                <p className="text-[10px] text-slate-500 mb-1">Mitigation Type</p>
                <div className="flex items-center gap-2">
                  <Wrench size={14} className="text-blue-400" />
                  <span className="text-xs font-semibold text-blue-400 capitalize">{selectedScenario.mitigationType}</span>
                </div>
                {selectedScenario.mitigation && (
                  <p className="text-[10px] font-mono text-slate-500 mt-1 break-all">{selectedScenario.mitigation}</p>
                )}
              </div>
            </div>

            {/* Risk bars comparison */}
            <div className="mt-4 space-y-3">
              <RiskBar score={currentGlobalRisk} label="Current Global Risk Score" />
              <RiskBar score={projectedRisk} label="Projected Risk Score (after mitigation)" projected={projectedRisk} />
            </div>

            <div className="mt-4 p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-lg flex items-start gap-2">
              <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">
                Applying <strong className="text-slate-200">{selectedScenario.name}</strong> would reduce the Global Risk Score by <strong className="text-emerald-400">{riskDelta} points</strong> and eliminate <strong className="text-purple-400">{selectedScenario.eliminatedPaths}</strong> attack path(s).
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-surface-2 rounded-xl border border-border p-5 flex flex-col items-center justify-center py-10 text-center">
            <FlaskConical size={36} className="text-slate-700 mb-3" />
            <p className="text-sm font-semibold text-slate-400">Select a What-If Scenario</p>
            <p className="text-xs text-slate-600 mt-1">from the left panel to simulate remediation impact</p>
          </div>
        )}

        {/* Choke Point Detail */}
        {selectedChoke && (
          <div className="bg-surface-2 rounded-xl border border-purple-500/20 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/15 rounded-lg">
                <Target size={16} className="text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-200">Choke Point Analysis – {selectedChoke.label}</h3>
                <p className="text-xs text-slate-500">{selectedChoke.chokePointDownstreamPaths} downstream attack paths pass through this node</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-purple-400 font-bold">ROI {selectedChoke.roiScore}</span>
                <RiskScore score={selectedChoke.riskScore} size="sm" showLabel={false} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-surface-3 rounded-lg text-center">
                <p className="text-xl font-mono font-bold text-purple-400">{selectedChoke.chokePointDownstreamPaths}</p>
                <p className="text-[10px] text-slate-500">Paths Through Node</p>
              </div>
              <div className="p-3 bg-surface-3 rounded-lg text-center">
                <p className="text-xl font-mono font-bold text-amber-400">{selectedChoke.roiScore}</p>
                <p className="text-[10px] text-slate-500">ROI Score</p>
              </div>
              <div className="p-3 bg-surface-3 rounded-lg text-center">
                <p className="text-xl font-mono font-bold text-red-400">{selectedChoke.riskScore}</p>
                <p className="text-[10px] text-slate-500">Current Risk</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">Risk Factors on This Choke Point</p>
              {selectedChoke.riskFactors.map((rf) => (
                <div key={rf.id} className="flex items-center gap-3 mb-2 px-3 py-2 bg-surface-3 rounded-lg">
                  <div className={clsx(
                    'w-1 h-6 rounded-full flex-shrink-0',
                    rf.severity === 'critical' ? 'bg-red-500' : rf.severity === 'high' ? 'bg-orange-500' : 'bg-amber-500'
                  )} />
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-300">{rf.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Badge label={rf.severity} variant={rf.severity} size="sm" />
                      {rf.mitreId && <span className="text-[9px] font-mono text-slate-600">{rf.mitreId}</span>}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-red-400">{rf.score}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 p-3 bg-purple-950/20 border border-purple-500/20 rounded-lg flex items-start gap-2">
              <Zap size={13} className="text-purple-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">
                Remediating <strong className="text-slate-200">{selectedChoke.label}</strong> would break <strong className="text-purple-400">{selectedChoke.chokePointDownstreamPaths} attack paths</strong> simultaneously — the highest ROI action available.
              </p>
            </div>
          </div>
        )}

        {/* MITRE ATT&CK Path Mapping */}
        <div className="bg-surface-2 rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/15 rounded-lg">
              <Shield size={16} className="text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">MITRE ATT&CK Path Enrichment</h3>
            <p className="text-xs text-slate-500 ml-auto">All CVEs/Misconfigs mapped to ATT&CK (AC-1)</p>
          </div>

          <div className="space-y-2">
            {Object.entries(mitreTypeColors).slice(0, 7).map(([tactic, color]) => {
              const techniques = mitreMappings.filter(m => m.tactic === tactic);
              if (!techniques.length) return null;
              return (
                <div key={tactic} className="flex items-start gap-3 p-2.5 bg-surface-3 rounded-lg">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold mb-1" style={{ color }}>{tactic}</p>
                    <div className="flex flex-wrap gap-1">
                      {techniques.map(t => (
                        <span
                          key={t.techniqueId}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
                          style={{
                            backgroundColor: `${color}15`,
                            color: color,
                            borderColor: `${color}30`,
                          }}
                          title={t.techniqueName}
                        >
                          {t.techniqueId}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alternative Mitigations */}
        <div className="bg-surface-2 rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/15 rounded-lg">
              <Flame size={16} className="text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Alternative Mitigations (AC-5 – Virtual Patching)</h3>
          </div>
          <div className="space-y-2">
            {[
              {
                path: 'Web-to-Database via S3 Key Exposure',
                primary: 'Patch CVE-2021-41773 on Apache',
                alternatives: [
                  { type: 'WAF', rule: 'ModSecurity CRS – REQUEST-930-APPLICATION-ATTACK-LFI blocks path traversal' },
                  { type: 'IPS', rule: 'Snort SID 58602 – Apache HTTP Server Path Traversal Detection' },
                ],
              },
              {
                path: 'IT/OT Flat Network → SCADA',
                primary: 'Patch EternalBlue on SCADA (EOL – not feasible)',
                alternatives: [
                  { type: 'Firewall', rule: 'Palo Alto: DENY 10.20.0.0/16 → 172.16.100.0/24 (port 445, 502)' },
                  { type: 'Segment', rule: 'Create dedicated VLAN for OT segment with monitoring' },
                ],
              },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-surface-3 rounded-lg">
                <p className="text-[10px] font-semibold text-slate-300 mb-1">{item.path}</p>
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle size={10} className="text-red-400" />
                  <span className="text-[10px] text-slate-500">Primary: {item.primary}</span>
                </div>
                <div className="space-y-1.5">
                  {item.alternatives.map((alt, j) => (
                    <div key={j} className="flex items-start gap-2 px-2 py-1.5 bg-blue-950/20 border border-blue-500/15 rounded">
                      <span className="text-[9px] font-mono font-bold text-blue-400 flex-shrink-0 mt-0.5">{alt.type}</span>
                      <span className="text-[10px] font-mono text-slate-400 break-words">{alt.rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
