/**
 * AI Response Node Definition
 * Advanced AI interaction with real-time testing and validation
 */

import { NodeTypeDefinition } from "../nodeLibrary_v3";

export const AIResponseNode: NodeTypeDefinition = {
  id: "ai.response",
  version: "1.0.0",
  label: "AI Response",
  description: "Generate AI-powered responses with real-time testing and multi-provider support",
  category: "agent",
  
  configSchema: {
    type: "object",
    properties: {
      provider: {
        type: "string",
        enum: ["openai", "anthropic", "google"],
        default: "openai",
        description: "AI provider to use",
      },
      model: {
        type: "string",
        default: "gpt-4",
        description: "Model name (e.g., gpt-4, claude-sonnet-4-5, gemini-2.5-flash)",
      },
      apiKey: {
        type: "string",
        description: "API key for the selected provider",
      },
      context: {
        type: "string",
        default: "You are a helpful assistant.",
        description: "System prompt / context for the AI",
      },
      responseTemplate: {
        type: "string",
        description: "Template for user prompt with variable interpolation ({{variable}})",
      },
      temperature: {
        type: "number",
        minimum: 0,
        maximum: 2,
        default: 0.7,
        description: "Creativity level (0 = deterministic, 2 = very creative)",
      },
      maxTokens: {
        type: "number",
        minimum: 1,
        maximum: 100000,
        default: 1000,
        description: "Maximum tokens in response",
      },
      responseFormat: {
        type: "string",
        enum: ["text", "json", "markdown"],
        default: "text",
        description: "Expected response format",
      },
    },
    required: ["provider", "model", "apiKey"],
  },

  inputs: {
    default: {
      name: "input",
      type: "data",
      required: true,
      description: "Input data to process",
    },
  },

  outputs: {
    default: {
      name: "output",
      type: "data",
      description: "AI-generated response",
    },
    error: {
      name: "error",
      type: "data",
      description: "Error output if AI call fails",
    },
  },

  ui: {
    icon: "Bot",
    category: "AI",
    fieldsOrder: [
      "provider",
      "model",
      "apiKey",
      "context",
      "responseTemplate",
      "temperature",
      "maxTokens",
      "responseFormat",
    ],
    helpLinks: ["https://docs.example.com/ai-response-node"],
    advanced: {
      collapsed: true,
      fields: ["temperature", "maxTokens", "responseFormat"],
    },
  },

  runtime: {
    handler: "aiResponseExecutor",
    timeoutMs: 30000,
    retry: {
      count: 2,
      backoffMs: 1000,
    },
  },

  security: {
    authType: "apiKey",
    scopes: ["ai:read", "ai:write"],
  },

  meta: {
    tags: ["ai", "llm", "chatbot", "openai", "anthropic", "google"],
    author: "Workflow Studio",
    createdAt: new Date().toISOString(),
  },
};
