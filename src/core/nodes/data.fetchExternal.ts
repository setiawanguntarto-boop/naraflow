import { NodeTypeDefinition } from "../nodeLibrary_v3";

export const FetchExternalDataNode: NodeTypeDefinition = {
  id: "data.fetchExternal",
  version: "1.0.0",
  label: "Fetch External Data",
  description:
    "Fetch data from external HTTP APIs with auth, templating, mapping, retry, and caching.",
  category: "trigger",

  configSchema: {
    type: "object",
    properties: {
      method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE", "PATCH"], default: "GET" },
      url: { type: "string", description: "HTTP endpoint URL (supports {{vars}} templating)" },
      query: {
        type: "array",
        items: { type: "object", properties: { key: { type: "string" }, value: { type: "string" } }, required: ["key", "value"] },
        description: "Query parameters appended to URL",
      },
      headers: {
        type: "array",
        items: { type: "object", properties: { key: { type: "string" }, value: { type: "string" } }, required: ["key", "value"] },
        description: "Request headers (supports templating)",
      },
      bodyType: { type: "string", enum: ["json", "form", "raw"], default: "json" },
      body: { type: "string", description: "Body template when method allows body" },

      auth: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["none", "apiKey", "basic", "bearer"], default: "none" },
          apiKeyHeader: { type: "string", default: "Authorization" },
          apiKeyValue: { type: "string" },
          basicUser: { type: "string" },
          basicPass: { type: "string" },
          bearerToken: { type: "string" },
        },
      },

      retry: {
        type: "object",
        properties: {
          count: { type: "number", default: 2 },
          backoffMs: { type: "number", default: 1000 },
        },
      },

      timeoutMs: { type: "number", default: 10000 },
      cacheTtlSec: { type: "number", default: 0, description: "Cache responses by URL for TTL seconds (0=disabled)" },
      rateLimitRps: { type: "number", default: 0, description: "Max requests per second (0=unlimited)" },

      // Response mapping
      responseMapping: {
        type: "array",
        description: "Map values from JSON response to output fields (dot paths)",
        items: {
          type: "object",
          properties: {
            field: { type: "string", description: "Output field name" },
            path: { type: "string", description: "Dot path in JSON response" },
          },
          required: ["field", "path"],
        },
      },
    },
    required: ["url", "method"],
  },

  inputs: {
    default: { name: "default", type: "data", required: false, description: "Optional input used to template URL/body" },
  },

  outputs: {
    default: { name: "default", type: "data", description: "{ response, mapped } with selected fields" },
    error: { name: "error", type: "route", description: "Emitted on HTTP/network error after retries" },
    rateLimited: { name: "rateLimited", type: "route", description: "Emitted when rate limit exceeded" },
  },

  ui: {
    icon: "globe",
    category: "trigger",
    fieldsOrder: [
      "method",
      "url",
      "query",
      "headers",
      "bodyType",
      "body",
      "auth",
      "responseMapping",
    ],
    advanced: {
      collapsed: true,
      fields: ["retry", "timeoutMs", "cacheTtlSec", "rateLimitRps"],
    },
    helpLinks: ["docs/fetch-external"],
  },

  runtime: {
    handler: "@/lib/executors/fetchExternalExecutor",
    timeoutMs: 20000,
    retry: { count: 0, backoffMs: 0 },
  },

  security: { authType: "none" },
  meta: { tags: ["http", "fetch", "api"], author: "Naraflow Team", createdAt: new Date().toISOString() },
};


