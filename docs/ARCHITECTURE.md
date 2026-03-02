# Technical Architecture — Attack Path Management

**Epic:** ETM-APM-001 | **Stack:** React 18 + TypeScript + Vite

---

## 1. Application Architecture

The app is a single-page application (SPA) with a sidebar-driven navigation model. There is no backend — all data is served from typed mock data in `src/data/mockData.ts` to simulate what the production backend API would deliver.

```
┌─────────────────────────────────────────────────────────────────────┐
│                           App.tsx (Root)                            │
│  ┌──────────────┐  ┌───────────────────────────────────────────┐   │
│  │   Sidebar    │  │            Header (sticky)                │   │
│  │  (nav, 6     │  │  Title · Description · Global Risk Score  │   │
│  │   items)     │  └───────────────────────────────────────────┘   │
│  │              │  ┌───────────────────────────────────────────┐   │
│  │              │  │              ActiveView                   │   │
│  │              │  │  (Dashboard | AttackPaths | NetworkMap    │   │
│  │              │  │   | IdentityMovement | Remediation        │   │
│  │              │  │   | RiskCorrelation)                      │   │
│  └──────────────┘  └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Routing

Routing is handled by a simple `ViewId` union type and a `switch` statement in `App.tsx`. No react-router is needed because the app has no URL-addressable deep links in the prototype phase.

```typescript
// src/types/index.ts
type ViewId =
  | 'dashboard'
  | 'attack-paths'
  | 'network-map'
  | 'identity'
  | 'remediation'
  | 'risk-correlation';
```

---

## 2. Data Model

All interfaces are defined in `src/types/index.ts`. The central entity is `GraphAsset`, which acts as a graph node:

### GraphAsset (Graph Node)

```typescript
interface GraphAsset {
  id: string;
  label: string;
  type: NodeType;           // entryPoint | pivot | crownJewel | identity | cloud | shadowIT | ot | firewall
  ip?: string;
  hostname?: string;
  os?: string;
  services: string[];
  ports: number[];
  segment: NetworkSegment;  // internet | dmz | corporate | cloud-aws | cloud-azure | ot | datacenter
  criticality: Severity;    // critical | high | medium | low | info
  businessValue: number;    // 0–100, maps to CMDB business criticality
  owner?: string;
  cmdbPresent: boolean;     // false → Shadow IT
  riskScore: number;        // topologically-adjusted final score
  baseRiskScore: number;    // score before choke-point elevation
  vulnerabilities: CVE[];
  misconfigurations: Misconfiguration[];
  riskFactors: RiskFactor[]; // nested JSON schema per Pillar 5 requirement
  adObject?: ADObject;
  isChokePoint: boolean;
  isToxicCombination: boolean;
  isShadowIT: boolean;
  reachable: boolean;       // false → noise suppression (Pillar 5 AC-3)
  chokePointDownstreamPaths?: number;
  roiScore?: number;
  privilegeLevel?: PrivilegeLevel;
  mitreIds: string[];
}
```

### AttackPath (Graph Walk)

```typescript
interface AttackPath {
  id: string;
  nodes: string[];          // ordered asset IDs from entry point to Crown Jewel
  edges: AttackEdge[];      // directed connections between node pairs
  entryPoint: string;       // first node ID
  crownJewel: string;       // last node ID
  riskScore: number;
  verified: boolean;
  mitreTactics: string[];
}
```

### RiskFactor (Nested JSON — Pillar 5 Schema)

```typescript
interface RiskFactor {
  id: string;
  type: 'cve' | 'misconfiguration' | 'credential' | 'iam' | 'acl' | 'exposure';
  title: string;
  score: number;
  severity: Severity;
  active: boolean;          // false → dormant (isolated from any reachable path)
  mitreId?: string;
}
```

---

## 3. Graph Engine (ReactFlow)

The attack path graph uses `@xyflow/react` v12 with two custom renderers.

### Node Pipeline

```
GraphAsset (mockData)
    ↓ assetToNode()
Node<AttackPathNode.data>   ← positions[] lookup for deterministic layout
    ↓ useNodesState()
