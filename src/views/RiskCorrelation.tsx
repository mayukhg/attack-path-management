import { useState } from 'react';
import { assets, attackPaths, whatIfScenarios } from '../data/mockData';
import { Badge } from '../components/shared/Badge';
import { RiskScore } from '../components/shared/RiskScore';
import { RiskBar } from '../components/shared/RiskScore';
import type { GraphAsset, WhatIfScenario } from '../types';
import {
  Layers,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Zap,
  FlaskConical,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { Tooltip } from '../components/shared/Tooltip';
import clsx from 'clsx';

function ToxicCombinationCard({ asset }: { asset: GraphAsset }) {
  const [expanded, setExpanded] = useState(false);

  const criticalFactors = asset.riskFactors.filter(rf => rf.severity === 'critical' || rf.severity === 'high');

  return (
    <div className="bg-surface-2 rounded-xl border border-red-500/20 p-4 hover:border-red-500/40 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-red-500/15 rounded-lg flex-shrink-0">
          <Layers size={14} className="text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge label="Toxic Combination" variant="toxic" />
            {asset.isChokePoint && <Badge label="Choke Point" variant="choke" size="sm" />}
          </div>
          <h3 className="text-sm font-semibold text-slate-200 leading-tight">{asset.label}</h3>
          <p className="text-[10px] font-mono text-slate-500">{asset.ip ?? asset.hostname} · {asset.segment}</p>
        </div>
        <RiskScore score={asset.riskScore} size="sm" showLabel={false} />
      </div>

      {/* Risk Factor Intersection */}
      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">
          Intersecting Risk Factors ({criticalFactors.length} on contiguous path)
        </p>
        <div className="space-y-1.5">
          {criticalFactors.map((rf) => (
            <div key={rf.id} className="flex items-center gap-2 px-2 py-1.5 bg-red-950/15 rounded border border-red-500/10">
              <div className={clsx(
                'w-1.5 h-1.5 rounded-full flex-shrink-0',
                rf.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'
              )} />
              <span className="text-[10px] text-slate-300 flex-1 truncate">{rf.title}</span>
              {rf.mitreId && <span className="text-[9px] font-mono text-slate-600">{rf.mitreId}</span>}
              <span className={clsx(
                'text-[9px] font-mono font-bold',
                rf.active ? 'text-red-400' : 'text-slate-600'
              )}>{rf.active ? 'ACTIVE' : 'DORMANT'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Bars */}
      <div className="space-y-2 mb-3">
        <RiskBar score={asset.baseRiskScore} label="Base Risk Score" />
        <RiskBar score={asset.riskScore} label="Topological Risk (after elevation)" />
      </div>

      {asset.isChokePoint && (
        <div className="text-[10px] text-slate-500 flex items-center gap-1">
          <Zap size={10} className="text-purple-400" />
          Choke point elevation: +{Math.round(((asset.riskScore - asset.baseRiskScore) / asset.baseRiskScore) * 100)}% above base score
        </div>
      )}

      <button
        onClick={() => setExpanded(e => !e)}
        className="mt-2 flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
      >
        <ChevronRight size={10} className={clsx('transition-transform', expanded && 'rotate-90')} />
        {expanded ? 'Hide' : 'Show'} all risk factors
      </button>

      {expanded && (
        <div className="mt-2 space-y-1">
          {asset.riskFactors.filter(rf => !criticalFactors.includes(rf)).map((rf) => (
            <div key={rf.id} className="flex items-center gap-2 px-2 py-1 bg-surface-3/50 rounded text-[10px] opacity-60">
              <div className="w-1 h-1 rounded-full bg-slate-500 flex-shrink-0" />
              <span className="text-slate-400 flex-1 truncate">{rf.title}</span>
              <span className="text-slate-600 font-mono">{rf.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContextualScorePanel({ asset }: { asset: GraphAsset }) {
  const isChoke = asset.isChokePoint;
  const elevation = isChoke ? Math.round(((asset.riskScore - asset.baseRiskScore) / asset.baseRiskScore) * 100) : 0;

  return (
    <div className="p-4 bg-surface-3 rounded-lg border border-border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-slate-200">{asset.label}</p>
          <p className="text-[10px] font-mono text-slate-500">{asset.segment}</p>
        </div>
        <div className="flex items-center gap-2">
          {asset.reachable ? (
            <div className="flex items-center gap-1 text-[9px] text-emerald-400">
              <Eye size={9} />
              Reachable
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[9px] text-slate-600">
              <EyeOff size={9} />
              Isolated
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-surface-0 rounded">
          <p className="text-sm font-mono font-bold text-slate-400">{asset.baseRiskScore}</p>
          <div className="flex items-center justify-center gap-0.5">
            <p className="text-[9px] text-slate-600">Base Score</p>
            <Tooltip text="Risk score derived from asset criticality, vulnerability severity, and business value — before contextual elevation factors are applied." />
          </div>
        </div>
        <div className="text-center p-2 bg-surface-0 rounded">
          <p className={clsx('text-sm font-mono font-bold', isChoke ? 'text-purple-400' : 'text-slate-500')}>
            {isChoke ? `+${elevation}%` : '—'}
          </p>
          <div className="flex items-center justify-center gap-0.5">
            <p className="text-[9px] text-slate-600">Elevation</p>
            <Tooltip text="AC-2 Choke Point Elevation: Risk score increase applied when an asset bottlenecks multiple attack paths. Minimum +20% over base score." />
          </div>
        </div>
        <div className="text-center p-2 bg-surface-0 rounded">
          <p className={clsx('text-sm font-mono font-bold',
            asset.riskScore >= 85 ? 'text-red-400' : asset.riskScore >= 70 ? 'text-orange-400' : 'text-slate-400'
          )}>{asset.riskScore}</p>
          <div className="flex items-center justify-center gap-0.5">
            <p className="text-[9px] text-slate-600">Final Score</p>
            <Tooltip text="Contextually-adjusted risk score after applying choke point elevation (AC-2) and noise suppression for non-reachable assets (AC-3)." />
          </div>
        </div>
      </div>

      {!asset.reachable && (
        <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
          <EyeOff size={10} />
          <span>Risk factors suppressed – no verified network reachability (AC-3 Noise Suppression)</span>
        </div>
      )}

      <RiskBar
        score={asset.riskScore}
        label={`Global Risk Factor Score${isChoke ? ' (Choke Point Elevated)' : ''}`}
      />
    </div>
  );
}

export function RiskCorrelation() {
  const [selectedScenario, setSelectedScenario] = useState<WhatIfScenario | null>(null);

  const toxicAssets = assets.filter(a => a.isToxicCombination);
  const chokeAssets = assets.filter(a => a.isChokePoint);
  const nonReachable = assets.filter(a => !a.reachable);
  const reachable = assets.filter(a => a.reachable);

  // Current global risk
  const globalRisk = 87;
  const projected = selectedScenario ? selectedScenario.projectedRiskScore : globalRisk;

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Scoring Overview */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Toxic Combinations', value: toxicAssets.length, color: '#ef4444', icon: Layers, desc: '3+ critical factors intersecting', tooltip: 'Assets at the intersection of 3 or more critical risk factors on the same attack path. Exploiting them grants disproportionate access — remediation has amplified impact.' },
            { label: 'Choke Point Elevation', value: `+20%+`, color: '#a855f7', icon: TrendingUp, desc: 'Min elevation for choke points (AC-2)', tooltip: 'Minimum risk score elevation applied to choke point assets (AC-2 algorithm). A node that bottlenecks multiple paths receives at least +20% above its base risk score.' },
            { label: 'Noise-Suppressed', value: `${nonReachable.length}`, color: '#64748b', icon: EyeOff, desc: 'Non-reachable assets dimmed (AC-3)', tooltip: 'CVEs and risk factors on assets with no verified network path are suppressed (AC-3 Noise Suppression). This prevents alert fatigue from non-exploitable findings.' },
            { label: 'Active Risk Factors', value: reachable.reduce((s, a) => s + a.riskFactors.filter(r => r.active).length, 0), color: '#f97316', icon: Activity, desc: 'Verified exploitable in context', tooltip: 'Individual risk conditions (CVEs, misconfigurations, ACL weaknesses) that are both present on a reachable asset AND part of a verified or modeled attack chain.' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="p-4 bg-surface-2 rounded-xl border border-border"
                style={{ borderColor: `${stat.color}30` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} style={{ color: stat.color }} />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</span>
                  <Tooltip text={stat.tooltip} />
                </div>
                <p className="text-3xl font-mono font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[10px] text-slate-600 mt-1">{stat.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Toxic Combinations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Toxic Combination Detections</h3>
              <p className="text-xs text-slate-500">Nodes where 3+ critical risk factors intersect on a path to a Crown Jewel</p>
            </div>
            <Badge label={`${toxicAssets.length} Active`} variant="critical" pulse />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {toxicAssets.map((asset) => (
              <ToxicCombinationCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>

        {/* Contextual Risk Scoring */}
        <div className="bg-surface-2 rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/15 rounded-lg">
              <TrendingUp size={16} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Contextual Risk Score Adjustment</h3>
              <p className="text-xs text-slate-500">Choke point elevation (AC-2: +20% min) · Noise suppression for non-reachable assets (AC-3)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {assets.slice(0, 6).map((asset) => (
              <ContextualScorePanel key={asset.id} asset={asset} />
            ))}
          </div>

          <div className="mt-4 p-3 bg-surface-3 rounded-lg flex items-start gap-2">
            <AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400">
              <strong className="text-slate-200">AC-2 Verified:</strong> DC01 (Choke Point) receives a{' '}
              <strong className="text-purple-400">+{Math.round(((assets.find(a => a.id === 'a5')!.riskScore - assets.find(a => a.id === 'a5')!.baseRiskScore) / assets.find(a => a.id === 'a5')!.baseRiskScore) * 100)}%</strong>{' '}
              risk elevation above its base score due to topological importance.
            </p>
          </div>
        </div>

        {/* What-If Risk Recalculation */}
        <div className="bg-surface-2 rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/15 rounded-lg">
              <FlaskConical size={16} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">What-If Risk Recalculation (AC-4)</h3>
              <p className="text-xs text-slate-500">Removing a risk factor triggers real-time projected risk score update</p>
            </div>
            {selectedScenario && (
              <div className="ml-auto flex items-center gap-2">
                <Badge label="Simulation Active" variant="neutral" />
                <span className="text-xs font-mono text-emerald-400 font-bold">Risk: {globalRisk} → {projected}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {whatIfScenarios.map((scenario) => {
              const mitColors: Record<string, string> = {
                patch: '#10b981',
                waf: '#3b82f6',
                firewall: '#f59e0b',
                ips: '#6366f1',
                disable: '#ef4444',
              };
              const color = mitColors[scenario.mitigationType] ?? '#64748b';
              const isSelected = selectedScenario?.id === scenario.id;
              const reduction = globalRisk - scenario.projectedRiskScore;

              return (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(isSelected ? null : scenario)}
                  className={clsx(
                    'text-left p-3 rounded-lg border transition-all',
                    isSelected ? 'border-emerald-500/40 bg-emerald-600/10' : 'border-border bg-surface-3 hover:border-slate-600'
                  )}
                >
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {scenario.mitigationType.toUpperCase()}
                  </span>
                  <p className="text-[10px] font-semibold text-slate-300 mt-2 mb-2 leading-tight">{scenario.name}</p>
                  <div className="flex items-center gap-2">
                    <TrendingDown size={12} className="text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-emerald-400">-{reduction} risk</span>
                    <span className="text-[10px] text-slate-600">· {scenario.eliminatedPaths} path{scenario.eliminatedPaths > 1 ? 's' : ''}</span>
                  </div>
                  {isSelected && (
                    <div className="mt-2">
                      <RiskBar score={scenario.projectedRiskScore} label="" projected={scenario.projectedRiskScore} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedScenario && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-500 mb-1">Current Global Risk</p>
                <RiskBar score={globalRisk} />
              </div>
              <div>
                <p className="text-[10px] text-emerald-400 mb-1">Projected Risk (post-mitigation)</p>
                <RiskBar score={projected} />
              </div>
            </div>
          )}
        </div>

        {/* Noise Suppression */}
        <div className="bg-surface-2 rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-700/50 rounded-lg">
              <EyeOff size={16} className="text-slate-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Noise Suppression – AC-3</h3>
              <p className="text-xs text-slate-500">Risk factors on non-reachable assets are deprioritized (dimmed in UI)</p>
            </div>
          </div>

          <div className="space-y-2">
            {assets.map((asset) => {
              const dormantFactors = asset.riskFactors.filter(rf => !rf.active);
              const activeFactors = asset.riskFactors.filter(rf => rf.active);
              return (
                <div
                  key={asset.id}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors',
                    asset.reachable
                      ? 'border-border bg-surface-3'
                      : 'border-slate-700/30 bg-surface-0/50 opacity-50'
                  )}
                >
                  <div className={clsx(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    asset.reachable ? 'bg-emerald-400' : 'bg-slate-600'
                  )} />
                  <span className="text-xs text-slate-300 flex-1 truncate">{asset.label}</span>
                  <div className="flex items-center gap-2 text-[10px]">
                    {asset.reachable ? (
                      <>
                        <Eye size={10} className="text-emerald-400" />
                        <span className="text-emerald-400 font-mono">{activeFactors.length} active</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={10} className="text-slate-600" />
                        <span className="text-slate-600 font-mono">{dormantFactors.length} suppressed</span>
                      </>
                    )}
                  </div>
                  <span className={clsx(
                    'text-xs font-mono font-bold flex-shrink-0',
                    asset.reachable
                      ? asset.riskScore >= 85 ? 'text-red-400' : 'text-orange-400'
                      : 'text-slate-600'
                  )}>{asset.riskScore}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel – Summary */}
      <div className="w-72 flex-shrink-0 border-l border-border bg-surface-1 flex flex-col overflow-y-auto p-4 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-3">Global Risk Score</p>
          <div className="flex items-center justify-center py-4">
            <RiskScore score={selectedScenario ? selectedScenario.projectedRiskScore : globalRisk} size="lg" />
          </div>
          {selectedScenario && (
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-400">
              <TrendingDown size={12} />
              <span className="font-mono font-bold">-{globalRisk - selectedScenario.projectedRiskScore} projected reduction</span>
            </div>
          )}
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">Attack Path Risk Summary</p>
          {attackPaths.map((path) => (
            <div key={path.id} className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-surface-2 rounded-lg border border-border">
              <div className={clsx(
                'w-1.5 h-1.5 rounded-full flex-shrink-0',
                path.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'
              )} />
              <span className="text-[10px] text-slate-300 flex-1 truncate">{path.name.split(' ').slice(0, 3).join(' ')}…</span>
              <span className={clsx('text-[10px] font-mono font-bold flex-shrink-0',
                path.riskScore >= 85 ? 'text-red-400' : 'text-orange-400'
              )}>{path.riskScore}</span>
            </div>
          ))}
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">Schema Compliance</p>
          <div className="space-y-2">
            {[
              { label: 'Nested Risk Factor JSON', status: true },
              { label: 'Reachability Correlation', status: true },
              { label: 'Business Impact Weighting', status: true },
              { label: 'Top 50 Toxic Signatures', status: true },
              { label: '15-min Telemetry Update', status: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-[10px]">
                <span className={clsx('font-mono font-bold', item.status ? 'text-emerald-400' : 'text-red-400')}>
                  {item.status ? '✓' : '✗'}
                </span>
                <span className="text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
