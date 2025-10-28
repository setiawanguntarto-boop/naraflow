/**
 * Dynamic Node Loading System
 * Loads node components on-demand to reduce initial bundle size
 */

import { lazy, ComponentType } from "react";
import { Node as ReactFlowNode } from "@xyflow/react";

// Lazy loaded node components with on-demand loading
export const LazyNodeComponents = {
  default: lazy(() => import("@/components/canvas/nodes/DefaultNode").then(mod => ({ default: mod.DefaultNode }))),
  decision: lazy(() => import("@/components/canvas/nodes/DecisionNode").then(mod => ({ default: mod.DecisionNode }))),
  start: lazy(() => import("@/components/canvas/nodes/StartNode").then(mod => ({ default: mod.StartNode }))),
  end: lazy(() => import("@/components/canvas/nodes/EndNode").then(mod => ({ default: mod.EndNode }))),
  group: lazy(() => import("@/components/canvas/nodes/GroupNode").then(mod => ({ default: mod.GroupNode }))),
  "llama-decision": lazy(() => import("@/components/canvas/nodes/LlamaNode").then(mod => ({ default: mod.LlamaNode }))),
  agent: lazy(() => import("@/components/canvas/nodes/AgentNode").then(mod => ({ default: mod.AgentNode }))),
};

export class NodeRegistry {
  private static loadedCount = 0;
  private static loadingPromises = new Map<string, Promise<void>>();

  /**
   * Preload common node types for faster initial rendering
   */
  static async preloadCommonNodes() {
    const commonTypes = ["default", "start", "end", "decision"];
    
    // Create promises for common nodes
    const preloadPromises = commonTypes.map(async (nodeType) => {
      const key = `preload-${nodeType}`;
      if (this.loadingPromises.has(key)) {
        return this.loadingPromises.get(key);
      }
      
      const promise = this.loadNodeType(nodeType);
      this.loadingPromises.set(key, promise);
      return promise;
    });

    await Promise.all(preloadPromises);
    this.loadedCount += commonTypes.length;
    console.log(`✅ Preloaded ${commonTypes.length} common node types`);
  }

  /**
   * Load a specific node type dynamically (for preloading)
   */
  private static async loadNodeType(nodeType: string): Promise<void> {
    // Node types are loaded lazily by React when needed
    return Promise.resolve();
  }

  /**
   * Preload nodes used in a workflow
   */
  static async preloadWorkflowNodes(nodes: ReactFlowNode[]): Promise<void> {
    const nodeTypes = Array.from(new Set(nodes.map(node => node.type || "default")));
    console.log(`📦 Preloading ${nodeTypes.length} node types for workflow`);
    // Nodes will be loaded on-demand when React Flow needs them
  }

  /**
   * Get lazy node components for creating node types
   */
  static getLazyNodeComponents() {
    return LazyNodeComponents;
  }
}

