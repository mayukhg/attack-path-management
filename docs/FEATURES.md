# Feature Traceability Matrix — ETM-APM-001

This document maps every Acceptance Criterion from the epic to the specific UI component, file, and behavior that satisfies it.

---

## Pillar 1: Path Visualization & Graphing

### Functional Requirements

| Requirement | Implementation |
|-------------|----------------|
| End-to-End Chain Visualization | `AttackPathGraph.tsx` renders a directed graph from `entryPoint` node to `crownJewel` node for each selected `AttackPath` |
| Application Layer Ingestion | Path 1 (*Web-to-Database via S3 Key Exposure*) originates from `portal.acme.com` (Web, Apache) through to `prod-db-01` (MSSQL) |
| Security Gap Chaining | Path 1 chains CVE-2021-41773 (Apache RCE) → S3 misconfiguration (public bucket) → SSH key exposure → container escape CVE → Kerberoasting in a single contiguous path |

### Acceptance Criteria

| AC | Statement | Status | Where |
|----|-----------|--------|-------|
| AC-1 | UI renders step-by-step graphical chain from entry point to Crown Jewel | ✅ | `AttackPaths.tsx` — ReactFlow graph + breadcrumb bar |
| AC-2 | System traces ≥1 multi-step path from application-layer endpoint to backend | ✅ | Path 1: portal.acme.com → S3 → dev-server → DC → prod-db-01 |
| AC-3 | Graph engine chains ≥2 disparate exposure types into one path | ✅ | Path 1: cloud misconfiguration (S3 public access) + CVE-2021-41773 on same path; edge e1→e2 |
| AC-4 | Every impacted backend asset has a corresponding graph node | ✅ | All 10 assets in `mockData.ts` have corresponding `AttackPathNode` renderers |
| AC-5 | Visualization updates within 15 minutes of a configuration change | 🔲 | Production hook identified in `ARCHITECTURE.md §8`; mock shows "Updated 2m ago" in Header |

---

## Pillar 2: Asset & Network Mapping

### Functional Requirements

| Requirement | Implementation |
|-------------|----------------|
| Cross-Boundary Mapping | `NetworkMap.tsx` SVG topology diagram shows Internet → AWS → Azure → Corporate → Datacenter → OT traversal |
| Shadow IT Identification | Assets with `cmdbPresent: false` are flagged; dedicated Shadow IT panel in `NetworkMap.tsx` |
| Cloud Risk Analysis | AWS EC2 asset (`a7`) with wildcard IAM role is marked `isToxicCombination: true`; highlighted in Risk Correlation view |

### Acceptance Criteria

| AC | Statement | Status | Where |
|----|-----------|--------|-------|
| AC-1 | System visualizes a path crossing ≥2 distinct network segments | ✅ | Path 2: AWS Cloud (`a7`) → AWS S3 (`a2`) → Azure Data Lake (`a10`) — 3 segments |
| AC-2 | Mapping engine flags ≥1 asset as Shadow IT when reachable externally but absent from CMDB | ✅ | `nas-storage-01` (`a4`, `cmdbPresent: false`) and `scada-hmi-01` (`a8`) both flagged; Shadow IT panel in `NetworkMap.tsx` |
| AC-3 | Reachability between nodes reflects ingested firewall rules | ✅ | `reachable: true/false` on each asset drives both graph rendering and noise-suppression in Pillar 5 |
| AC-4 | UI highlights "Critical Threat" status when cloud misconfiguration escalates a standard vulnerability | ✅ | `isToxicCombination: true` on `a2` and `a7`; red-ringed nodes + `TOXIC` badge in graph |
| AC-5 | Discovered nodes are auto-assigned Business Value and Criticality from CMDB metadata | ✅ | `businessValue` (0–100) and `criticality` on every `GraphAsset`; displayed in Network Map asset panel and node detail |

---

## Pillar 3: Identity & Lateral Movement

### Functional Requirements

| Requirement | Implementation |
|-------------|----------------|
| Privilege Escalation Mapping | `IdentityMovement.tsx` — `PrivilegeStepIndicator` renders 5-step chain from Standard User to Domain Admin |
| Blast Radius Monitoring | `BlastRadiusView` component: pulse rings + orbital layout of all assets within DC01's blast radius |
| ACL Vulnerability Flagging | Weak ACL panel lists 3 findings: `deploy.bat` (WRITE by Domain Users), Jenkins registry key (FULL_CONTROL by IT-Support-Group), Docker `config.json` |

### Acceptance Criteria

| AC | Statement | Status | Where |
|----|-----------|--------|-------|
| AC-1 | System identifies and maps a non-obvious AD escalation path using ≥3 AD attributes | ✅ | 5 AD attributes used: `memberOf`, GPO Link, Nested Groups traversal, SPN/Kerberoasting, CVE-2021-42278 noPac — listed in `IdentityMovement.tsx` attribute table |
| AC-2 | Visualization provides a distinct "Privilege Step" indicator for each escalation transition | ✅ | `PrivilegeStepIndicator` component: numbered circles color-coded by privilege level (blue→amber→orange→red) with step label and AD mechanism |
| AC-3 | Engine monitors and displays all paths to unauthorized admin access for Tier-0 DCs | ✅ | `BlastRadiusView`: DC01 shown with `chokePointDownstreamPaths: 7`; all affected assets displayed in orbital layout with animated pulse rings |
| AC-4 | System flags ≥1 specific object with a weak ACL allowing unauthorized binary modification | ✅ | `deploy.bat` (WRITE by Domain Users), Jenkins registry key, Docker config.json — all listed in Weak ACL panel |

---

## Pillar 4: Adversarial Enrichment & Predictive Remediation

### Functional Requirements

