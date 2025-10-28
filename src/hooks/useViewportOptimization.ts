/**
 * Viewport Optimization Hook
 * Implements viewport-based culling for large workflows
 */

import { useMemo, useState, useEffect } from "react";
import { Node, Edge, Viewport } from "@xyflow/react";

interface ViewportOptimizationOptions {
  enabled?: boolean;
  viewportPadding?: number;
  debounceMs?: number;
}

interface ViewportBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Calculate which nodes are visible in the current viewport
 */
function getNodesInViewport(
  nodes: Node[],
  viewport: Viewport,
  padding: number = 200
): Node[] {
  if (!viewport || nodes.length === 0) {
    return nodes;
  }

  const bounds: ViewportBounds = {
    minX: -viewport.x / viewport.zoom,
    maxX: (-viewport.x + window.innerWidth) / viewport.zoom,
    minY: -viewport.y / viewport.zoom,
    maxY: (-viewport.y + window.innerHeight) / viewport.zoom,
  };

  // Add padding to viewport bounds
  const paddedBounds: ViewportBounds = {
    minX: bounds.minX - padding,
    maxX: bounds.maxX + padding,
    minY: bounds.minY - padding,
    maxY: bounds.maxY + padding,
  };

  return nodes.filter(node => {
    const nodeX = node.position.x;
    const nodeY = node.position.y;
    const nodeWidth = node.width || 200;
    const nodeHeight = node.height || 100;

    return (
      nodeX + nodeWidth >= paddedBounds.minX &&
      nodeX <= paddedBounds.maxX &&
      nodeY + nodeHeight >= paddedBounds.minY &&
      nodeY <= paddedBounds.maxY
    );
  });
}

/**
 * Custom hook for viewport-based optimization
 */
export function useViewportOptimization(
  nodes: Node[],
  edges: Edge[],
  options: ViewportOptimizationOptions = {}
) {
  const {
    enabled = true,
    viewportPadding = 200,
    debounceMs = 100,
  } = options;

  const [viewport, setViewport] = useState<Viewport | null>(null);
  const [visibleNodes, setVisibleNodes] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled || !viewport) {
      setVisibleNodes(nodes.map(n => n.id));
      return;
    }

    const timer = setTimeout(() => {
      const inViewport = getNodesInViewport(nodes, viewport, viewportPadding);
      setVisibleNodes(inViewport.map(n => n.id));
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [nodes, viewport, enabled, viewportPadding, debounceMs]);

  const updateViewport = useMemo(
    () => (newViewport: Viewport) => {
      setViewport(newViewport);
    },
    []
  );

  const optimizedNodes = useMemo(() => {
    if (!enabled) {
      return nodes;
    }

    const visibleSet = new Set(visibleNodes);
    return nodes.filter(node => visibleSet.has(node.id));
  }, [nodes, visibleNodes, enabled]);

  const optimizedEdges = useMemo(() => {
    if (!enabled) {
      return edges;
    }

    const visibleSet = new Set(visibleNodes);
    return edges.filter(edge => {
      // Include edge if source or target is visible
      return visibleSet.has(edge.source) || visibleSet.has(edge.target);
    });
  }, [edges, visibleNodes, enabled]);

  return {
    optimizedNodes,
    optimizedEdges,
    updateViewport,
    isOptimized: enabled && visibleNodes.length < nodes.length,
    visibleCount: visibleNodes.length,
    totalCount: nodes.length,
  };
}