ReactFlow canvas
```

**Node synchronization:** `useEffect` hooks in `AttackPathGraph.tsx` call `setNodes(initialNodes)` and `setEdges(initialEdges)` whenever `selectedPath` or `patchedNodes` changes. This is required because `useNodesState` / `useEdgesState` only read their argument once on mount.

```typescript
// AttackPathGraph.tsx
useEffect(() => { setNodes(initialNodes); }, [initialNodes, setNodes]);
useEffect(() => { setEdges(initialEdges); }, [initialEdges, setEdges]);
```

### Custom Node: `AttackPathNode`

Located in `src/components/graph/CustomNode.tsx`. Each node renders:
- Icon (type-specific via `nodeIcons` map)
- Label, segment, services (up to 2 shown, remainder as `+N`)
- Risk score badge (color-coded: red ≥85, orange ≥70, amber ≥50, blue <50)
- Special badges: `CHOKE`, `TOXIC`, `SHADOW`, `CROWN`
- Vulnerability count indicator
- Purple ring for choke points, red ring for toxic combinations
- `PATCHED` overlay when the node is in the `patchedNodes` set (for What-If mode)

### Custom Edge: `AttackEdgeComponent`

Located in `src/components/graph/CustomEdge.tsx`. Uses `getBezierPath` from ReactFlow with:
- Color per `exploitType` (exploit=red, lateral=orange, escalation=purple, misconfiguration=amber, credential=cyan)
- Dashed stroke for `lateral` and `misconfiguration` types
- `animated` prop on `exploit` and `escalation` edges (marching ants)
- MITRE technique ID label always visible; full technique description shown when edge is selected
- SVG `<marker>` arrowheads, one per exploit type color, defined as `url(#arrowhead-{type})`

### Fixed Layout Positions

Nodes use a hard-coded `positions` map (keyed by asset ID) to produce a left-to-right attack chain layout that respects the Internet→Cloud→Corporate→Datacenter boundary order:

```typescript
const positions: Record<string, { x: number; y: number }> = {
  a1: { x: 0,    y: 200 },   // Internet entry points
  a7: { x: 0,    y: 420 },
  a9: { x: 0,    y: 620 },
  a2: { x: 280,  y: 120 },   // Cloud pivot
  a3: { x: 560,  y: 300 },   // Corporate pivot (choke point)
  a4: { x: 560,  y: 520 },   // Shadow IT
  a5: { x: 840,  y: 200 },   // Domain Controller (choke point)
  a8: { x: 840,  y: 480 },   // OT SCADA
  a6: { x: 1120, y: 100 },   // Crown Jewels
  a10:{ x: 1120, y: 380 },
};
```

---

## 4. Component Hierarchy

```
App
├── Sidebar
│   └── NavItem × 6
├── Header
│   └── RiskScore (sm)
└── ActiveView
    ├── Dashboard
    │   ├── AlertBanner
    │   │   └── Alert × N
    │   ├── MetricCard × 8
    │   ├── LineChart (Recharts)
    │   ├── PieChart (Recharts)
    │   ├── BarChart (Recharts) – ROI
    │   └── AttackPath row × 4
    │
    ├── AttackPaths
    │   ├── Path list (AttackPath × 4)
    │   ├── AttackPathGraph
    │   │   ├── ReactFlow
    │   │   │   ├── AttackPathNode × N
    │   │   │   └── AttackEdgeComponent × N
    │   │   ├── Background (dots)
    │   │   ├── Controls
    │   │   └── MiniMap
    │   └── Node detail panel
    │
    ├── NetworkMap
    │   ├── NetworkDiagram (SVG)
    │   ├── BoundaryCard × 6
    │   ├── Shadow IT panel
    │   └── Asset inventory list
    │
    ├── IdentityMovement
    │   ├── ADObjectCard × 8
    │   ├── PrivilegeStepIndicator (5 steps)
    │   ├── BlastRadiusView (circular orbital)
    │   └── Weak ACL findings
    │
    ├── Remediation
    │   ├── Tabs: Choke Points | What-If | MITRE
    │   ├── ChokePointCard × 2
    │   ├── WhatIfCard × 5
    │   ├── What-If impact summary panel
    │   ├── Choke point detail panel
    │   ├── MITRE ATT&CK tactic table
    │   └── Alternative mitigation list
    │
    └── RiskCorrelation
        ├── Summary metric cards × 4
        ├── ToxicCombinationCard × 3
        ├── ContextualScorePanel × 6
        ├── What-If recalculation grid
        └── Noise suppression list
```

---

## 5. Styling System

### Dark Theme Palette

Defined in `tailwind.config.js` under `theme.extend.colors`:

| Token | Hex | Usage |
|-------|-----|-------|
| `surface-0` | `#0a0d14` | Page background |
| `surface-1` | `#0f1320` | Sidebar, panels |
| `surface-2` | `#151b2e` | Cards |
| `surface-3` | `#1e2640` | Card rows, list items |
| `surface-4` | `#252f4a` | Hover states |
| `border` | `#2a3350` | Default border |
| `border-light` | `#3d4f70` | Hover borders |
| `critical` | `#ef4444` | Red — P0 severity |
| `high` | `#f97316` | Orange |
| `medium` | `#f59e0b` | Amber |
| `low` | `#3b82f6` | Blue |
| `safe` | `#10b981` | Green — remediated |
| `crown` | `#fbbf24` | Crown Jewel gold |
| `shadow-it` | `#a855f7` | Shadow IT purple |

### Node Type Colors

| Node Type | Border | Icon | Glow |
|-----------|--------|------|------|
| entryPoint | red-500 | red-400 | red-500/20 |
| pivot | orange-500 | orange-400 | orange-500/20 |
| crownJewel | amber-400 | amber-400 | amber-400/30 |
| identity | purple-500 | purple-400 | purple-500/20 |
| cloud | sky-500 | sky-400 | sky-500/20 |
| shadowIT | fuchsia-500 | fuchsia-400 | fuchsia-500/20 |
| ot | emerald-500 | emerald-400 | emerald-500/20 |

### Risk Score Color Thresholds

| Score Range | Color |
|-------------|-------|
| ≥ 85 | `text-red-400` |
| ≥ 70 | `text-orange-400` |
| ≥ 50 | `text-amber-400` |
| < 50 | `text-blue-400` |

---

## 6. Shared Components

### `<Badge>`
Renders a small uppercase monospace pill. Accepts `variant` matching any `Severity` value plus special types: `toxic`, `choke`, `shadow`, `crown`. Supports `pulse` for an animated live indicator dot.

### `<RiskScore>`
Renders a square score orb in three sizes (`sm`, `md`, `lg`). Color and glow are derived from the score value. Used in headers, cards, and the graph detail panel.

### `<RiskBar>`
A horizontal progress bar showing a score from 0–100. Accepts an optional `projected` value to overlay an emerald bar representing what-if reduction.

### `<MetricCard>`
KPI stat card with title, large metric value, subtitle, trend indicator, and a severity-colored icon. Uses `severity` prop to drive border color and icon background.

### `<AlertBanner>`
Dismissible alert strip at the top of the Dashboard. Shows unacknowledged alerts; collapsed by default with a chevron expand toggle.

---

## 7. State Management

No external state library is used. State is local to each view component:

| View | State |
|------|-------|
| `AttackPaths` | `selectedPath`, `selectedNode` |
| `NetworkMap` | `selectedBoundary` |
| `IdentityMovement` | `selectedAD` |
| `Remediation` | `selectedScenario`, `selectedChoke`, `activeTab` |
| `RiskCorrelation` | `selectedScenario` |
| `App` | `activeView` |

For a production implementation, `selectedPath`, active alerts, and the global risk score would be promoted to a context provider or a lightweight store (Zustand / Jotai).

---

## 8. Production Integration Points

The following hooks are ready to be replaced with real API calls:

| Mock Data Export | Production Source |
|-----------------|-------------------|
| `assets` | Attack Path Engine — `/api/v1/assets` |
| `attackPaths` | Graph Engine — `/api/v1/paths` |
| `alerts` | Alert Service — `/api/v1/alerts` (WebSocket for real-time) |
| `adObjects` | AD Ingestion Service — `/api/v1/ad-objects` |
| `whatIfScenarios` | Simulation Engine — `POST /api/v1/simulate` |
| `mitreMappings` | Threat Research Service — `/api/v1/mitre` |
| `networkBoundaries` | CMDB / Firewall Ingestion — `/api/v1/network` |

The 15-minute dynamic refresh SLA (Pillar 4 AC-6 / Pillar 5 Technical Notes) would be implemented via a `setInterval` polling loop or a WebSocket connection feeding into the above endpoints.
