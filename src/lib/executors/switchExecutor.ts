/**
 * Executor for Switch (Control Flow) Node
 * Routes flow based on expression results
 */

import { ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";

export async function switchExecutor(context: ExecutionContext, config: any): Promise<NodeResult> {
  const { logger } = context.services;
  const { payload, memory, vars } = context;

  try {
    let expression = config.expression;
    
    // Build expression from simple condition
    if (config.conditionType === "simple" && config.leftOperand && config.operator) {
      expression = buildSimpleExpression(config.leftOperand, config.operator, config.rightOperand);
    }
    
    // Build expression from multiple conditions
    if (config.conditionType === "multiple" && config.conditions && config.conditions.length > 0) {
      expression = buildMultipleConditionsExpression(
        config.conditions, 
        config.logicGate || "AND"
      );
    }
    
    // Evaluate expression
    const result = await evaluateExpression(expression, { payload, memory, vars });

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

async function evaluateExpression(expression: string, context: any): Promise<any> {
  // SECURITY: Use safe expression evaluator instead of Function constructor
  
  try {
    const { Parser } = await import('expr-eval');
    const parser = new Parser();
    
    // Create safe context with payload, memory, and vars
    const safeContext = {
      payload: context.payload,
      memory: context.memory,
      vars: context.vars,
      value: context.vars?.value,
      input: context.vars?.input,
      data: context.vars?.data,
    };
    
    return parser.evaluate(expression, safeContext);
  } catch (error) {
    // Fallback to simple string comparison if evaluation fails
    return expression;
  }
}

function buildSimpleExpression(left: string, operator: string, right: string): string {
  const opMap: Record<string, string> = {
    "equals": "==",
    "not_equals": "!=",
    "greater_than": ">",
    "less_than": "<",
    "greater_or_equal": ">=",
    "less_or_equal": "<=",
  };
  
  if (operator === "contains") {
    return `${left}.includes(${right})`;
  } else if (operator === "starts_with") {
    return `${left}.startsWith(${right})`;
  } else if (operator === "is_empty") {
    return `${left} == null || ${left} == ''`;
  }
  
  const op = opMap[operator] || "==";
  return `${left} ${op} ${right}`;
}

function buildMultipleConditionsExpression(conditions: any[], gate: string): string {
  const expressions = conditions.map(c => 
    buildSimpleExpression(c.leftOperand, c.operator, c.rightOperand)
  );
  
  const connector = gate === "AND" ? " && " : " || ";
  return expressions.join(connector);
}
