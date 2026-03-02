import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Node,
  type Edge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AttackPathNode } from './CustomNode';
import { AttackEdgeComponent } from './CustomEdge';
import type { GraphAsset, AttackEdge, AttackPath } from '../../types';
import { assets } from '../../data/mockData';

const nodeTypes = { attackNode: AttackPathNode };
const edgeTypes = { attackEdge: AttackEdgeComponent };

function assetToNode(asset: GraphAsset, position: { x: number; y: number }, patchedNodes: Set<string>): Node {
  return {
    id: asset.id,
    type: 'attackNode',
    position,
    data: {
      label: asset.label,
      type: asset.type,
      riskScore: asset.riskScore,
      isChokePoint: asset.isChokePoint,
      isToxicCombination: asset.isToxicCombination,
      isShadowIT: asset.isShadowIT,
      segment: asset.segment,
      services: asset.services.slice(0, 3),
      vulnerabilities: asset.vulnerabilities,
      misconfigurations: asset.misconfigurations,
      criticality: asset.criticality,
      reachable: asset.reachable,
      privilegeLevel: asset.privilegeLevel,
      patched: patchedNodes.has(asset.id),
    },
  };
}

function edgeToFlow(ae: AttackEdge): Edge {
  return {
    id: ae.id,
    source: ae.source,
    target: ae.target,
    type: 'attackEdge',
    animated: ae.exploitType === 'exploit' || ae.exploitType === 'escalation',
    data: {
      mitreId: ae.mitreId,
      technique: ae.technique,
      exploitType: ae.exploitType,
      probability: ae.probability,
      verified: ae.verified,
    },
  };
}

// Layout positions for the main attack path scenario
const positions: Record<string, { x: number; y: number }> = {
  a1: { x: 0, y: 200 },
  a7: { x: 0, y: 420 },
  a9: { x: 0, y: 620 },
  a2: { x: 280, y: 120 },
  a3: { x: 560, y: 300 },
  a4: { x: 560, y: 520 },
  a5: { x: 840, y: 200 },
  a8: { x: 840, y: 480 },
  a6: { x: 1120, y: 100 },
  a10: { x: 1120, y: 380 },
};

interface AttackPathGraphProps {
  selectedPath: AttackPath | null;
  patchedNodes?: Set<string>;
  onNodeClick?: (assetId: string) => void;
}

export function AttackPathGraph({ selectedPath, patchedNodes = new Set(), onNodeClick }: AttackPathGraphProps) {
  const filteredAssets = useMemo(() => {
    if (!selectedPath) return assets;
    return assets.filter(a => selectedPath.nodes.includes(a.id));
  }, [selectedPath]);

  const initialNodes: Node[] = useMemo(() =>
    filteredAssets.map(asset => assetToNode(asset, positions[asset.id] ?? { x: Math.random() * 800, y: Math.random() * 400 }, patchedNodes)),
    [filteredAssets, patchedNodes]
  );

  const initialEdges: Edge[] = useMemo(() => {
    if (!selectedPath) return [];
    return selectedPath.edges.map(edgeToFlow);
  }, [selectedPath]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full bg-surface-0 rounded-xl overflow-hidden border border-border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, includeHiddenNodes: false }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.75 }}
        minZoom={0.3}
        maxZoom={2}
        onNodeClick={(_, node) => onNodeClick?.(node.id)}
        className="bg-surface-0"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#1e293b"
        />
        <Controls
          className="!bg-surface-2 !border-border [&>button]:!bg-surface-2 [&>button]:!border-border [&>button]:!text-slate-400 [&>button:hover]:!bg-surface-3"
        />
        <MiniMap
          className="!bg-surface-1 !border-border"
          nodeColor={(n) => {
            const type = (n.data as { type: string }).type;
            if (type === 'crownJewel') return '#fbbf24';
            if (type === 'entryPoint') return '#ef4444';
            if (type === 'identity') return '#a855f7';
            if (type === 'cloud') return '#0ea5e9';
            if (type === 'shadowIT') return '#d946ef';
            return '#f97316';
          }}
          maskColor="rgba(10,13,20,0.8)"
        />

        {/* SVG defs for arrowheads */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            {['exploit', 'lateral', 'escalation', 'misconfiguration', 'credential', 'default'].map((type) => {
              const colors: Record<string, string> = {
                exploit: '#ef4444', lateral: '#f97316', escalation: '#a855f7',
                misconfiguration: '#f59e0b', credential: '#06b6d4', default: '#64748b',
              };
              return (
                <marker
                  key={type}
                  id={`arrowhead-${type}`}
                  markerWidth="8"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill={colors[type]} />
                </marker>
              );
            })}
          </defs>
        </svg>
      </ReactFlow>
    </div>
  );
}
