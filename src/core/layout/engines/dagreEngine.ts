/**
 * Dagre Layout Engine - Fast synchronous layout using Dagre.js
 */

import dagre from 'dagre';
import { LayoutGraph, LayoutResult, LayoutOptions, LayoutEngine } from '../types';

export class DagreEngine implements LayoutEngine {
  name = 'dagre';
  isAsync = false;

  /**
   * Execute Dagre layout
   */
  async layout(graph: LayoutGraph, options: LayoutOptions): Promise<LayoutResult> {
    const startTime = performance.now();

    // Create Dagre graph
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setGraph({
      rankdir: this.mapDirection(options.direction),
      nodesep: options.spacing.node,
      ranksep: options.spacing.level,
      marginx: 20,
      marginy: 20,
    });

    // Add nodes
    graph.nodes.forEach(node => {
      dagreGraph.setNode(node.id, {
        width: node.width,
        height: node.height,
        label: node.id,
      });
    });

    // Add edges
    graph.edges.forEach(edge => {
      dagreGraph.setEdge(edge.source, edge.target, {
        label: edge.id || '',
      });
    });

    // Run layout
    dagre.layout(dagreGraph);

    // Extract positions
    const positions = graph.nodes.map(node => {
      const dagreNode = dagreGraph.node(node.id);
      return {
        id: node.id,
        position: {
          x: dagreNode.x - dagreNode.width / 2,
          y: dagreNode.y - dagreNode.height / 2,
        },
      };
    });

    const executionTime = performance.now() - startTime;

    return {
      positions,
      metadata: {
        engine: this.name,
        direction: options.direction,
        executionTime,
        nodeCount: graph.nodes.length,
        edgeCount: graph.edges.length,
      },
    };
  }

  /**
   * Map direction to Dagre format
   */
  private mapDirection(direction: string): string {
    switch (direction) {
      case 'LR':
        return 'LR';
      case 'RL':
        return 'RL';
      case 'TB':
        return 'TB';
      case 'BT':
        return 'BT';
      default:
        return 'LR';
    }
  }

  /**
   * Validate if graph is suitable for Dagre
   */
  static validateGraph(graph: LayoutGraph): { suitable: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // Check for cycles (Dagre works best with DAGs)
    if (this.hasCycles(graph)) {
      warnings.push('Graph contains cycles - Dagre may not produce optimal layout');
    }

    // Check for disconnected components
    const components = this.findConnectedComponents(graph);
    if (components.length > 1) {
      warnings.push(`Graph has ${components.length} disconnected components`);
    }

    // Check for very large graphs
    if (graph.nodes.length > 500) {
      warnings.push('Large graph detected - consider using ELK engine for better performance');
    }

    return {
      suitable: true, // Dagre can handle any graph
      warnings,
    };
  }

  /**
   * Check if graph has cycles using DFS
   */
  private static hasCycles(graph: LayoutGraph): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        return true; // Cycle detected
      }

      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingEdges = graph.edges.filter(edge => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        if (dfs(edge.target)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Find connected components in the graph
   */
  private static findConnectedComponents(graph: LayoutGraph): string[][] {
    const visited = new Set<string>();
    const components: string[][] = [];

    const dfs = (nodeId: string, component: string[]) => {
      if (visited.has(nodeId)) return;
      
      visited.add(nodeId);
      component.push(nodeId);

      // Find neighbors
      const neighbors = [
        ...graph.edges.filter(edge => edge.source === nodeId).map(edge => edge.target),
        ...graph.edges.filter(edge => edge.target === nodeId).map(edge => edge.source),
      ];

      for (const neighbor of neighbors) {
        dfs(neighbor, component);
      }
    };

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        const component: string[] = [];
        dfs(node.id, component);
        components.push(component);
      }
    }

    return components;
  }

  /**
   * Get recommended settings for different graph types
   */
  static getRecommendedSettings(graph: LayoutGraph): Partial<LayoutOptions> {
    const metrics = {
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      avgConnections: graph.edges.length / graph.nodes.length,
    };

    // Adjust spacing based on graph density
    let nodeSpacing = 50;
    let levelSpacing = 100;

    if (metrics.nodeCount > 100) {
      nodeSpacing = 30;
      levelSpacing = 80;
    }

    if (metrics.avgConnections > 3) {
      nodeSpacing = Math.max(20, nodeSpacing - 10);
      levelSpacing = Math.max(60, levelSpacing - 20);
    }

    // Choose direction based on graph structure
    let direction: 'LR' | 'TB' = 'LR';
    
    // If graph is very wide, use TB direction
    if (metrics.nodeCount > 50 && metrics.avgConnections < 2) {
      direction = 'TB';
    }

    return {
      direction,
      spacing: {
        node: nodeSpacing,
        level: levelSpacing,
      },
      gridSnap: metrics.nodeCount < 200,
    };
  }
}
