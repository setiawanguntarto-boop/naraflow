import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import {
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import { EdgeConditionType, ValidationOptions } from "@/types/workflow";
import { WorkflowValidator, ValidationError } from "@/utils/workflowValidation";
import { workflowTemplates } from "@/lib/templates/workflowTemplates";
import { ConnectionWithLabel, ConnectionLabelMetadata } from "@/types/connection";
import { ConnectionLabel } from "@/types/connectionLabel.types";
import { TemplateData, TemplateManager } from "@/lib/templateManager";
import { TemplateStorage } from "@/lib/templateStorage";
import { SessionManager, SessionData } from "@/lib/sessionManager";
import { globalCanvasEventBus } from "@/hooks/useCanvasEventBus";

// Simple UUID generator
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Node Entity interface for O(1) lookup
interface NodeEntity extends Node {
  status?: "idle" | "running" | "completed" | "error" | "warning";
  lastUpdated?: number;
  executionCount?: number;

  /**
   * Sub-node support (Langflow-style)
   * All sub-node data stored in node.data to avoid React Flow type conflicts
   *
   * Note: data extends Node['data'] to maintain React Flow compatibility
   * while adding optional sub-node fields
   */
  data: Node["data"] & {
    /**
     * Sub-nodes attached to this node
     * Structure: { id, type, label, portId, config }
     */
    subNodes?: Array<{
      id: string;
      type: string;
      label: string;
      portId?: string;
      config?: any;
    }>;

    /**
     * Active attachment ports
     * e.g., ['model', 'memory', 'parser']
     */
    attachmentPorts?: string[];

    /**
     * Parent node ID (if this is a sub-node)
     */
    parentNodeId?: string;
  };
}

// Edge Entity interface
interface EdgeEntity extends Edge {
  status?: "active" | "inactive" | "error" | "conditional";
  lastUpdated?: number;
}

// UI State (separate from business logic)
interface UIState {
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  selectedEdgeId: string | null;
  zoom: number;
  pan: { x: number; y: number };
  showValidation: boolean;
  autoValidate: boolean;
  showMinimap: boolean;
  showControls: boolean;
  isDragging: boolean;
  isConnecting: boolean;
}

// Runtime State (business logic)
interface RuntimeState {
  sessionId: string | null;
  isActive: boolean;
  lastSaved: number | null;
  hasUnsavedChanges: boolean;
  executionInProgress: boolean;
  currentExecutionId: string | null;
}

// Batch Update Interface
interface BatchUpdate {
  nodes?: Record<string, Partial<NodeEntity>>;
  edges?: Record<string, Partial<EdgeEntity>>;
  ui?: Partial<UIState>;
  runtime?: Partial<RuntimeState>;
}

interface WorkflowState {
  // Core Data (Runtime State)
  nodes: Record<string, NodeEntity>;
  edges: Record<string, EdgeEntity>;

  // UI State (separate from business logic)
  ui: UIState;

  // Runtime State (session and execution)
  runtime: RuntimeState;

  // Legacy arrays for React Flow compatibility
  nodesArray: Node[];
  edgesArray: Edge[];

  // Configuration
  defaultEdgeType: "smoothstep" | "straight" | "step" | "default";
  defaultEdgeStyle: "solid" | "dashed" | "dotted";
  defaultEdgeAnimated: boolean;
  defaultEdgeWidth: number;
  defaultEdgeCondition: EdgeConditionType;

  // LLaMA Configuration
  llamaConfig: {
    mode: "local" | "cloud";
    endpoint: string;
    apiKey?: string;
    connected?: boolean;
    lastModel?: string;
    llamaStatus: "connected" | "disconnected" | "checking";
    useLocalLlama: boolean;
  };

  // LLaMA Generation Cache
  llamaCache: {
    [prompt: string]: {
      raw: string;
      parsed: any;
      timestamp: string;
      model?: string;
    };
  };

  // LLaMA Logs for audit trail
  llamaLogs: Array<{
    id: string;
    nodeId: string;
    prompt: string;
    timestamp: string;
    model: string;
    mode: string;
    rawPreview: string;
  }>;

  // Copy/Paste
  clipboard: {
    nodes: Node[];
    edges: Edge[];
  };

  // Undo/Redo
  history: Array<{
    nodes: Record<string, NodeEntity>;
    edges: Record<string, EdgeEntity>;
    ui: UIState;
    runtime: RuntimeState;
  }>;
  historyIndex: number;
  maxHistorySize: number;

  // Validation
  validationOptions: ValidationOptions;
  validationErrors: ValidationError[];

  // Session Management
  sessionManager: SessionManager;
  currentSessionId: string | null;

  // Actions
  actions: {
    // Node Operations
    updateNode: (nodeId: string, updates: Partial<NodeEntity>) => void;
    addNode: (node: NodeEntity) => void;
    removeNode: (nodeId: string) => void;
    moveNode: (nodeId: string, position: { x: number; y: number }) => void;
    setNodeStatus: (nodeId: string, status: NodeEntity["status"]) => void;

    // Sub-node Operations (Langflow-style)
    attachSubNode: (parentId: string, nodeId: string, portId: string) => void;
    detachSubNode: (parentId: string, nodeId: string) => void;
    getSubNodes: (parentId: string) => NodeEntity[];
    updateAttachmentPort: (parentId: string, portId: string, enabled: boolean) => void;

    // Edge Operations
    addEdge: (edge: EdgeEntity) => void;
    removeEdge: (edgeId: string) => void;
    updateEdge: (edgeId: string, updates: Partial<EdgeEntity>) => void;
    setEdgeStatus: (edgeId: string, status: EdgeEntity["status"]) => void;

    // UI Operations
    selectNode: (nodeId: string | null) => void;
    selectEdge: (edgeId: string | null) => void;
    setZoom: (zoom: number) => void;
    setPan: (pan: { x: number; y: number }) => void;
    toggleValidation: () => void;
    toggleAutoValidate: () => void;

    // Batch Operations
    batchUpdate: (updates: BatchUpdate) => void;
    processNodeChanges: (changes: NodeChange[]) => void;
    processEdgeChanges: (changes: EdgeChange[]) => void;

    // Session Operations
    createSession: (name: string, description?: string) => Promise<string>;
    loadSession: (sessionId: string) => Promise<void>;
    saveSession: () => Promise<void>;
    switchSession: (sessionId: string) => Promise<void>;
    deleteSession: (sessionId: string) => Promise<void>;

    // History Operations
    saveHistory: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;

    // Template Operations
    saveAsTemplate: (
      name: string,
      description: string,
      category?: string,
      tags?: string[]
    ) => Promise<void>;
    loadTemplate: (templateId: string) => Promise<void>;
    duplicateTemplate: (templateId: string) => Promise<void>;
    deleteTemplate: (templateId: string) => Promise<void>;
    exportTemplate: (templateId: string) => Promise<void>;
    importTemplate: (file: File) => Promise<void>;

    // Utility Operations
    clearCanvas: () => void;
    exportWorkflowJSON: () => string;
    importWorkflowJSON: (json: string) => void;
    validateWorkflow: () => ValidationError[];
    getNodeErrors: (nodeId: string) => ValidationError[];

    // Selection Operations
    copySelection: (nodeIds: string[], edgeIds: string[]) => void;
    pasteSelection: () => void;
    duplicateSelection: (nodeIds: string[], edgeIds: string[]) => void;

    // Batch Operations
    removeNodes: (nodeIds: string[]) => void;
    removeEdges: (edgeIds: string[]) => void;
    createGroup: (nodeIds: string[]) => void;
    ungroupNodes: (groupNodeIds: string[]) => void;

    // LLaMA Operations
    setLlamaConfig: (config: Partial<WorkflowState["llamaConfig"]>) => void;
    appendLlamaLog: (message: string) => void;
    applyTemplateFlow: (templateId: keyof typeof workflowTemplates) => void;
  };
}

// Helper function to convert nodes/edges records to arrays
const recordsToArrays = (nodes: Record<string, NodeEntity>, edges: Record<string, EdgeEntity>) => {
  return {
    nodesArray: Object.values(nodes),
    edgesArray: Object.values(edges),
  };
};

// Helper function to convert arrays to records
const arraysToRecords = (nodes: Node[], edges: Edge[]) => {
  const nodesRecord: Record<string, NodeEntity> = {};
  const edgesRecord: Record<string, EdgeEntity> = {};

  nodes.forEach(node => {
    nodesRecord[node.id] = { ...node, lastUpdated: Date.now() };
  });

  edges.forEach(edge => {
    edgesRecord[edge.id] = { ...edge, lastUpdated: Date.now() };
  });

  return { nodesRecord, edgesRecord };
};

export const useWorkflowState = create<WorkflowState>()(
  subscribeWithSelector((set, get) => ({
    // Core Data
    nodes: {},
    edges: {},

    // UI State
    ui: {
      selectedNodeId: null,
      selectedNodeIds: [],
      selectedEdgeId: null,
      zoom: 1,
      pan: { x: 0, y: 0 },
      showValidation: false,
    autoValidate: true,
      showMinimap: true,
      showControls: true,
      isDragging: false,
      isConnecting: false,
    },

    // Runtime State
    runtime: {
      sessionId: null,
      isActive: false,
      lastSaved: null,
      hasUnsavedChanges: false,
      executionInProgress: false,
      currentExecutionId: null,
    },

    // Legacy arrays for React Flow compatibility
    nodesArray: [],
    edgesArray: [],

    // Configuration
    defaultEdgeType: "smoothstep",
    defaultEdgeStyle: "solid",
    defaultEdgeAnimated: true,
    defaultEdgeWidth: 2,
    defaultEdgeCondition: "default",

    // LLaMA Configuration
    llamaConfig: {
      mode: "local",
      endpoint: "http://localhost:11434",
      connected: false,
      llamaStatus: "disconnected" as const,
      useLocalLlama: true,
    },

    // LLaMA Generation Cache
    llamaCache: {},

    // LLaMA Logs
    llamaLogs: [],

    // Copy/Paste
    clipboard: {
      nodes: [],
      edges: [],
    },

    // Undo/Redo
    history: [],
    historyIndex: -1,
    maxHistorySize: 50,

    // Validation
    validationOptions: {
      allowCircular: false,
      preventDuplicates: true,
      preventSelfConnections: true,
      maxConnectionsPerHandle: 5,
    },
    validationErrors: [],

    // Session Management
    sessionManager: new SessionManager(),
    currentSessionId: null,

    // Actions
    actions: {
      // Node Operations
      updateNode: (nodeId, updates) => {
        set(state => {
          const updatedNodes = {
            ...state.nodes,
            [nodeId]: {
              ...state.nodes[nodeId],
              ...updates,
              lastUpdated: Date.now(),
            },
          };

          const { nodesArray, edgesArray } = recordsToArrays(updatedNodes, state.edges);

          return {
            nodes: updatedNodes,
            nodesArray,
            runtime: {
              ...state.runtime,
              hasUnsavedChanges: true,
            },
          };
        }, false);

        // Emit event
        globalCanvasEventBus.emit({
          type: "node:update",
          payload: { nodeId, updates },
        });
      },

      addNode: node => {
        set(state => {
          const updatedNodes = {
            ...state.nodes,
            [node.id]: {
              ...node,
              lastUpdated: Date.now(),
            },
          };

          const { nodesArray, edgesArray } = recordsToArrays(updatedNodes, state.edges);

          return {
            nodes: updatedNodes,
            nodesArray,
            runtime: {
              ...state.runtime,
              hasUnsavedChanges: true,
            },
          };
        }, false);

        // Emit event
        globalCanvasEventBus.emit({
          type: "node:add",
          payload: { node },
        });
      },

      // Sub-node Management (Langflow-style)
      attachSubNode: (parentId, nodeId, portId) => {
        set(state => {
          const parent = state.nodes[parentId];
          const childNode = state.nodes[nodeId];

          if (!parent || !childNode) return state;

          // Get existing sub-nodes or initialize
          const subNodes = parent.data?.subNodes || [];

          // Check if already attached
          const isAlreadyAttached = subNodes.some((s: any) => s.id === nodeId);
          if (isAlreadyAttached) return state;

          // Add to parent's subNodes
          const updatedParent = {
            ...parent,
            data: {
              ...parent.data,
              subNodes: [
                ...subNodes,
                {
                  id: nodeId,
                  type: childNode.type,
                  label: String(childNode.data?.label || childNode.id),
                  portId,
                },
              ],
            },
            lastUpdated: Date.now(),
          };

          // Mark child node as attached
          const updatedChild = {
            ...childNode,
            data: {
              ...childNode.data,
              parentNodeId: parentId,
            },
            lastUpdated: Date.now(),
          };

          const updatedNodes = {
            ...state.nodes,
            [parentId]: updatedParent,
            [nodeId]: updatedChild,
          };

          const { nodesArray, edgesArray } = recordsToArrays(updatedNodes, state.edges);

          return {
            nodes: updatedNodes,
            nodesArray,
            runtime: {
              ...state.runtime,
              hasUnsavedChanges: true,
            },
          };
        }, false);

        globalCanvasEventBus.emit({
          type: "subnode:attached",
          payload: { parentId, nodeId, portId },
        });
      },

      detachSubNode: (parentId, nodeId) => {
        set(state => {
          const parent = state.nodes[parentId];
          const childNode = state.nodes[nodeId];

          if (!parent || !childNode) return state;

          // Remove from parent's subNodes
          const subNodes = (parent.data?.subNodes || []).filter((s: any) => s.id !== nodeId);

          const updatedParent = {
            ...parent,
            data: {
              ...parent.data,
              subNodes,
            },
            lastUpdated: Date.now(),
          };

          // Unmark child node
          const updatedChild = {
            ...childNode,
            data: {
              ...childNode.data,
              parentNodeId: undefined,
            },
            lastUpdated: Date.now(),
          };

          const updatedNodes = {
            ...state.nodes,
            [parentId]: updatedParent,
            [nodeId]: updatedChild,
          };

          const { nodesArray, edgesArray } = recordsToArrays(updatedNodes, state.edges);

          return {
            nodes: updatedNodes,
            nodesArray,
            runtime: {
              ...state.runtime,
              hasUnsavedChanges: true,
            },
          };
        }, false);

        globalCanvasEventBus.emit({
          type: "subnode:detached",
          payload: { parentId, nodeId },
        });
      },

      getSubNodes: parentId => {
        const state = get();
        const parent = state.nodes[parentId];

        if (!parent || !parent.data?.subNodes) return [];

        return parent.data.subNodes.map((sub: any) => state.nodes[sub.id]).filter(Boolean);
      },

      updateAttachmentPort: (parentId, portId, enabled) => {
        set(state => {
          const parent = state.nodes[parentId];
          if (!parent) return state;

          const attachmentPorts = parent.data?.attachmentPorts || [];

          const updatedPorts = enabled
            ? [...new Set([...attachmentPorts, portId])]
            : attachmentPorts.filter((p: string) => p !== portId);

          const updatedParent = {
            ...parent,
            data: {
              ...parent.data,
              attachmentPorts: updatedPorts,
            },
            lastUpdated: Date.now(),
          };

          const updatedNodes = {
            ...state.nodes,
            [parentId]: updatedParent,
          };

          const { nodesArray, edgesArray } = recordsToArrays(updatedNodes, state.edges);

          return {
            nodes: updatedNodes,
            nodesArray,
            runtime: {
              ...state.runtime,
              hasUnsavedChanges: true,
            },
          };
        }, false);
      },

      removeNode: nodeId => {
        set(state => {
          const updatedNodes = { ...state.nodes };
          delete updatedNodes[nodeId];

          // Remove connected edges
          const updatedEdges = { ...state.edges };
          Object.keys(updatedEdges).forEach(edgeId => {
            const edge = updatedEdges[edgeId];
            if (edge.source === nodeId || edge.target === nodeId) {
              delete updatedEdges[edgeId];
            }
          });

          const { nodesArray, edgesArray } = recordsToArrays(updatedNodes, updatedEdges);

          return {
            nodes: updatedNodes,
            edges: updatedEdges,
            nodesArray,
            edgesArray,
            ui: {
              ...state.ui,
              selectedNodeId: state.ui.selectedNodeId === nodeId ? null : state.ui.selectedNodeId,
            },
            runtime: {
              ...state.runtime,
              hasUnsavedChanges: true,
            },
          };
        }, false);

        // Emit event
        globalCanvasEventBus.emit({
          type: "node:delete",
          payload: { nodeId },
        });
      },

      moveNode: (nodeId, position) => {
        set(state => {
          const updatedNodes = {
            ...state.nodes,
            [nodeId]: {
              ...state.nodes[nodeId],
              position,
              lastUpdated: Date.now(),
            },
          };

          const { nodesArray, edgesArray } = recordsToArrays(updatedNodes, state.edges);

          return {
            nodes: updatedNodes,
            nodesArray,
            runtime: {
              ...state.runtime,
              hasUnsavedChanges: true,
            },
          };
        }, false);

        // Emit event
        globalCanvasEventBus.emit({
          type: "node:move",
          payload: { nodeId, position },
        });
      },

      setNodeStatus: (nodeId, status) => {
        set(state => {
          const updatedNodes = {
            ...state.nodes,
            [nodeId]: {
              ...state.nodes[nodeId],
              status,
              lastUpdated: Date.now(),
            },
          };

          const { nodesArray, edgesArray } = recordsToArrays(updatedNodes, state.edges);

          return {
            nodes: updatedNodes,
            nodesArray,
          };
        }, false);

        // Emit event
        globalCanvasEventBus.emit({
          type: "execution:status",
          payload: { nodeId, status },
        });
      },

      // Edge Operations
      addEdge: edge => {
        set(state => {
          const updatedEdges = {
            ...state.edges,
            [edge.id]: {
              ...edge,
              lastUpdated: Date.now(),
            },
          };

          const { nodesArray, edgesArray } = recordsToArrays(state.nodes, updatedEdges);

          return {
            edges: updatedEdges,
            edgesArray,
            runtime: {
              ...state.runtime,
              hasUnsavedChanges: true,
            },
          };
        }, false);

        // Emit event
        globalCanvasEventBus.emit({
          type: "edge:create",
          payload: { edge },
        });
      },

      removeEdge: edgeId => {
        set(state => {
          const updatedEdges = { ...state.edges };
          delete updatedEdges[edgeId];

          const { nodesArray, edgesArray } = recordsToArrays(state.nodes, updatedEdges);

          return {
            edges: updatedEdges,
            edgesArray,
            ui: {
              ...state.ui,
              selectedEdgeId: state.ui.selectedEdgeId === edgeId ? null : state.ui.selectedEdgeId,
            },
            runtime: {
              ...state.runtime,
              hasUnsavedChanges: true,
            },
          };
        }, false);

        // Emit event
        globalCanvasEventBus.emit({
          type: "edge:delete",
          payload: { edgeId },
        });
      },

      updateEdge: (edgeId, updates) => {
        set(state => {
          const updatedEdges = {
            ...state.edges,
            [edgeId]: {
              ...state.edges[edgeId],
              ...updates,
              lastUpdated: Date.now(),
            },
          };

          const { nodesArray, edgesArray } = recordsToArrays(state.nodes, updatedEdges);

          return {
            edges: updatedEdges,
            edgesArray,
            runtime: {
              ...state.runtime,
              hasUnsavedChanges: true,
            },
          };
        }, false);

        // Emit event
        globalCanvasEventBus.emit({
          type: "edge:update",
          payload: { edgeId, updates },
        });
      },

      setEdgeStatus: (edgeId, status) => {
        set(state => {
          const updatedEdges = {
            ...state.edges,
            [edgeId]: {
              ...state.edges[edgeId],
              status,
              lastUpdated: Date.now(),
            },
          };

          const { nodesArray, edgesArray } = recordsToArrays(state.nodes, updatedEdges);

          return {
            edges: updatedEdges,
            edgesArray,
          };
        }, false);
      },

      // UI Operations
      selectNode: nodeId => {
        set(
          state => ({
            ui: {
              ...state.ui,
              selectedNodeId: nodeId,
              selectedEdgeId: null,
            },
          }),
          false
        );

        // Emit event
        globalCanvasEventBus.emit({
          type: "node:select",
          payload: { nodeId },
        });
      },

      selectEdge: edgeId => {
        set(
          state => ({
            ui: {
              ...state.ui,
              selectedEdgeId: edgeId,
              selectedNodeId: null,
            },
          }),
          false
        );

        // Emit event
        globalCanvasEventBus.emit({
          type: "edge:select",
          payload: { edgeId },
        });
      },

      setZoom: zoom => {
        set(
          state => ({
            ui: {
              ...state.ui,
              zoom,
            },
          }),
          false
        );

        // Emit event
        globalCanvasEventBus.emit({
          type: "ui:zoom",
          payload: { zoom },
        });
      },

      setPan: pan => {
        set(
          state => ({
            ui: {
              ...state.ui,
              pan,
            },
          }),
          false
        );

        // Emit event
        globalCanvasEventBus.emit({
          type: "ui:pan",
          payload: { pan },
        });
      },

      toggleValidation: () => {
        set(
          state => ({
            ui: {
              ...state.ui,
              showValidation: !state.ui.showValidation,
            },
          }),
          false
        );
      },

      toggleAutoValidate: () => {
        set(
          state => ({
            ui: {
              ...state.ui,
              autoValidate: !state.ui.autoValidate,
            },
          }),
          false
        );
      },

      // Batch Operations
      batchUpdate: updates => {
        console.log("[WorkflowState] batchUpdate called:", {
          nodeCount: Object.keys(updates.nodes || {}).length,
          edgeCount: Object.keys(updates.edges || {}).length,
          edgeIds: Object.keys(updates.edges || {}),
        });

        set(state => {
          const newState = { ...state };

          if (updates.nodes) {
            // REPLACE all nodes instead of merging
            // Cast to correct type since we're replacing the entire record
            newState.nodes = updates.nodes as Record<string, NodeEntity>;
            console.log("[WorkflowState] Nodes replaced:", Object.keys(newState.nodes).length);
          }

          if (updates.edges) {
            // REPLACE all edges instead of merging
            // Cast to correct type since we're replacing the entire record
            newState.edges = updates.edges as Record<string, EdgeEntity>;
            console.log("[WorkflowState] Edges replaced:", Object.keys(newState.edges).length);
          }

          if (updates.ui) {
            newState.ui = { ...state.ui, ...updates.ui };
          }

          if (updates.runtime) {
            newState.runtime = { ...state.runtime, ...updates.runtime };
          }

          // Update arrays
          const { nodesArray, edgesArray } = recordsToArrays(newState.nodes, newState.edges);
          newState.nodesArray = nodesArray;
          newState.edgesArray = edgesArray;

          console.log("[WorkflowState] Final counts:", {
            nodesArray: nodesArray.length,
            edgesArray: edgesArray.length,
          });

          return newState;
        }, false);

        // Emit batch event
        globalCanvasEventBus.emit({
          type: "batch:update",
          payload: { updates },
        });
      },

      processNodeChanges: changes => {
        const state = get();
        const updatedNodes = { ...state.nodes };

        changes.forEach(change => {
          if (change.type === "position" && change.position) {
            updatedNodes[change.id] = {
              ...updatedNodes[change.id],
              position: change.position,
              lastUpdated: Date.now(),
            };
          } else if (change.type === "remove") {
            delete updatedNodes[change.id];
          }
        });

        const { nodesArray, edgesArray } = recordsToArrays(updatedNodes, state.edges);

        set(
          {
            nodes: updatedNodes,
            nodesArray,
            runtime: {
              ...state.runtime,
              hasUnsavedChanges: true,
            },
          },
          false
        );
      },

      processEdgeChanges: changes => {
        const state = get();
        const updatedEdges = { ...state.edges };

        changes.forEach(change => {
          if (change.type === "remove") {
            delete updatedEdges[change.id];
          }
        });

        const { nodesArray, edgesArray } = recordsToArrays(state.nodes, updatedEdges);

        set(
          {
            edges: updatedEdges,
            edgesArray,
            runtime: {
              ...state.runtime,
              hasUnsavedChanges: true,
            },
          },
          false
        );
      },

      // Session Operations
      createSession: async (name, description) => {
        const { sessionManager } = get();
        const sessionId = await sessionManager.createSession(name, description);

        set(
          {
            currentSessionId: sessionId,
            runtime: {
              ...get().runtime,
              sessionId,
              isActive: true,
              hasUnsavedChanges: false,
            },
          },
          false
        );

        return sessionId;
      },

      loadSession: async sessionId => {
        const { sessionManager } = get();
        const sessionData = await sessionManager.loadSession(sessionId);

        if (sessionData) {
          const { nodesRecord, edgesRecord } = arraysToRecords(
            sessionData.nodes,
            sessionData.edges
          );
          const { nodesArray, edgesArray } = recordsToArrays(nodesRecord, edgesRecord);

          set(
            {
              nodes: nodesRecord,
              edges: edgesRecord,
              nodesArray,
              edgesArray,
              currentSessionId: sessionId,
              runtime: {
                ...get().runtime,
                sessionId,
                isActive: true,
                hasUnsavedChanges: false,
                lastSaved: Date.now(),
              },
              ui: {
                ...get().ui,
                selectedNodeId: null,
                selectedEdgeId: null,
              },
            },
            false
          );

          // Save to history
          setTimeout(() => get().actions.saveHistory(), 100);
        }
      },

      saveSession: async () => {
        const { sessionManager, currentSessionId, nodesArray, edgesArray } = get();

        if (!currentSessionId) {
          throw new Error("No active session to save");
        }

        await sessionManager.saveSession(currentSessionId, nodesArray, edgesArray);

        set(
          {
            runtime: {
              ...get().runtime,
              hasUnsavedChanges: false,
              lastSaved: Date.now(),
            },
          },
          false
        );
      },

      switchSession: async sessionId => {
        await get().actions.loadSession(sessionId);
      },

      deleteSession: async sessionId => {
        const { sessionManager, currentSessionId } = get();

        await sessionManager.deleteSession(sessionId);

        if (currentSessionId === sessionId) {
          set(
            {
              nodes: {},
              edges: {},
              nodesArray: [],
              edgesArray: [],
              currentSessionId: null,
              runtime: {
                ...get().runtime,
                sessionId: null,
                isActive: false,
                hasUnsavedChanges: false,
              },
              ui: {
                ...get().ui,
                selectedNodeId: null,
                selectedEdgeId: null,
              },
            },
            false
          );
        }
      },

      // History Operations
      saveHistory: () => {
        const state = get();
        const historyEntry = {
          nodes: { ...state.nodes },
          edges: { ...state.edges },
          ui: { ...state.ui },
          runtime: { ...state.runtime },
        };

        set(state => {
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(historyEntry);

          if (newHistory.length > state.maxHistorySize) {
            newHistory.shift();
          } else {
            state.historyIndex++;
          }

          return {
            history: newHistory,
            historyIndex: state.historyIndex,
          };
        }, false);
      },

      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const historyEntry = state.history[state.historyIndex - 1];
          const { nodesArray, edgesArray } = recordsToArrays(
            historyEntry.nodes,
            historyEntry.edges
          );

          set(
            {
              nodes: historyEntry.nodes,
              edges: historyEntry.edges,
              nodesArray,
              edgesArray,
              ui: historyEntry.ui,
              runtime: historyEntry.runtime,
              historyIndex: state.historyIndex - 1,
            },
            false
          );
        }
      },

      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          const historyEntry = state.history[state.historyIndex + 1];
          const { nodesArray, edgesArray } = recordsToArrays(
            historyEntry.nodes,
            historyEntry.edges
          );

          set(
            {
              nodes: historyEntry.nodes,
              edges: historyEntry.edges,
              nodesArray,
              edgesArray,
              ui: historyEntry.ui,
              runtime: historyEntry.runtime,
              historyIndex: state.historyIndex + 1,
            },
            false
          );
        }
      },

      canUndo: () => {
        return get().historyIndex > 0;
      },

      canRedo: () => {
        const state = get();
        return state.historyIndex < state.history.length - 1;
      },

      // Template Operations (keeping existing implementation)
      saveAsTemplate: async (name, description, category = "general", tags = []) => {
        const { nodesArray, edgesArray } = get();

        if (nodesArray.length === 0) {
          throw new Error("Cannot save empty workflow as template");
        }

        try {
          const template = TemplateManager.createTemplate(
            name,
            description,
            nodesArray,
            edgesArray,
            category,
            tags
          );

          const templateStorage = new TemplateStorage();
          await templateStorage.saveTemplate(template);

          console.log("Template saved successfully:", template.metadata.id);
        } catch (error) {
          console.error("Failed to save template:", error);
          throw error;
        }
      },

      loadTemplate: async templateId => {
        try {
          const templateStorage = new TemplateStorage();
          const template = await templateStorage.loadTemplate(templateId);

          if (!template) {
            throw new Error("Template not found");
          }

          get().actions.clearCanvas();

          const { nodesRecord, edgesRecord } = arraysToRecords(template.nodes, template.edges);
          const { nodesArray, edgesArray } = recordsToArrays(nodesRecord, edgesRecord);

          set({
            nodes: nodesRecord,
            edges: edgesRecord,
            nodesArray,
            edgesArray,
          });

          setTimeout(() => get().actions.saveHistory(), 100);

          console.log("Template loaded successfully:", template.metadata.name);
        } catch (error) {
          console.error("Failed to load template:", error);
          throw error;
        }
      },

      duplicateTemplate: async templateId => {
        try {
          const templateStorage = new TemplateStorage();
          const template = await templateStorage.loadTemplate(templateId);

          if (!template) {
            throw new Error("Template not found");
          }

          const duplicateTemplate = TemplateManager.createTemplate(
            `${template.metadata.name} (Copy)`,
            template.metadata.description,
            template.nodes,
            template.edges,
            template.metadata.category,
            template.metadata.tags
          );

          await templateStorage.saveTemplate(duplicateTemplate);

          console.log("Template duplicated successfully:", duplicateTemplate.metadata.id);
        } catch (error) {
          console.error("Failed to duplicate template:", error);
          throw error;
        }
      },

      deleteTemplate: async templateId => {
        try {
          const templateStorage = new TemplateStorage();
          await templateStorage.deleteTemplate(templateId);

          console.log("Template deleted successfully:", templateId);
        } catch (error) {
          console.error("Failed to delete template:", error);
          throw error;
        }
      },

      exportTemplate: async templateId => {
        try {
          const templateStorage = new TemplateStorage();
          const template = await templateStorage.loadTemplate(templateId);

          if (!template) {
            throw new Error("Template not found");
          }

          await templateStorage.exportToFile(template);

          console.log("Template exported successfully:", template.metadata.name);
        } catch (error) {
          console.error("Failed to export template:", error);
          throw error;
        }
      },

      importTemplate: async file => {
        try {
          const templateStorage = new TemplateStorage();
          const template = await templateStorage.importFromFile(file);

          await templateStorage.saveTemplate(template);

          console.log("Template imported successfully:", template.metadata.name);
        } catch (error) {
          console.error("Failed to import template:", error);
          throw error;
        }
      },

      // Utility Operations
      clearCanvas: () => {
        set(
          {
            nodes: {},
            edges: {},
            nodesArray: [],
            edgesArray: [],
            ui: {
              ...get().ui,
              selectedNodeId: null,
              selectedEdgeId: null,
            },
            runtime: {
              ...get().runtime,
              hasUnsavedChanges: true,
            },
          },
          false
        );
      },

      // Selection Operations
      copySelection: (nodeIds: string[], edgeIds: string[]) => {
        const { nodes, edges } = get();
        const selectedNodes = nodeIds.map(id => nodes[id]).filter(Boolean);
        const selectedEdges = edgeIds.map(id => edges[id]).filter(Boolean);

        const clipboardData = {
          nodes: selectedNodes,
          edges: selectedEdges,
          timestamp: Date.now(),
        };

        localStorage.setItem("naraflow_clipboard", JSON.stringify(clipboardData));

        // Emit event
        globalCanvasEventBus.emit({
          type: "selection:copy",
          payload: { nodeIds, edgeIds },
        });
      },

      pasteSelection: () => {
        const clipboardData = localStorage.getItem("naraflow_clipboard");
        if (!clipboardData) return;

        try {
          const data = JSON.parse(clipboardData);
          const { nodes: clipboardNodes, edges: clipboardEdges } = data;

          if (!clipboardNodes || !clipboardEdges) return;

          const { nodes, edges } = get();
          const newNodes: Record<string, NodeEntity> = {};
          const newEdges: Record<string, EdgeEntity> = {};

          // Generate new IDs for pasted nodes
          const nodeIdMap = new Map<string, string>();
          clipboardNodes.forEach((node: NodeEntity) => {
            const newId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            nodeIdMap.set(node.id, newId);
            newNodes[newId] = {
              ...node,
              id: newId,
              position: {
                x: node.position.x + 50,
                y: node.position.y + 50,
              },
              lastUpdated: Date.now(),
            };
          });

          // Generate new IDs for pasted edges
          clipboardEdges.forEach((edge: EdgeEntity) => {
            const newId = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const newSource = nodeIdMap.get(edge.source);
            const newTarget = nodeIdMap.get(edge.target);

            if (newSource && newTarget) {
              newEdges[newId] = {
                ...edge,
                id: newId,
                source: newSource,
                target: newTarget,
                lastUpdated: Date.now(),
              };
            }
          });

          set(state => {
            const updatedNodes = { ...state.nodes, ...newNodes };
            const updatedEdges = { ...state.edges, ...newEdges };
            const { nodesArray, edgesArray } = recordsToArrays(updatedNodes, updatedEdges);

            return {
              nodes: updatedNodes,
              edges: updatedEdges,
              nodesArray,
              edgesArray,
              runtime: {
                ...state.runtime,
                hasUnsavedChanges: true,
              },
            };
          }, false);

          // Emit event
          globalCanvasEventBus.emit({
            type: "selection:paste",
            payload: { nodeIds: Object.keys(newNodes), edgeIds: Object.keys(newEdges) },
          });
        } catch (error) {
          console.error("Failed to paste selection:", error);
        }
      },

      duplicateSelection: (nodeIds: string[], edgeIds: string[]) => {
        const { nodes, edges } = get();
        const selectedNodes = nodeIds.map(id => nodes[id]).filter(Boolean);
        const selectedEdges = edgeIds.map(id => edges[id]).filter(Boolean);

        if (selectedNodes.length === 0) return;

        const newNodes: Record<string, NodeEntity> = {};
        const newEdges: Record<string, EdgeEntity> = {};

        // Generate new IDs for duplicated nodes
        const nodeIdMap = new Map<string, string>();
        selectedNodes.forEach((node: NodeEntity) => {
          const newId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          nodeIdMap.set(node.id, newId);
          newNodes[newId] = {
            ...node,
            id: newId,
            position: {
              x: node.position.x + 50,
              y: node.position.y + 50,
            },
            lastUpdated: Date.now(),
          };
        });

        // Generate new IDs for duplicated edges
        selectedEdges.forEach((edge: EdgeEntity) => {
          const newId = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const newSource = nodeIdMap.get(edge.source);
          const newTarget = nodeIdMap.get(edge.target);

          if (newSource && newTarget) {
            newEdges[newId] = {
              ...edge,
              id: newId,
              source: newSource,
              target: newTarget,
              lastUpdated: Date.now(),
            };
          }
        });

        set(state => {
          const updatedNodes = { ...state.nodes, ...newNodes };
          const updatedEdges = { ...state.edges, ...newEdges };
          const { nodesArray, edgesArray } = recordsToArrays(updatedNodes, updatedEdges);

          return {
            nodes: updatedNodes,
            edges: updatedEdges,
            nodesArray,
            edgesArray,
            runtime: {
              ...state.runtime,
              hasUnsavedChanges: true,
            },
          };
        }, false);

        // Emit event
        globalCanvasEventBus.emit({
          type: "selection:duplicate",
          payload: { nodeIds: Object.keys(newNodes), edgeIds: Object.keys(newEdges) },
        });
      },

      // Batch Operations
      removeNodes: (nodeIds: string[]) => {
        set(state => {
          const updatedNodes = { ...state.nodes };
          const updatedEdges = { ...state.edges };

          // Remove nodes
          nodeIds.forEach(nodeId => {
            delete updatedNodes[nodeId];
          });

          // Remove connected edges
          Object.keys(updatedEdges).forEach(edgeId => {
            const edge = updatedEdges[edgeId];
            if (nodeIds.includes(edge.source) || nodeIds.includes(edge.target)) {
              delete updatedEdges[edgeId];
            }
          });

          const { nodesArray, edgesArray } = recordsToArrays(updatedNodes, updatedEdges);

          return {
            nodes: updatedNodes,
            edges: updatedEdges,
            nodesArray,
            edgesArray,
            ui: {
              ...state.ui,
              selectedNodeId: nodeIds.includes(state.ui.selectedNodeId || "")
                ? null
                : state.ui.selectedNodeId,
            },
            runtime: {
              ...state.runtime,
              hasUnsavedChanges: true,
            },
          };
        }, false);

        // Emit event
        globalCanvasEventBus.emit({
          type: "nodes:remove",
          payload: { nodeIds },
        });
      },

      removeEdges: (edgeIds: string[]) => {
        set(state => {
          const updatedEdges = { ...state.edges };

          edgeIds.forEach(edgeId => {
            delete updatedEdges[edgeId];
          });

          const { nodesArray, edgesArray } = recordsToArrays(state.nodes, updatedEdges);

          return {
            edges: updatedEdges,
            edgesArray,
            ui: {
              ...state.ui,
              selectedEdgeId: edgeIds.includes(state.ui.selectedEdgeId || "")
                ? null
                : state.ui.selectedEdgeId,
            },
            runtime: {
              ...state.runtime,
              hasUnsavedChanges: true,
            },
          };
        }, false);

        // Emit event
        globalCanvasEventBus.emit({
          type: "edges:remove",
          payload: { edgeIds },
        });
      },

      createGroup: (nodeIds: string[]) => {
        if (nodeIds.length === 0) return;

        const { nodes } = get();
        const selectedNodes = nodeIds.map(id => nodes[id]).filter(Boolean);

        if (selectedNodes.length === 0) return;

        // Calculate group bounds
        const positions = selectedNodes.map(node => node.position);
        const minX = Math.min(...positions.map(p => p.x));
        const minY = Math.min(...positions.map(p => p.y));
        const maxX = Math.max(...positions.map(p => p.x));
        const maxY = Math.max(...positions.map(p => p.y));

        const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const groupNode: NodeEntity = {
          id: groupId,
          type: "group",
          position: { x: minX - 20, y: minY - 20 },
          data: {
            label: `Group ${selectedNodes.length}`,
            description: `Group containing ${selectedNodes.length} nodes`,
            nodes: nodeIds,
          },
          lastUpdated: Date.now(),
        };

        set(state => {
          const updatedNodes = { ...state.nodes, [groupId]: groupNode };
          const { nodesArray, edgesArray } = recordsToArrays(updatedNodes, state.edges);

          return {
            nodes: updatedNodes,
            nodesArray,
            runtime: {
              ...state.runtime,
              hasUnsavedChanges: true,
            },
          };
        }, false);

        // Emit event
        globalCanvasEventBus.emit({
          type: "group:create",
          payload: { groupId, nodeIds },
        });
      },

      ungroupNodes: (groupNodeIds: string[]) => {
        set(state => {
          const updatedNodes = { ...state.nodes };

          groupNodeIds.forEach(groupId => {
            const groupNode = updatedNodes[groupId];
            if (groupNode && groupNode.type === "group") {
              // Remove the group node
              delete updatedNodes[groupId];
            }
          });

          const { nodesArray, edgesArray } = recordsToArrays(updatedNodes, state.edges);

          return {
            nodes: updatedNodes,
            nodesArray,
            ui: {
              ...state.ui,
              selectedNodeId: groupNodeIds.includes(state.ui.selectedNodeId || "")
                ? null
                : state.ui.selectedNodeId,
            },
            runtime: {
              ...state.runtime,
              hasUnsavedChanges: true,
            },
          };
        }, false);

        // Emit event
        globalCanvasEventBus.emit({
          type: "group:ungroup",
          payload: { groupNodeIds },
        });
      },

      // LLaMA Operations
      setLlamaConfig: (config: Partial<WorkflowState["llamaConfig"]>) => {
        set(
          state => ({
            llamaConfig: {
              ...state.llamaConfig,
              ...config,
            },
          }),
          false
        );
      },

      appendLlamaLog: (message: string) => {
        set(
          state => ({
            llamaLogs: [
              ...state.llamaLogs,
              {
                id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                nodeId: "system",
                prompt: message,
                timestamp: new Date().toISOString(),
                model: "system",
                mode: "info",
                rawPreview: message,
              },
            ],
          }),
          false
        );
      },

      applyTemplateFlow: (templateId: keyof typeof workflowTemplates) => {
        const template = workflowTemplates[templateId];
        if (!template) return;

        const { nodesRecord, edgesRecord } = arraysToRecords(template.nodes, template.edges);
        const { nodesArray, edgesArray } = recordsToArrays(nodesRecord, edgesRecord);

        set(
          state => ({
            nodes: nodesRecord,
            edges: edgesRecord,
            nodesArray,
            edgesArray,
            runtime: {
              ...state.runtime,
              hasUnsavedChanges: true,
            },
          }),
          false
        );

        // Emit event
        globalCanvasEventBus.emit({
          type: "template:apply",
          payload: { templateId },
        });
      },

      exportWorkflowJSON: () => {
        const { nodesArray, edgesArray } = get();
        return JSON.stringify(
          {
            nodes: nodesArray,
            edges: edgesArray,
            metadata: {
              version: "1.0",
              exportedAt: new Date().toISOString(),
            },
          },
          null,
          2
        );
      },

      importWorkflowJSON: json => {
        try {
          const data = JSON.parse(json);
          const { nodesRecord, edgesRecord } = arraysToRecords(data.nodes || [], data.edges || []);
          const { nodesArray, edgesArray } = recordsToArrays(nodesRecord, edgesRecord);

          set(
            {
              nodes: nodesRecord,
              edges: edgesRecord,
              nodesArray,
              edgesArray,
              runtime: {
                ...get().runtime,
                hasUnsavedChanges: true,
              },
            },
            false
          );

          setTimeout(() => get().actions.saveHistory(), 100);
        } catch (error) {
          console.error("Failed to import workflow JSON:", error);
          throw error;
        }
      },

      validateWorkflow: () => {
        const { nodesArray, edgesArray, validationOptions } = get();
        const validator = new WorkflowValidator();
        const errors = WorkflowValidator.validateWorkflow(nodesArray, edgesArray);

        set({ validationErrors: errors }, false);
        return errors;
      },

      getNodeErrors: nodeId => {
        const { validationErrors } = get();
        return validationErrors.filter(error => error.nodeId === nodeId);
      },

      // Connection Label Management
      setConnectionLabel: (connectionId: string, label: ConnectionLabel) => {
        set(state => {
          const edge = state.edges[connectionId];
          if (!edge) return state;

          const updatedEdge = {
            ...edge,
            data: {
              ...edge.data,
              label,
            },
          };

          return {
            edges: {
              ...state.edges,
              [connectionId]: updatedEdge,
            },
            edgesArray: state.edgesArray.map(e => (e.id === connectionId ? updatedEdge : e)),
          };
        }, false);
      },

      getConnectionLabel: (connectionId: string): ConnectionLabel | null => {
        const { edges } = get();
        const edge = edges[connectionId];
        return (edge?.data?.label as ConnectionLabel) || null;
      },

      removeConnectionLabel: (connectionId: string) => {
        set(state => {
          const edge = state.edges[connectionId];
          if (!edge) return state;

          const updatedEdge = {
            ...edge,
            data: {
              ...edge.data,
              label: undefined,
            },
          };

          return {
            edges: {
              ...state.edges,
              [connectionId]: updatedEdge,
            },
            edgesArray: state.edgesArray.map(e => (e.id === connectionId ? updatedEdge : e)),
          };
        }, false);
      },
    },
  }))
);

// Selectors for optimized subscriptions
export const useNodes = () => useWorkflowState(state => state.nodesArray);
export const useNodesRecord = () => useWorkflowState(state => state.nodes);
export const useEdges = () => useWorkflowState(state => state.edgesArray);
export const useUIState = () => useWorkflowState(state => state.ui);
export const useRuntimeState = () => useWorkflowState(state => state.runtime);
export const useWorkflowActions = () => useWorkflowState(state => state.actions);
export const useSelectedNode = () =>
  useWorkflowState(state =>
    state.ui.selectedNodeId ? state.nodes[state.ui.selectedNodeId] : null
  );
export const useSelectedEdge = () =>
  useWorkflowState(state =>
    state.ui.selectedEdgeId ? state.edges[state.ui.selectedEdgeId] : null
  );
export const useValidationErrors = () => useWorkflowState(state => state.validationErrors);
export const useHistory = () =>
  useWorkflowState(state => ({
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
  }));
