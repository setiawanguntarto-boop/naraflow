import { create } from 'zustand';
import { Node, Edge, applyNodeChanges, applyEdgeChanges, addEdge, Connection } from '@xyflow/react';
import { EdgeConditionType, ValidationOptions } from '@/types/workflow';

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
    setTimeout(() => get().saveHistory(), 300);
  },
  
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
    setTimeout(() => get().saveHistory(), 300);
  },
  
  onConnect: (connection) => {
    const { defaultEdgeType, defaultEdgeStyle, defaultEdgeAnimated, defaultEdgeWidth } = get();
    
    let strokeDasharray = undefined;
    if (defaultEdgeStyle === 'dashed') {
      strokeDasharray = '5, 5';
    } else if (defaultEdgeStyle === 'dotted') {
      strokeDasharray = '2, 4';
    }
    
    set({
      edges: addEdge(
        {
          ...connection,
          type: defaultEdgeType,
          animated: defaultEdgeAnimated,
          style: { 
            stroke: 'hsl(var(--brand-primary))', 
            strokeWidth: defaultEdgeWidth,
            strokeDasharray,
          },
          data: {
            lineStyle: defaultEdgeStyle,
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
}));
