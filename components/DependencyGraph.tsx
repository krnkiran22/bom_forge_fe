import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Settings2,
  Sparkles,
  Target,
  Layers,
  Share2,
  Info,
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface BOMItem {
  partNumber: string;
  description: string;
  quantity?: number;
  level?: number;
  confidence?: number;
  workCenter?: string;
  materialSpec?: string;
  changeType?: 'added' | 'modified' | 'unchanged' | 'grouped';
  dependencies?: string[];
  reasoning?: string;
  sequence?: number;
}

interface DependencyGraphProps {
  items: BOMItem[];
  onNodeClick?: (item: BOMItem) => void;
}

// ═══════════════════════════════════════════════════════════════
// PREMIUM CUSTOM NODE (macOS Aesthetic)
// ═══════════════════════════════════════════════════════════════
const CustomNode = ({ data, selected }: any) => {
  const getIcon = () => {
    switch (data.changeType) {
      case 'added': return <Sparkles className="w-4 h-4 text-emerald-500" />;
      case 'modified': return <Settings2 className="w-4 h-4 text-amber-500" />;
      case 'grouped': return <Layers className="w-4 h-4 text-blue-500" />;
      default: return <Box className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBorderColor = () => {
    if (selected) return 'border-teal-500 ring-4 ring-teal-500/10';
    switch (data.changeType) {
      case 'added': return 'border-emerald-200';
      case 'modified': return 'border-amber-200';
      case 'grouped': return 'border-blue-200';
      default: return 'border-slate-200';
    }
  };

  return (
    <div className={`
      relative group px-5 py-4 min-w-[220px] 
      bg-white/90 backdrop-blur-xl rounded-2xl border ${getBorderColor()}
      transition-all duration-300 mac-shadow hover:scale-[1.02]
      ${selected ? 'scale-[1.05]' : 'opacity-90 hover:opacity-100'}
    `}>
      {/* Selection Glow */}
      {selected && (
        <div className="absolute -inset-0.5 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-2xl blur-sm -z-10" />
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-white transition-colors">
            {getIcon()}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node ID</span>
            <span className="text-sm font-black text-slate-900 tracking-tight">{data.label}</span>
          </div>
        </div>
        {data.confidence && (
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black uppercase tracking-tighter text-teal-600 mb-0.5">Match</span>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-100">
              {Math.round(data.confidence * 100)}%
            </span>
          </div>
        )}
      </div>

      <p className="text-[11px] font-medium text-slate-500 line-clamp-2 leading-relaxed mb-4">
        {data.description}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex items-center gap-2 text-slate-400">
          <Target className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
            {data.workCenter?.split('-').slice(1, 2).join('-') || 'GENERAL'}
          </span>
        </div>
        <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN GRAPH COMPONENT
// ═══════════════════════════════════════════════════════════════
export function DependencyGraph({ items, onNodeClick }: DependencyGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const connections = new Map<string, string[]>();
    const hasParent = new Set<string>();

    items.forEach(item => {
      if (item.dependencies && item.dependencies.length > 0) {
        item.dependencies.forEach(depId => {
          if (!connections.has(depId)) connections.set(depId, []);
          connections.get(depId)!.push(item.partNumber);
          hasParent.add(item.partNumber);
        });
      } else if (item.level && item.level > 0) {
        const potentialParents = items.filter(i => i.level === (item.level! - 1));
        if (potentialParents.length > 0) {
          const parent = potentialParents[0];
          if (!connections.has(parent.partNumber)) connections.set(parent.partNumber, []);
          connections.get(parent.partNumber)!.push(item.partNumber);
          hasParent.add(item.partNumber);
        }
      }
    });

    const levelMap = new Map<number, BOMItem[]>();
    items.forEach(item => {
      const level = item.level || 0;
      if (!levelMap.has(level)) levelMap.set(level, []);
      levelMap.get(level)!.push(item);
    });

    const verticalSpacing = 220;
    const horizontalSpacing = 300;

    levelMap.forEach((levelItems, level) => {
      const levelWidth = (levelItems.length - 1) * horizontalSpacing;
      const startX = -levelWidth / 2;

      levelItems.forEach((item, index) => {
        const x = startX + (index * horizontalSpacing);
        const y = level * verticalSpacing;

        nodes.push({
          id: item.partNumber,
          type: 'custom',
          position: { x, y },
          data: {
            label: item.partNumber,
            description: item.description,
            confidence: item.confidence,
            workCenter: item.workCenter,
            changeType: item.changeType,
            item: item,
          },
        });
      });
    });

    connections.forEach((children, parentId) => {
      children.forEach(childId => {
        edges.push({
          id: `${parentId}-${childId}`,
          source: parentId,
          target: childId,
          type: 'smoothstep',
          animated: true,
          style: {
            stroke: '#94a3b8',
            strokeWidth: 3,
            opacity: 0.6,
            strokeDasharray: '4 4'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#94a3b8',
            width: 20,
            height: 20,
          },
        });
      });
    });

    return { nodes, edges };
  }, [items]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
      if (onNodeClick) onNodeClick(node.data.item);
    },
    [onNodeClick]
  );

  return (
    <div className="relative group/canvas w-full h-full">
      {/* Visual Workspace Controls Overlay */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-3">
        <div className="p-1 px-3 bg-slate-900/90 backdrop-blur-xl rounded-full mac-shadow border border-white/10 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-3 h-3 text-teal-400" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{nodes.length} Nodes Synchronized</span>
          </div>
          <div className="w-px h-3 bg-white/20" />
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic animate-pulse">
            Real-time Simulation Active
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-20 flex gap-2">
        {[
          { label: 'Added', color: 'bg-emerald-500' },
          { label: 'Modified', color: 'bg-amber-500' },
          { label: 'Grouped', color: 'bg-blue-500' }
        ].map((l, i) => (
          <div key={i} className="px-4 py-2 bg-white/80 backdrop-blur-3xl rounded-xl border border-slate-100 mac-shadow flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${l.color}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>

      <div className="w-full h-full bg-[#FBFBFD] relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClickHandler}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.05}
          maxZoom={1.5}
        >
          <Background
            variant={BackgroundVariant.Dots}
            color="#cbd5e1"
            gap={32}
            size={1.5}
            style={{ opacity: 0.4 }}
          />
          <Controls
            showInteractive={false}
            className="flex flex-col gap-1 p-1 bg-white/80 backdrop-blur-xl rounded-[20px] mac-shadow border border-white !shadow-none !m-6 scale-110"
          />
          <MiniMap
            nodeColor={(node) => {
              switch (node.data.changeType) {
                case 'added': return '#10b981';
                case 'modified': return '#f59e0b';
                case 'grouped': return '#3b82f6';
                default: return '#cbd5e1';
              }
            }}
            className="!bg-white/50 backdrop-blur-2xl !rounded-[24px] !border !border-white !mac-shadow !w-56 !h-40 !m-8 !overflow-hidden !transition-all !duration-500 opacity-60 hover:opacity-100"
            maskColor="rgba(0, 0, 0, 0.03)"
            maskStrokeColor="rgba(0, 0, 0, 0.05)"
          />
        </ReactFlow>
      </div>

      {/* Modern Interaction Helper */}
      <div className="absolute bottom-10 right-1/2 translate-x-1/2 pointer-events-none transition-all duration-500 opacity-0 group-hover/canvas:opacity-100">
        <div className="px-6 py-3 bg-white/40 backdrop-blur-3xl border border-white rounded-full mac-shadow flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Pinch to Zoom</span>
          </div>
          <div className="w-px h-3 bg-slate-200" />
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Select node to inspect</span>
          </div>
        </div>
      </div>
    </div>
  );
}
