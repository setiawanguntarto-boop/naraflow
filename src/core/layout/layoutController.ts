/**
 * Layout Controller - Main orchestrator for the auto-layout system
 */

import { Node, Edge } from '@xyflow/react';
import { GraphBuilder } from './graphBuilder';
import { DagreEngine } from './engines/dagreEngine';
import { ElkEngine } from './engines/elkEngine';
import { 
  LayoutOptions, 
  LayoutResult, 
  LayoutHistory, 
  LayoutController as ILayoutController,
  LayoutEvent 
} from './types';
import { globalCanvasEventBus } from '@/hooks/useCanvasEventBus';

export class LayoutController implements ILayoutController {
  private history: LayoutHistory[] = [];
  private maxHistorySize = 10;
  private isLayouting = false;
  private layoutMutex = false;

  constructor(
    private setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void,
    private setViewport: (viewport: any) => void,
    private getNodes: () => Node[],
    private getEdges: () => Edge[]
  ) {}

  /**
   * Execute auto-layout with given options and optional partial layout
   */
  async autoLayout(options: Partial<LayoutOptions> = {}, selectedNodeIds?: string[]): Promise<void> {
    if (this.isLayouting || this.layoutMutex) {
      throw new Error('Layout already in progress');
    }

    this.isLayouting = true;
    this.layoutMutex = true;

    try {
      // Emit start event
      this.emitEvent('layout:start', {
        engine: options.engine || 'dagre',
        direction: options.direction || 'LR',
        nodeCount: this.getNodes().length,
      });

      // Build graph
      const nodes = this.getNodes();
      const edges = this.getEdges();
      let graph = GraphBuilder.buildGraph(nodes, edges);
      
      // Apply partial layout filtering if selectedNodeIds provided
      if (selectedNodeIds && selectedNodeIds.length > 0) {
        graph = GraphBuilder.filterForPartialLayout(graph, selectedNodeIds);
      }

      // Validate graph
      const validation = GraphBuilder.validateGraph(graph);
      if (!validation.valid) {
        throw new Error(`Invalid graph: ${validation.errors.join(', ')}`);
      }

      // Apply partial layout filter if needed
      const filteredGraph = options.partialLayout 
        ? GraphBuilder.filterForPartialLayout(graph, options.partialLayout)
        : graph;

      // Merge with default options
      const layoutOptions: LayoutOptions = {
        engine: 'dagre',
        direction: 'LR',
        spacing: { node: 50, level: 100 },
        groupAware: true,
        gridSnap: false,
        gridSize: 20,
        ...options,
      };

      // Save current state to history
      this.saveToHistory(nodes, layoutOptions);

      // Emit progress event
      this.emitEvent('layout:progress', {
        stage: 'calculating',
        progress: 25,
        message: 'Calculating optimal layout...',
      });

      // Execute layout
      const result = await this.executeLayout(filteredGraph, layoutOptions);

      // Emit progress event
      this.emitEvent('layout:progress', {
        stage: 'applying',
        progress: 75,
        message: 'Applying layout to canvas...',
      });

      // Apply grid snapping if enabled
      if (layoutOptions.gridSnap) {
        result.positions = this.applyGridSnapping(result.positions, layoutOptions.gridSize);
      }

      // Update nodes with new positions
      this.updateNodePositions(result.positions, layoutOptions, selectedNodeIds);

      // Update viewport
      this.updateViewport();

      // Emit completion event
      this.emitEvent('layout:complete', {
        engine: layoutOptions.engine,
        direction: layoutOptions.direction,
        nodeCount: result.positions.length,
        executionTime: result.metadata?.executionTime,
        layoutQuality: this.calculateLayoutQuality(result.positions, filteredGraph),
      });

    } catch (error) {
      this.emitEvent('layout:error', {
        error: error instanceof Error ? error : new Error('Unknown layout error'),
      });
      throw error;
    } finally {
      this.isLayouting = false;
      this.layoutMutex = false;
    }
  }

  /**
   * Restore previous layout from history
   */
  restoreLayout(): void {
    if (this.history.length === 0) {
      throw new Error('No layout history to restore');
    }

    const lastLayout = this.history.pop()!;
    const nodes = this.getNodes();

    // Restore positions
    const updatedNodes = nodes.map(node => {
      const savedPosition = lastLayout.positions.find(p => p.id === node.id);
      if (savedPosition) {
        return {
          ...node,
          position: savedPosition.position,
        };
      }
      return node;
    });

    this.setNodes(updatedNodes);
    this.updateViewport();

    this.emitEvent('layout:restore', {
      engine: lastLayout.metadata.engine,
      direction: lastLayout.metadata.direction,
      nodeCount: lastLayout.metadata.nodeCount,
    });
  }

  /**
   * Check if layout can be restored
   */
  canRestore(): boolean {
    return this.history.length > 0;
  }

  /**
   * Get layout history
   */
  getHistory(): LayoutHistory[] {
    return [...this.history];
  }

