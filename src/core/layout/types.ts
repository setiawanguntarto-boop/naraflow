/**
 * Core types for the Smart Auto-Layout System
 */

export interface LayoutNode {
  id: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
  group?: string;
  hidden?: boolean;
}

export interface LayoutEdge {
  source: string;
  target: string;
  id?: string;
  type?: string;
}

export interface LayoutGraph {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
}

export interface LayoutPosition {
  id: string;
  position: {
    x: number;
    y: number;
  };
}

export interface LayoutResult {
  positions: LayoutPosition[];
  metadata?: {
    engine: string;
    direction: string;
    executionTime: number;
    nodeCount: number;
    edgeCount: number;
  };
}

export interface LayoutOptions {
  engine: "dagre" | "elk" | "group";
  direction: "LR" | "RL" | "TB" | "BT";
  spacing: {
    node: number;
    level: number;
  };
  groupAware: boolean;
  gridSnap: boolean;
  gridSize: number;
  partialLayout?: string[]; // node IDs for partial layout
}

export interface LayoutEngine {
  name: string;
  layout(graph: LayoutGraph, options: LayoutOptions): Promise<LayoutResult>;
  isAsync: boolean;
}

export interface LayoutHistory {
  timestamp: number;
  positions: LayoutPosition[];
  metadata: {
    engine: string;
    direction: string;
    nodeCount: number;
  };
}

export interface LayoutController {
  autoLayout(options?: Partial<LayoutOptions>): Promise<void>;
  restoreLayout(): void;
  canRestore(): boolean;
  getHistory(): LayoutHistory[];
  clearHistory(): void;
}

// Event types for layout system
export interface LayoutEvent {
  type: "layout:start" | "layout:complete" | "layout:error" | "layout:restore";
  payload: {
    engine?: string;
    direction?: string;
    nodeCount?: number;
    error?: Error;
    executionTime?: number;
  };
}

// Hook types
export interface UseLayoutOptions {
  onBeforeLayout?: (
    nodes: LayoutNode[],
    edges: LayoutEdge[]
  ) => { nodes: LayoutNode[]; edges: LayoutEdge[] };
  onAfterLayout?: (result: LayoutResult) => LayoutResult;
  onLayoutError?: (error: Error) => void;
}

export interface UseLayoutReturn {
  autoLayout: (options?: Partial<LayoutOptions>) => Promise<void>;
  restoreLayout: () => void;
  canRestore: boolean;
  isLayouting: boolean;
  layoutHistory: LayoutHistory[];
  clearHistory: () => void;
  layoutResult?: any;
  layoutError?: Error | null;
}
