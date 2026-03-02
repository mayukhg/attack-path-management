# Qualys TrueRisk — Attack Path Management (APM)

**Epic:** ETM-APM-001 | **Priority:** P0 | **Target:** Q3 2026 | **Squad:** Attack Path Engineering & Threat Research

A React/TypeScript prototype demonstrating the five capability pillars of the Enterprise TrueRisk Attack Path Management module. The application provides a graph-based understanding of adversarial risk by correlating weak credentials, CVEs, and cloud misconfigurations into unified, actionable attack paths.

---

## Quick Start

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Installation & Run

```bash
# 1. Navigate to the project directory
cd "Attack Path"

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Other Commands

```bash
# Type-check without running
npx tsc --noEmit

# Build for production
npm run build

# Preview the production build
npm run preview
```

---

## What Was Built

### Application Overview

A fully-functional, dark-themed security intelligence dashboard implementing all five pillars defined in the ETM-APM-001 epic. The app uses realistic mock data representing a simulated enterprise environment with 10 assets, 4 verified attack paths, 8 AD objects, and 5 what-if remediation scenarios.

### Screen-by-Screen Summary

#### Dashboard — Executive Overview
- Global TrueRisk score with 30-day trend chart (Recharts `LineChart`)
- 8 KPI metric cards: Critical Paths, Crown Jewels at Risk, Shadow IT count, Toxic Combinations, Choke Points, Internet-reachable assets, paths eliminated, avg. remediation time
- Live dismissible alert banner with pulse animation for unacknowledged alerts
- Active attack paths summary table with severity badges and MITRE tactic chips
- Remediation ROI horizontal bar chart comparing choke-point impact
- Severity distribution pie chart

#### Attack Paths — Pillar 1: Path Visualization & Graphing
- Interactive ReactFlow (`@xyflow/react`) graph with custom node and edge renderers
- 4 selectable attack paths rendered as directed graphs from entry point to Crown Jewel
- Custom node types: `entryPoint` (red), `pivot` (orange), `crownJewel` (amber), `identity` (purple), `cloud` (sky), `shadowIT` (fuchsia), `ot` (emerald)
- Custom animated edges color-coded by exploit type: `exploit`, `lateral`, `escalation`, `misconfiguration`, `credential`
- MITRE technique ID labels on every edge; full technique description on edge click
- Choke Point nodes ringed with purple glow + lightning icon; Toxic Combination nodes with red ring
- Node detail side panel: asset metadata, CVEs, misconfigurations, risk factors, business value
- Attack chain breadcrumb bar for quick path navigation
- MiniMap with color-coded nodes; zoom/pan controls

#### Network Map — Pillar 2: Asset & Network Mapping
- Cross-boundary topology diagram showing Internet → AWS → Azure → Corporate → Datacenter → OT traversal with dashed attack vectors
- Six network segment boundary cards (Internet, AWS Cloud, Azure Cloud, Corporate LAN, Datacenter, OT/ICS) with per-segment asset counts, Shadow IT counts, and toxic combination counts
- Shadow IT detection panel flagging all assets absent from CMDB but reachable from the internet
- Asset inventory right panel with CMDB status (✓/✗), business value, owner, risk score, and segment filtering

#### Identity & Lateral Movement — Pillar 3
- AD Object browser (Users, Groups, GPOs, OUs, Computers) with privilege level color-coding
- 5-step privilege escalation chain visualization: Standard User → Local Admin → SYSTEM → Domain Admin, with the specific AD attribute used at each hop
- AD attribute inventory proving AC-1 (≥3 AD attributes used): `memberOf`, GPO Link, Nested Groups, SPN/Kerberoasting, noPac CVE
- Animated Blast Radius view around DC01 (Tier-0): pulse rings + orbital layout of all assets within blast radius
- Weak ACL findings panel: specific files, registry keys, and folders with unauthorized write permissions

#### Remediation — Pillar 4: Adversarial Enrichment & Predictive Remediation
- Choke Point cards with downstream path count and ROI Score; bar chart showing remediation priority
- What-If simulation panel: select a scenario → see current risk vs. projected risk, paths eliminated, and a before/after RiskBar comparison
- Alternative mitigation suggestions (WAF rules, IPS signatures, Firewall ACLs) for assets that cannot be patched
- MITRE ATT&CK enrichment table: every technique mapped to its tactic stage with technique ID badges
- Virtual patch simulation: displays "Projected Risk Score" as if mitigation is already active

#### Risk Correlation — Pillar 5: Risk Factor & Attack Path Correlation
- Toxic Combination cards: expandable list of all intersecting critical risk factors per node, with ACTIVE/DORMANT status
- Contextual Risk Score panel for every asset: base score → topological elevation % → final score
- Noise Suppression list: non-reachable assets visually dimmed, risk factors labeled DORMANT
- What-If recalculation: clicking a scenario instantly recalculates the projected global risk score
- Schema compliance checklist confirming Nested Risk Factor JSON, Reachability Correlation, Business Impact Weighting, Top-50 Toxic Signatures, and 15-min telemetry SLA markers

---

## Project Structure

```
Attack Path/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── README.md
├── docs/
│   ├── ARCHITECTURE.md        # Technical design & component map
│   └── FEATURES.md            # Epic AC → implementation traceability matrix
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx               # React entry point
    ├── App.tsx                # Root layout + view router
    ├── index.css              # Tailwind base + ReactFlow overrides
    ├── types/
    │   └── index.ts           # All TypeScript interfaces
    ├── data/
    │   └── mockData.ts        # 10 assets, 4 paths, 5 what-if, AD objects
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.tsx    # Navigation with pillar badges
    │   │   └── Header.tsx     # Sticky header + global risk score
    │   ├── shared/
    │   │   ├── Badge.tsx      # Severity / type / special badges
    │   │   ├── RiskScore.tsx  # Score orb + RiskBar component
    │   │   ├── MetricCard.tsx # KPI stat cards
    │   │   └── AlertBanner.tsx # Live dismissible alert strip
    │   └── graph/
    │       ├── AttackPathGraph.tsx  # ReactFlow canvas wrapper
    │       ├── CustomNode.tsx       # AttackPathNode renderer
    │       └── CustomEdge.tsx       # AttackEdgeComponent with MITRE labels
    └── views/
        ├── Dashboard.tsx
        ├── AttackPaths.tsx
        ├── NetworkMap.tsx
        ├── IdentityMovement.tsx
        ├── Remediation.tsx
        └── RiskCorrelation.tsx
