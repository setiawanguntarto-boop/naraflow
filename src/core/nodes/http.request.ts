import { NodeTypeDefinition } from "../nodeLibrary_v3";

export const HttpRequestNode: NodeTypeDefinition = {
  id: "http.request",
  version: "1.0.0",
  label: "HTTP Request",
  description: "Make HTTP requests to external APIs",
  category: "utility",

  configSchema: {
    type: "object",
    properties: {
      method: {
        type: "string",
        enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        default: "GET",
        description: "HTTP method"
      },
      url: {
        type: "string",
        description: "API endpoint URL"
      },
      headers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            value: { type: "string" }
          }
        },
        default: [],
        description: "Request headers"
      },
      queryParams: {
        type: "array",
        items: {
          type: "object",
          properties: {
            key: { type: "string" },
            value: { type: "string" }
          }
        },
        default: [],
        description: "URL query parameters"
      },
      body: {
        type: "string",
        description: "Request body (for POST/PUT/PATCH)"
      },
      bodyType: {
        type: "string",
        enum: ["json", "form", "text"],
        default: "json",
        description: "Request body format"
      },
      authType: {
        type: "string",
        enum: ["none", "bearer", "apiKey", "basic"],
        default: "none",
        description: "Authentication type"
      },
      authToken: {
        type: "string",
        description: "Bearer token or API key"
      },
      timeout: {
        type: "number",
        default: 30000,
        description: "Request timeout in milliseconds"
      },
      retryOnFailure: {
        type: "boolean",
        default: false,
        description: "Retry on failure"
      }
    },
    required: ["method", "url"]
  },

  inputs: {
    default: {
      name: "default",
      type: "data",
      required: true,
      description: "Trigger the HTTP request"
    }
  },

  outputs: {
    success: {
      name: "success",
      type: "data",
      description: "Request successful"
    },
    error: {
      name: "error",
      type: "data",
      description: "Request failed"
    }
  },

  ui: {
    icon: "globe",
    category: "utility",
    fieldsOrder: ["method", "url", "queryParams", "authType", "authToken", "headers", "bodyType", "body", "timeout", "retryOnFailure"],
    helpLinks: ["https://docs.lovable.dev/integrations/api-calls"]
  },

  runtime: {
    handler: "@/lib/executors/httpRequestExecutor",
    timeoutMs: 30000,
    retry: {
      count: 2,
      backoffMs: 1000
    }
  },

  meta: {
    tags: ["api", "http", "integration", "external"]
  }
};