  /**
   * Clear layout history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Execute layout using selected engine
   */
  private async executeLayout(graph: any, options: LayoutOptions): Promise<LayoutResult> {
    switch (options.engine) {
      case 'dagre':
        return await new DagreEngine().layout(graph, options);
      case 'elk':
        return await new ElkEngine().layout(graph, options);
      case 'group':
        return await this.executeGroupLayout(graph, options);
      default:
        throw new Error(`Unknown layout engine: ${options.engine}`);
    }
  }

  /**
   * Execute group-aware layout
   */
  private async executeGroupLayout(graph: any, options: LayoutOptions): Promise<LayoutResult> {
    // For now, fallback to Dagre with group awareness
    const dagreEngine = new DagreEngine();
    return await dagreEngine.layout(graph, options);
  }

  /**
   * Update node positions in ReactFlow with smooth transitions
   */
  private updateNodePositions(positions: any[], options: LayoutOptions, selectedNodeIds?: string[]): void {
    this.setNodes(prevNodes => 
      prevNodes.map(node => {
        const newPosition = positions.find(p => p.id === node.id);
        if (newPosition) {
          return {
            ...node,
            position: newPosition.position,
            style: {
              ...node.style,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'scale(1.05)', // Slight scale for glow effect
            },
            data: {
              ...node.data,
              layoutEngine: options.engine,
              layoutDirection: options.direction,
              autoLayouted: true,
              layoutTimestamp: Date.now(),
              partialLayout: selectedNodeIds ? selectedNodeIds.includes(node.id) : false,
            },
          };
        }
        return node;
      })
    );

    // Remove glow effect after animation
    setTimeout(() => {
      this.setNodes(prevNodes => 
        prevNodes.map(node => ({
          ...node,
          style: {
            ...node.style,
            transform: 'scale(1)',
          },
        }))
      );
    }, 500);
  }

  /**
   * Update viewport to fit the layout with smooth animation
   */
  private updateViewport(): void {
    this.setViewport({
      x: 0,
      y: 0,
      zoom: 1,
      duration: 800,
      easing: (t: number) => t * (2 - t), // easeOutQuad
    });
  }

  /**
   * Apply grid snapping to positions
   */
  private applyGridSnapping(positions: any[], gridSize: number): any[] {
    return positions.map(pos => ({
      ...pos,
      position: {
        x: Math.round(pos.position.x / gridSize) * gridSize,
        y: Math.round(pos.position.y / gridSize) * gridSize,
      },
    }));
  }

  /**
   * Save current layout to history
   */
  private saveToHistory(nodes: Node[], options: LayoutOptions): void {
    const historyEntry: LayoutHistory = {
      timestamp: Date.now(),
      positions: nodes.map(node => ({
        id: node.id,
        position: node.position,
      })),
      metadata: {
        engine: options.engine,
        direction: options.direction,
        nodeCount: nodes.length,
      },
    };

    this.history.push(historyEntry);

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Calculate layout quality score based on edge crossings and spacing
   */
  private calculateLayoutQuality(positions: any[], graph: any): number {
    let score = 100;
    
    // Check for edge crossings (simplified)
    const edges = graph.edges || [];
    for (let i = 0; i < edges.length; i++) {
      for (let j = i + 1; j < edges.length; j++) {
        if (this.edgesCross(edges[i], edges[j], positions)) {
          score -= 5; // Penalty for edge crossings
        }
      }
    }
    
    // Check for optimal spacing
    const nodes = positions;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = Math.sqrt(
          Math.pow(nodes[i].position.x - nodes[j].position.x, 2) +
          Math.pow(nodes[i].position.y - nodes[j].position.y, 2)
        );
        if (distance < 50) {
          score -= 2; // Penalty for nodes too close
        }
      }
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Check if two edges cross (simplified line intersection)
   */
  private edgesCross(edge1: any, edge2: any, positions: any[]): boolean {
    const p1 = positions.find(p => p.id === edge1.source)?.position;
    const p2 = positions.find(p => p.id === edge1.target)?.position;
    const p3 = positions.find(p => p.id === edge2.source)?.position;
    const p4 = positions.find(p => p.id === edge2.target)?.position;
    
    if (!p1 || !p2 || !p3 || !p4) return false;
    
    // Simple bounding box intersection check
    const minX1 = Math.min(p1.x, p2.x);
    const maxX1 = Math.max(p1.x, p2.x);
    const minY1 = Math.min(p1.y, p2.y);
    const maxY1 = Math.max(p1.y, p2.y);
    
    const minX2 = Math.min(p3.x, p4.x);
    const maxX2 = Math.max(p3.x, p4.x);
    const minY2 = Math.min(p3.y, p4.y);
    const maxY2 = Math.max(p3.y, p4.y);
    
    return !(maxX1 < minX2 || maxX2 < minX1 || maxY1 < minY2 || maxY2 < minY1);
  }

  /**
   * Emit layout events
   */
  private emitEvent(type: LayoutEvent['type'], payload: LayoutEvent['payload']): void {
    try {
      globalCanvasEventBus.emit({
        type: type,
        payload,
      });
    } catch (error) {
      console.warn('Failed to emit layout event:', error);
    }
  }
}
