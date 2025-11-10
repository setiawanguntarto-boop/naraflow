import { NodeTypeDefinition } from "../nodeLibrary_v3";

export const AIAnalysisNode: NodeTypeDefinition = {
  id: "ai.analysis",
  version: "1.0.0",
  label: "AI Analysis",
  description: "Analyze input data using LLaMA with structured mapping and optional tools.",
  category: "processing",

  configSchema: {
    type: "object",
    properties: {
      provider: { type: "string", enum: ["llama"], default: "llama" },
      model: {
        type: "string",
        enum: [
          "llama-3-8b-instruct",
          "llama-3-70b-instruct",
          "llama-3.1-8b-instruct",
          "llama-3.1-70b-instruct"
        ],
        default: "llama-3.1-8b-instruct",
      },
      systemPrompt: { type: "string", description: "System prompt for analysis" },
      promptTemplate: { type: "string", description: "User prompt template (supports {{variables}})" },
      temperature: { type: "number", minimum: 0, maximum: 2, default: 0.2 },
      maxTokens: { type: "number", minimum: 1, maximum: 4096, default: 400 },
      // Structured mapping of response fields via dot-path or JSON extraction
      responseMapping: {
        type: "array",
        items: {
          type: "object",
          properties: {
            field: { type: "string" },
            path: { type: "string", description: "Dot path within parsed JSON" },
          },
          required: ["field", "path"],
        },
        description: "Map parsed JSON fields to output",
      },
      tools: {
        type: "array",
        description: "Function calling tools available to the LLM",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            parameters: {
              type: "array",
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
    default: { name: "default", type: "data", required: true, description: "Input data for analysis" },
  },

  outputs: {
    default: { name: "default", type: "data", description: "Structured analysis result" },
    error: { name: "error", type: "data", description: "Error details if analysis fails" },
  },

  ui: {
    icon: "brain",
    category: "processing",
    fieldsOrder: [
      "provider",
      "model",
      "systemPrompt",
      "promptTemplate",
      "temperature",
      "maxTokens",
      "responseMapping",
    ],
    advanced: { collapsed: true, fields: ["tools"] },
    helpLinks: ["docs/ai-analysis"],
  },

  runtime: {
    handler: "@/lib/executors/aiAnalysisExecutor",
    timeoutMs: 30000,
    retry: { count: 1, backoffMs: 1500 },
  },

  security: { authType: "apiKey" },
  meta: { tags: ["llm", "analysis"], author: "Naraflow Team", createdAt: new Date().toISOString() },
};


