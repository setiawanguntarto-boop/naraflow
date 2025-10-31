import { NodeTypeDefinition } from "../nodeLibrary_v3";

export const DecisionNode: NodeTypeDefinition = {
  id: "control.decision",
  version: "1.0.0",
  label: "Decision",
  description: "Route workflow based on evaluated conditions.",
  category: "control",

  configSchema: {
    type: "object",
    properties: {
      mode: { type: "string", enum: ["all", "any"], default: "any", description: "Combine multiple conditions" },
      stopOnFirst: { type: "boolean", default: true, description: "Stop evaluating after first match" },
      defaultRoute: { type: "string", default: "default", description: "Route when no condition matches" },
      conditions: {
        type: "array",
        description: "List of conditions and their routes",
        items: {
          type: "object",
          properties: {
            leftPath: { type: "string", description: "Dot path to value from payload/vars/memory" },
            operator: { type: "string", enum: ["==", "!=", ">", ">=", "<", "<=", "includes", "exists", "regex"], default: "==" },
            rightValue: { type: ["string", "number", "boolean"], description: "Literal to compare or regex pattern" },
            route: { type: "string", description: "Target route id (output)" },
          },
          required: ["leftPath", "operator", "route"],
        },
        default: [],
      },
    },
    required: ["conditions"],
  },

  inputs: {
    default: { name: "default", type: "data", required: false, description: "Input payload used for evaluation" },
  },

  outputs: {
    default: { name: "default", type: "route", description: "Default route when no condition matches" },
    matched: { name: "matched", type: "route", description: "Generic matched route when route unspecified" },
  },

  ui: {
    icon: "git-branch",
    category: "control",
    fieldsOrder: ["mode", "stopOnFirst", "defaultRoute", "conditions"],
    advanced: { collapsed: true, fields: [] },
    helpLinks: ["docs/decision"],
  },

  runtime: {
    handler: "@/lib/executors/decisionExecutorV3",
    timeoutMs: 3000,
  },

  security: { authType: "none" },
  meta: { tags: ["logic", "routing"], author: "Naraflow Team", createdAt: new Date().toISOString() },
};


