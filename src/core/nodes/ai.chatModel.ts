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
        enum: ["openai", "google", "local"],
        default: "openai",
      },
      model: {
        type: "string",
        default: "gpt-4o",
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
        items: { type: "object" },
        description: "Function calling tools",
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

  metrics: {
    enabled: true,
    category: "performance",
    customizable: true,
    defaultMetrics: [
      {
        id: "total_calls",
        label: "Total LLM Calls",
        description: "Total number of LLM API calls made",
        type: "count",
        defaultValue: 0,
        required: true,
      },
      {
        id: "avg_latency",
        label: "Average Latency",
        description: "Average response time from LLM",
        type: "duration",
        unit: "ms",
        defaultValue: 0,
      },
      {
        id: "token_consumption",
        label: "Token Consumption",
        description: "Total tokens used (input + output)",
        type: "count",
        defaultValue: 0,
      },
      {
        id: "success_rate",
        label: "Success Rate",
        description: "Percentage of successful LLM calls",
        type: "percentage",
        unit: "%",
        defaultValue: 100,
        required: true,
      },
      {
        id: "api_errors",
        label: "API Errors",
        description: "Number of API error responses",
        type: "count",
        defaultValue: 0,
      },
      {
        id: "avg_tokens_in",
        label: "Avg Input Tokens",
        description: "Average input tokens per request",
        type: "number",
        defaultValue: 0,
      },
      {
        id: "avg_tokens_out",
        label: "Avg Output Tokens",
        description: "Average output tokens per response",
        type: "number",
        defaultValue: 0,
      },
      {
        id: "cost_estimate",
        label: "Estimated Cost",
        description: "Estimated API cost",
        type: "number",
        unit: "$",
        defaultValue: 0,
      },
    ],
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
