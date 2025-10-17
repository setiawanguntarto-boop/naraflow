import { create } from 'zustand';
import { Node, Edge, applyNodeChanges, applyEdgeChanges, addEdge, Connection } from '@xyflow/react';

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  defaultEdgeType: 'smoothstep' | 'straight' | 'step' | 'default';
  defaultEdgeStyle: 'solid' | 'dashed' | 'dotted';
  defaultEdgeAnimated: boolean;
  defaultEdgeWidth: number;
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
}

export const useWorkflowState = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  defaultEdgeType: 'smoothstep',
  defaultEdgeStyle: 'solid',
  defaultEdgeAnimated: true,
  defaultEdgeWidth: 2,
  
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  setDefaultEdgeType: (type) => set({ defaultEdgeType: type }),
  setDefaultEdgeStyle: (style) => set({ defaultEdgeStyle: style }),
  setDefaultEdgeAnimated: (animated) => set({ defaultEdgeAnimated: animated }),
  setDefaultEdgeWidth: (width) => set({ defaultEdgeWidth: width }),
  
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
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
  },
}));
