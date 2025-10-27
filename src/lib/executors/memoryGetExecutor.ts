/**
 * Executor for Memory Get Node
 * Reads conversation memory for user/session
 */

import { ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";

export async function memoryGetExecutor(
  context: ExecutionContext,
  config: any
): Promise<NodeResult> {
  const { storage, logger, vars } = context;

  if (!storage) {
    return {
      status: "error",
      error: { message: "Storage service not available", code: "NO_STORAGE" },
    };
  }

  try {
    // Resolve key with template variables
    const resolvedKey = resolveTemplate(config.key, { ...vars, ...context.meta });

    // Get memory by scope
    let key = resolvedKey;
    if (config.scope === "user") {
      key = `memory:user:${key}`;
    } else if (config.scope === "session") {
      key = `memory:session:${context.executionId}:${key}`;
    } else if (config.scope === "workflow") {
      key = `memory:workflow:${context.workflowId}:${key}`;
    }

    const value = await storage.get(key);

    logger.info(`Retrieved memory from key: ${key}`);

    return {
      status: "success",
      data: value || null,
      next: "default",
    };
  } catch (error: any) {
    logger.error(`Memory get failed: ${error.message}`);
    return {
      status: "error",
      error: {
        message: error.message,
        code: "MEMORY_ERROR",
        details: error,
      },
    };
  }
}

function resolveTemplate(template: string, vars: any): string {
  let result = template;

  // Replace {{variable}} placeholders
  result = result.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const value = getNestedValue(vars, path);
    return value !== undefined ? String(value) : match;
  });

  return result;
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, prop) => current?.[prop], obj);
}
