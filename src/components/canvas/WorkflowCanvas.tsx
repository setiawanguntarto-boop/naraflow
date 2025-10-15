import { useCallback } from 'react';
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
}

export const WorkflowCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
}: WorkflowCanvasProps) => {
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  return (
    <div className="w-full h-full bg-background-soft">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
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
