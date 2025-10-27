/**
 * Graph Builder - Converts ReactFlow nodes/edges to layout graph format
 */

import { Node, Edge } from "@xyflow/react";
import { LayoutGraph, LayoutNode, LayoutEdge } from "./types";

export class GraphBuilder {
  private static readonly DEFAULT_NODE_SIZE = { width: 180, height: 80 };
  private static readonly DEFAULT_GROUP_SIZE = { width: 300, height: 200 };

  /**
   * Build layout graph from ReactFlow nodes and edges
   */
  static buildGraph(nodes: Node[], edges: Edge[]): LayoutGraph {
    const layoutNodes = this.buildNodes(nodes);
    const layoutEdges = this.buildEdges(edges);

    return {
      nodes: layoutNodes,
      edges: layoutEdges,
    };
  }

  /**
   * Convert ReactFlow nodes to layout nodes
   */
  private static buildNodes(nodes: Node[]): LayoutNode[] {
    return nodes.map(node => {
      const size = this.getNodeSize(node);

      return {
        id: node.id,
        width: size.width,
        height: size.height,
        x: node.position?.x,
        y: node.position?.y,
        group: node.parentId || undefined,
        hidden: node.hidden || false,
      };
    });
  }

  /**
   * Convert ReactFlow edges to layout edges
   */
  private static buildEdges(edges: Edge[]): LayoutEdge[] {
    return edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      id: edge.id,
      type: edge.type,
    }));
  }

  /**
   * Get node size based on type and data
   */
  private static getNodeSize(node: Node): { width: number; height: number } {
    // Check if node has explicit dimensions
    if (node.data?.width && node.data?.height) {
      return {
        width: Number(node.data.width),
        height: Number(node.data.height),
      };
    }

    // Type-specific sizing
    switch (node.type) {
      case "start":
      case "end":
        return { width: 120, height: 60 };

      case "decision":
        return { width: 160, height: 100 };

      case "group":
        return this.DEFAULT_GROUP_SIZE;

      case "llama-decision":
        return { width: 200, height: 120 };

      default:
        return this.DEFAULT_NODE_SIZE;
    }
  }

  /**
   * Filter nodes for partial layout
   */
  static filterForPartialLayout(graph: LayoutGraph, selectedNodeIds: string[]): LayoutGraph {
    const filteredNodes = graph.nodes.filter(node => selectedNodeIds.includes(node.id));

    const filteredEdges = graph.edges.filter(
      edge => selectedNodeIds.includes(edge.source) && selectedNodeIds.includes(edge.target)
    );

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }

  /**
   * Extract group information from nodes
   */
  static extractGroups(nodes: Node[]): Map<string, string[]> {
    const groups = new Map<string, string[]>();

    nodes.forEach(node => {
      if (node.parentId) {
        if (!groups.has(node.parentId)) {
          groups.set(node.parentId, []);
        }
        groups.get(node.parentId)!.push(node.id);
      }
    });

    return groups;
  }

  /**
   * Validate graph structure
   */
  static validateGraph(graph: LayoutGraph): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for orphaned edges
    const nodeIds = new Set(graph.nodes.map(n => n.id));
    graph.edges.forEach(edge => {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge source '${edge.source}' not found in nodes`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge target '${edge.target}' not found in nodes`);
      }
    });

    // Check for duplicate node IDs
    const nodeIdSet = new Set<string>();
    graph.nodes.forEach(node => {
      if (nodeIdSet.has(node.id)) {
        errors.push(`Duplicate node ID: ${node.id}`);
      }
      nodeIdSet.add(node.id);
    });

    // Check for self-loops
    graph.edges.forEach(edge => {
      if (edge.source === edge.target) {
        errors.push(`Self-loop detected for node: ${edge.source}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate graph metrics
   */
  static calculateMetrics(graph: LayoutGraph): {
    nodeCount: number;
    edgeCount: number;
    groupCount: number;
    maxDepth: number;
    avgConnections: number;
  } {
    const nodeCount = graph.nodes.length;
    const edgeCount = graph.edges.length;

    const groups = new Set(graph.nodes.map(n => n.group).filter(Boolean));
    const groupCount = groups.size;

    // Calculate max depth using BFS
    const maxDepth = this.calculateMaxDepth(graph);

    // Calculate average connections per node
    const connectionsPerNode = new Map<string, number>();
    graph.edges.forEach(edge => {
      connectionsPerNode.set(edge.source, (connectionsPerNode.get(edge.source) || 0) + 1);
      connectionsPerNode.set(edge.target, (connectionsPerNode.get(edge.target) || 0) + 1);
    });

    const totalConnections = Array.from(connectionsPerNode.values()).reduce(
      (sum, count) => sum + count,
      0
    );
    const avgConnections = nodeCount > 0 ? totalConnections / nodeCount : 0;

    return {
      nodeCount,
      edgeCount,
      groupCount,
      maxDepth,
      avgConnections,
    };
  }

  /**
   * Calculate maximum depth of the graph using BFS
   */
  private static calculateMaxDepth(graph: LayoutGraph): number {
    if (graph.nodes.length === 0) return 0;

    // Build adjacency list
    const adjacencyList = new Map<string, string[]>();
    graph.nodes.forEach(node => {
      adjacencyList.set(node.id, []);
    });

    graph.edges.forEach(edge => {
      const neighbors = adjacencyList.get(edge.source) || [];
      neighbors.push(edge.target);
      adjacencyList.set(edge.source, neighbors);
    });

    // Find root nodes (nodes with no incoming edges)
    const incomingEdges = new Set<string>();
    graph.edges.forEach(edge => {
      incomingEdges.add(edge.target);
    });

    const rootNodes = graph.nodes.filter(node => !incomingEdges.has(node.id));

    if (rootNodes.length === 0) {
      // No root nodes, start from first node
      return this.bfsMaxDepth(adjacencyList, graph.nodes[0].id);
    }

    // Calculate max depth from all root nodes
    let maxDepth = 0;
    rootNodes.forEach(root => {
      const depth = this.bfsMaxDepth(adjacencyList, root.id);
      maxDepth = Math.max(maxDepth, depth);
    });

    return maxDepth;
  }

  /**
   * BFS to calculate maximum depth from a root node
   */
  private static bfsMaxDepth(adjacencyList: Map<string, string[]>, rootId: string): number {
    const visited = new Set<string>();
    const queue: { nodeId: string; depth: number }[] = [{ nodeId: rootId, depth: 0 }];
    let maxDepth = 0;

    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift()!;

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      maxDepth = Math.max(maxDepth, depth);

      const neighbors = adjacencyList.get(nodeId) || [];
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          queue.push({ nodeId: neighbor, depth: depth + 1 });
        }
      });
    }

    return maxDepth;
  }
}
