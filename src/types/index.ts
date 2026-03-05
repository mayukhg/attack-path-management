export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type NodeType =
  | 'entryPoint'
  | 'pivot'
  | 'crownJewel'
  | 'identity'
  | 'cloud'
  | 'shadowIT'
  | 'ot'
  | 'firewall';

export type NetworkSegment = 'internet' | 'dmz' | 'corporate' | 'cloud-aws' | 'cloud-azure' | 'ot' | 'datacenter';

export type PrivilegeLevel = 'anonymous' | 'standard' | 'local-admin' | 'system' | 'domain-admin';

export interface CVE {
  id: string;
  cvss: number;
  severity: Severity;
  description: string;
  mitreIds: string[];
  exploitable: boolean;
}

export interface Misconfiguration {
  id: string;
  title: string;
  severity: Severity;
  category: 'cloud' | 'firewall' | 'ad' | 'acl' | 'iam';
  mitreIds: string[];
}

export interface RiskFactor {
  id: string;
  type: 'cve' | 'misconfiguration' | 'credential' | 'iam' | 'acl' | 'exposure';
  title: string;
  score: number;
  severity: Severity;
  active: boolean;
  mitreId?: string;
}

export interface ADObject {
  id: string;
  type: 'user' | 'group' | 'gpo' | 'ou' | 'computer';
  name: string;
  privilegeLevel: PrivilegeLevel;
  memberOf?: string[];
  controls?: string[];
  hasWeakACL?: boolean;
}

export interface GraphAsset {
  id: string;
  label: string;
  type: NodeType;
  ip?: string;
  hostname?: string;
  os?: string;
  services: string[];
  ports: number[];
  segment: NetworkSegment;
  criticality: Severity;
  businessValue: number;
  owner?: string;
  cmdbPresent: boolean;
  riskScore: number;
  baseRiskScore: number;
  vulnerabilities: CVE[];
  misconfigurations: Misconfiguration[];
  riskFactors: RiskFactor[];
  adObject?: ADObject;
  isChokePoint: boolean;
  isToxicCombination: boolean;
  isShadowIT: boolean;
  reachable: boolean;
  chokePointDownstreamPaths?: number;
  roiScore?: number;
  privilegeLevel?: PrivilegeLevel;
  mitreIds: string[];
}

export interface AttackEdge {
  id: string;
  source: string;
  target: string;
  technique: string;
  mitreId: string;
  exploitType: 'exploit' | 'lateral' | 'escalation' | 'misconfiguration' | 'credential';
  verified: boolean;
  probability: number;
}

export interface AttackPath {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  nodes: string[];
  edges: AttackEdge[];
  entryPoint: string;
  crownJewel: string;
  riskScore: number;
  verified: boolean;
  lastUpdated: string;
  mitreTactics: string[];
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  timestamp: string;
  pathId?: string;
  assetId?: string;
  acknowledged: boolean;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  removedRiskFactors: string[];
  projectedRiskScore: number;
  eliminatedPaths: number;
  eliminatedNodes: string[];
  mitigationType: 'patch' | 'waf' | 'ips' | 'firewall' | 'disable';
  mitigation?: string;
}

export interface MITREMapping {
  techniqueId: string;
  techniqueName: string;
  tactic: string;
  description: string;
}

export interface NetworkBoundary {
  id: string;
  name: string;
  type: NetworkSegment;
  color: string;
  assets: string[];
}

export type ViewId =
  | 'dashboard'
  | 'attack-paths'
  | 'network-map'
  | 'identity'
  | 'remediation'
  | 'risk-correlation'
  | 'ciso'
  | 'security-architect'
  | 'remediation-manager'
  | 'soc-analyst'
  | 'vulnerability-manager'
  | 'red-team'
  | 'grc-compliance';

export interface ComplianceControl {
  id: string;
  framework: 'ISO27001' | 'SOC2' | 'NIST-CSF';
  controlId: string;
  title: string;
  status: 'compliant' | 'at-risk' | 'non-compliant';
  linkedAssets: string[];
  evidenceAvailable: boolean;
  lastAudit: string;
  remediationEvidence?: string;
}

export interface SOCEvent {
  id: string;
  timestamp: string;
  source: 'EDR' | 'CloudTrail' | 'SIEM' | 'IDS';
  asset: string;
  technique: string;
  mitreId: string;
  severity: Severity;
  pathId?: string;
  description: string;
  investigated: boolean;
}

export interface VulnPathImpact {
  cveId: string;
  cvss: number;
  cvssRank: number;
  pathImpactRank: number;
  pathsAffected: number;
  assetsExposed: number;
  exploitable: boolean;
  patchBreaksChains: number;
  description: string;
  severity: Severity;
}

export interface RedTeamFinding {
  id: string;
  title: string;
  technique: string;
  mitreId: string;
  discoveredBy: 'platform' | 'manual' | 'both';
  severity: Severity;
  verified: boolean;
  pathId?: string;
  notes?: string;
}

export interface CrownJewelRisk {
  assetId: string;
  assetName: string;
  breachProbability: number;
  hopsFromInternet: number;
  financialImpact: number;
  pathCount: number;
  trend: 'up' | 'down' | 'stable';
  trendDelta: number;
}
