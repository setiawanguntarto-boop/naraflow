import { create } from 'zustand';
import { Node, Edge, applyNodeChanges, applyEdgeChanges, addEdge, Connection } from '@xyflow/react';

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (node: Node | null) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  clearCanvas: () => void;
  updateNodeMetrics: (nodeId: string, metrics: string[]) => void;
}

export const useWorkflowState = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  
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
    set({
      edges: addEdge(
        {
          ...connection,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'hsl(var(--brand-primary))', strokeWidth: 2 },
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
      nodes: get().nodes.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, metrics } }
          : node
      ),
    });
  },
}));
