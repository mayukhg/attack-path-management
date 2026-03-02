import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';

interface EdgeData {
  mitreId: string;
  technique: string;
  exploitType: 'exploit' | 'lateral' | 'misconfiguration' | 'credential' | 'escalation';
  probability: number;
  verified: boolean;
}

const edgeColors: Record<string, string> = {
  exploit: '#ef4444',
  lateral: '#f97316',
  escalation: '#a855f7',
  misconfiguration: '#f59e0b',
  credential: '#06b6d4',
};

interface AttackEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: import('@xyflow/react').Position;
  targetPosition: import('@xyflow/react').Position;
  data?: EdgeData;
  selected?: boolean;
}

export const AttackEdgeComponent = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: AttackEdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const color = data ? edgeColors[data.exploitType] ?? '#64748b' : '#64748b';
  const isDashed = data?.exploitType === 'lateral' || data?.exploitType === 'misconfiguration';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: isDashed ? '6,3' : undefined,
          filter: selected ? `drop-shadow(0 0 4px ${color}80)` : undefined,
          opacity: 0.8,
        }}
        markerEnd={`url(#arrowhead-${data?.exploitType ?? 'default'})`}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {data && (
            <div
              className="flex flex-col items-center gap-0.5 cursor-pointer group"
            >
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                  borderColor: `${color}40`,
                }}
              >
                {data.mitreId}
              </span>
              {selected && (
                <span className="text-[8px] bg-surface-2 border border-border text-slate-400 px-2 py-1 rounded max-w-[120px] text-center leading-tight">
                  {data.technique.slice(0, 60)}{data.technique.length > 60 ? '…' : ''}
                </span>
              )}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

AttackEdgeComponent.displayName = 'AttackEdgeComponent';
