/**
 * Validation Service
 * Interactive validation for generated workflows
 */

import { WorkflowOutput } from "./types";
import { nodeTypeRegistry } from "@/lib/nodeTypeRegistry";

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Validate a generated workflow
 */
export function validateWorkflow(workflow: WorkflowOutput): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check if all node types exist in registry
  workflow.nodes.forEach(node => {
    if (node.type === "default") return; // Default nodes are always valid

    const nodeType = nodeTypeRegistry.getNodeType(node.type);

    if (!nodeType) {
      warnings.push(`Unknown node type: ${node.type}. This node may not execute properly.`);
    } else {
      // Check required config fields
      const nodeTypeSchema = nodeType.configSchema;

      if (nodeTypeSchema && typeof nodeTypeSchema === "object" && "required" in nodeTypeSchema) {
        const requiredFields = nodeTypeSchema.required as string[];

        if (requiredFields && Array.isArray(requiredFields)) {
          for (const field of requiredFields) {
            if (!node.data.config || !node.data.config[field]) {
              warnings.push(`Node ${node.id} missing required config field: ${field}`);
            }
          }
        }
      }
    }

    // Check webhook nodes for security configuration
    if (node.type === "whatsapp.trigger" || node.type?.includes("trigger")) {
      const config = node.data.config || node.data;
      
      if (config.verifyToken === "" || config.verifyToken === "verify-token") {
        warnings.push(
          `Node ${node.id}: Webhook verify token is not configured. Set a secure random token before deploying.`
        );
      }
      
      if (config.verifyToken && config.verifyToken.length < 16) {
        warnings.push(
          `Node ${node.id}: Webhook verify token is too short. Use at least 16 characters for security.`
        );
      }
    }
  });

  // Check edge connections
  const nodeIdMap = new Set(workflow.nodes.map(n => n.id));

  workflow.edges.forEach(edge => {
    if (!nodeIdMap.has(edge.source)) {
      errors.push(`Edge references non-existent source node: ${edge.source}`);
    }

    if (!nodeIdMap.has(edge.target)) {
      errors.push(`Edge references non-existent target node: ${edge.target}`);
    }
  });

  // Check for orphaned nodes (no connections)
  const connectedNodes = new Set<string>();
  workflow.edges.forEach(edge => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });

  workflow.nodes.forEach(node => {
    if (!connectedNodes.has(node.id) && workflow.nodes.length > 1) {
      warnings.push(`Node ${node.id} is not connected to any other node`);
    }
  });

  // Check for cycles (basic detection - warn only)
  const hasCycle = detectSimpleCycle(workflow.nodes, workflow.edges);
  if (hasCycle) {
    warnings.push("Potential circular dependency detected in workflow");
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Detect simple cycles in workflow graph
 */
function detectSimpleCycle(nodes: any[], edges: any[]): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoingEdges = edges.filter(e => e.source === nodeId);
    for (const edge of outgoingEdges) {
      if (dfs(edge.target)) return true;
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id) && dfs(node.id)) {
      return true;
    }
  }

  return false;
}
