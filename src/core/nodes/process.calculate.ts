import { NodeTypeDefinition } from "../nodeLibrary_v3";

export const CalculateNode: NodeTypeDefinition = {
  id: "process.calculate",
  version: "1.0.0",
  label: "Calculate",
  description: "Evaluate one or more expressions using variables from payload, vars, or constants.",
  category: "processing",

  configSchema: {
    type: "object",
    properties: {
      variables: {
        type: "array",
        description: "Resolve variables from incoming data",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Variable name used in expressions" },
            path: { type: "string", description: "Dot path to fetch from payload (e.g., input.feed_kg)" },
            default: { type: "number", description: "Default value when path missing" },
          },
          required: ["name", "path"],
        },
        default: [],
      },
      constants: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            value: { type: "number" },
          },
          required: ["name", "value"],
        },
        default: [],
      },
      expressions: {
        type: "array",
        description: "List of expressions to compute",
        items: {
          type: "object",
          properties: {
            field: { type: "string", description: "Output field name" },
            expr: { type: "string", description: "Math expression (supports Math.* and variables)" },
            precision: { type: "number", default: 2 },
            clampMin: { type: "number" },
            clampMax: { type: "number" },
            unit: { type: "string" },
          },
          required: ["field", "expr"],
        },
        default: [],
      },
      onError: { type: "string", enum: ["route", "null", "zero"], default: "route", description: "How to handle evaluation errors" },
    },
    required: ["expressions"],
  },

  inputs: {
    default: { name: "default", type: "data", required: true, description: "Input data containing variables" },
  },

  outputs: {
    default: { name: "default", type: "data", description: "Calculated outputs { calculations }" },
    error: { name: "error", type: "route", description: "Emitted when evaluation fails and onError=route" },
  },

  ui: {
    icon: "calculator",
    category: "processing",
    fieldsOrder: ["variables", "constants", "expressions"],
    advanced: { collapsed: true, fields: ["onError"] },
    helpLinks: ["docs/calculate"],
  },

  runtime: {
    handler: "@/lib/executors/calculateExecutor",
    timeoutMs: 5000,
  },

  security: { authType: "none" },
  meta: { tags: ["calc", "math"], author: "Naraflow Team", createdAt: new Date().toISOString() },
};


