/**
 * Real-time Workflow Size Calculator
 * Tracks total bundle size of workflow and updates in real-time
 */

import { useEffect, useState, useMemo } from "react";
import { Node } from "@xyflow/react";
import { NodeSizeAnalyzer } from "@/lib/nodeSizeAnalyzer";

interface WorkflowSize {
  totalSize: number;
  formattedSize: string;
  nodeCount: number;
  heavyNodeCount: number;
  breakdown: Array<{
    nodeType: string;
    count: number;
    size: number;
    formattedSize: string;
  }>;
}

/**
 * Hook to calculate workflow size in real-time
 */
export function useWorkflowSizeCalculator(nodes: Record<string, Node>) {
  const [workflowSize, setWorkflowSize] = useState<WorkflowSize>({
    totalSize: 0,
    formattedSize: "0 B",
    nodeCount: 0,
    heavyNodeCount: 0,
    breakdown: [],
  });

  // Calculate workflow size whenever nodes change
  const sizeCalculation = useMemo(() => {
    const nodeArray = Object.values(nodes);
    let totalSize = 0;
    const typeBreakdown = new Map<string, number>();

    // Count nodes by type and calculate total size
    nodeArray.forEach(node => {
      const nodeType = node.type || "default";
      const nodeSize = NodeSizeAnalyzer.getNodeSize(nodeType);
      totalSize += nodeSize;

      const currentCount = typeBreakdown.get(nodeType) || 0;
      typeBreakdown.set(nodeType, currentCount + 1);
    });

    // Count heavy nodes
    const heavyNodeCount = nodeArray.filter(node => {
      const category = NodeSizeAnalyzer.getSizeCategory(node.type || "default");
      return category === "heavy";
    }).length;

    // Create breakdown array
    const breakdown = Array.from(typeBreakdown.entries()).map(([nodeType, count]) => {
      const nodeSize = NodeSizeAnalyzer.getNodeSize(nodeType);
      return {
        nodeType,
        count,
        size: nodeSize * count,
        formattedSize: NodeSizeAnalyzer.formatSize(nodeSize * count),
      };
    });

    // Sort breakdown by size (descending)
    breakdown.sort((a, b) => b.size - a.size);

    return {
      totalSize,
      formattedSize: NodeSizeAnalyzer.formatSize(totalSize),
      nodeCount: nodeArray.length,
      heavyNodeCount,
      breakdown,
    };
  }, [nodes]);

  useEffect(() => {
    setWorkflowSize(sizeCalculation);
  }, [sizeCalculation]);

  return workflowSize;
}

