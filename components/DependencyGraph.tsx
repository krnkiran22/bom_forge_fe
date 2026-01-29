'use client';

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
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

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
// CUSTOM NODE COMPONENT (Obsidian-style)
// ═══════════════════════════════════════════════════════════════
const CustomNode = ({ data }: any) => {
  const getNodeStyle = () => {
    switch (data.changeType) {
      case 'added':
        return 'bg-gradient-to-br from-green-500 to-green-600 border-green-700';
      case 'modified':
        return 'bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-700';
      case 'grouped':
        return 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-700';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600 border-gray-700';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-xl rounded-xl border-2 ${getNodeStyle()} text-white min-w-[180px] transition-all hover:scale-105 cursor-pointer`}>
      {/* Part Number */}
      <div className="font-bold text-sm mb-1">{data.label}</div>
      
      {/* Description (truncated) */}
      <div className="text-xs opacity-90 mb-2 line-clamp-1">
        {data.description}
      </div>
      
      {/* Confidence Badge */}
      {data.confidence && (
        <div className="inline-block text-xs bg-white/30 backdrop-blur-sm px-2 py-1 rounded-full font-semibold">
          {(data.confidence * 100).toFixed(0)}% confident
        </div>
      )}
      
      {/* Work Center */}
      {data.workCenter && (
        <div className="text-xs mt-1 opacity-80">
          📍 {data.workCenter.split('-').slice(1, 2).join('-')}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN GRAPH COMPONENT
// ═══════════════════════════════════════════════════════════════
export function DependencyGraph({ items, onNodeClick }: DependencyGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // BUILD GRAPH DATA (Force-Directed Layout)
  // ─────────────────────────────────────────────────────────────
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create node map for quick lookup
    const nodeMap = new Map(items.map(item => [item.partNumber, item]));

    // ─── BUILD DEPENDENCY GRAPH ───
    const connections = new Map<string, string[]>(); // parent -> children
    const hasParent = new Set<string>();

    items.forEach(item => {
      if (item.dependencies && item.dependencies.length > 0) {
        // Has explicit dependencies
        item.dependencies.forEach(depId => {
          if (!connections.has(depId)) {
            connections.set(depId, []);
          }
          connections.get(depId)!.push(item.partNumber);
          hasParent.add(item.partNumber);
        });
      } else if (item.level && item.level > 0) {
        // Infer from level hierarchy
        const potentialParents = items.filter(i => 
          i.level === (item.level! - 1)
        );
        
        if (potentialParents.length > 0) {
          // Connect to parent(s) at previous level
          const parent = potentialParents[0]; // Connect to first parent
          if (!connections.has(parent.partNumber)) {
            connections.set(parent.partNumber, []);
          }
          connections.get(parent.partNumber)!.push(item.partNumber);
          hasParent.add(item.partNumber);
        }
      }
    });

    // Find root nodes (no parents)
    const rootNodes = items.filter(item => !hasParent.has(item.partNumber));
    if (rootNodes.length === 0 && items.length > 0) {
      // No clear hierarchy, use level 0 or first item
      rootNodes.push(items[0]);
    }

    // ─── FORCE-DIRECTED LAYOUT (Simplified) ───
    // We'll use a hierarchical layout with some horizontal spreading
    const levelMap = new Map<number, BOMItem[]>();
    
    items.forEach(item => {
      const level = item.level || 0;
      if (!levelMap.has(level)) {
        levelMap.set(level, []);
      }
      levelMap.get(level)!.push(item);
    });

    const maxLevel = Math.max(...Array.from(levelMap.keys()));
    const verticalSpacing = 180;
    const horizontalSpacing = 250;

    // Position nodes by level
    levelMap.forEach((levelItems, level) => {
      const levelWidth = levelItems.length * horizontalSpacing;
      const startX = -levelWidth / 2;

      levelItems.forEach((item, index) => {
        const x = startX + (index * horizontalSpacing) + (horizontalSpacing / 2);
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

    // ─── CREATE EDGES (Connections) ───
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
            strokeWidth: 2.5,
            strokeDasharray: '5 5'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#94a3b8',
            width: 25,
            height: 25,
          },
        });
      });
    });

    // If no edges were created, create default connections
    if (edges.length === 0 && items.length > 1) {
      // Connect items sequentially as fallback
      for (let i = 0; i < items.length - 1; i++) {
        edges.push({
          id: `${items[i].partNumber}-${items[i + 1].partNumber}`,
          source: items[i].partNumber,
          target: items[i + 1].partNumber,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#cbd5e1', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#cbd5e1',
          },
        });
      }
    }

    return { nodes, edges };
  }, [items]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
      if (onNodeClick) {
        onNodeClick(node.data.item);
      }
    },
    [onNodeClick]
  );

  const selectedNode = items.find(i => i.partNumber === selectedNodeId);

  return (
    <div className="space-y-4">
      {/* Graph Canvas */}
      <div className="w-full h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-300 shadow-lg overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClickHandler}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
          }}
        >
          <Background 
            color="#e5e7eb" 
            gap={20} 
            size={1}
            style={{ opacity: 0.5 }}
          />
          <Controls 
            showInteractive={false}
            className="bg-white shadow-lg rounded-lg border border-gray-300"
          />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.data.changeType) {
                case 'added': return '#10b981';
                case 'modified': return '#f59e0b';
                case 'grouped': return '#3b82f6';
                default: return '#6b7280';
              }
            }}
            className="bg-white shadow-lg rounded-lg border border-gray-300"
            maskColor="rgba(0, 0, 0, 0.05)"
          />
        </ReactFlow>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">
                  {selectedNode.changeType === 'added' ? '🆕' :
                   selectedNode.changeType === 'modified' ? '✏️' :
                   selectedNode.changeType === 'grouped' ? '📦' : '📋'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedNode.partNumber}</h3>
                  {selectedNode.confidence && (
                    <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                      {(selectedNode.confidence * 100).toFixed(0)}% confident
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-4">{selectedNode.description}</p>
              
              <div className="grid grid-cols-2 gap-3">
                {selectedNode.quantity && (
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Quantity</p>
                    <p className="text-lg font-bold text-gray-900">{selectedNode.quantity}</p>
                  </div>
                )}
                {selectedNode.workCenter && (
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Work Center</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedNode.workCenter}</p>
                  </div>
                )}
                {selectedNode.materialSpec && (
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Material</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedNode.materialSpec}</p>
                  </div>
                )}
                {selectedNode.sequence && (
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Sequence</p>
                    <p className="text-lg font-bold text-gray-900">#{selectedNode.sequence}</p>
                  </div>
                )}
              </div>

              {selectedNode.reasoning && (
                <div className="mt-4 p-4 bg-white rounded-lg border-l-4 border-purple-500 shadow-sm">
                  <p className="text-xs text-gray-500 mb-1 font-semibold">💡 AI Reasoning:</p>
                  <p className="text-sm text-gray-700 italic">{selectedNode.reasoning}</p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setSelectedNodeId(null)}
              className="ml-4 p-2 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow"></div>
          <span className="text-sm font-medium text-gray-700">Added</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full shadow"></div>
          <span className="text-sm font-medium text-gray-700">Modified</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow"></div>
          <span className="text-sm font-medium text-gray-700">Grouped</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full shadow"></div>
          <span className="text-sm font-medium text-gray-700">Standard</span>
        </div>
      </div>

      {/* Stats */}
      <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-200">
        <span className="font-semibold">{nodes.length} nodes</span>
        {' • '}
        <span className="font-semibold">{edges.length} connections</span>
        {' • '}
        <span className="text-gray-500">Zoom and drag to explore</span>
      </div>
    </div>
  );
}
