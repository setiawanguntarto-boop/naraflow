/**
 * Intelligent Preload Manager
 * Manages node preloading with connection-aware scheduling
 */

export type ConnectionSpeed = 'fast' | 'slow' | 'offline';

class PreloadManagerClass {
  private preloadedNodes = new Set<string>();
  private loadingNodes = new Set<string>();
  private connectionSpeed: ConnectionSpeed = 'fast';
  private preloadQueue: string[] = [];

  /**
   * Detect connection speed
   */
  private detectConnectionSpeed(): ConnectionSpeed {
    if (!navigator.onLine) return 'offline';
    
    const connection = (navigator as any).connection;
    if (!connection) return 'fast';
    
    const effectiveType = connection.effectiveType || '4g';
    if (effectiveType === '2g' || effectiveType === 'slow-2g') {
      return 'slow';
    }
    
    return 'fast';
  }

  /**
   * Initialize preload manager
   */
  async initialize() {
    this.connectionSpeed = this.detectConnectionSpeed();
    
    // Only preload on fast connections
    if (this.connectionSpeed === 'fast') {
      await this.preloadCommonNodes();
    }
    
    console.log(`📦 PreloadManager initialized (${this.connectionSpeed} connection)`);
  }

  /**
   * Preload common nodes for faster initial rendering
   */
  async preloadCommonNodes() {
    const commonTypes = ['default', 'start', 'end', 'decision'];
    
    const preloadPromises = commonTypes.map(async (nodeType) => {
      if (this.preloadedNodes.has(nodeType)) return;
      
      await this.preloadNode(nodeType);
    });

    await Promise.all(preloadPromises);
    console.log('✅ Common nodes preloaded');
  }

  /**
   * Preload a single node type
   */
  private async preloadNode(nodeType: string): Promise<void> {
    if (this.preloadedNodes.has(nodeType) || this.loadingNodes.has(nodeType)) {
      return;
    }

    this.loadingNodes.add(nodeType);
    
    try {
      // Trigger import for the node type
      await import(`@/components/canvas/nodes/${nodeType}.tsx`).catch(() => {
        // Fallback to DefaultNode if specific type not found
        return import('@/components/canvas/nodes/DefaultNode');
      });
      
      this.preloadedNodes.add(nodeType);
      console.log(`✅ Preloaded: ${nodeType}`);
    } catch (error) {
      console.warn(`⚠️ Failed to preload ${nodeType}:`, error);
    } finally {
      this.loadingNodes.delete(nodeType);
    }
  }

  /**
   * Preload nodes when browser is idle
   */
  preloadOnIdle(nodeTypes: string[]) {
    if (this.connectionSpeed === 'offline') return;

    const executePreload = () => {
      nodeTypes.forEach(nodeType => {
        if (!this.preloadedNodes.has(nodeType)) {
          this.preloadNode(nodeType);
        }
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(executePreload, { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(executePreload, 100);
    }
  }

  /**
   * Preload nodes used in workflow
   */
  async preloadWorkflowNodes(nodeTypes: string[]) {
    if (this.connectionSpeed === 'offline') return;

    const uniqueTypes = Array.from(new Set(nodeTypes));
    
    // Preload critical nodes first
    const criticalNodes = uniqueTypes.filter(type => 
      ['default', 'start', 'end'].includes(type)
    );
    
    // Preload critical nodes immediately
    await Promise.all(criticalNodes.map(type => this.preloadNode(type)));
    
    // Preload rest on idle
    const restNodes = uniqueTypes.filter(type => !criticalNodes.includes(type));
    this.preloadOnIdle(restNodes);
  }

  /**
   * Check if node is preloaded
   */
  isNodePreloaded(nodeType: string): boolean {
    return this.preloadedNodes.has(nodeType);
  }

  /**
   * Get preload status for UI
   */
  getPreloadStatus(nodeType: string): 'preloaded' | 'loading' | 'pending' {
    if (this.preloadedNodes.has(nodeType)) return 'preloaded';
    if (this.loadingNodes.has(nodeType)) return 'loading';
    return 'pending';
  }

  /**
   * Get list of preloaded nodes
   */
  getPreloadedNodes(): string[] {
    return Array.from(this.preloadedNodes);
  }
}

// Singleton instance
export const PreloadManager = new PreloadManagerClass();

