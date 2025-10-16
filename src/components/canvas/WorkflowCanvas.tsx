import { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  BackgroundVariant,
  useReactFlow,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DefaultNode } from './nodes/DefaultNode';
import { DecisionNode } from './nodes/DecisionNode';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';

const nodeTypes = {
  default: DefaultNode,
  decision: DecisionNode,
  start: StartNode,
  end: EndNode,
};

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick?: (node: Node) => void;
  onDrop?: (nodeData: any, position: { x: number; y: number }) => void;
  onDeleteEdge?: (edgeId: string) => void;
}

export const WorkflowCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onDrop,
  onDeleteEdge,
}: WorkflowCanvasProps) => {
  const { screenToFlowPosition } = useReactFlow();
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeDataString = event.dataTransfer.getData('application/reactflow');
      if (!nodeDataString || !onDrop) return;

      try {
        const nodeData = JSON.parse(nodeDataString);
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        onDrop(nodeData, position);
      } catch (error) {
        console.error('Failed to parse dropped node data:', error);
      }
    },
    [screenToFlowPosition, onDrop]
  );

  const handleEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
  }, []);

  // Keyboard shortcut for edge deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEdgeId && onDeleteEdge) {
        // Prevent default backspace navigation
        e.preventDefault();
        onDeleteEdge(selectedEdgeId);
        setSelectedEdgeId(null);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedEdgeId, onDeleteEdge]);

  return (
    <div className="w-full h-full bg-background-soft" onDrop={handleDrop} onDragOver={handleDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges.map(edge => ({
          ...edge,
          style: {
            ...edge.style,
            strokeWidth: selectedEdgeId === edge.id ? 3 : 2,
          },
          className: selectedEdgeId === edge.id ? 'selected-edge' : '',
        }))}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        className="workflow-canvas"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={16} 
          size={1}
          color="hsl(var(--foreground-light))"
        />
        <Controls 
          className="bg-card border border-border rounded-lg shadow-soft"
          showInteractive={false}
        />
        <MiniMap 
          className="bg-card border border-border rounded-lg shadow-soft"
          nodeColor={(node) => {
            switch (node.type) {
              case 'start':
                return 'hsl(var(--brand-secondary))';
              case 'end':
                return 'hsl(var(--brand-primary))';
              case 'decision':
                return 'hsl(142 76% 55%)';
              default:
                return 'hsl(var(--brand-primary-light))';
            }
          }}
        />
      </ReactFlow>
    </div>
  );
};
