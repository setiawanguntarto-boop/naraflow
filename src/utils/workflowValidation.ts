import { Node, Edge } from "@xyflow/react";

export interface ValidationError {
  id: string;
  nodeId?: string;
  edgeId?: string;
  type: "error" | "warning";
  message: string;
  severity: "critical" | "high" | "medium" | "low";
}

export class WorkflowValidator {
  /**
   * Validate entire workflow
   */
  static validateWorkflow(nodes: Node[], edges: Edge[]): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for Start node
    const startNodes = nodes.filter(n => n.type === "start");
    if (startNodes.length === 0) {
      errors.push({
        id: "no-start-node",
        type: "error",
        severity: "critical",
        message: "Workflow must have a Start node",
      });
    } else if (startNodes.length > 1) {
      errors.push({
        id: "multiple-start-nodes",
        type: "error",
        severity: "high",
        message: "Workflow can only have one Start node",
      });
    }

    // Check for End node
    const endNodes = nodes.filter(n => n.type === "end");
    if (endNodes.length === 0) {
      errors.push({
        id: "no-end-node",
        type: "error",
        severity: "critical",
        message: "Workflow must have at least one End node",
      });
    }

    // Validate each node
    nodes.forEach(node => {
      const nodeErrors = this.validateNode(node, nodes, edges);
      errors.push(...nodeErrors);
    });

    // Check for orphaned nodes
    const orphanedNodes = this.findOrphanedNodes(nodes, edges);
    orphanedNodes.forEach(nodeId => {
      errors.push({
        id: `orphaned-${nodeId}`,
        nodeId,
        type: "error",
        severity: "high",
        message: "Node is not connected to the workflow",
      });
    });

    // Check for unreachable end nodes
    const unreachableEnds = this.findUnreachableEndNodes(nodes, edges);
    unreachableEnds.forEach(nodeId => {
      errors.push({
        id: `unreachable-${nodeId}`,
        nodeId,
        type: "warning",
        severity: "medium",
        message: "This path does not lead to an End node",
      });
    });

    return errors;
  }

  /**
   * Validate individual node
   */
  static validateNode(node: Node, allNodes: Node[], edges: Edge[]): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check if node has required fields
    if (!node.data.label || String(node.data.label).trim() === "") {
      errors.push({
        id: `empty-label-${node.id}`,
        nodeId: node.id,
        type: "error",
        severity: "medium",
        message: "Node label is required",
      });
    }

    // Check outgoing connections (except End nodes and Group nodes)
    if (node.type !== "end" && node.type !== "group") {
      const outgoingEdges = edges.filter(e => e.source === node.id);
      if (outgoingEdges.length === 0) {
        errors.push({
          id: `no-outgoing-${node.id}`,
          nodeId: node.id,
          type: "error",
          severity: "high",
          message: "Node must have at least one outgoing connection",
        });
      }
    }

    // Check incoming connections (except Start nodes)
    if (node.type !== "start") {
      const incomingEdges = edges.filter(e => e.target === node.id);
      if (incomingEdges.length === 0 && !node.parentId) {
        errors.push({
          id: `no-incoming-${node.id}`,
          nodeId: node.id,
          type: "error",
          severity: "high",
          message: "Node must have at least one incoming connection",
        });
      }
    }

    // Special validation for decision nodes
    if (node.type === "decision") {
      const yesEdge = edges.find(e => e.source === node.id && e.sourceHandle === "yes");
      const noEdge = edges.find(e => e.source === node.id && e.sourceHandle === "no");

      if (!yesEdge) {
        errors.push({
          id: `missing-yes-${node.id}`,
          nodeId: node.id,
          type: "warning",
          severity: "medium",
          message: 'Decision node should have "Yes" branch connected',
        });
      }

      if (!noEdge) {
        errors.push({
          id: `missing-no-${node.id}`,
          nodeId: node.id,
          type: "warning",
          severity: "medium",
          message: 'Decision node should have "No" branch connected',
        });
      }
    }

    // Check for duplicate labels (warning)
    const duplicateLabels = allNodes.filter(
      n => n.id !== node.id && n.data.label === node.data.label
    );
    if (duplicateLabels.length > 0) {
      errors.push({
        id: `duplicate-label-${node.id}`,
        nodeId: node.id,
        type: "warning",
        severity: "low",
        message: `Duplicate label: "${node.data.label}"`,
      });
    }

    return errors;
  }

  /**
   * Find orphaned nodes (not connected to workflow)
   */
  static findOrphanedNodes(nodes: Node[], edges: Edge[]): string[] {
    const connectedNodeIds = new Set<string>();

    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    // Filter nodes that aren't connected and aren't in groups
    return nodes
      .filter(node => !connectedNodeIds.has(node.id) && !node.parentId && node.type !== "group")
      .map(node => node.id);
  }

  /**
   * Find paths that don't lead to End node (using DFS)
   */
  static findUnreachableEndNodes(nodes: Node[], edges: Edge[]): string[] {
    const endNodes = nodes.filter(n => n.type === "end").map(n => n.id);
    const unreachable: string[] = [];

    nodes.forEach(node => {
      if (node.type === "end" || node.type === "start" || node.type === "group") return;

      const canReachEnd = this.canReachAnyEndNode(node.id, edges, endNodes);
      if (!canReachEnd) {
        unreachable.push(node.id);
      }
    });

    return unreachable;
  }

  /**
   * Check if node can reach any end node (BFS)
   */
  static canReachAnyEndNode(nodeId: string, edges: Edge[], endNodeIds: string[]): boolean {
    const visited = new Set<string>();
    const queue: string[] = [nodeId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      if (endNodeIds.includes(currentId)) {
        return true;
      }

      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const outgoingEdges = edges.filter(e => e.source === currentId);
      outgoingEdges.forEach(edge => {
        if (!visited.has(edge.target)) {
          queue.push(edge.target);
        }
      });
    }

    return false;
  }

  /**
   * Get validation summary
   */
  static getValidationSummary(errors: ValidationError[]): {
    isValid: boolean;
    errorCount: number;
    warningCount: number;
    criticalCount: number;
  } {
    return {
      isValid: errors.filter(e => e.type === "error").length === 0,
      errorCount: errors.filter(e => e.type === "error").length,
      warningCount: errors.filter(e => e.type === "warning").length,
      criticalCount: errors.filter(e => e.severity === "critical").length,
    };
  }
}
