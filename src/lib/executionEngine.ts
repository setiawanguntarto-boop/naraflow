/**
 * Execution Engine for Node Library v3
 * Handles node execution with retry, timeout, and memory management
 */

import { ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";
import { nodeTypeRegistry } from "./nodeTypeRegistry";

/**
 * Create execution context from workflow state
 */
export function createExecutionContext(
  workflowId: string,
  executionId: string,
  nodeId: string,
  payload: any,
  memory: any,
  vars: Record<string, any>,
  services: ExecutionContext["services"],
  meta: ExecutionContext["meta"]
): ExecutionContext {
  return {
    workflowId,
    executionId,
    nodeId,
    runId: `${executionId}-${Date.now()}`,
    payload,
    memory,
    vars,
    meta,
    services,
    abortSignal: undefined,
  };
}

/**
 * Execute node with timeout
 */
export async function executeNodeWithTimeout(
  executor: (context: ExecutionContext, config: any) => Promise<NodeResult>,
  context: ExecutionContext,
  config: any,
  timeoutMs: number
): Promise<NodeResult> {
  return Promise.race([
    executor(context, config),
    new Promise<NodeResult>(resolve => {
      setTimeout(() => {
        resolve({
          status: "error",
          error: {
            message: `Node execution timed out after ${timeoutMs}ms`,
            code: "TIMEOUT",
          },
        });
      }, timeoutMs);
    }),
  ]);
}

/**
 * Execute node with retry logic
 */
export async function executeNodeWithRetry(
  nodeTypeId: string,
  context: ExecutionContext,
  config: any
): Promise<NodeResult> {
  const nodeType = nodeTypeRegistry.getNodeType(nodeTypeId);

  if (!nodeType) {
    throw new Error(`Node type not found: ${nodeTypeId}`);
  }

  // Get executor
  const executor = async (ctx: ExecutionContext, cfg: any) => {
    return nodeTypeRegistry.executeNode(nodeTypeId, ctx, cfg);
  };

  // Apply timeout
  const executeWithTimeout = () => {
    return executeNodeWithTimeout(executor, context, config, nodeType.runtime.timeoutMs);
  };

  // Retry logic
  let lastError: NodeResult | null = null;
  const maxRetries = nodeType.runtime.retry?.count || 0;
  const backoffMs = nodeType.runtime.retry?.backoffMs || 1000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await executeWithTimeout();

      // If success or error (not retry), return immediately
      if (result.status !== "retry") {
        return result;
      }

      lastError = result;

      // If retry and we have more attempts, wait before retrying
      if (attempt < maxRetries) {
        await sleep(backoffMs);
      }
    } catch (error: any) {
      context.services.logger.error(`Execution attempt ${attempt + 1} failed: ${error.message}`);
      lastError = {
        status: "error",
        error: {
          message: error.message,
          code: "EXEC_ERROR",
        },
      };

      if (attempt < maxRetries) {
        await sleep(backoffMs);
      }
    }
  }

  // All retries exhausted
  return (
    lastError || {
      status: "error",
      error: {
        message: "Execution failed after all retry attempts",
        code: "MAX_RETRIES",
      },
    }
  );
}

/**
 * Route node output to next nodes
 */
export function routeNodeOutput(
  result: NodeResult,
  nodeId: string,
  connections: Map<string, any>
): string[] {
  const nextOutputPort = result.next || "default";
  const targetNodes = connections.get(nextOutputPort) || [];

  return targetNodes.map((conn: any) => conn.node);
}

/**
 * Apply memory updates atomically
 */
export async function applyMemoryUpdates(
  updates: Record<string, any> | undefined,
  storage: ExecutionContext["services"]["storage"]
): Promise<void> {
  if (!updates || !storage) {
    return;
  }

  // Apply all updates atomically
  for (const [key, value] of Object.entries(updates)) {
    await storage.set(key, value);
  }
}

/**
 * Utility function for sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
