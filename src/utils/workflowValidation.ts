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
   * Attempt to auto-fix common issues by mutating shallow copies of the graph.
   * - Adds missing Start/End nodes
   * - Fills empty labels with placeholders
   * - Connects nodes without outgoing edges to the nearest End (or creates one)
   */
  static autoFixWorkflow(nodes: Node[], edges: Edge[]): {
    nodes: Node[];
    edges: Edge[];
    changes: Array<{ kind: string; nodeId?: string; edgeId?: string; description: string }>;
  } {
    const nMap = new Map(nodes.map(n => [n.id, { ...n, data: { ...(n.data || {}) } }] as const));
    const outEdges = new Map<string, Edge[]>();
    const inEdges = new Map<string, Edge[]>();
    const eList: Edge[] = edges.map(e => ({ ...e }));
    const changes: Array<{ kind: string; nodeId?: string; edgeId?: string; description: string }> = [];

    const addEdge = (source: string, target: string) => {
      const id = `auto-${source}-${target}-${Math.random().toString(36).slice(2, 8)}`;
      const edge: Edge = { id, source, target } as any;
      eList.push(edge);
      changes.push({ kind: "edge-added", edgeId: id, description: `Linked ${source} -> ${target}` });
      return edge;
    };

    // Ensure a Start node exists
    const starts = nodes.filter(n => n.type === "start");
    let startId = starts[0]?.id;
    if (!startId) {
      startId = `start-auto`;
      const start: Node = {
        id: startId,
        type: "start",
        position: { x: 0, y: 0 } as any,
        data: { label: "Start" } as any,
      };
      nMap.set(start.id, start);
      changes.push({ kind: "node-added", nodeId: start.id, description: "Added Start node" });
    }

    // Ensure an End node exists
    const ends = nodes.filter(n => n.type === "end");
    let endId = ends[0]?.id;
    if (!endId) {
      endId = `end-auto`;
      const end: Node = {
        id: endId,
        type: "end",
        position: { x: 400, y: 0 } as any,
        data: { label: "End" } as any,
      };
      nMap.set(end.id, end);
      changes.push({ kind: "node-added", nodeId: end.id, description: "Added End node" });
    }

    // Build edge maps
    eList.forEach(e => {
      if (!outEdges.has(e.source)) outEdges.set(e.source, []);
      if (!inEdges.has(e.target)) inEdges.set(e.target, []);
      outEdges.get(e.source)!.push(e);
      inEdges.get(e.target)!.push(e);
    });

    // Fill missing labels
    Array.from(nMap.values()).forEach(n => {
      const label = (n.data as any)?.label;
      if (!label || String(label).trim() === "") {
        (n.data as any).label = `${n.type || "Node"} ${n.id}`;
        changes.push({ kind: "label-filled", nodeId: n.id, description: `Filled empty label for ${n.id}` });
      }
    });

    // Connect nodes without outgoing edges (that are not End) to the End
    Array.from(nMap.values()).forEach(n => {
      if (n.type === "end" || n.type === "group") return;
      const outs = outEdges.get(n.id) || [];
      if (outs.length === 0) {
        addEdge(n.id, endId!);
      }
    });

    // Connect nodes without incoming edges (that are not Start) to the Start
    Array.from(nMap.values()).forEach(n => {
      if (n.type === "start" || n.type === "group") return;
      const ins = inEdges.get(n.id) || [];
      if (ins.length === 0) {
        addEdge(startId!, n.id);
      }
    });

    return { nodes: Array.from(nMap.values()), edges: eList, changes };
  }

  /**
   * Validate entire workflow
   */
  static validateWorkflow(nodes: Node[], edges: Edge[]): ValidationError[] {
    const errors: ValidationError[] = [];

    const nodeIdSet = new Set(nodes.map(n => n.id));

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

    // Validate edges: existence and self-loops
    edges.forEach(e => {
      if (!nodeIdSet.has(e.source)) {
        errors.push({
          id: `edge-missing-source-${e.id || `${e.source}->${e.target}`}`,
          edgeId: e.id,
          type: "error",
          severity: "critical",
          message: `Edge references missing source node: ${e.source}`,
        });
      }
      if (!nodeIdSet.has(e.target)) {
        errors.push({
          id: `edge-missing-target-${e.id || `${e.source}->${e.target}`}`,
          edgeId: e.id,
          type: "error",
          severity: "critical",
          message: `Edge references missing target node: ${e.target}`,
        });
      }
      if (e.source === e.target) {
        errors.push({
          id: `self-loop-${e.id || e.source}`,
          edgeId: e.id,
          type: "warning",
          severity: "low",
          message: "Self-loop detected. Ensure this is intentional to avoid infinite loops",
        });
      }
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

    // Check for nodes unreachable from any Start node
    const unreachableFromStart = this.findUnreachableFromStart(nodes, edges);
    unreachableFromStart.forEach(nodeId => {
      errors.push({
        id: `unreachable-from-start-${nodeId}`,
        nodeId,
        type: "warning",
        severity: "high",
        message: "Node cannot be reached from any Start node",
      });
    });

    // Detect directed cycles (may cause infinite loops)
    const cycleNodes = this.findCycleNodes(nodes, edges);
    cycleNodes.forEach(nodeId => {
      errors.push({
        id: `cycle-${nodeId}`,
        nodeId,
        type: "warning",
        severity: "medium",
        message: "Node is part of a cycle. Ensure there is a terminating path",
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
    const nodeLabel = (node.data as any)?.label;
    if (!nodeLabel || String(nodeLabel).trim() === "") {
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
      n => n.id !== node.id && (n.data as any)?.label === nodeLabel
    );
    if (duplicateLabels.length > 0) {
      errors.push({
        id: `duplicate-label-${node.id}`,
        nodeId: node.id,
        type: "warning",
        severity: "low",
        message: `Duplicate label: "${nodeLabel}"`,
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
   * Find nodes that cannot be reached from any Start node
   */
  static findUnreachableFromStart(nodes: Node[], edges: Edge[]): string[] {
    const startIds = nodes.filter(n => n.type === "start").map(n => n.id);
    if (startIds.length === 0) return [];

    const visited = new Set<string>();
    const queue: string[] = [...startIds];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      const outs = edges.filter(e => e.source === current).map(e => e.target);
      outs.forEach(t => { if (!visited.has(t)) queue.push(t); });
    }

    return nodes
      .filter(n => n.type !== "group" && !visited.has(n.id))
      .map(n => n.id);
  }

  /**
   * Find nodes participating in any directed cycle using DFS
   */
  static findCycleNodes(nodes: Node[], edges: Edge[]): string[] {
    const idToIndex = new Map<string, number>();
    nodes.forEach((n, i) => idToIndex.set(n.id, i));
    const adj = new Map<string, string[]>();
    nodes.forEach(n => adj.set(n.id, []));
    edges.forEach(e => {
      if (adj.has(e.source)) adj.get(e.source)!.push(e.target);
    });

    const visiting = new Set<string>();
    const visited = new Set<string>();
    const inCycle = new Set<string>();

    const dfs = (u: string) => {
      if (visiting.has(u)) { inCycle.add(u); return; }
      if (visited.has(u)) return;
      visiting.add(u);
      for (const v of adj.get(u) || []) {
        if (!visited.has(v)) dfs(v);
        if (visiting.has(v) || inCycle.has(v)) inCycle.add(u);
      }
      visiting.delete(u);
      visited.add(u);
    };

    nodes.forEach(n => dfs(n.id));
    return Array.from(inCycle);
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
