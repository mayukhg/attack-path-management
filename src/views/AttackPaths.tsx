import { useState } from 'react';
import { AttackPathGraph } from '../components/graph/AttackPathGraph';
import { Badge } from '../components/shared/Badge';
import { RiskScore } from '../components/shared/RiskScore';
import { attackPaths, assets, mitreMappings } from '../data/mockData';
import type { AttackPath, GraphAsset } from '../types';
import { ChevronRight, Shield, Target, Clock, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import clsx from 'clsx';

export function AttackPaths() {
  const [selectedPath, setSelectedPath] = useState<AttackPath>(attackPaths[0]);
  const [selectedNode, setSelectedNode] = useState<GraphAsset | null>(null);

  const pathAssets = selectedPath
    ? selectedPath.nodes.map(id => assets.find(a => a.id === id)).filter(Boolean) as GraphAsset[]
    : [];

  const handleNodeClick = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    setSelectedNode(asset ?? null);
  };

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">
      {/* Left Panel – Path List */}
      <div className="w-72 flex-shrink-0 border-r border-border flex flex-col bg-surface-1">
        <div className="px-4 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-slate-200">Attack Paths</h2>
          <p className="text-xs text-slate-500 mt-0.5">{attackPaths.length} active paths detected</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {attackPaths.map((path) => (
            <button
              key={path.id}
              onClick={() => { setSelectedPath(path); setSelectedNode(null); }}
              className={clsx(
                'w-full text-left px-3 py-3 rounded-lg border transition-all',
                selectedPath?.id === path.id
                  ? 'bg-blue-600/15 border-blue-500/40 text-blue-400'
                  : 'border-border hover:border-slate-600 hover:bg-surface-2 text-slate-300'
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <Badge label={path.severity} variant={path.severity} size="sm" />
                <span className="text-[10px] font-mono text-slate-500">{path.nodes.length} hops</span>
              </div>
              <p className="text-xs font-semibold leading-tight mb-1 truncate">{path.name}</p>
              <div className="flex items-center gap-1">
                {path.verified
                  ? <CheckCircle2 size={10} className="text-emerald-400" />
                  : <AlertCircle size={10} className="text-amber-400" />}
                <span className="text-[10px] text-slate-500">{path.verified ? 'Verified exploitable' : 'Unverified'}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] font-mono text-red-400 font-bold">Risk {path.riskScore}</span>
                <ChevronRight size={12} className="text-slate-600" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Center – Graph */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Path header */}
        <div className="px-5 py-3 border-b border-border bg-surface-1 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge label={selectedPath.severity} variant={selectedPath.severity} />
              <h3 className="text-sm font-semibold text-slate-200 truncate">{selectedPath.name}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{selectedPath.description}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex gap-1">
              {selectedPath.mitreTactics.map((t, i) => (
                <span key={i} className="text-[9px] bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded font-mono">{t}</span>
              ))}
            </div>
            <RiskScore score={selectedPath.riskScore} size="sm" showLabel={false} />
          </div>
        </div>

        {/* Chain breadcrumb */}
        <div className="px-5 py-2 border-b border-border bg-surface-0 flex items-center gap-1 overflow-x-auto">
          <span className="text-[10px] text-slate-600 font-mono flex-shrink-0">CHAIN:</span>
          {pathAssets.map((asset, idx) => (
            <span key={asset.id} className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setSelectedNode(asset)}
                className={clsx(
                  'text-[10px] font-mono px-2 py-0.5 rounded transition-colors',
                  asset.type === 'entryPoint' ? 'text-red-400 bg-red-500/10' :
                  asset.type === 'crownJewel' ? 'text-amber-400 bg-amber-500/10' :
                  asset.type === 'identity' ? 'text-purple-400 bg-purple-500/10' :
                  'text-orange-400 bg-orange-500/10'
                )}
              >
                {asset.label.split(' ').slice(0, 2).join(' ')}
              </button>
              {idx < pathAssets.length - 1 && <ChevronRight size={10} className="text-slate-600" />}
            </span>
          ))}
        </div>

        <div className="flex-1 p-4">
          <AttackPathGraph
            key={selectedPath.id}
            selectedPath={selectedPath}
            onNodeClick={handleNodeClick}
          />
        </div>
      </div>

      {/* Right Panel – Node Detail */}
      <div className="w-80 flex-shrink-0 border-l border-border bg-surface-1 flex flex-col overflow-y-auto">
        {selectedNode ? (
          <>
            <div className="px-4 py-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <Badge label={selectedNode.type} variant="neutral" />
                <RiskScore score={selectedNode.riskScore} size="sm" showLabel={false} />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">{selectedNode.label}</h3>
              <p className="text-xs font-mono text-slate-500 mt-0.5">{selectedNode.ip ?? selectedNode.hostname}</p>
            </div>

            <div className="p-4 space-y-4 flex-1">
              {/* Asset Info */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">Asset Metadata</p>
                <div className="space-y-1.5">
                  {[
                    ['OS', selectedNode.os ?? 'N/A'],
                    ['Segment', selectedNode.segment],
                    ['Owner', selectedNode.owner ?? 'Unknown'],
                    ['Business Value', `${selectedNode.businessValue}/100`],
                    ['CMDB', selectedNode.cmdbPresent ? '✓ Present' : '✗ Missing (Shadow IT)'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs gap-2">
                      <span className="text-slate-500">{k}</span>
                      <span className="text-slate-300 font-mono text-right truncate max-w-[160px]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">Services & Ports</p>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.services.map((s, i) => (
                    <span key={i} className="text-[10px] bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded font-mono">{s}</span>
                  ))}
                  {selectedNode.ports.map((p, i) => (
                    <span key={i} className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-mono border border-blue-500/20">{p}</span>
                  ))}
                </div>
              </div>

              {/* Vulnerabilities */}
              {selectedNode.vulnerabilities.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">CVEs</p>
                  {selectedNode.vulnerabilities.map((v) => (
                    <div key={v.id} className="mb-2 p-2.5 bg-red-950/20 border border-red-500/20 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-bold text-red-400">{v.id}</span>
                        <span className="text-xs font-mono font-bold text-red-400">CVSS {v.cvss}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{v.description}</p>
                      <div className="flex gap-1 mt-1.5">
                        {v.mitreIds.map(mid => (
                          <span key={mid} className="text-[9px] bg-slate-700/50 text-slate-500 px-1 py-0.5 rounded font-mono">{mid}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Misconfigurations */}
              {selectedNode.misconfigurations.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">Misconfigurations</p>
                  {selectedNode.misconfigurations.map((mc) => (
                    <div key={mc.id} className="mb-2 p-2.5 bg-amber-950/20 border border-amber-500/20 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <Badge label={mc.severity} variant={mc.severity} size="sm" />
                        <span className="text-[10px] font-mono text-slate-500">{mc.category}</span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-medium">{mc.title}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Risk Factors */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">Risk Factors</p>
                {selectedNode.riskFactors.map((rf) => (
                  <div key={rf.id} className="flex items-center gap-2 mb-1.5">
                    <div className={clsx(
                      'w-1 h-6 rounded-full flex-shrink-0',
                      rf.severity === 'critical' ? 'bg-red-500' : rf.severity === 'high' ? 'bg-orange-500' : 'bg-amber-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-300 truncate">{rf.title}</p>
                      <div className="flex items-center gap-1">
                        {rf.mitreId && <span className="text-[9px] font-mono text-slate-600">{rf.mitreId}</span>}
                        <span className={clsx('text-[9px] font-mono font-bold', rf.active ? 'text-red-400' : 'text-slate-600')}>
                          {rf.active ? 'ACTIVE' : 'DORMANT'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-red-400 flex-shrink-0">{rf.score}</span>
                  </div>
                ))}
              </div>

              {/* Special Flags */}
              <div className="flex flex-wrap gap-2">
                {selectedNode.isChokePoint && (
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <Target size={12} className="text-purple-400" />
                    <span className="text-[10px] text-purple-300 font-semibold">Choke Point – {selectedNode.chokePointDownstreamPaths} downstream paths</span>
                  </div>
                )}
                {selectedNode.isToxicCombination && (
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <Layers size={12} className="text-red-400" />
                    <span className="text-[10px] text-red-300 font-semibold">Toxic Combination</span>
                  </div>
                )}
                {selectedNode.isShadowIT && (
                  <div className="flex items-center gap-1.5 px-2 py-1.5 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-lg">
                    <Shield size={12} className="text-fuchsia-400" />
                    <span className="text-[10px] text-fuchsia-300 font-semibold">Shadow IT – Not in CMDB</span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <Target size={40} className="text-slate-700 mb-3" />
            <p className="text-sm font-semibold text-slate-400">Click any node</p>
            <p className="text-xs text-slate-600 mt-1">to view asset details, vulnerabilities, and risk factors</p>
            <div className="mt-6 w-full space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-600 text-left">Path Stats</p>
              {[
                ['Entry Point', pathAssets[0]?.label ?? '-'],
                ['Crown Jewel', pathAssets[pathAssets.length - 1]?.label ?? '-'],
                ['Hops', selectedPath.nodes.length],
                ['Verified', selectedPath.verified ? 'Yes' : 'No'],
                ['Last Updated', new Date(selectedPath.lastUpdated).toLocaleDateString()],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between text-xs">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-300 font-mono">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