```

---

## Mock Data Summary

| Entity | Count | Details |
|--------|-------|---------|
| Assets | 10 | Web Portal, S3 Bucket, Dev Server, Shadow NAS, Domain Controller, Prod DB, API Gateway, SCADA HMI, Workstation, Azure Data Lake |
| Attack Paths | 4 | Web-to-DB (Critical), API→Azure (Critical), Phishing→OT (Critical), Shadow NAS→DC (High) |
| Attack Edges | 10 | Cross-boundary hops with MITRE IDs and exploit type classification |
| CVEs | 5 | CVE-2021-41773, CVE-2019-5736, CVE-2020-0796, CVE-2021-42278, CVE-2017-0144 |
| Misconfigurations | 8 | S3 public access, IAM wildcard, Docker socket ACL, Kerberoastable SPNs, IT/OT flat network, etc. |
| AD Objects | 8 | Users, Groups (nested), GPOs, OUs |
| What-If Scenarios | 5 | Patch, WAF rule, Firewall ACL, Kerberoast remediation, S3 lockdown |
| Alerts | 5 | 3 unacknowledged (critical/high), 2 acknowledged |
| Network Boundaries | 6 | Internet, AWS, Azure, Corporate LAN, Datacenter, OT/ICS |
| MITRE Techniques | 12 | Mapped across all 5 ATT&CK phases present in paths |

---

## Technology Choices

| Dependency | Version | Purpose |
|------------|---------|---------|
| `react` | 18.x | UI framework |
| `typescript` | 5.x | Type safety |
| `vite` | 5.x | Build tool & dev server |
| `tailwindcss` | 3.x | Utility-first CSS, custom dark theme |
| `@xyflow/react` | 12.x | Interactive graph canvas for attack paths |
| `recharts` | 2.x | Risk trend, severity, and ROI charts |
| `lucide-react` | 0.44x | Icon library |
| `clsx` | 2.x | Conditional class composition |

---

## Acceptance Criteria Coverage

See [`docs/FEATURES.md`](docs/FEATURES.md) for the full traceability matrix mapping each Epic AC to the specific UI component that satisfies it.

---

## Phase Rollout Status

| Phase | Scope | Status |
|-------|-------|--------|
| Phase 1 — Foundation & Visibility | End-to-end chain visualization, node metadata, cross-boundary mapping, CMDB enrichment | Implemented |
| Phase 2 — Identity & Multi-Vector Correlation | AD privilege escalation, security gap chaining, toxic combinations | Implemented |
| Phase 3 — Predictive Remediation & Real-Time Intelligence | What-If analysis, choke point identification, telemetry hooks, virtual patching | Implemented |
