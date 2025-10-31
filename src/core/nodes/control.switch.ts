import { NodeTypeDefinition } from "../nodeLibrary_v3";

export const SwitchNode: NodeTypeDefinition = {
  id: "control.switch",
  version: "1.0.0",
  label: "Switch (Route)",
  description: "Route flow based on expression results",
  category: "control",

  configSchema: {
    type: "object",
    properties: {
      conditionType: {
        type: "string",
        enum: ["simple", "expression", "multiple"],
        default: "simple",
        description: "Type of condition evaluation"
      },
      operator: {
        type: "string",
        enum: ["equals", "not_equals", "greater_than", "less_than", "greater_or_equal", "less_or_equal", "contains", "starts_with", "is_empty"],
        default: "equals",
        description: "Comparison operator"
      },
      leftOperand: {
        type: "string",
        description: "Left side of comparison (e.g., {{payload.temperature}})"
      },
      rightOperand: {
        type: "string",
        description: "Right side of comparison (e.g., 30)"
      },
      logicGate: {
        type: "string",
        enum: ["AND", "OR"],
        default: "AND",
        description: "Logic gate for multiple conditions"
      },
      conditions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            leftOperand: { type: "string" },
            operator: { type: "string" },
            rightOperand: { type: "string" }
          }
        },
        default: [],
        description: "Multiple conditions for complex logic"
      },
      expression: {
        type: "string",
        description: "Expression to evaluate (e.g., \"payload.status === 'complete'\")",
      },
      cases: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: {
              type: "string",
              description: "Case label",
            },
            value: {
              type: "string",
              description: "Case value to route to",
            },
          },
          required: ["label", "value"],
        },
        default: [],
      },
    },
    required: ["cases"],
  },

  inputs: {
    default: {
      name: "default",
      type: "condition",
      required: true,
      description: "Input data for condition evaluation",
    },
  },

  outputs: {
    default: {
      name: "default",
      type: "route",
      description: "Default route if no case matches",
    },
  },

  metrics: {
    enabled: true,
    category: "performance",
    customizable: true,
    defaultMetrics: [
      {
        id: "route_distribution",
        label: "Route Distribution",
        description: "Track which routes are most frequently taken",
        type: "percentage",
        unit: "%",
        defaultValue: 0,
      },
      {
        id: "evaluation_time",
        label: "Evaluation Time",
        description: "Time taken to evaluate conditions",
        type: "duration",
        unit: "ms",
        defaultValue: 0,
        max: 5000,
      },
      {
        id: "condition_success_rate",
        label: "Condition Success Rate",
        description: "Percentage of successful condition evaluations",
        type: "percentage",
        unit: "%",
        defaultValue: 100,
      },
      {
        id: "fallback_triggered",
        label: "Fallback Triggered",
        description: "Number of times default route was used",
        type: "count",
        defaultValue: 0,
      },
    ],
  },

  ui: {
    icon: "git-branch",
    category: "control",
    fieldsOrder: ["expression", "cases"],
    helpLinks: ["docs/routing"],
  },

  runtime: {
    handler: "@/lib/executors/switchExecutor",
    timeoutMs: 2000,
  },

  meta: {
    tags: ["routing", "condition", "control"],
  },
};