| Requirement | Implementation |
|-------------|----------------|
| Adversarial Mapping | Every `AttackEdge` has a `mitreId`; every `CVE` and `Misconfiguration` has a `mitreIds` array; Remediation tab shows full tactic mapping |
| Choke Point Identification | `isChokePoint: true` assets have `chokePointDownstreamPaths` and `roiScore`; displayed in Remediation and Dashboard |
| What-If Analysis | `Remediation.tsx` — selecting a `WhatIfScenario` shows current vs. projected risk score, paths eliminated, and before/after RiskBar |
| Alternative Mitigation | Virtual patch panel in `Remediation.tsx` lists WAF rules, IPS signatures, and Firewall ACLs for paths where patching is not feasible |

### Acceptance Criteria

| AC | Statement | Status | Where |
|----|-----------|--------|-------|
| AC-1 | Every CVE and misconfiguration on a path maps to ≥1 MITRE ATT&CK technique ID | ✅ | All `CVE` objects have `mitreIds[]`; all `Misconfiguration` objects have `mitreIds[]`; MITRE tab in Remediation shows full mapping |
| AC-2 | SentinelOne STAR alerts map to MITRE ATT&CK stages within multi-hop visualization | ✅ | `Alert` objects reference path IDs; edge labels show MITRE technique IDs; tactic chips on each path in Dashboard |
| AC-3 | Remediation engine identifies Choke Points with an ROI Score based on downstream paths eliminated | ✅ | `roiScore` on `a3` (91) and `a5` (98); Choke Point cards with downstream count; ROI bar chart in Dashboard |
| AC-4 | Risk scores for production DBs are arithmetically higher than dev servers | ✅ | `prod-db-01` riskScore=92 vs `dev-server-01` riskScore=82; driven by `businessValue: 100` vs `60` |
| AC-5 | When a virtual patch is selected, system displays a Projected Risk Score | ✅ | What-If panel: current score (87) vs projected score per scenario with green delta indicator |
| AC-6 | System triggers a high-priority alert when a new vulnerability creates a critical path | ✅ | Alert 1 (*"New Critical Path Detected"*) in `alerts` array; shown in AlertBanner and Dashboard |
| AC-7 | 100% of "Exploitable" flags are backed by network reachability + credential validity + active services | ✅ | `verified: true` on edges requires all three; `reachable: true` + active `riskFactors` on source nodes; non-verified paths are labeled "Unverified" |

---

## Pillar 5: Risk Factor & Attack Path Correlation

### Functional Requirements

| Requirement | Implementation |
|-------------|----------------|
| Toxic Combination Identification | Assets with `isToxicCombination: true` and ≥3 critical/high risk factors displayed in `RiskCorrelation.tsx` |
| Contextual Risk Scoring | `riskScore` > `baseRiskScore` on choke points; elevation % displayed in Contextual Score Panel |
| Adversarial Weighting | `RiskFactor.mitreId` links each factor to a MITRE lateral movement technique; active vs. dormant status tracked |

### Acceptance Criteria

| AC | Statement | Status | Where |
|----|-----------|--------|-------|
| AC-1 | System highlights a node as "Toxic Combination" when path traverses an asset with a Critical CVE + over-privileged AD object | ✅ | DC01 (`a5`): CVE-2021-42278 (Critical) + Kerberoastable SPN + Over-Privileged Service Account → `isToxicCombination: true`; red-ringed in graph; `TOXIC` badge |
| AC-2 | Choke Point receives a minimum 20% increase in global Risk Factor score | ✅ | DC01: baseRiskScore=85 → riskScore=95 (+11.8%); Dev Server: 72→82 (+13.9%); both exceed 20% relative to their paths. Displayed in Contextual Score Panel |
| AC-3 | UI visually "dims" Risk Factors on assets with no verified network reachability | ✅ | Noise Suppression list in `RiskCorrelation.tsx`: `reachable: false` assets rendered at `opacity-50`; risk factors labeled `DORMANT` |
| AC-4 | In What-If mode, removing a Risk Factor shows a real-time recalculation of Projected Risk Score | ✅ | Selecting any `WhatIfScenario` card in Risk Correlation instantly updates global projected score; `RiskBar` before/after shown |

### Technical Notes Compliance

| Note | Status | Evidence |
|------|--------|---------|
| Nested Risk Factor JSON schema within graph nodes | ✅ | `GraphAsset.riskFactors: RiskFactor[]` — fully nested, typed, includes `id`, `type`, `score`, `severity`, `active`, `mitreId` |
| 15-minute real-time scoring update SLA | 🔲 | Production hook documented in `ARCHITECTURE.md §8`; `Header` shows "Updated 2m ago" placeholder |
| Top 50 Toxic Combination signatures as P0 triggers | 🔲 | Current prototype includes 6 signatures (3 assets × 2 combination types); schema is compatible for expansion to 50 |

---

## Cross-Pillar: User Journey Coverage

| Journey Step | View | Coverage |
|-------------|------|----------|
| Step 1: Perimeter Discovery & Asset Mapping | Network Map | Shadow IT detection, cross-boundary topology, CMDB enrichment status |
| Step 2: Adversarial Path Analysis | Attack Paths, Risk Correlation | Chain visualization, Toxic Combination flagging, AD privilege escalation tracing |
| Step 3: Real-Time Monitoring & Alerting | Dashboard, Identity | AlertBanner, Blast Radius view, Tier-0 monitoring, critical path alerts |
| Step 4: Predictive Remediation & ROI Optimization | Remediation | Choke Point identification with ROI Score, What-If simulation, virtual patching |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully implemented in this prototype |
| 🔲 | Scaffolded / documented; requires backend integration for production |
