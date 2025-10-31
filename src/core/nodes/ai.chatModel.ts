import { NodeTypeDefinition } from "../nodeLibrary_v3";

export const ChatModelNode: NodeTypeDefinition = {
  id: "ai.chatModel",
  version: "1.0.0",
  label: "Chat Model (LLM)",
  description: "Call LLM with system prompts and conversation context",
  category: "logic",

  configSchema: {
    type: "object",
    properties: {
      provider: {
        type: "string",
        enum: ["llama"],
        default: "llama",
      },
      model: {
        type: "string",
        enum: [
          "llama-3-8b-instruct",
          "llama-3-70b-instruct",
          "llama-3.1-8b-instruct",
          "llama-3.1-70b-instruct",
          "llama-3.2-11b-vision",
          "llama-3.2-90b-vision"
        ],
        default: "llama-3.1-8b-instruct",
        description: "Model name",
      },
      systemPrompt: {
        type: "string",
        description: "System prompt for the model",
      },
      promptTemplate: {
        type: "string",
        description: "User prompt template (supports {{variables}})",
      },
      temperature: {
        type: "number",
        minimum: 0,
        maximum: 2,
        default: 0.7,
      },
      maxTokens: {
        type: "number",
        default: 500,
        minimum: 1,
        maximum: 4096,
      },
      tools: {
        type: "array",
        description: "Function calling tools available to the LLM",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Unique tool name" },
            description: { type: "string", description: "What the tool does and when to use it" },
            parameters: {
              type: "array",
              description: "List of accepted arguments",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string", enum: ["text", "number", "boolean"], default: "text" },
                  required: { type: "boolean", default: false },
                  description: { type: "string" },
                },
                required: ["name", "type"],
              },
            },
          },
          required: ["name"],
        },
      },
    },
    required: ["provider", "model", "systemPrompt", "promptTemplate"],
  },

  inputs: {
    default: {
      name: "default",
      type: "data",
      required: true,
      description: "Input data for LLM processing",
    },
  },

  outputs: {
    default: {
      name: "default",
      type: "data",
      description: "LLM response and structured output",
    },
    error: {
      name: "error",
      type: "data",
      description: "Error details if LLM call fails",
    },
  },

  ui: {
    icon: "brain",
    category: "logic",
    fieldsOrder: [
      "provider",
      "model",
      "systemPrompt",
      "promptTemplate",
      "temperature",
      "maxTokens",
    ],
    advanced: {
      collapsed: true,
      fields: ["tools"],
    },
    helpLinks: ["docs/llm-usage"],
  },

  runtime: {
    handler: "@/lib/executors/chatModelExecutor",
    timeoutMs: 30000,
    retry: {
      count: 1,
      backoffMs: 2000,
    },
  },

  security: {
    authType: "apiKey",
    scopes: ["llm:use"],
  },

  meta: {
    tags: ["llm", "ai", "processing"],
    author: "Naraflow Team",
    createdAt: "2025-01-01",
  },
};
