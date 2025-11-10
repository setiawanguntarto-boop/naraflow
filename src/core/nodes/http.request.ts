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

  metrics: {
    enabled: true,
    category: "technical",
    customizable: true,
    defaultMetrics: [
      {
        id: "request_count",
        label: "Request Count",
        description: "Total HTTP requests made",
        type: "count",
        defaultValue: 0,
      },
      {
        id: "success_rate",
        label: "Success Rate",
        description: "Percentage of successful requests (2xx status)",
        type: "percentage",
        unit: "%",
        defaultValue: 0,
        required: true,
      },
      {
        id: "avg_response_time",
        label: "Average Response Time",
        description: "Average API response time",
        type: "duration",
        unit: "ms",
        defaultValue: 0,
      },
      {
        id: "error_4xx_count",
        label: "Client Errors (4xx)",
        description: "Number of client error responses",
        type: "count",
        defaultValue: 0,
      },
      {
        id: "error_5xx_count",
        label: "Server Errors (5xx)",
        description: "Number of server error responses",
        type: "count",
        defaultValue: 0,
      },
      {
        id: "timeout_count",
        label: "Timeout Count",
        description: "Number of request timeouts",
        type: "count",
        defaultValue: 0,
      },
      {
        id: "retry_count",
        label: "Retry Count",
        description: "Number of retried requests",
        type: "count",
        defaultValue: 0,
      },
    ],
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
