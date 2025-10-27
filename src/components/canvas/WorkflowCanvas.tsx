import { useCallback, useState, useEffect, useMemo } from 'react';
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
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DefaultNode } from './nodes/DefaultNode';
import { DecisionNode } from './nodes/DecisionNode';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { GroupNode } from './nodes/GroupNode';
import { LlamaNode } from './nodes/LlamaNode';
import { AgentNode } from './nodes/AgentNode';
import { EdgeContextMenu } from './EdgeContextMenu';
import { CustomEdge } from './edges/CustomEdge';
import { EdgeValidator } from '@/utils/edgeValidation';
import { toast } from 'sonner';
import { useWorkflowState, useWorkflowActions, useNodes, useEdges, useUIState } from '@/hooks/useWorkflowState';
import { useContextMenu } from '@/hooks/useContextMenu';
import { UniversalContextMenu } from './UniversalContextMenu';
import { WorkflowActions } from '@/lib/workflowActions';
import { useCanvasEventBus, globalCanvasEventBus } from '@/hooks/useCanvasEventBus';
import { AutoLayoutToolbar } from './AutoLayoutToolbar';
import { useLayout, LayoutPresets } from '@/core/layout/useLayout';
import { LayoutFeedback, LayoutAnimationController } from './LayoutFeedback';
import {
  Copy, Trash2, Edit3, Box, 
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
  'llama-decision': LlamaNode,
  agent: AgentNode,
  'agent.conversational': AgentNode,
});

const edgeTypes = {
  smoothstep: CustomEdge,
  straight: CustomEdge,
  step: CustomEdge,
  default: CustomEdge,
};

interface WorkflowCanvasProps {
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
  onOpenLlamaSettings?: () => void;
}

