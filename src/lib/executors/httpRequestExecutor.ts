import { ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";

export async function httpRequestExecutor(
  context: ExecutionContext,
  config: any
): Promise<NodeResult> {
  const { http, logger } = context.services;
  const { vars, payload } = context;

  if (!http) {
    return {
      status: "error",
      error: { message: "HTTP service not available", code: "NO_HTTP_SERVICE" }
    };
  }

  try {
    // Resolve template variables in URL
    let url = resolveTemplate(config.url, { ...vars, payload });
    
    // Add query parameters
    if (config.queryParams && config.queryParams.length > 0) {
      const params = new URLSearchParams();
      config.queryParams.forEach((param: any) => {
        const key = resolveTemplate(param.key, { ...vars, payload });
        const value = resolveTemplate(param.value, { ...vars, payload });
        params.append(key, value);
      });
      url = `${url}?${params.toString()}`;
    }

    // Build headers
    const headers: Record<string, string> = {};
    
    // Add authentication
    if (config.authType === "bearer" && config.authToken) {
      headers["Authorization"] = `Bearer ${config.authToken}`;
    } else if (config.authType === "apiKey" && config.authToken) {
      headers["X-API-Key"] = config.authToken;
    }
    
    // Add custom headers
    if (config.headers) {
      config.headers.forEach((header: any) => {
        headers[header.key] = resolveTemplate(header.value, { ...vars, payload });
      });
    }

    // Make request
    let response: any;
    const method = config.method || "GET";

    if (method === "GET") {
      response = await http.get(url, { headers });
    } else if (["POST", "PUT", "PATCH"].includes(method)) {
      let body = config.body || "{}";
      body = resolveTemplate(body, { ...vars, payload });
      
      // Parse body based on type
      let parsedBody;
      if (config.bodyType === "json") {
        parsedBody = JSON.parse(body);
      } else {
        parsedBody = body;
      }
      
      response = await http.post(url, parsedBody, { headers });
    }

    logger.info(`HTTP ${method} request successful: ${url}`);

    return {
      status: "success",
      data: response,
      next: "success"
    };
  } catch (error: any) {
    logger.error(`HTTP request failed: ${error.message}`);
    
    if (config.retryOnFailure) {
      return {
        status: "retry",
        error: {
          message: error.message,
          code: "HTTP_ERROR",
          details: error
        }
      };
    }
    
    return {
      status: "error",
      error: {
        message: error.message,
        code: "HTTP_ERROR",
        details: error
      },
      next: "error"
    };
  }
}

function resolveTemplate(template: string, vars: any): string {
  let result = template;
  result = result.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const value = getNestedValue(vars, path);
    return value !== undefined ? String(value) : match;
  });
  return result;
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, prop) => current?.[prop], obj);
}
