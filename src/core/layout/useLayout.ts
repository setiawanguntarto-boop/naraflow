/**
 * useLayout Hook - React integration for the auto-layout system
 */

import { useCallback, useState, useRef, useEffect } from "react";
import { Node, Edge, useReactFlow } from "@xyflow/react";
import { LayoutController } from "./layoutController";
import { LayoutOptions, UseLayoutOptions, UseLayoutReturn, LayoutHistory } from "./types";
import { toast } from "sonner";

export function useLayout(
  nodes: Node[],
  edges: Edge[],
  options: UseLayoutOptions = {}
): UseLayoutReturn {
  const [isLayouting, setIsLayouting] = useState(false);
  const [layoutHistory, setLayoutHistory] = useState<LayoutHistory[]>([]);
  const [layoutResult, setLayoutResult] = useState<any>(null);
  const [layoutError, setLayoutError] = useState<Error | null>(null);

  const controllerRef = useRef<LayoutController | null>(null);

  // Get ReactFlow functions - this must be called unconditionally
  const reactFlowFunctions = useReactFlow();

  // Initialize controller when ReactFlow functions are available
  useEffect(() => {
    if (reactFlowFunctions && !controllerRef.current) {
      controllerRef.current = new LayoutController(
        reactFlowFunctions.setNodes,
        reactFlowFunctions.setViewport,
        reactFlowFunctions.getNodes,
        reactFlowFunctions.getEdges
      );
    }
  }, [reactFlowFunctions]);

  // Update history when controller changes
  useEffect(() => {
    if (controllerRef.current) {
      setLayoutHistory(controllerRef.current.getHistory());
    }
  }, [isLayouting]);

  /**
   * Execute auto-layout with optional partial layout support
   */
  const autoLayout = useCallback(
    async (layoutOptions: Partial<LayoutOptions> = {}, selectedNodeIds?: string[]) => {
      if (!controllerRef.current) {
        throw new Error("Layout controller not initialized");
      }

      try {
        setIsLayouting(true);

        // Determine if this is a partial layout
        const isPartialLayout = selectedNodeIds && selectedNodeIds.length > 0;
        const targetNodes = isPartialLayout ? selectedNodeIds.length : nodes.length;

        // Show loading toast
        const loadingToast = toast.loading(
          isPartialLayout ? "Arranging selected nodes..." : "Arranging workflow...",
          {
            description: `Using ${layoutOptions.engine || "dagre"} layout engine for ${targetNodes} nodes`,
          }
        );

        // Apply pre-layout hooks
        let processedNodes = nodes;
        let processedEdges = edges;

        if (options.onBeforeLayout) {
          const result = options.onBeforeLayout(
            nodes.map(n => ({
              id: n.id,
              width: n.width || 150,
              height: n.height || 50,
              x: n.position.x,
              y: n.position.y,
              group: n.parentId,
              hidden: n.hidden,
            })),
            edges.map(e => ({
              source: e.source,
              target: e.target,
              id: e.id,
              type: e.type,
            }))
          );
          processedNodes = result.nodes.map(n => ({
            ...n,
            id: n.id,
            position: { x: n.x || 0, y: n.y || 0 },
            data: {},
            width: n.width || 150,
            height: n.height || 50,
          }));
          processedEdges = result.edges.map(e => ({
            ...e,
            source: e.source,
            target: e.target,
            id: e.id || `${e.source}-${e.target}`,
          }));
        }

        // Execute layout with partial support
        await controllerRef.current.autoLayout(layoutOptions, selectedNodeIds);

        // Apply post-layout hooks
        if (options.onAfterLayout) {
          // This would need to be implemented based on the actual result
          // For now, we'll skip this as it requires more complex integration
        }

        // Update history
        setLayoutHistory(controllerRef.current.getHistory());

        // Show success toast
        toast.dismiss(loadingToast);
        toast.success(
          isPartialLayout
            ? "Selected nodes arranged successfully"
            : "Auto-layout applied successfully",
          {
            description: `Arranged ${targetNodes} nodes using ${layoutOptions.engine || "dagre"} layout`,
          }
        );
      } catch (error) {
        setIsLayouting(false);

        // Show error toast
        toast.error("Auto-layout failed", {
          description: error instanceof Error ? error.message : "Unknown error occurred",
        });

        // Call error handler if provided
        if (options.onLayoutError) {
          options.onLayoutError(error instanceof Error ? error : new Error("Unknown error"));
        }

        throw error;
      } finally {
        setIsLayouting(false);
      }
    },
    [nodes, edges, options]
  );

  /**
   * Restore previous layout
   */
  const restoreLayout = useCallback(() => {
    if (!controllerRef.current) {
      throw new Error("Layout controller not initialized");
    }

    try {
      controllerRef.current.restoreLayout();
      setLayoutHistory(controllerRef.current.getHistory());

      toast.success("Layout restored", {
        description: "Previous layout has been restored",
      });
    } catch (error) {
      toast.error("Failed to restore layout", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }, []);

  /**
   * Check if layout can be restored
   */
  const canRestore = useCallback(() => {
    return controllerRef.current?.canRestore() || false;
  }, []);

  /**
   * Clear layout history
   */
  const clearHistory = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.clearHistory();
      setLayoutHistory([]);
    }
  }, []);

  return {
    autoLayout,
    restoreLayout,
    canRestore: canRestore(),
    isLayouting,
    layoutHistory,
    clearHistory,
    layoutResult,
    layoutError,
  };
}

/**
 * Quick layout presets for common use cases
 */
export const LayoutPresets = {
  /**
   * Horizontal flow (left to right)
   */
  horizontal: {
    engine: "dagre" as const,
    direction: "LR" as const,
    spacing: { node: 50, level: 100 },
    groupAware: true,
    gridSnap: true,
  },

  /**
   * Vertical flow (top to bottom)
   */
  vertical: {
    engine: "dagre" as const,
    direction: "TB" as const,
    spacing: { node: 50, level: 100 },
    groupAware: true,
    gridSnap: true,
  },

  /**
   * Compact layout for dense graphs
   */
  compact: {
    engine: "dagre" as const,
    direction: "LR" as const,
    spacing: { node: 30, level: 60 },
    groupAware: true,
    gridSnap: false,
  },

  /**
   * Spacious layout for readability
   */
  spacious: {
    engine: "dagre" as const,
    direction: "LR" as const,
    spacing: { node: 80, level: 150 },
    groupAware: true,
    gridSnap: true,
  },

  /**
   * Complex layout using ELK
   */
  complex: {
    engine: "elk" as const,
    direction: "LR" as const,
    spacing: { node: 50, level: 100 },
    groupAware: true,
    gridSnap: false,
  },
} as const;
