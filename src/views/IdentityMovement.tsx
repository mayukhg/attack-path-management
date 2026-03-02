import { useState } from 'react';
import { adObjects, assets } from '../data/mockData';
import { Badge } from '../components/shared/Badge';
import { RiskScore } from '../components/shared/RiskScore';
import type { ADObject } from '../types';
import {
  User,
  Users,
  FileCode2,
  FolderTree,
  Monitor,
  ChevronRight,
  AlertTriangle,
  Shield,
  Zap,
  Lock,
  Unlock,
  Target,
} from 'lucide-react';
import clsx from 'clsx';

const privilegeColors: Record<string, string> = {
  anonymous: '#64748b',
  standard: '#3b82f6',
  'local-admin': '#f59e0b',
  system: '#f97316',
  'domain-admin': '#ef4444',
};

const privilegeLabels: Record<string, string> = {
  anonymous: 'Anonymous',
  standard: 'Standard User',
  'local-admin': 'Local Admin',
  system: 'SYSTEM',
  'domain-admin': 'Domain Admin',
};

const adIcons: Record<string, React.ElementType> = {
  user: User,
  group: Users,
  gpo: FileCode2,
  ou: FolderTree,
  computer: Monitor,
};

function ADObjectCard({ obj, selected, onClick }: { obj: ADObject; selected: boolean; onClick: () => void }) {
  const Icon = adIcons[obj.type] ?? User;
  const color = privilegeColors[obj.privilegeLevel];

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left p-3 rounded-lg border transition-all',
        selected ? 'border-purple-500/50 bg-purple-600/10' : 'border-border bg-surface-2 hover:border-slate-600'
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon size={12} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono font-semibold text-slate-200 truncate">{obj.name}</p>
          <p className="text-[10px] text-slate-600 capitalize">{obj.type}</p>
        </div>
        {obj.hasWeakACL && <AlertTriangle size={11} className="text-red-400 flex-shrink-0" />}
      </div>
      <div
        className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded inline-flex"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {privilegeLabels[obj.privilegeLevel]}
      </div>
    </button>
  );
}

