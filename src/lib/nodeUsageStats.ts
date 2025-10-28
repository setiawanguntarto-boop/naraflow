/**
 * Node Usage Statistics Tracker
 * Tracks and analyzes node usage patterns for intelligent preloading
 */

class NodeUsageStatsClass {
  private usageCount = new Map<string, number>();
  private usageHistory: Array<{ nodeType: string; timestamp: number }> = [];
  private readonly MAX_HISTORY = 1000;

  /**
   * Track node usage
   */
  trackUsage(nodeType: string) {
    const currentCount = this.usageCount.get(nodeType) || 0;
    this.usageCount.set(nodeType, currentCount + 1);

    // Add to history
    this.usageHistory.push({
      nodeType,
      timestamp: Date.now(),
    });

    // Trim history if too large
    if (this.usageHistory.length > this.MAX_HISTORY) {
      this.usageHistory = this.usageHistory.slice(-this.MAX_HISTORY);
    }

    // Persist to localStorage
    this.persistToStorage();
  }

  /**
   * Get usage count for a specific node type
   */
  getUsageCount(nodeType: string): number {
    return this.usageCount.get(nodeType) || 0;
  }

  /**
   * Get most used nodes
   */
  getMostUsedNodes(limit: number = 5): string[] {
    return Array.from(this.usageCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([type]) => type);
  }

  /**
   * Get recently used nodes
   */
  getRecentlyUsedNodes(limit: number = 5, timeWindow: number = 3600000): string[] {
    const now = Date.now();
    const recentUsages = this.usageHistory.filter(
      entry => now - entry.timestamp < timeWindow
    );

    const countMap = new Map<string, number>();
    recentUsages.forEach(entry => {
      const count = countMap.get(entry.nodeType) || 0;
      countMap.set(entry.nodeType, count + 1);
    });

    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([type]) => type);
  }

  /**
   * Get usage statistics
   */
  getStats() {
    const total = Array.from(this.usageCount.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    return {
      totalUsages: total,
      uniqueNodeTypes: this.usageCount.size,
      mostUsed: this.getMostUsedNodes(5),
      recentlyUsed: this.getRecentlyUsedNodes(5),
    };
  }

  /**
   * Persist to localStorage
   */
  private persistToStorage() {
    try {
      const data = {
        usageCount: Array.from(this.usageCount.entries()),
        lastUpdated: Date.now(),
      };
      localStorage.setItem('nodeUsageStats', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to persist usage stats:', error);
    }
  }

  /**
   * Load from localStorage
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem('nodeUsageStats');
      if (data) {
        const parsed = JSON.parse(data);
        this.usageCount = new Map(parsed.usageCount);
        console.log('📊 Loaded usage statistics');
      }
    } catch (error) {
      console.warn('Failed to load usage stats:', error);
    }
  }

  /**
   * Clear statistics
   */
  clear() {
    this.usageCount.clear();
    this.usageHistory = [];
    localStorage.removeItem('nodeUsageStats');
  }
}

// Singleton instance
export const NodeUsageStats = new NodeUsageStatsClass();

// Load persisted stats on initialization
NodeUsageStats.loadFromStorage();

