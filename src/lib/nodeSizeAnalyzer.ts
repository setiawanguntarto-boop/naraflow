/**
 * Node Size Analyzer
 * Tracks and calculates bundle size impact of each node type
 */

interface NodeSizeInfo {
  nodeType: string;
  estimatedSize: number; // in bytes
  loaded: boolean;
  isHeavy: boolean;
}

export class NodeSizeAnalyzer {
  private static readonly nodeSizes: Record<string, number> = {
    // Lightweight nodes (< 10KB)
    default: 8 * 1024, // 8KB
    start: 6 * 1024,
    end: 6 * 1024,
    decision: 9 * 1024,
    
    // Medium nodes (10KB - 50KB)
    group: 15 * 1024,
    "llama-decision": 25 * 1024,
    
    // Heavy nodes (>= 50KB)
    agent: 55 * 1024,
    "agent.conversational": 60 * 1024,
  };

  private static readonly SIZE_CATEGORIES = {
    LIGHTWEIGHT: 10 * 1024, // < 10KB
    MEDIUM: 50 * 1024,      // 10KB - 50KB
    // HEAVY: >= 50KB
  };

  /**
   * Get size category for a node type
   */
  static getSizeCategory(nodeType: string): "lightweight" | "medium" | "heavy" {
    const size = this.nodeSizes[nodeType] || 10 * 1024;
    
    if (size < this.SIZE_CATEGORIES.LIGHTWEIGHT) {
      return "lightweight";
    } else if (size < this.SIZE_CATEGORIES.MEDIUM) {
      return "medium";
    } else {
      return "heavy";
    }
  }

  /**
   * Get estimated size for a node type
   */
  static getNodeSize(nodeType: string): number {
    return this.nodeSizes[nodeType] || 10 * 1024;
  }

  /**
   * Format size in human-readable format
   */
  static formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * Get size badge color for UI
   */
  static getSizeBadgeColor(category: "lightweight" | "medium" | "heavy"): string {
    switch (category) {
      case "lightweight":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "heavy":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  }

  /**
   * Get size icon for category
   */
  static getSizeIcon(category: "lightweight" | "medium" | "heavy"): string {
    switch (category) {
      case "lightweight":
        return "⚡";
      case "medium":
        return "⚖️";
      case "heavy":
        return "⚙️";
      default:
        return "📦";
    }
  }
}

