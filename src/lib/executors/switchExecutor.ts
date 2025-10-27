/**
 * Executor for Switch (Control Flow) Node
 * Routes flow based on expression results
 */

import { ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";

export async function switchExecutor(context: ExecutionContext, config: any): Promise<NodeResult> {
  const { logger, payload, memory, vars } = context;

  try {
    // Evaluate expression
    const result = evaluateExpression(config.expression, { payload, memory, vars });

    logger.info(`Expression result: ${result}`);

    // Find matching case
    const matchingCase = config.cases?.find((c: any) => c.value === String(result));

    if (matchingCase) {
      logger.info(`Routing to case: ${matchingCase.label}`);
      return {
        status: "success",
        data: { case: matchingCase.label, value: result },
        next: matchingCase.value || "default",
      };
    }

    // No match, use default
    logger.info("No matching case, using default route");
    return {
      status: "success",
      data: { value: result },
      next: "default",
    };
  } catch (error: any) {
    logger.error(`Switch execution failed: ${error.message}`);
    return {
      status: "error",
      error: {
        message: error.message,
        code: "SWITCH_ERROR",
        details: error,
      },
    };
  }
}

function evaluateExpression(expression: string, context: any): any {
  // Basic safe expression evaluation
  // In production, use a sandboxed expression evaluator like expr-eval or safer-eval

  try {
    // Replace context references
    let safeExpression = expression
      .replace(/payload\./g, "context.payload.")
      .replace(/memory\./g, "context.memory.")
      .replace(/vars\./g, "context.vars.");

    // Simple evaluation using Function constructor
    const func = new Function("context", `return ${safeExpression}`);
    return func(context);
  } catch (error) {
    // Fallback to simple string comparison
    return expression;
  }
}
