import { NodeTypeDefinition } from "../nodeLibrary_v3";

export const ValidationBasicNode: NodeTypeDefinition = {
  id: "validation.basic",
  version: "1.0.0",
  label: "Validation",
  description: "Validate data with multiple rules (email, phone, regex, custom JS)",
  category: "control",

  configSchema: {
    type: "object",
    properties: {
      fieldName: {
        type: "string",
        description: "Field name to validate",
      },
      rules: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["required", "email", "phone", "number", "regex", "min", "max", "date", "js"],
              description: "Validation rule type",
            },
            pattern: {
              type: "string",
              description: "Regex pattern (for regex type)",
            },
            errorMessage: {
              type: "string",
              description: "Custom error message",
            },
            params: {
              type: "object",
              description: "Additional parameters for the rule",
            },
          },
          required: ["type"],
        },
        default: [],
      },
    },
    required: ["fieldName", "rules"],
  },

  inputs: {
    default: {
      name: "default",
      type: "data",
      required: true,
      description: "Data to validate",
    },
  },

  outputs: {
    default: {
      name: "default",
      type: "data",
      description: "Validated data",
    },
    error: {
      name: "error",
      type: "data",
      description: "Error details if validation fails",
    },
  },

  ui: {
    icon: "shield-check",
    category: "control",
    fieldsOrder: ["fieldName", "rules"],
    helpLinks: ["docs/validation"],
  },

  runtime: {
    handler: "@/lib/executors/validationExecutor",
    timeoutMs: 5000,
  },

  meta: {
    tags: ["validation", "data", "control"],
  },
};
