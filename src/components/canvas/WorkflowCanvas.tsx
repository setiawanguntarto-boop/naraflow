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
  BackgroundVariant,
  useReactFlow,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DefaultNode } from './nodes/DefaultNode';
import { DecisionNode } from './nodes/DecisionNode';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { EdgeContextMenu } from './EdgeContextMenu';
import { CustomEdge } from './edges/CustomEdge';
import { EdgeValidator } from '@/utils/edgeValidation';
import { toast } from 'sonner';
import { useWorkflowState } from '@/hooks/useWorkflowState';

const nodeTypes = {
  default: DefaultNode,
  decision: DecisionNode,
  start: StartNode,
  end: EndNode,
};

const edgeTypes = {
  smoothstep: CustomEdge,
  straight: CustomEdge,
  step: CustomEdge,
  default: CustomEdge,
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
  onUpdateEdge?: (edgeId: string, updates: Partial<Edge>) => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDuplicate?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: () => boolean;
  canRedo?: () => boolean;
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
  onUpdateEdge,
  onCopy,
  onPaste,
  onDuplicate,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: WorkflowCanvasProps) => {
  const { screenToFlowPosition } = useReactFlow();
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [contextMenuEdge, setContextMenuEdge] = useState<Edge | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const { validationOptions } = useWorkflowState();
  
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

  const handleEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setContextMenuEdge(edge);
      setSelectedEdgeId(edge.id);
    },
    []
  );

  // Track selection changes
  useEffect(() => {
    const selectedNodes = nodes.filter(n => n.selected).length;
    const selectedEdges = edges.filter(e => e.selected).length;
    setSelectedCount(selectedNodes + selectedEdges);
  }, [nodes, edges]);
  
  // Validation function for React Flow
  const isValidConnection = useCallback(
    (connection: Connection) => {
      const result = EdgeValidator.validateConnection(
        connection,
        nodes,
        edges,
        validationOptions
      );
      
      if (!result.isValid) {
        toast.error('Invalid Connection', {
          description: result.message,
        });
      }
      
      return result.isValid;
    },
    [nodes, edges, validationOptions]
  );

  // Keyboard shortcuts for all operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent if user is typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;
      
      // Copy: Ctrl/Cmd + C
      if (cmdKey && e.key === 'c') {
        e.preventDefault();
        const selectedNodesCount = nodes.filter(n => n.selected).length;
        if (selectedNodesCount > 0 && onCopy) {
          onCopy();
        }
        return;
      }
      
      // Paste: Ctrl/Cmd + V
      if (cmdKey && e.key === 'v') {
        e.preventDefault();
        if (onPaste) {
          onPaste();
        }
        return;
      }
      
      // Duplicate: Ctrl/Cmd + D
      if (cmdKey && e.key === 'd') {
        e.preventDefault();
        const selectedNodesCount = nodes.filter(n => n.selected).length;
        if (selectedNodesCount > 0 && onDuplicate) {
          onDuplicate();
        }
        return;
      }
      
      // Undo: Ctrl/Cmd + Z (without Shift)
      if (cmdKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo?.() && onUndo) {
          onUndo();
        }
        return;
      }
      
      // Redo: Ctrl/Cmd + Shift + Z OR Ctrl/Cmd + Y
      if ((cmdKey && e.shiftKey && e.key === 'z') || (cmdKey && e.key === 'y')) {
        e.preventDefault();
        if (canRedo?.() && onRedo) {
          onRedo();
        }
        return;
      }
      
      // Edge operations (only when edge is selected)
      if (!selectedEdgeId) return;
      
      // Delete/Backspace - Delete edge
      if ((e.key === 'Delete' || e.key === 'Backspace') && onDeleteEdge) {
        e.preventDefault();
        onDeleteEdge(selectedEdgeId);
        setSelectedEdgeId(null);
        return;
      }
      
      // Keyboard shortcuts for edge type
      if (onUpdateEdge) {
        switch(e.key) {
          case '1':
            onUpdateEdge(selectedEdgeId, { type: 'smoothstep' });
            break;
          case '2':
            onUpdateEdge(selectedEdgeId, { type: 'straight' });
            break;
          case '3':
            onUpdateEdge(selectedEdgeId, { type: 'step' });
            break;
          case '4':
            onUpdateEdge(selectedEdgeId, { type: 'default' });
            break;
          case 'd':
          case 'D':
            e.preventDefault();
            const currentEdge = edges.find(edge => edge.id === selectedEdgeId);
            const isDashed = currentEdge?.data?.lineStyle === 'dashed';
            onUpdateEdge(selectedEdgeId, {
              style: {
                ...currentEdge?.style,
                strokeDasharray: isDashed ? undefined : '5, 5',
              },
              data: {
                ...currentEdge?.data,
                lineStyle: isDashed ? 'solid' : 'dashed',
              },
            });
            break;
          case 'a':
          case 'A':
            e.preventDefault();
            const edge = edges.find(e => e.id === selectedEdgeId);
            onUpdateEdge(selectedEdgeId, { animated: !edge?.animated });
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedEdgeId, onDeleteEdge, onUpdateEdge, edges, nodes, onCopy, onPaste, onDuplicate, onUndo, onRedo, canUndo, canRedo]);

  // Apply dynamic styling to edges
  const styledEdges = edges.map(edge => {
    const lineStyle = edge.data?.lineStyle || 'solid';
    const className = `
      ${selectedEdgeId === edge.id ? 'selected-edge' : ''}
      ${lineStyle === 'dashed' ? 'edge-dashed' : ''}
      ${lineStyle === 'dotted' ? 'edge-dotted' : ''}
    `.trim();
    
    return {
      ...edge,
      className,
      style: {
        ...edge.style,
        strokeWidth: selectedEdgeId === edge.id ? 3 : (edge.style?.strokeWidth || 2),
      },
    };
  });

  return (
    <div className="w-full h-full bg-background-soft" onDrop={handleDrop} onDragOver={handleDragOver}>
      {/* Selection counter badge */}
      {selectedCount > 1 && (
        <div className="selection-count">
          {selectedCount} items selected
        </div>
      )}
      
      {contextMenuEdge && onUpdateEdge && onDeleteEdge && (
        <EdgeContextMenu
          edge={contextMenuEdge}
          onDeleteEdge={onDeleteEdge}
          onUpdateEdge={onUpdateEdge}
        >
          <div className="absolute inset-0 pointer-events-none" onClick={() => setContextMenuEdge(null)} />
        </EdgeContextMenu>
      )}
      
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onEdgeContextMenu={handleEdgeContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        isValidConnection={isValidConnection}
        fitView
        attributionPosition="bottom-right"
        className="workflow-canvas"
        multiSelectionKeyCode="Shift"
        panOnDrag={[1, 2]}
        selectionOnDrag
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
