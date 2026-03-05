import { useState } from 'react';
import { AlertTriangle, Radio, CheckCircle2, ExternalLink, ChevronDown, ChevronRight, Shield, Eye } from 'lucide-react';
import { Badge } from '../../components/shared/Badge';
import { Tooltip } from '../../components/shared/Tooltip';
import { socEvents, mitreTimeline } from '../../data/mockData';
import type { SOCEvent } from '../../types';
import clsx from 'clsx';

const severityColor: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  low: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
};

const sourceIcon: Record<string, string> = {
  EDR: '🛡',
  CloudTrail: '☁',
  SIEM: '📡',
  IDS: '🔍',
};

const stageBg: Record<string, string> = {
  'Initial Access': 'bg-red-500/20 border-red-500/40 text-red-300',
  'Collection': 'bg-orange-500/20 border-orange-500/40 text-orange-300',
  'Credential Access': 'bg-purple-500/20 border-purple-500/40 text-purple-300',
  'Lateral Movement': 'bg-blue-500/20 border-blue-500/40 text-blue-300',
  'Privilege Escalation': 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-300',
};

function EventRow({ ev, expanded, onToggle }: { ev: SOCEvent; expanded: boolean; onToggle: () => void }) {
  return (
    <div className={clsx('border rounded-lg overflow-hidden transition-all', ev.investigated ? 'border-border opacity-60' : 'border-border hover:border-slate-600')}>
      <button
        className="w-full flex items-start gap-3 p-3 text-left"
        onClick={onToggle}
      >
        <span className="text-lg leading-none mt-0.5">{sourceIcon[ev.source] ?? '•'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded border', severityColor[ev.severity])}>
              {ev.severity.toUpperCase()}
            </span>
            <span className="text-xs text-slate-500 font-mono">{ev.source}</span>
            <span className="text-xs text-slate-400 font-medium truncate">{ev.technique}</span>
            {ev.investigated && (
              <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 size={11} /> Investigated
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-300 font-mono">{ev.asset}</span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-xs text-slate-500 font-mono">{new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {ev.pathId && (
              <>
                <span className="text-slate-600 text-xs">·</span>
                <span className="text-xs text-blue-400 font-mono">{ev.pathId}</span>
              </>
            )}
          </div>
        </div>
        <span className="text-slate-500 flex-shrink-0 mt-1">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border bg-surface-0/50">
          <p className="text-xs text-slate-400 leading-relaxed mt-3 mb-3">{ev.description}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-mono bg-slate-700/50 border border-border rounded px-2 py-0.5 text-slate-300">{ev.mitreId}</span>
            {ev.pathId && (
              <button className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                <ExternalLink size={11} />
                View full attack path
              </button>
            )}
            {!ev.investigated && (
              <button className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-xs">
                <CheckCircle2 size={11} />
                Mark Investigated
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function SOCAnalystView() {
  const [expandedEvent, setExpandedEvent] = useState<string | null>('se1');
  const [filterSource, setFilterSource] = useState<string>('all');

  const sources = ['all', 'EDR', 'CloudTrail', 'SIEM', 'IDS'];
  const filteredEvents = filterSource === 'all'
    ? socEvents
    : socEvents.filter(e => e.source === filterSource);

  const uninvestigated = socEvents.filter(e => !e.investigated).length;
  const critical = socEvents.filter(e => e.severity === 'critical').length;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">

      {/* Banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
        <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-300">Active Adversary Activity Detected</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {uninvestigated} uninvestigated events across {new Set(socEvents.filter(e => !e.investigated).map(e => e.pathId)).size} active attack paths. Earliest event: 04:10 today.
          </p>
        </div>
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white">{uninvestigated} OPEN</span>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Open Events', value: uninvestigated, color: 'text-red-400', tooltip: 'Alerts not yet reviewed or marked as resolved by the SOC team. Sorted by severity and time of detection.' },
          { label: 'Critical Severity', value: critical, color: 'text-orange-400', tooltip: 'Events with confirmed exploit activity or active adversary presence — require immediate triage before end of current shift.' },
          { label: 'Active Paths Involved', value: 2, color: 'text-fuchsia-400', tooltip: 'Distinct attack paths associated with at least one open alert. Indicates how many concurrent adversarial chains are active.' },
          { label: 'Investigated Today', value: socEvents.filter(e => e.investigated).length, color: 'text-emerald-400', tooltip: 'Events reviewed and marked as investigated during the current shift. Tracks SOC throughput and coverage.' },
        ].map(k => (
          <div key={k.label} className="bg-surface-1 border border-border rounded-xl p-4">
            <p className={clsx('text-2xl font-bold', k.color)}>{k.value}</p>
            <div className="flex items-center gap-1 mt-1">
              <p className="text-xs text-slate-500">{k.label}</p>
              <Tooltip text={k.tooltip} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Live Event Feed */}
        <div className="bg-surface-1 border border-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio size={15} className="text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-200">Live Alert Feed</h3>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div className="flex gap-1">
              {sources.map(s => (
                <button
                  key={s}
                  onClick={() => setFilterSource(s)}
                  className={clsx('px-2 py-0.5 rounded text-xs transition-colors', filterSource === s ? 'bg-blue-500/30 text-blue-300 border border-blue-500/40' : 'text-slate-500 hover:text-slate-300 border border-transparent')}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredEvents.map(ev => (
              <EventRow
                key={ev.id}
                ev={ev}
                expanded={expandedEvent === ev.id}
                onToggle={() => setExpandedEvent(prev => prev === ev.id ? null : ev.id)}
              />
            ))}
          </div>
        </div>

        {/* MITRE ATT&CK Timeline + Chain Investigation */}
        <div className="flex flex-col gap-5">

          {/* MITRE Timeline */}
          <div className="bg-surface-1 border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={15} className="text-purple-400" />
              <h3 className="text-sm font-semibold text-slate-200">MITRE ATT&CK Progression</h3>
              <Badge variant="critical" label="path1" />
            </div>

            <div className="relative">
              {/* Vertical connector line */}
              <div className="absolute left-[11px] top-3 bottom-3 w-px bg-slate-700" />

              <div className="space-y-1">
                {mitreTimeline.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 relative">
                    <span className={clsx(
                      'w-5 h-5 rounded-full border-2 flex-shrink-0 z-10 mt-0.5',
                      step.severity === 'critical' ? 'bg-red-500 border-red-400' : 'bg-orange-500 border-orange-400'
                    )} />
                    <div className={clsx('flex-1 rounded-lg border px-3 py-2 mb-1', stageBg[step.stage] ?? 'bg-surface-2 border-border text-slate-300')}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold">{step.stage}</span>
                        <span className="text-xs font-mono opacity-70">{step.time}</span>
                      </div>
                      <p className="text-xs opacity-90 mt-0.5">{step.technique}</p>
                      <p className="text-xs opacity-60 mt-0.5">{step.asset}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Adversary Chain Summary */}
          <div className="bg-surface-1 border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={15} className="text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-200">Adversary Chain — path1</h3>
            </div>

            <div className="flex items-center gap-1 flex-wrap text-xs">
              {['portal.acme.com', 'S3 Bucket', 'SSH Key', 'dev-server-01', 'Host Escape', 'DC01', 'Domain Admin'].map((hop, i, arr) => (
                <span key={hop} className="flex items-center gap-1">
                  <span className={clsx('px-2 py-0.5 rounded font-mono border', i === 0 ? 'bg-red-500/20 border-red-500/40 text-red-300' : i === arr.length - 1 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-surface-2 border-border text-slate-400')}>
                    {hop}
                  </span>
                  {i < arr.length - 1 && <span className="text-slate-600">→</span>}
                </span>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="bg-surface-0 border border-border rounded-lg p-3">
                <p className="text-lg font-bold text-red-400">7</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <p className="text-xs text-slate-500">Total Hops</p>
                  <Tooltip text="Number of distinct lateral movement steps in the reconstructed adversary chain from initial access to the target." />
                </div>
              </div>
              <div className="bg-surface-0 border border-border rounded-lg p-3">
                <p className="text-lg font-bold text-orange-400">4h 32m</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <p className="text-xs text-slate-500">Dwell Time</p>
                  <Tooltip text="Elapsed time between the earliest detected technique and the most recent activity on this path. Longer dwell time means more time for damage." />
                </div>
              </div>
              <div className="bg-surface-0 border border-border rounded-lg p-3">
                <p className="text-lg font-bold text-fuchsia-400">4</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <p className="text-xs text-slate-500">MITRE Tactics</p>
                  <Tooltip text="Number of distinct ATT&CK tactic categories (e.g. Initial Access, Lateral Movement, Privilege Escalation) observed in the attack chain." />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
