import { useState } from 'react';
import { Crosshair, CheckCircle2, AlertTriangle, Monitor, User, Minus } from 'lucide-react';
import { Tooltip } from '../../components/shared/Tooltip';
import { redTeamFindings } from '../../data/mockData';
import type { RedTeamFinding } from '../../types';
import clsx from 'clsx';

type DiscoveredBy = 'both' | 'platform' | 'manual' | 'all';

const discoveredByConfig = {
  both: { label: 'Both', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40', icon: '✓' },
  platform: { label: 'Platform Only', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/40', icon: '🖥' },
  manual: { label: 'Manual Only', color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/40', icon: '👤' },
};

const severityBorder: Record<string, string> = {
  critical: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-amber-500',
};

function FindingCard({ f }: { f: RedTeamFinding }) {
  const cfg = discoveredByConfig[f.discoveredBy];
  return (
    <div className={clsx('bg-surface-1 border border-border border-l-4 rounded-xl p-4', severityBorder[f.severity])}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-200 leading-snug">{f.title}</p>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">{f.mitreId} · {f.technique}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {f.verified
            ? <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 size={11} /> Verified</span>
            : <span className="flex items-center gap-1 text-xs text-slate-500"><AlertTriangle size={11} /> Unverified</span>
          }
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className={clsx('text-xs px-2 py-0.5 rounded border font-medium', cfg.bg, cfg.color)}>
          {cfg.label}
        </span>
        <span className={clsx('text-xs px-2 py-0.5 rounded border font-medium',
          f.severity === 'critical' ? 'bg-red-500/20 border-red-500/40 text-red-300'
          : f.severity === 'high' ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
          : 'bg-amber-500/20 border-amber-500/40 text-amber-300')}>
          {f.severity}
        </span>
        {f.pathId && (
          <span className="text-xs px-2 py-0.5 rounded border bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400 font-mono">{f.pathId}</span>
        )}
      </div>

      {f.notes && (
        <p className="text-xs text-slate-400 leading-relaxed italic">{f.notes}</p>
      )}
    </div>
  );
}

export function RedTeamView() {
  const [filterBy, setFilterBy] = useState<DiscoveredBy>('all');

  const filtered = filterBy === 'all' ? redTeamFindings : redTeamFindings.filter(f => f.discoveredBy === filterBy);

  const bothCount = redTeamFindings.filter(f => f.discoveredBy === 'both').length;
  const platformOnly = redTeamFindings.filter(f => f.discoveredBy === 'platform').length;
  const manualOnly = redTeamFindings.filter(f => f.discoveredBy === 'manual').length;
  const total = redTeamFindings.length;
  const coverageScore = Math.round(((bothCount + platformOnly) / total) * 100);

  // Coverage matrix data
  const matrixItems = [
    { technique: 'S3 Credential Exfil', platform: true, manual: true },
    { technique: 'Kerberoasting', platform: true, manual: true },
    { technique: 'IT/OT Pivot', platform: true, manual: false },
    { technique: 'IAM Wildcard', platform: true, manual: true },
    { technique: 'Docker Socket ACL', platform: false, manual: true },
    { technique: 'LSASS Dump', platform: false, manual: true },
    { technique: 'SSRF + IAM', platform: true, manual: false },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">

      {/* Coverage Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Platform + Manual Coverage', value: `${coverageScore}%`, color: 'text-emerald-400', sub: `${bothCount + platformOnly} of ${total} findings`, tooltip: 'Percentage of total findings detected by the automated platform (either independently or together with the red team). Indicates platform detection breadth.' },
          { label: 'Found by Both', value: bothCount, color: 'text-emerald-400', sub: 'High confidence', tooltip: 'Findings confirmed independently by both the automated platform and manual red team — highest confidence results requiring immediate remediation.' },
          { label: 'Platform Only (gaps for RT)', value: platformOnly, color: 'text-blue-400', sub: 'RT scope gaps', tooltip: 'Attack paths found by the platform that were not tested by the red team. Consider expanding red team engagement scope to cover these in the next cycle.' },
          { label: 'Manual Only (gaps for platform)', value: manualOnly, color: 'text-orange-400', sub: 'Detection gaps', tooltip: 'Findings discovered manually by the red team that the platform did not detect. These represent detection gaps to improve in the platform logic.' },
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

        {/* Coverage Matrix */}
        <div className="bg-surface-1 border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Crosshair size={15} className="text-red-400" />
            <h3 className="text-sm font-semibold text-slate-200">Coverage Gap Matrix</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-border">
                  <th className="text-left py-2 pr-6 font-medium">Technique</th>
                  <th className="text-center py-2 px-4 font-medium">
                    <span className="flex items-center justify-center gap-1"><Monitor size={11} /> Platform</span>
                  </th>
                  <th className="text-center py-2 px-4 font-medium">
                    <span className="flex items-center justify-center gap-1"><User size={11} /> Red Team</span>
                  </th>
                  <th className="text-center py-2 px-4 font-medium">Gap?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {matrixItems.map(item => {
                  const gap = item.platform !== item.manual;
                  const gapOwner = gap ? (item.platform ? 'RT Scope' : 'Platform') : null;
                  return (
                    <tr key={item.technique} className="hover:bg-surface-2/30 transition-colors">
                      <td className="py-2.5 pr-6 text-slate-300 font-medium">{item.technique}</td>
                      <td className="py-2.5 px-4 text-center">
                        {item.platform
                          ? <CheckCircle2 size={14} className="text-emerald-400 mx-auto" />
                          : <Minus size={14} className="text-slate-600 mx-auto" />}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {item.manual
                          ? <CheckCircle2 size={14} className="text-emerald-400 mx-auto" />
                          : <Minus size={14} className="text-slate-600 mx-auto" />}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {gap ? (
                          <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium', gapOwner === 'Platform' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400')}>
                            {gapOwner}
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-surface-0 border border-border text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Legend:</strong> "Platform Gap" = Red team found but platform missed — detection improvement needed. "RT Scope" = Platform found but red team didn't test — expand engagement scope.
          </div>
        </div>

        {/* Findings List */}
        <div className="bg-surface-1 border border-border rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-200">Engagement Findings</h3>
            </div>
            <div className="flex gap-1">
              {(['all', 'both', 'platform', 'manual'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterBy(f)}
                  className={clsx('px-2 py-0.5 rounded text-xs transition-colors capitalize',
                    filterBy === f ? 'bg-blue-500/30 text-blue-300 border border-blue-500/40' : 'text-slate-500 hover:text-slate-300 border border-transparent')}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filtered.map(f => (
              <FindingCard key={f.id} f={f} />
            ))}
          </div>
        </div>
      </div>

      {/* Path Verification Status */}
      <div className="bg-surface-1 border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200">Path Verification Status</h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: 'Verified by Red Team',
              items: redTeamFindings.filter(f => f.verified),
              color: 'text-emerald-400',
              borderColor: 'border-l-emerald-500',
            },
            {
              label: 'Unverified (Platform Only)',
              items: redTeamFindings.filter(f => !f.verified),
              color: 'text-amber-400',
              borderColor: 'border-l-amber-500',
            },
            {
              label: 'Platform Detection Gaps',
              items: redTeamFindings.filter(f => f.discoveredBy === 'manual'),
              color: 'text-orange-400',
              borderColor: 'border-l-orange-500',
            },
          ].map(col => (
            <div key={col.label}>
              <p className={clsx('text-xs font-semibold mb-2', col.color)}>{col.label} ({col.items.length})</p>
              <div className="space-y-1.5">
                {col.items.map(item => (
                  <div key={item.id} className={clsx('text-xs bg-surface-0 border border-border border-l-4 rounded px-3 py-2', col.borderColor)}>
                    <p className="text-slate-300 font-medium leading-snug">{item.title}</p>
                    <p className="text-slate-600 font-mono mt-0.5">{item.mitreId}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
