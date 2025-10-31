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

  metrics: {
    enabled: true,
    category: "quality",
    customizable: true,
    defaultMetrics: [
      {
        id: "validation_pass_rate",
        label: "Validation Pass Rate",
        description: "Percentage of data that passes validation",
        type: "percentage",
        unit: "%",
        defaultValue: 0,
        required: true,
      },
      {
        id: "total_validations",
        label: "Total Validations",
        description: "Total number of validation attempts",
        type: "count",
        defaultValue: 0,
      },
      {
        id: "most_common_error",
        label: "Most Common Error",
        description: "Most frequently failing validation rule",
        type: "string",
        defaultValue: "None",
      },
      {
        id: "validation_time",
        label: "Average Validation Time",
        description: "Average time to validate data",
        type: "duration",
        unit: "ms",
        defaultValue: 0,
      },
    ],
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
