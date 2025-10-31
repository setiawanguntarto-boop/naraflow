import { ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";

function getByPath(scope: any, path: string): any {
  return path.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), scope);
}

function matches(left: any, op: string, right: any): boolean {
  switch (op) {
    case "==": return left == right; // intentional loose for strings/numbers
    case "!=": return left != right;
    case ">": return Number(left) > Number(right);
    case ">=": return Number(left) >= Number(right);
    case "<": return Number(left) < Number(right);
    case "<=": return Number(left) <= Number(right);
    case "includes": return Array.isArray(left) ? left.includes(right) : String(left ?? "").includes(String(right ?? ""));
    case "exists": return left !== undefined && left !== null && left !== "";
    case "regex": try { return new RegExp(String(right)).test(String(left ?? "")); } catch { return false; }
    default: return false;
  }
}

export async function decisionExecutorV3(context: ExecutionContext, config: any): Promise<NodeResult> {
  const scope = { payload: context.payload, vars: context.vars, memory: context.memory };

  const mode = config.mode || "any";
  const stopOnFirst = config.stopOnFirst !== false;
  const defaultRoute = config.defaultRoute || "default";

  const conditions = Array.isArray(config.conditions) ? config.conditions : [];

  for (const cond of conditions) {
    const left = getByPath(scope, String(cond.leftPath || ""));
    const ok = matches(left, String(cond.operator || "=="), cond.rightValue);
    if (ok) {
      const next = cond.route || "matched";
      return { status: "success", data: { matched: cond }, next };
    }
    if (stopOnFirst && mode === "any") continue; // try next
  }

  return { status: "success", data: { matched: null }, next: defaultRoute };
}


