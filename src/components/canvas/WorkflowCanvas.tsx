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
import { GroupNode } from './nodes/GroupNode';
import { EdgeContextMenu } from './EdgeContextMenu';
import { CustomEdge } from './edges/CustomEdge';
import { EdgeValidator } from '@/utils/edgeValidation';
import { toast } from 'sonner';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { useContextMenu } from '@/hooks/useContextMenu';
import { UniversalContextMenu } from './UniversalContextMenu';
import { WorkflowActions } from '@/lib/workflowActions';
import {
  Settings2, Copy, Trash2, Edit3, Box, 
  AlignHorizontalSpaceAround, AlignVerticalSpaceAround,
  AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter,
  FolderPlus, ZoomIn, ZoomOut, RotateCcw, Eraser,
  Maximize2, Camera, FileJson
} from 'lucide-react';

// We'll create wrapped node types to inject context menu handlers
const createNodeTypes = (handleNodeContextMenu: (e: React.MouseEvent, node: Node) => void) => ({
  default: (props: any) => <DefaultNode {...props} onContextMenu={handleNodeContextMenu} />,
  decision: DecisionNode,
  start: StartNode,
  end: EndNode,
  group: GroupNode,
});

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
  onOpenConfig?: (node: Node) => void;
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
  onOpenConfig,
}: WorkflowCanvasProps) => {
  const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow();
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [contextMenuEdge, setContextMenuEdge] = useState<Edge | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const { validationOptions, createGroup, ungroupNodes } = useWorkflowState();
  const { contextMenu, showContextMenu, closeContextMenu } = useContextMenu();
  
  // Node context menu handler (defined early for use in nodeTypes)
  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      
      // Base menu items for all nodes
      const baseItems = [
        {
          label: 'Configure Node',
          icon: <Settings2 className="w-4 h-4" />,
          onClick: () => {
            onOpenConfig?.(node);
            toast.info('Node configuration opened');
          },
        },
        {
          label: 'Duplicate Node',
          icon: <Copy className="w-4 h-4" />,
          onClick: () => {
            onDuplicate?.();
            toast.success('Node duplicated');
          },
          shortcut: '⌘D',
        },
        { label: '---' },
      ];
      
      // Type-specific menu items
      const typeSpecificItems: any[] = [];
      
      if (node.type === 'default') {
        const nodeIcon = node.data.icon;
        
        // Input Data specific
        if (nodeIcon === 'database') {
          typeSpecificItems.push(
            {
              label: 'Edit Data Metrics',
              icon: <Edit3 className="w-4 h-4" />,
              onClick: () => {
                onNodeClick?.(node);
                toast.info('Opening metrics editor');
              },
            },
            {
              label: 'Export Node Data',
              icon: <Box className="w-4 h-4" />,
              onClick: () => {
                WorkflowActions.exportNodeAsJSON(node);
                toast.success('Node data exported');
              },
            }
          );
        }
        
        // Sensor/IoT specific
        if (nodeIcon === 'wifi') {
          typeSpecificItems.push(
            {
              label: 'Configure Sensor',
              icon: <Settings2 className="w-4 h-4" />,
              onClick: () => {
                toast.info('Sensor configuration (coming soon)');
              },
            },
            {
              label: 'View Sensor Data',
              icon: <FileJson className="w-4 h-4" />,
              onClick: () => {
                toast.info('Sensor data viewer (coming soon)');
              },
            }
          );
        }
        
        if (typeSpecificItems.length > 0) {
          typeSpecificItems.push({ label: '---' });
        }
      }
      
      // Delete item (always at bottom)
      const deleteItem = {
        label: 'Delete Node',
        icon: <Trash2 className="w-4 h-4" />,
        onClick: () => {
          const removeChanges = [{ type: 'remove' as const, id: node.id }];
          onNodesChange?.(removeChanges);
          toast.success('Node deleted');
        },
        variant: 'destructive' as const,
        shortcut: 'Del',
      };
      
      showContextMenu(event, [...baseItems, ...typeSpecificItems, deleteItem]);
    },
    [onNodeClick, onDuplicate, onNodesChange, showContextMenu]
  );

  // Create node types with context menu handler
  const nodeTypes = createNodeTypes(handleNodeContextMenu);
  
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

  // Canvas context menu handler
  const handleCanvasContextMenu = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('react-flow__pane')) {
        return;
      }
      
      event.preventDefault();
      
      showContextMenu(event, [
        {
          label: 'Zoom In',
          icon: <ZoomIn className="w-4 h-4" />,
          onClick: () => {
            zoomIn();
            toast.info('Zoomed in');
          },
          shortcut: '+',
        },
        {
          label: 'Zoom Out',
          icon: <ZoomOut className="w-4 h-4" />,
          onClick: () => {
            zoomOut();
            toast.info('Zoomed out');
          },
          shortcut: '-',
        },
        {
          label: 'Fit View',
          icon: <Maximize2 className="w-4 h-4" />,
          onClick: () => {
            fitView({ padding: 0.2 });
            toast.info('View fitted to workflow');
          },
          shortcut: '0',
        },
        {
          label: 'Reset View',
          icon: <RotateCcw className="w-4 h-4" />,
          onClick: () => {
            fitView({ padding: 0.5, duration: 500 });
            toast.info('View reset');
          },
        },
        { label: '---' },
        {
          label: 'Clear Canvas',
          icon: <Eraser className="w-4 h-4" />,
          onClick: () => {
            if (confirm('Are you sure you want to clear the entire canvas?')) {
              onNodesChange?.([]);
              onEdgesChange?.([]);
              toast.success('Canvas cleared');
            }
          },
          variant: 'destructive' as const,
        },
      ]);
    },
    [showContextMenu, fitView, zoomIn, zoomOut, onNodesChange, onEdgesChange]
  );

  // Multi-selection context menu handler
  const handleMultiSelectContextMenu = useCallback(
    (event: React.MouseEvent) => {
      const selectedNodes = nodes.filter(n => n.selected);
      
      if (selectedNodes.length < 2) return;
      
      event.preventDefault();
      
      showContextMenu(event, [
        {
          label: `${selectedNodes.length} nodes selected`,
          icon: <Box className="w-4 h-4" />,
          onClick: () => {},
          disabled: true,
        },
        { label: '---' },
        {
          label: 'Align Horizontally',
          icon: <AlignHorizontalJustifyCenter className="w-4 h-4" />,
          onClick: () => {
            const aligned = WorkflowActions.alignHorizontally(selectedNodes);
            const updatedNodes = nodes.map(n => {
              const found = aligned.find(a => a.id === n.id);
              return found || n;
            });
            onNodesChange?.(updatedNodes.map((n, i) => ({
              type: 'position' as const,
              id: n.id,
              position: n.position,
            })));
            toast.success('Nodes aligned horizontally');
          },
        },
        {
          label: 'Align Vertically',
          icon: <AlignVerticalJustifyCenter className="w-4 h-4" />,
          onClick: () => {
            const aligned = WorkflowActions.alignVertically(selectedNodes);
            const updatedNodes = nodes.map(n => {
              const found = aligned.find(a => a.id === n.id);
              return found || n;
            });
            onNodesChange?.(updatedNodes.map((n, i) => ({
              type: 'position' as const,
              id: n.id,
              position: n.position,
            })));
            toast.success('Nodes aligned vertically');
          },
        },
        {
          label: 'Distribute Horizontally',
          icon: <AlignHorizontalSpaceAround className="w-4 h-4" />,
          onClick: () => {
            const distributed = WorkflowActions.distributeHorizontally(selectedNodes);
            const updatedNodes = nodes.map(n => {
              const found = distributed.find(d => d.id === n.id);
              return found || n;
            });
            onNodesChange?.(updatedNodes.map((n, i) => ({
              type: 'position' as const,
              id: n.id,
              position: n.position,
            })));
            toast.success('Nodes distributed horizontally');
          },
          disabled: selectedNodes.length < 3,
        },
        {
          label: 'Distribute Vertically',
          icon: <AlignVerticalSpaceAround className="w-4 h-4" />,
          onClick: () => {
            const distributed = WorkflowActions.distributeVertically(selectedNodes);
            const updatedNodes = nodes.map(n => {
              const found = distributed.find(d => d.id === n.id);
              return found || n;
            });
            onNodesChange?.(updatedNodes.map((n, i) => ({
              type: 'position' as const,
              id: n.id,
              position: n.position,
            })));
            toast.success('Nodes distributed vertically');
          },
          disabled: selectedNodes.length < 3,
        },
        { label: '---' },
        {
          label: 'Group Nodes',
          icon: <FolderPlus className="w-4 h-4" />,
          onClick: () => {
            const nodeIds = selectedNodes.map(n => n.id);
            createGroup(nodeIds, 'New Group');
            toast.success('Nodes grouped');
          },
          shortcut: '⌘G',
        },
        { label: '---' },
        {
          label: 'Delete Selected',
          icon: <Trash2 className="w-4 h-4" />,
          onClick: () => {
            const nodeIds = selectedNodes.map(n => n.id);
            onNodesChange?.(
              nodeIds.map(id => ({ type: 'remove' as const, id }))
            );
            toast.success(`${nodeIds.length} nodes deleted`);
          },
          variant: 'destructive' as const,
          shortcut: 'Del',
        },
      ]);
    },
    [nodes, showContextMenu, onNodesChange, createGroup]
  );

  // Mini-map context menu handler
  const handleMiniMapContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      
      showContextMenu(event, [
        {
          label: 'Reset View',
          icon: <RotateCcw className="w-4 h-4" />,
          onClick: () => {
            fitView({ padding: 0.5, duration: 500 });
            toast.info('View reset from mini-map');
          },
        },
        {
          label: 'Fit to Workflow',
          icon: <Maximize2 className="w-4 h-4" />,
          onClick: () => {
            fitView({ padding: 0.2, duration: 500 });
            toast.info('View fitted to workflow');
          },
        },
        {
          label: 'Export Snapshot',
          icon: <Camera className="w-4 h-4" />,
          onClick: () => {
            toast.success('Mini-map snapshot exported (feature coming soon)');
          },
        },
      ]);
    },
    [showContextMenu, fitView]
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
      
      // Group: Ctrl/Cmd + G
      if (cmdKey && e.key === 'g' && !e.shiftKey) {
        e.preventDefault();
        const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id);
        if (selectedNodeIds.length >= 2) {
          createGroup(selectedNodeIds, 'New Group');
          toast.success('Nodes grouped');
        }
        return;
      }
      
      // Ungroup: Ctrl/Cmd + Shift + G
      if (cmdKey && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        const selectedGroups = nodes.filter(n => n.selected && n.type === 'group');
        selectedGroups.forEach(group => ungroupNodes(group.id));
        if (selectedGroups.length > 0) {
          toast.success('Groups ungrouped');
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
  }, [selectedEdgeId, onDeleteEdge, onUpdateEdge, edges, nodes, onCopy, onPaste, onDuplicate, onUndo, onRedo, canUndo, canRedo, createGroup, ungroupNodes]);

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
        onPaneContextMenu={handleCanvasContextMenu}
        onSelectionContextMenu={handleMultiSelectContextMenu}
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
        <div onContextMenu={handleMiniMapContextMenu}>
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
        </div>
      </ReactFlow>
      
      {contextMenu && (
        <UniversalContextMenu
          menu={contextMenu}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
};
