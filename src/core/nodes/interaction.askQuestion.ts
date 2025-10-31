import { NodeTypeDefinition } from "../nodeLibrary_v3";

export const AskQuestionNode: NodeTypeDefinition = {
  id: "interaction.askQuestion",
  version: "1.0.0",
  label: "Ask Question",
  description:
    "Send a question to the user and wait for a response. Supports text, number, and multiple-choice with validation, timeout, and retries.",
  category: "trigger",

  configSchema: {
    type: "object",
    properties: {
      question: {
        type: "string",
        minLength: 1,
        description: "Question text to ask the user",
      },
      responseType: {
        type: "string",
        enum: ["text", "number", "choice"],
        default: "text",
        description: "Expected response type",
      },
      choices: {
        type: "array",
        items: { type: "string" },
        minItems: 1,
        description: "Allowed choices when responseType is 'choice'",
      },
      required: {
        type: "boolean",
        default: true,
        description: "Whether response is mandatory",
      },
      validationRegex: {
        type: "string",
        description: "Regex validation applied to text responses",
      },
      minValue: {
        type: "number",
        description: "Minimum value for number responses",
      },
      maxValue: {
        type: "number",
        description: "Maximum value for number responses",
      },
      timeoutSec: {
        type: "number",
        default: 300,
        description: "How long to wait for a response before timing out",
      },
      retries: {
        type: "number",
        default: 0,
        minimum: 0,
        maximum: 5,
        description: "How many times to retry asking on invalid input or timeout",
      },
      saveToMemoryKey: {
        type: "string",
        description: "If set, store the user's response to memory under this key",
      },
      captureMetrics: {
        type: "boolean",
        default: true,
        description: "Capture interaction metrics (latency, retries, completion)",
      },
    },
    required: ["question", "responseType"],
  },

  inputs: {
    default: {
      name: "default",
      type: "data",
      required: false,
      description: "Optional input payload carrying conversation context",
    },
  },

  outputs: {
    default: {
      name: "answered",
      type: "data",
      description: "Emits when a valid response is received. Contains normalized value.",
    },
    invalid: {
      name: "invalid",
      type: "route",
      description: "Emits when response fails validation (before retry logic).",
    },
    timeout: {
      name: "timeout",
      type: "route",
      description: "Emits when no response is received within timeout (and retries exhausted).",
    },
  },

  ui: {
    icon: "message-circle",
    category: "trigger",
    fieldsOrder: [
      "question",
      "responseType",
      "choices",
      "required",
      "validationRegex",
      "minValue",
      "maxValue",
      "timeoutSec",
      "retries",
      "saveToMemoryKey",
      "captureMetrics",
    ],
    advanced: {
      collapsed: true,
      fields: ["validationRegex", "minValue", "maxValue", "captureMetrics"],
    },
    helpLinks: ["docs/ask-question"],
  },

  runtime: {
    handler: "@/lib/executors/askQuestionExecutor",
    timeoutMs: 30000,
    retry: {
      count: 0,
      backoffMs: 0,
    },
  },

  security: {
    authType: "none",
  },

  meta: {
    tags: ["interaction", "input", "question"],
    author: "Naraflow Team",
    createdAt: new Date().toISOString(),
  },
};


