import { ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";

function getByPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

function buildScope(context: ExecutionContext, config: any): Record<string, number> {
  const scope: Record<string, number> = {};
  for (const v of config.variables || []) {
    const raw = getByPath(context.payload, v.path) ?? getByPath(context.vars, v.path) ?? v.default;
    if (raw !== undefined && raw !== null && raw !== "") scope[v.name] = Number(raw);
  }
  for (const c of config.constants || []) {
    scope[c.name] = Number(c.value);
  }
  return scope;
}

function isSafeExpression(expr: string): boolean {
  // Allow digits, operators, whitespace, underscores, letters, dots, parentheses, commas
  // Disallow assignments and keywords like new, Function, constructor
  const forbidden = /(=|new\b|Function\b|constructor\b|while\b|for\b|import\b|require\b)/i;
  const allowed = /^[0-9\s+\-*/%().,_a-zA-Z\.]*$/;
  return allowed.test(expr) && !forbidden.test(expr);
}

function evalExpr(expr: string, scope: Record<string, number>): number {
  if (!isSafeExpression(expr)) throw new Error("unsafe_expression");
  const fn = new Function("v", "Math", `with(v){ return ( ${expr} ); }`);
  const value = fn(scope, Math);
  if (typeof value !== "number" || Number.isNaN(value)) throw new Error("invalid_result");
  return value;
}

export async function calculateExecutor(context: ExecutionContext, config: any): Promise<NodeResult> {
  const scope = buildScope(context, config);
  const outputs: Record<string, any> = {};

  try {
    for (const e of config.expressions || []) {
      let val = evalExpr(String(e.expr), scope);
      if (typeof e.clampMin === "number" && val < e.clampMin) val = e.clampMin;
      if (typeof e.clampMax === "number" && val > e.clampMax) val = e.clampMax;
      const precision = typeof e.precision === "number" ? e.precision : 2;
      const rounded = Number.isFinite(precision) ? Number(val.toFixed(precision)) : val;
      outputs[e.field] = e.unit ? `${rounded} ${e.unit}` : rounded;
    }
  } catch (err) {
    if (config.onError === "null") {
      for (const e of config.expressions || []) outputs[e.field] = null;
      return { status: "success", data: { calculations: outputs }, next: "default" };
    }
    if (config.onError === "zero") {
      for (const e of config.expressions || []) outputs[e.field] = 0;
      return { status: "success", data: { calculations: outputs }, next: "default" };
    }
    return { status: "success", data: { error: String(err) }, next: "error" };
  }

  return { status: "success", data: { calculations: outputs }, next: "default" };
}


