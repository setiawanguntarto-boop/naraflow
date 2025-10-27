/**
 * Migration utility for converting v2 NodeLibrary to v3
 */

import { NodeDefinition } from "./nodeLibrary";
import { NodeTypeDefinition } from "./nodeLibrary_v3";

/**
 * Migrate from NodeLibrary v2 to v3
 */
export function migrateV2ToV3(v2Node: NodeDefinition): Partial<NodeTypeDefinition> {
  return {
    id: v2Node.id,
    version: "1.0.0",
    label: v2Node.displayName,
    description: v2Node.description,
    category: mapCategory(v2Node.category),

    // Create basic config schema
    configSchema: {
      type: "object",
      properties: {},
      required: [],
    },

    // Map inputs/outputs
    inputs: mapConnectionsToPorts(v2Node.inputs),
    outputs: mapConnectionsToPorts(v2Node.outputs),

    ui: {
      icon: v2Node.icon,
      category: v2Node.category,
      fieldsOrder: [],
      helpLinks: [],
    },

    runtime: {
      handler: `@/executors/${v2Node.id}Executor`,
      timeoutMs: 30000,
    },

    meta: {
      tags: [v2Node.category],
      createdAt: new Date().toISOString(),
    },
  };
}

function mapCategory(category: string): NodeTypeDefinition["category"] {
  const categoryMap: Record<string, NodeTypeDefinition["category"]> = {
    input: "trigger",
    processing: "logic",
    logic: "control",
    output: "output",
    meta: "trigger",
  };

  return categoryMap[category.toLowerCase()] || "utility";
}

function mapConnectionsToPorts(connections?: Record<string, string>): Record<string, any> {
  if (!connections) return {};

  return Object.entries(connections).reduce(
    (acc, [name, type]) => {
      acc[name] = {
        name,
        type: mapPortType(type),
        required: false,
        description: `${name} port`,
      };
      return acc;
    },
    {} as Record<string, any>
  );
}

function mapPortType(type: string): any {
  const typeMap: Record<string, string> = {
    trigger: "trigger",
    data: "data",
    condition: "condition",
    message: "message",
    confirmation: "confirmation",
    insights: "insights",
    route: "route",
  };

  return typeMap[type] || "data";
}

/**
 * Migrate entire workflow from v2 to v3
 */
export function migrateWorkflowToV3(workflow: any): any {
  return {
    ...workflow,
    version: "3.0.0",
    nodes:
      workflow.nodes?.map((node: any) => ({
        ...node,
        config: node.config || {},
        inputs: node.data?.inputs || [],
        outputs: node.data?.outputs || [],
      })) || [],
    connections: workflow.connections || {},
  };
}
