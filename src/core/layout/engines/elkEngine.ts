/**
 * ELK Layout Engine - Complex async layout using ELK.js
 */

import { LayoutGraph, LayoutResult, LayoutOptions, LayoutEngine } from '../types';
import { globalCanvasEventBus } from '@/hooks/useCanvasEventBus';

export class ElkEngine implements LayoutEngine {
  name = 'elk';
  isAsync = true;

  async layout(graph: LayoutGraph, options: LayoutOptions): Promise<LayoutResult> {
    const startTime = performance.now();

    try {
      // Emit progress event
      this.emitProgress(10, 'Loading ELK engine...');

      // Dynamic import of ELK
      const ELK = await import('elkjs/lib/elk.bundled.js');
      const elk = new ELK.default();

      // Emit progress event
      this.emitProgress(25, 'Converting graph format...');

      // Convert to ELK format
      const elkGraph = this.convertToElkFormat(graph, options);

      // Emit progress event
      this.emitProgress(50, 'Calculating layout...');

      // Run layout
      const layoutedGraph = await elk.layout(elkGraph);

      // Emit progress event
      this.emitProgress(75, 'Extracting positions...');

      // Extract positions
      const positions = this.extractPositions(layoutedGraph);

      // Emit progress event
      this.emitProgress(90, 'Finalizing layout...');

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
    } catch (error) {
      this.emitProgress(0, 'Layout failed');
      throw new Error(`ELK layout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private convertToElkFormat(graph: LayoutGraph, options: LayoutOptions) {
    return {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': this.mapDirection(options.direction),
        'elk.spacing.nodeNode': options.spacing.node.toString(),
        'elk.spacing.nodeNodeBetweenLayers': options.spacing.level.toString(),
      },
      children: graph.nodes.map(node => ({
        id: node.id,
        width: node.width,
        height: node.height,
      })),
      edges: graph.edges.map(edge => ({
        id: edge.id || `${edge.source}-${edge.target}`,
        sources: [edge.source],
        targets: [edge.target],
      })),
    };
  }

  private extractPositions(elkGraph: any) {
    return elkGraph.children.map((node: any) => ({
      id: node.id,
      position: {
        x: node.x || 0,
        y: node.y || 0,
      },
    }));
  }

  private mapDirection(direction: string): string {
    switch (direction) {
      case 'LR': return 'RIGHT';
      case 'RL': return 'LEFT';
      case 'TB': return 'DOWN';
      case 'BT': return 'UP';
      default: return 'RIGHT';
    }
  }

  /**
   * Emit progress events during ELK layout
   */
  private emitProgress(progress: number, message: string): void {
    try {
      globalCanvasEventBus.emit({
        type: 'layout:progress',
        payload: {
          progress,
          message,
          stage: 'calculating',
        },
      });
    } catch (error) {
      console.warn('Failed to emit ELK progress event:', error);
    }
  }
}
