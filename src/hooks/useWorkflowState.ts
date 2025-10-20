import { create } from 'zustand';
import { Node, Edge, applyNodeChanges, applyEdgeChanges, addEdge, Connection } from '@xyflow/react';
import { EdgeConditionType, ValidationOptions } from '@/types/workflow';
import { WorkflowValidator, ValidationError } from '@/utils/workflowValidation';

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  defaultEdgeType: 'smoothstep' | 'straight' | 'step' | 'default';
  defaultEdgeStyle: 'solid' | 'dashed' | 'dotted';
  defaultEdgeAnimated: boolean;
  defaultEdgeWidth: number;
  
  // Copy/Paste
  clipboard: {
    nodes: Node[];
    edges: Edge[];
  };
  
  // Undo/Redo
  history: Array<{
    nodes: Node[];
    edges: Edge[];
  }>;
  historyIndex: number;
  maxHistorySize: number;
  
  // Edge Labels and Conditions
  updateEdgeLabel: (edgeId: string, label: string) => void;
  defaultEdgeCondition: EdgeConditionType;
  setDefaultEdgeCondition: (condition: EdgeConditionType) => void;
  
  // Validation
  validationOptions: ValidationOptions;
  setValidationOptions: (options: ValidationOptions) => void;
  validationErrors: ValidationError[];
  showValidation: boolean;
  validateWorkflow: () => ValidationError[];
  toggleValidation: () => void;
  getNodeErrors: (nodeId: string) => ValidationError[];
  
  // Node Groups
  createGroup: (nodeIds: string[], label?: string) => void;
  ungroupNodes: (groupId: string) => void;
  addNodeToGroup: (nodeId: string, groupId: string) => void;
  removeNodeFromGroup: (nodeId: string) => void;
  
  // Export/Import
  exportWorkflowJSON: () => string;
  importWorkflowJSON: (json: string) => void;
  
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (node: Node | null) => void;
  setDefaultEdgeType: (type: 'smoothstep' | 'straight' | 'step' | 'default') => void;
  setDefaultEdgeStyle: (style: 'solid' | 'dashed' | 'dotted') => void;
  setDefaultEdgeAnimated: (animated: boolean) => void;
  setDefaultEdgeWidth: (width: number) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  clearCanvas: () => void;
  updateNodeMetrics: (nodeId: string, metrics: string[]) => void;
  updateEdgeStyle: (edgeId: string, updates: Partial<Edge>) => void;
  applyStyleToAllEdges: (style: any) => void;
  deleteEdge: (edgeId: string) => void;
  
  // Copy/Paste functions
  copySelection: () => void;
  pasteSelection: () => void;
  duplicateSelection: () => void;
  
  // Undo/Redo functions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveHistory: () => void;
}