function PrivilegeStepIndicator({ steps }: { steps: { label: string; privilege: string; via: string }[] }) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, idx) => {
        const color = privilegeColors[step.privilege];
        const isLast = idx === steps.length - 1;
        return (
          <div key={idx} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs border-2 flex-shrink-0"
                style={{ borderColor: color, backgroundColor: `${color}20`, color }}
              >
                {idx + 1}
              </div>
              {!isLast && <div className="w-0.5 flex-1 my-1" style={{ backgroundColor: `${color}30`, minHeight: 24 }} />}
            </div>
            <div className={clsx('pb-4 flex-1 min-w-0', isLast && 'pb-0')}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-slate-200">{step.label}</span>
                <span
                  className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {privilegeLabels[step.privilege]}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">via {step.via}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BlastRadiusView() {
  const dc = assets.find(a => a.id === 'a5')!;
  const affectedAssets = assets.filter(a => ['a6', 'a3', 'a9', 'a4'].includes(a.id));

  return (
    <div className="bg-surface-2 rounded-xl border border-red-500/20 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-500/15 rounded-lg">
          <Target size={16} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Blast Radius – DC01 (Tier-0)</h3>
          <p className="text-xs text-slate-500">All paths to unauthorized domain admin access</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge label="Tier-0" variant="critical" pulse />
          <RiskScore score={dc.riskScore} size="sm" showLabel={false} />
        </div>
      </div>

      {/* Blast radius visualization */}
      <div className="relative flex items-center justify-center py-6">
        {/* Center – DC */}
        <div className="relative z-10">
          <div className="w-20 h-20 rounded-full border-2 border-red-500 bg-red-500/15 flex items-center justify-center flex-col gap-1">
            <Shield size={20} className="text-red-400" />
            <span className="text-[9px] font-mono text-red-400 font-bold">DC01</span>
            <span className="text-[9px] font-mono text-red-300">DA</span>
          </div>
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute -inset-4 rounded-full border border-red-500/15 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
        </div>

        {/* Surrounding affected assets */}
        {affectedAssets.map((asset, idx) => {
          const angle = (idx / affectedAssets.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 110;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={asset.id}
              className="absolute flex flex-col items-center gap-1"
              style={{
                transform: `translate(${x}px, ${y}px)`,
                left: '50%',
                top: '50%',
                marginLeft: -40,
                marginTop: -30,
              }}
            >
              {/* Connection line - rendered via CSS */}
              <div
                className="absolute w-0.5 bg-gradient-to-b from-red-500/40 to-transparent"
                style={{
                  height: radius - 40,
                  transformOrigin: 'top center',
                  transform: `rotate(${angle + Math.PI / 2}rad)`,
                  top: '50%',
                  left: '50%',
                }}
              />
              <div className={clsx(
                'w-16 h-16 rounded-xl border flex items-center justify-center flex-col gap-0.5 text-center',
                asset.criticality === 'critical' ? 'border-red-500/40 bg-red-500/10' : 'border-orange-500/40 bg-orange-500/10'
              )}>
                <span className="text-[8px] font-mono text-slate-400 leading-tight px-1 text-center">
                  {asset.label.split(' ').slice(0, 2).join('\n')}
                </span>
                <span className={clsx('text-[10px] font-mono font-bold', asset.riskScore >= 85 ? 'text-red-400' : 'text-orange-400')}>
                  {asset.riskScore}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-500 text-center mt-2">
        {affectedAssets.length} assets within blast radius · {dc.chokePointDownstreamPaths} total attack paths through DC01
      </p>
    </div>
  );
}

export function IdentityMovement() {
  const [selectedAD, setSelectedAD] = useState<ADObject | null>(null);

  const escalationSteps = [
    { label: 'j.smith (Workstation)', privilege: 'standard', via: 'Phishing / PowerShell dropper' },
    { label: 'IT-Support-Group membership', privilege: 'local-admin', via: 'Group membership lookup in AD' },
    { label: 'Tier-2-Admins → Tier-1-Admins', privilege: 'local-admin', via: 'Nested group traversal' },
    { label: 'svc-jenkins (service account)', privilege: 'system', via: 'IT-Support-LocalAdmin-GPO on dev-server-01' },
    { label: 'Domain Admins', privilege: 'domain-admin', via: 'CVE-2021-42278 noPac / Kerberoasting' },
  ];

  const weakACLObjects = adObjects.filter(a => a.hasWeakACL);
  const tier0Objects = assets.filter(a => a.type === 'identity' && a.criticality === 'critical');

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">
      {/* Left Panel – AD Objects */}
      <div className="w-64 flex-shrink-0 border-r border-border bg-surface-1 flex flex-col">
        <div className="px-4 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-slate-200">AD Objects</h2>
          <p className="text-xs text-slate-500 mt-0.5">{adObjects.length} objects ingested</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {adObjects.map((obj) => (
            <ADObjectCard
              key={obj.id}
              obj={obj}
              selected={selectedAD?.id === obj.id}
              onClick={() => setSelectedAD(selectedAD?.id === obj.id ? null : obj)}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Privilege Escalation Chain */}
        <div className="bg-surface-2 rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-purple-500/15 rounded-lg">
              <Zap size={16} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Privilege Escalation Path</h3>
              <p className="text-xs text-slate-500">Standard User → Domain Admin via AD traversal</p>
            </div>
            <Badge label="AC-1 Verified" variant="neutral" size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-4">Step-by-Step Escalation</p>
              <PrivilegeStepIndicator steps={escalationSteps} />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-3">Attributes Used (AC-1: ≥3 AD Attributes)</p>
              <div className="space-y-2">
                {[
                  { attr: 'memberOf', desc: 'j.smith → IT-Support-Group', mitre: 'T1069.002' },
                  { attr: 'GPO Link', desc: 'IT-Support-LocalAdmin-GPO → LocalAdmin', mitre: 'T1615' },
                  { attr: 'Nested Groups', desc: 'Tier-2 → Tier-1 → Tier-0 chain', mitre: 'T1484.001' },
                  { attr: 'SPN / Kerberoast', desc: 'svc-jenkins TGS cracking', mitre: 'T1558.003' },
                  { attr: 'noPac CVE', desc: 'sAMAccountName spoofing → DA', mitre: 'T1078.002' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-surface-3 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono font-semibold text-purple-400">{item.attr}</span>
                      <span className="text-[10px] text-slate-500"> · {item.desc}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-600 flex-shrink-0">{item.mitre}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Blast Radius */}
        <BlastRadiusView />

        {/* Weak ACL Findings */}
        <div className="bg-surface-2 rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/15 rounded-lg">
              <Unlock size={16} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Weak ACL Findings (AC-4)</h3>
              <p className="text-xs text-slate-500">Objects with unauthorized write/modify permissions on sensitive files</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              {
                object: 'C:\\Jenkins\\scripts\\deploy.bat',
                type: 'File',
                weakPerm: 'svc-jenkins has WRITE by Domain Users',
                risk: 'Binary replacement / persistence',
                severity: 'critical' as const,
              },
              {
                object: 'HKLM\\SYSTEM\\CurrentControlSet\\Services\\Jenkins',
                type: 'Registry Key',
                weakPerm: 'IT-Support-Group has FULL_CONTROL',
                risk: 'Service hijacking for privilege escalation',
                severity: 'critical' as const,
              },
              {
                object: 'C:\\ProgramData\\Docker\\config.json',
                type: 'File',
                weakPerm: 'Domain Users can READ (contains registry auth)',
                risk: 'Container registry credential exposure',
                severity: 'high' as const,
              },
            ].map((finding, i) => (
              <div key={i} className="p-3 bg-amber-950/10 border border-amber-500/15 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge label={finding.type} variant="neutral" size="sm" />
                      <Badge label={finding.severity} variant={finding.severity} size="sm" />
                    </div>
                    <p className="text-[10px] font-mono text-slate-300 mb-1 break-all">{finding.object}</p>
                    <p className="text-[10px] text-slate-500">{finding.weakPerm}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ChevronRight size={10} className="text-red-400" />
                      <p className="text-[10px] text-red-400 font-semibold">{finding.risk}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel – AD Object Detail */}
      <div className="w-72 flex-shrink-0 border-l border-border bg-surface-1 flex flex-col overflow-y-auto">
        {selectedAD ? (
          <>
            <div className="px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <Badge label={selectedAD.type} variant="neutral" />
                {selectedAD.hasWeakACL && <Badge label="Weak ACL" variant="critical" size="sm" />}
              </div>
              <h3 className="text-sm font-semibold text-slate-200 font-mono">{selectedAD.name}</h3>
              <div
                className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded inline-flex mt-1"
                style={{
                  backgroundColor: `${privilegeColors[selectedAD.privilegeLevel]}20`,
                  color: privilegeColors[selectedAD.privilegeLevel],
                }}
              >
                {privilegeLabels[selectedAD.privilegeLevel]}
              </div>
            </div>

            <div className="p-4 space-y-4">
              {selectedAD.memberOf && selectedAD.memberOf.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">Member Of</p>
                  {selectedAD.memberOf.map((g, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1.5 px-2 py-1.5 bg-surface-3 rounded">
                      <Users size={10} className="text-purple-400" />
                      <span className="text-[10px] font-mono text-slate-300">{g}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedAD.controls && selectedAD.controls.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-600 mb-2">Controls / Manages</p>
                  {selectedAD.controls.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1.5 px-2 py-1.5 bg-surface-3 rounded">
                      <Lock size={10} className="text-amber-400" />
                      <span className="text-[10px] font-mono text-slate-300">{c}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedAD.hasWeakACL && (
                <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={12} className="text-red-400" />
                    <span className="text-xs font-semibold text-red-400">Weak ACL Detected</span>
                  </div>
                  <p className="text-[10px] text-slate-400">This object has ACL permissions allowing unauthorized binary modification or service tampering.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <User size={40} className="text-slate-700 mb-3" />
            <p className="text-sm font-semibold text-slate-400">Select an AD Object</p>
            <p className="text-xs text-slate-600 mt-1">to view membership, controls, and ACL findings</p>
          </div>
        )}
      </div>
    </div>
  );
}