export const WorkflowCanvas = ({
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
  onOpenLlamaSettings,
}: WorkflowCanvasProps) => {
  const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow();
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [contextMenuEdge, setContextMenuEdge] = useState<Edge | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  
  // Use new state management
  const nodes = useNodes();
  const edges = useEdges();
  const uiState = useUIState();
  const actions = useWorkflowActions();
  const { validationOptions } = useWorkflowState();
  
  // Event bus integration
  const { emit, EVENT_TYPES } = useCanvasEventBus();
  const { contextMenu, showContextMenu, closeContextMenu } = useContextMenu();
  
  // Auto-layout integration
  const { autoLayout, restoreLayout, canRestore, isLayouting, layoutResult, layoutError } = useLayout(nodes, edges);
  
  // Layout feedback state
  const animationController = LayoutAnimationController.getInstance();

  // Keyboard shortcuts for auto-layout
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if we're in an input field or textarea
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

      if (ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 'l':
            event.preventDefault();
            if (!isLayouting && Object.keys(nodes).length > 0) {
              autoLayout(LayoutPresets.horizontal);
            }
            break;
          case 'shift':
            if (event.key === 'L' && canRestore) {
              event.preventDefault();
              restoreLayout();
            }
            break;
          case 'alt':
            // Alt + number keys for quick presets
            if (event.key >= '1' && event.key <= '5') {
              event.preventDefault();
              const presets = [
                LayoutPresets.horizontal,
                LayoutPresets.vertical,
                LayoutPresets.compact,
                LayoutPresets.spacious,
                LayoutPresets.complex
              ];
              const presetIndex = parseInt(event.key) - 1;
              if (presets[presetIndex] && !isLayouting) {
                autoLayout(presets[presetIndex]);
              }
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [autoLayout, restoreLayout, canRestore, isLayouting, nodes]);
  
  // Connect handler using event bus
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        // Check if this is an attachment connection (sub-node)
        const isAttachmentPort = connection.sourceHandle && 
          ['model', 'memory', 'parser'].includes(connection.sourceHandle);
        
        if (isAttachmentPort && connection.sourceHandle) {
          // Attach as sub-node instead of creating regular edge
          try {
            actions.attachSubNode(
              connection.source,
              connection.target,
              connection.sourceHandle
            );
            
            toast.success(`Attached to ${connection.sourceHandle} port`);
            
            emit({
              type: 'subnode:attached',
              payload: {
                parentId: connection.source,
                nodeId: connection.target,
                portId: connection.sourceHandle
              }
            });
          } catch (error) {
            console.error('Failed to attach sub-node:', error);
            toast.error('Failed to attach sub-node');
          }
        } else {
          // Regular edge connection
          const newEdge = {
            id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
            type: 'smoothstep',
            animated: true,
            data: {
              label: '',
              condition: 'default',
            },
          };
          
          // Emit edge creation event
          emit({
            type: EVENT_TYPES.EDGE.CREATE,
            payload: { edge: newEdge },
          });
          
          // Add edge through actions
          actions.addEdge(newEdge);
        }
      }
    },
    [emit, EVENT_TYPES.EDGE.CREATE, actions]
  );
  
  // Node context menu handler (defined early for use in nodeTypes)
  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      
      // Base menu items for all nodes
      const baseItems = [
        {
          label: 'Configure Node',
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
          actions.processNodeChanges(removeChanges);
          toast.success('Node deleted');
        },
        variant: 'destructive' as const,
        shortcut: 'Del',
      };
      
      showContextMenu(event, [...baseItems, ...typeSpecificItems, deleteItem]);
    },
    [onNodeClick, onDuplicate, actions, showContextMenu]
  );

  // Create node types with context menu handler (memoized to prevent recreation)
  const nodeTypes = useMemo(() => createNodeTypes(handleNodeContextMenu), [handleNodeContextMenu]);
  
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      // Select node through actions
      actions.selectNode(node.id);
      
      // Emit node selection event
      emit({
        type: EVENT_TYPES.NODE.SELECT,
        payload: { nodeId: node.id },
      });
      
      // Call external handler if provided
      onNodeClick?.(node);
    },
    [actions, emit, EVENT_TYPES.NODE.SELECT, onNodeClick]
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

  const handleEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation(); // Prevent bubbling to canvas
    
    // Select edge through actions
    actions.selectEdge(edge.id);
    
    // Emit edge selection event
    emit({
      type: EVENT_TYPES.EDGE.SELECT,
      payload: { edgeId: edge.id },
    });
    
    setSelectedEdgeId(edge.id);
  }, [actions, emit, EVENT_TYPES.EDGE.SELECT]);

  const handleEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      event.stopPropagation(); // Prevent bubbling to canvas
      closeContextMenu(); // Close any existing context menu
      setContextMenuEdge(edge);
      setSelectedEdgeId(edge.id);
    },
    [closeContextMenu]
  );

  // Canvas context menu handler
  const handleCanvasContextMenu = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.classList.contains('react-flow__pane')) {
        return;
      }
      
      event.preventDefault();
      event.stopPropagation();
      
      // Close any existing edge context menu
      setContextMenuEdge(null);
      
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
              actions.clearCanvas();
              toast.success('Canvas cleared');
            }
          },
          variant: 'destructive' as const,
        },
      ]);
    },
    [showContextMenu, fitView, zoomIn, zoomOut, actions]
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
            actions.processNodeChanges(updatedNodes.map((n, i) => ({
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
            actions.processNodeChanges(updatedNodes.map((n, i) => ({
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
            actions.processNodeChanges(updatedNodes.map((n, i) => ({
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
            actions.processNodeChanges(updatedNodes.map((n, i) => ({
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
            actions.createGroup(nodeIds);
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
            actions.processNodeChanges(
              nodeIds.map(id => ({ type: 'remove' as const, id }))
            );
            toast.success(`${nodeIds.length} nodes deleted`);
          },
          variant: 'destructive' as const,
          shortcut: 'Del',
        },
      ]);
    },
    [nodes, showContextMenu, actions]
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
          actions.createGroup(selectedNodeIds);
          toast.success('Nodes grouped');
        }
        return;
      }
      
      // Ungroup: Ctrl/Cmd + Shift + G
      if (cmdKey && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        const selectedGroups = nodes.filter(n => n.selected && n.type === 'group');
        selectedGroups.forEach(group => actions.ungroupNodes([group.id]));
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
  }, [selectedEdgeId, onDeleteEdge, onUpdateEdge, edges, nodes, onCopy, onPaste, onDuplicate, onUndo, onRedo, canUndo, canRedo, actions]);

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
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setContextMenuEdge(null)}
            onContextMenu={() => setContextMenuEdge(null)}
          />
        </EdgeContextMenu>
      )}
      
      {/* Auto-Layout Toolbar - Floating FAB Design */}
      <div className="absolute bottom-20 right-4 z-50">
        <AutoLayoutToolbar
          onAutoLayout={autoLayout}
          onRestoreLayout={restoreLayout}
          canRestore={canRestore}
          isLayouting={isLayouting}
          nodeCount={Object.keys(nodes).length}
          edgeCount={Object.keys(edges).length}
          selectedNodeIds={uiState.selectedNodeIds}
          currentNodes={Object.values(nodes)}
          currentEdges={Object.values(edges)}
        />
      </div>
      
      {/* Layout Feedback */}
      <LayoutFeedback
        isLayouting={isLayouting}
        layoutResult={layoutResult}
        error={layoutError}
      />
      
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={actions.processNodeChanges}
        onEdgesChange={actions.processEdgeChanges}
        onConnect={handleConnect}
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
        className="workflow-canvas scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
        multiSelectionKeyCode="Shift"
        panOnDrag={[1, 2]}
        selectionOnDrag
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20}  // Slightly larger gap
          size={0.8} // Smaller dots
          color="#E2E8F0" // More subtle grid color
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
      
      {/* Powered by LLaMA Badge */}
      <div className="absolute bottom-4 right-4 z-10">
        <div 
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors"
          title="Click to open LLaMA settings"
          onClick={() => {
            if (onOpenLlamaSettings) {
              onOpenLlamaSettings();
            }
          }}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <span className="text-lg">🦙</span>
            <span>Powered by LLaMA 3</span>
          </div>
        </div>
      </div>
    </div>
  );
};