export const useWorkflowState = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  defaultEdgeType: 'smoothstep',
  defaultEdgeStyle: 'solid',
  defaultEdgeAnimated: true,
  defaultEdgeWidth: 2,
  
  // Copy/Paste state
  clipboard: {
    nodes: [],
    edges: [],
  },
  
  // Undo/Redo state
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,
  
  // Edge condition and validation
  defaultEdgeCondition: 'default',
  validationOptions: {
    allowCircular: false,
    preventDuplicates: true,
    preventSelfConnections: true,
  },
  validationErrors: [],
  showValidation: false,
  
  setNodes: (nodes) => {
    set({ nodes });
    setTimeout(() => get().saveHistory(), 0);
  },
  setEdges: (edges) => {
    set({ edges });
    setTimeout(() => get().saveHistory(), 0);
  },
  setSelectedNode: (node) => set({ selectedNode: node }),
  setDefaultEdgeType: (type) => set({ defaultEdgeType: type }),
  setDefaultEdgeStyle: (style) => set({ defaultEdgeStyle: style }),
  setDefaultEdgeAnimated: (animated) => set({ defaultEdgeAnimated: animated }),
  setDefaultEdgeWidth: (width) => set({ defaultEdgeWidth: width }),
  
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
    
    // Auto-validate if validation is enabled
    if (get().showValidation) {
      setTimeout(() => get().validateWorkflow(), 100);
    }
    
    setTimeout(() => get().saveHistory(), 300);
  },
  
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
    
    // Auto-validate if validation is enabled
    if (get().showValidation) {
      setTimeout(() => get().validateWorkflow(), 100);
    }
    
    setTimeout(() => get().saveHistory(), 300);
  },
  
  onConnect: (connection) => {
    const { 
      defaultEdgeType, 
      defaultEdgeStyle, 
      defaultEdgeAnimated, 
      defaultEdgeWidth,
      defaultEdgeCondition,
      nodes,
    } = get();
    
    let strokeDasharray = undefined;
    if (defaultEdgeStyle === 'dashed') {
      strokeDasharray = '5, 5';
    } else if (defaultEdgeStyle === 'dotted') {
      strokeDasharray = '2, 4';
    }
    
    // Auto-label decision node edges
    const sourceNode = nodes.find(n => n.id === connection.source);
    let autoLabel = '';
    if (sourceNode?.type === 'decision') {
      if (connection.sourceHandle === 'yes') {
        autoLabel = 'Yes';
      } else if (connection.sourceHandle === 'no') {
        autoLabel = 'No';
      }
    }
    
    // Get condition color
    const getConditionColor = (conditionType: EdgeConditionType): string => {
      switch (conditionType) {
        case 'success': return '#22c55e';
        case 'error': return '#ef4444';
        case 'warning': return '#eab308';
        case 'conditional': return '#3b82f6';
        default: return 'hsl(var(--brand-primary))';
      }
    };
    
    set({
      edges: addEdge(
        {
          ...connection,
          type: defaultEdgeType,
          animated: defaultEdgeAnimated,
          style: { 
            stroke: getConditionColor(defaultEdgeCondition),
            strokeWidth: defaultEdgeWidth,
            strokeDasharray,
          },
          data: {
            lineStyle: defaultEdgeStyle,
            label: autoLabel,
            conditionType: defaultEdgeCondition,
            onUpdateLabel: (edgeId: string, label: string) => {
              get().updateEdgeLabel(edgeId, label);
            },
          },
        },
        get().edges
      ),
    });
  },
  
  addNode: (node) => {
    const currentNodes = get().nodes;
    const currentEdges = get().edges;
    
    // Check if we need to create a start node
    const hasStartNode = currentNodes.some(n => n.type === 'start');
    const newNodes = [...currentNodes];
    const newEdges = [...currentEdges];
    
    if (!hasStartNode && node.type === 'default') {
      // Create start node
      const startNode: Node = {
        id: 'start',
        type: 'start',
        position: { x: node.position.x - 250, y: node.position.y },
        data: { label: 'Mulai' },
      };
      newNodes.push(startNode);
      
      // Connect start to new node
      newEdges.push({
        id: `e-start-${node.id}`,
        source: 'start',
        target: node.id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'hsl(var(--brand-primary))', strokeWidth: 2 },
      });
    }
    
    // Add the new node
    newNodes.push(node);
    
    set({
      nodes: newNodes,
      edges: newEdges,
    });
  },
  
  clearCanvas: () => {
    set({
      nodes: [],
      edges: [],
      selectedNode: null,
    });
  },
  
  updateNodeMetrics: (nodeId, metrics) => {
    set({
      nodes: get().nodes.map(node => {
        if (node.id === nodeId) {
          // Generate new label based on metrics
          const newLabel = metrics.length > 0 
            ? metrics.length === 1
              ? metrics[0] // Show first metric only
              : `${metrics[0]} (+${metrics.length - 1})` // Show first + count
            : node.data.originalLabel || node.data.label || 'Input Data'; // Fallback to original label
          
          return { 
            ...node, 
            data: { 
              ...node.data, 
              metrics,
              label: newLabel,
              originalLabel: node.data.originalLabel || node.data.label // Preserve original label
            } 
          };
        }
        return node;
      }),
    });
  },
  
  updateEdgeStyle: (edgeId, updates) => {
    set({
      edges: get().edges.map(edge => 
        edge.id === edgeId 
          ? { ...edge, ...updates }
          : edge
      ),
    });
  },
  
  applyStyleToAllEdges: (style) => {
    set({
      edges: get().edges.map(edge => ({
        ...edge,
        ...style,
      })),
    });
  },
  
  deleteEdge: (edgeId) => {
    set({
      edges: get().edges.filter(edge => edge.id !== edgeId),
    });
    setTimeout(() => get().saveHistory(), 0);
  },
  
  // Copy/Paste Implementation
  copySelection: () => {
    const { nodes, edges } = get();
    const selectedNodes = nodes.filter(n => n.selected);
    const selectedNodeIds = selectedNodes.map(n => n.id);
    
    // Copy edges that connect selected nodes
    const selectedEdges = edges.filter(e => 
      selectedNodeIds.includes(e.source) && selectedNodeIds.includes(e.target)
    );
    
    set({
      clipboard: {
        nodes: selectedNodes,
        edges: selectedEdges,
      },
    });
    
    console.log(`Copied ${selectedNodes.length} nodes and ${selectedEdges.length} edges`);
  },
  
  pasteSelection: () => {
    const { clipboard, nodes, edges } = get();
    
    if (clipboard.nodes.length === 0) {
      console.log('Nothing to paste');
      return;
    }
    
    // Generate new IDs for pasted nodes
    const idMap = new Map<string, string>();
    const timestamp = Date.now();
    
    const newNodes = clipboard.nodes.map((node, index) => {
      const newId = `${node.id}_copy_${timestamp}_${index}`;
      idMap.set(node.id, newId);
      
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
        selected: true,
      };
    });
    
    // Create edges with updated IDs
    const newEdges = clipboard.edges.map((edge, index) => {
      const newSourceId = idMap.get(edge.source);
      const newTargetId = idMap.get(edge.target);
      
      if (!newSourceId || !newTargetId) return null;
      
      return {
        ...edge,
        id: `e_copy_${timestamp}_${index}`,
        source: newSourceId,
        target: newTargetId,
        selected: true,
      };
    }).filter(Boolean) as Edge[];
    
    // Deselect existing nodes
    const updatedNodes = nodes.map(n => ({ ...n, selected: false }));
    const updatedEdges = edges.map(e => ({ ...e, selected: false }));
    
    set({
      nodes: [...updatedNodes, ...newNodes],
      edges: [...updatedEdges, ...newEdges],
    });
    
    setTimeout(() => get().saveHistory(), 0);
    console.log(`Pasted ${newNodes.length} nodes and ${newEdges.length} edges`);
  },
  
  duplicateSelection: () => {
    get().copySelection();
    get().pasteSelection();
  },
  
  // Undo/Redo Implementation
  saveHistory: () => {
    const { nodes, edges, history, historyIndex, maxHistorySize } = get();
    
    // Create snapshot of current state
    const snapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };
    
    // Remove future history if we're in the middle
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Add new snapshot
    newHistory.push(snapshot);
    
    // Limit history size
    if (newHistory.length > maxHistorySize) {
      newHistory.shift();
    } else {
      set({ historyIndex: historyIndex + 1 });
    }
    
    set({ history: newHistory });
  },
  
  undo: () => {
    const { history, historyIndex } = get();
    
    if (historyIndex <= 0) {
      console.log('Nothing to undo');
      return;
    }
    
    const newIndex = historyIndex - 1;
    const snapshot = history[newIndex];
    
    set({
      nodes: JSON.parse(JSON.stringify(snapshot.nodes)),
      edges: JSON.parse(JSON.stringify(snapshot.edges)),
      historyIndex: newIndex,
    });
    
    console.log(`Undo: Restored to state ${newIndex + 1}/${history.length}`);
  },
  
  redo: () => {
    const { history, historyIndex } = get();
    
    if (historyIndex >= history.length - 1) {
      console.log('Nothing to redo');
      return;
    }
    
    const newIndex = historyIndex + 1;
    const snapshot = history[newIndex];
    
    set({
      nodes: JSON.parse(JSON.stringify(snapshot.nodes)),
      edges: JSON.parse(JSON.stringify(snapshot.edges)),
      historyIndex: newIndex,
    });
    
    console.log(`Redo: Restored to state ${newIndex + 1}/${history.length}`);
  },
  
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
  
  // Edge Labels
  updateEdgeLabel: (edgeId, label) => {
    set({
      edges: get().edges.map(edge =>
        edge.id === edgeId
          ? {
              ...edge,
              data: {
                ...edge.data,
                label,
              },
            }
          : edge
      ),
    });
    setTimeout(() => get().saveHistory(), 0);
  },
  
  // Edge Conditions
  setDefaultEdgeCondition: (condition) => set({ defaultEdgeCondition: condition }),
  
  // Validation
  setValidationOptions: (options) => set({ validationOptions: options }),
  
  validateWorkflow: () => {
    const { nodes, edges } = get();
    const errors = WorkflowValidator.validateWorkflow(nodes, edges);
    set({ validationErrors: errors });
    return errors;
  },
  
  toggleValidation: () => {
    const newShowValidation = !get().showValidation;
    set({ showValidation: newShowValidation });
    
    if (newShowValidation) {
      get().validateWorkflow();
    }
  },
  
  getNodeErrors: (nodeId) => {
    return get().validationErrors.filter(e => e.nodeId === nodeId);
  },
  
  // Node Groups
  createGroup: (nodeIds, label = 'New Group') => {
    const { nodes } = get();
    const selectedNodes = nodes.filter(n => nodeIds.includes(n.id));
    
    if (selectedNodes.length === 0) return;
    
    // Calculate bounding box
    const minX = Math.min(...selectedNodes.map(n => n.position.x)) - 20;
    const minY = Math.min(...selectedNodes.map(n => n.position.y)) - 50;
    const maxX = Math.max(...selectedNodes.map(n => n.position.x + (n.width || 150)));
    const maxY = Math.max(...selectedNodes.map(n => n.position.y + (n.height || 50)));
    
    const groupId = `group_${Date.now()}`;
    
    // Create group node
    const groupNode: Node = {
      id: groupId,
      type: 'group',
      position: { x: minX, y: minY },
      data: { label },
      style: {
        width: maxX - minX + 40,
        height: maxY - minY + 70,
      },
    };
    
    // Update child nodes to be inside group
    const updatedNodes = nodes.map(n => {
      if (nodeIds.includes(n.id)) {
        return {
          ...n,
          parentId: groupId,
          extent: 'parent' as const,
          position: {
            x: n.position.x - minX,
            y: n.position.y - minY,
          },
        };
      }
      return n;
    });
    
    set({
      nodes: [...updatedNodes, groupNode],
    });
    
    setTimeout(() => get().saveHistory(), 0);
  },
  
  ungroupNodes: (groupId) => {
    const { nodes } = get();
    const group = nodes.find(n => n.id === groupId);
    
    if (!group) return;
    
    // Remove group and unparent children
    set({
      nodes: nodes
        .filter(n => n.id !== groupId)
        .map(n => {
          if (n.parentId === groupId) {
            return {
              ...n,
              parentId: undefined,
              extent: undefined,
              position: {
                x: n.position.x + group.position.x,
                y: n.position.y + group.position.y,
              },
            };
          }
          return n;
        }),
    });
    
    setTimeout(() => get().saveHistory(), 0);
  },
  
  addNodeToGroup: (nodeId, groupId) => {
    const { nodes } = get();
    const node = nodes.find(n => n.id === nodeId);
    const group = nodes.find(n => n.id === groupId);
    
    if (!node || !group || group.type !== 'group') return;
    
    set({
      nodes: nodes.map(n => {
        if (n.id === nodeId) {
          return {
            ...n,
            parentId: groupId,
            extent: 'parent' as const,
            position: {
              x: n.position.x - group.position.x,
              y: n.position.y - group.position.y,
            },
          };
        }
        return n;
      }),
    });
  },
  
  removeNodeFromGroup: (nodeId) => {
    const { nodes } = get();
    const node = nodes.find(n => n.id === nodeId);
    
    if (!node || !node.parentId) return;
    
    const parent = nodes.find(n => n.id === node.parentId);
    if (!parent) return;
    
    set({
      nodes: nodes.map(n => {
        if (n.id === nodeId) {
          return {
            ...n,
            parentId: undefined,
            extent: undefined,
            position: {
              x: n.position.x + parent.position.x,
              y: n.position.y + parent.position.y,
            },
          };
        }
        return n;
      }),
    });
  },
  
  // Export/Import
  exportWorkflowJSON: () => {
    const { nodes, edges } = get();
    
    const workflow = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      metadata: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
      },
      nodes: nodes.map(node => ({
        ...node,
        selected: false,
        dragging: false,
      })),
      edges: edges.map(edge => ({
        ...edge,
        selected: false,
      })),
    };
    
    return JSON.stringify(workflow, null, 2);
  },
  
  importWorkflowJSON: (json) => {
    try {
      const workflow = JSON.parse(json);
      
      if (!workflow.nodes || !workflow.edges) {
        throw new Error('Invalid workflow format');
      }
      
      set({
        nodes: workflow.nodes,
        edges: workflow.edges,
        history: [],
        historyIndex: -1,
      });
      
      console.log('Workflow imported successfully');
    } catch (error) {
      console.error('Failed to import workflow:', error);
      throw error;
    }
  },
}));
