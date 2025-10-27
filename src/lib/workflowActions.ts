import { Node } from "@xyflow/react";

export const WorkflowActions = {
  // Alignment functions
  alignHorizontally: (nodes: Node[]): Node[] => {
    if (nodes.length < 2) return nodes;

    const avgY = nodes.reduce((sum, n) => sum + n.position.y, 0) / nodes.length;

    return nodes.map(n => ({
      ...n,
      position: { ...n.position, y: avgY },
    }));
  },

  alignVertically: (nodes: Node[]): Node[] => {
    if (nodes.length < 2) return nodes;

    const avgX = nodes.reduce((sum, n) => sum + n.position.x, 0) / nodes.length;

    return nodes.map(n => ({
      ...n,
      position: { ...n.position, x: avgX },
    }));
  },

  // Distribution functions
  distributeHorizontally: (nodes: Node[]): Node[] => {
    if (nodes.length < 3) return nodes;

    const sorted = [...nodes].sort((a, b) => a.position.x - b.position.x);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const spacing = (last.position.x - first.position.x) / (sorted.length - 1);

    return sorted.map((n, i) => ({
      ...n,
      position: { ...n.position, x: first.position.x + spacing * i },
    }));
  },

  distributeVertically: (nodes: Node[]): Node[] => {
    if (nodes.length < 3) return nodes;

    const sorted = [...nodes].sort((a, b) => a.position.y - b.position.y);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const spacing = (last.position.y - first.position.y) / (sorted.length - 1);

    return sorted.map((n, i) => ({
      ...n,
      position: { ...n.position, y: first.position.y + spacing * i },
    }));
  },

  // Export node data as JSON
  exportNodeAsJSON: (node: Node): void => {
    const dataStr = JSON.stringify(node, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `node-${node.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
