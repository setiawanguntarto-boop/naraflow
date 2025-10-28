import { renderWhatsAppTemplate } from "@/lib/templates/whatsappTemplates";

export type NodeKind = "start" | "end" | "input" | "output" | "process" | "condition" | "unknown";

export interface FSMNode {
  id: string;
  label: string;
  kind: NodeKind;
  data?: any;
}

export interface FSMEdge {
  from: string;
  to: string;
  label?: string;
  condition?: string;
}

export interface FSM {
  nodes: Record<string, FSMNode>;
  edgesFrom: Record<string, FSMEdge[]>;
  startId: string;
}

export interface StepResult {
  outputs: string[];
  awaitingInput: boolean;
  nextStateId: string | null;
  variables: Record<string, any>;
}

const getKind = (node: any): NodeKind => {
  const t = String(node?.type || "").toLowerCase();
  const label = String(node?.data?.label || node?.data?.title || "").toLowerCase();
  if (t === "start" || label.includes("start")) return "start";
  if (t === "end" || label.includes("end")) return "end";
  if (t.includes("ask") || t.includes("input") || t.includes("trigger") || label.includes("ask") || label.includes("input")) return "input";
  if (t.includes("send") || t.includes("output") || label.includes("send") || label.includes("whatsapp") || label.includes("message")) return "output";
  if (t.includes("condition") || t.includes("decision") || label.includes("condition") || label.includes("decision")) return "condition";
  if (t.includes("process") || t.includes("ai") || t.includes("calculate") || label.includes("process") || label.includes("calculate") || label.includes("analysis")) return "process";
  return "unknown";
};

export function compileWorkflowToFSM(nodes: any[], edges: any[]): FSM {
  const fsmNodes: Record<string, FSMNode> = {};
  const edgesFrom: Record<string, FSMEdge[]> = {};

  for (const n of nodes) {
    const kind = getKind(n);
    fsmNodes[n.id] = {
      id: n.id,
      label: n.data?.label || n.data?.title || n.type || n.id,
      kind,
      data: n.data || {},
    };
  }

  for (const e of edges) {
    const item: FSMEdge = {
      from: e.source,
      to: e.target,
      label: e?.label,
      condition: e?.data?.condition,
    };
    (edgesFrom[e.source] ||= []).push(item);
  }

  const incoming = new Set(edges.map((e: any) => e.target));
  const start =
    nodes.find(n => getKind(n) === "start") ||
    nodes.find(n => getKind(n) === "input") ||
    nodes.find(n => !incoming.has(n.id)) ||
    nodes[0];

  return {
    nodes: fsmNodes,
    edgesFrom,
    startId: start?.id || nodes[0]?.id,
  };
}

export function formatWithVars(text: string, vars: Record<string, any>) {
  return String(text || "").replace(/\{\{\s*([^}]+)\s*\}\}/g, (_m, p1) => {
    const k = String(p1).replace(/\s+/g, "_").toLowerCase();
    const v = vars[k];
    return v !== undefined && v !== null ? String(v) : "";
  });
}

export function parseKeyValueLine(text: string): Record<string, any> {
  const result: Record<string, any> = {};
  text
    .split(",")
    .map(p => p.trim())
    .filter(Boolean)
    .forEach(p => {
      const [k, ...rest] = p.split(":");
      if (!k || rest.length === 0) return;
      const key = k.trim().toLowerCase().replace(/\s+/g, "_");
      const valueRaw = rest.join(":").trim();
      const num = Number(valueRaw);
      result[key] = isNaN(num) ? valueRaw : num;
    });
  return result;
}

export function stepFSM(
  fsm: FSM,
  currentId: string | null,
  userInput: string | null,
  vars: Record<string, any> = {}
): StepResult {
  let stateId = currentId ?? fsm.startId;
  let awaitingInput = false;
  const outputs: string[] = [];
  const safeGetEdges = (id: string) => fsm.edgesFrom[id] || [];

  const visitGuard = new Map<string, number>();
  const enqueue = (id: string) => {
    const v = (visitGuard.get(id) || 0) + 1;
    visitGuard.set(id, v);
    return v <= 3;
  };

  if (!stateId) return { outputs, awaitingInput: false, nextStateId: null, variables: vars };

  let cursor = stateId;
  if (!enqueue(cursor)) return { outputs, awaitingInput: false, nextStateId: stateId, variables: vars };

  while (cursor) {
    const node = fsm.nodes[cursor];
    if (!node) break;

    if (node.kind === "output") {
      // Prefer template rendering when templateId provided
      let raw: string = node.data?.text || node.data?.title || node.label;
      if (node.data?.templateId) {
        try {
          const rendered = renderWhatsAppTemplate(String(node.data.templateId), vars);
          raw = rendered || raw;
        } catch {
          // fallback to raw if template render fails
        }
      }
      outputs.push(formatWithVars(raw, vars));
      const next = safeGetEdges(cursor)[0]?.to;
      if (!next) return { outputs, awaitingInput: false, nextStateId: cursor, variables: vars };
      cursor = next;
      if (!enqueue(cursor)) break;
      continue;
    }

    if (node.kind === "process") {
      // processing nodes are silent in chat (avoid exposing backend steps)
      if (node.data?.debug === true) {
        const msg = node.data?.label || node.label || "Processing";
        outputs.push(`Processing: ${msg}`);
      }
      const next = safeGetEdges(cursor)[0]?.to;
      if (!next) return { outputs, awaitingInput: false, nextStateId: cursor, variables: vars };
      cursor = next;
      if (!enqueue(cursor)) break;
      continue;
    }

    if (node.kind === "input") {
      if (userInput === null) {
        const prompt = node.data?.prompt || node.data?.title || node.label || "Masukkan data";
        outputs.push(prompt);
        awaitingInput = true;
        return { outputs, awaitingInput, nextStateId: cursor, variables: vars };
      } else {
        const key = node?.data?.fieldKey || node?.data?.label || node?.data?.title || `input_${cursor}`;
        const updates =
          node?.data?.parse === "kv" || /[:].*,/.test(userInput)
            ? parseKeyValueLine(userInput)
            : { [String(key).replace(/\s+/g, "_").toLowerCase()]: userInput };
        vars = { ...vars, ...updates };
        const next = safeGetEdges(cursor)[0]?.to;
        cursor = next || cursor;
        if (!enqueue(cursor)) break;
        // consume input
        userInput = null;
        continue;
      }
    }

    if (node.kind === "condition") {
      const outs = safeGetEdges(cursor);
      // Auto-route if node requests it (computed condition from prior processing)
      if (userInput === null && (node.data?.auto === true || node.data?.autoRoute === true)) {
        const nextAuto = outs[0]?.to;
        cursor = nextAuto || cursor;
        if (!enqueue(cursor)) break;
        continue;
      }
      if (userInput === null) {
        const q = node.data?.prompt || node.data?.title || node.label || "Pilih opsi";
        const labels = outs.map(o => o.condition || o.label).filter(Boolean) as string[];
        outputs.push(`${q}${labels.length ? ` (${labels.join(" / ")})` : ""}`);
        awaitingInput = true;
        return { outputs, awaitingInput, nextStateId: cursor, variables: vars };
      } else {
        const input = userInput.toLowerCase();
        const yes = ["ya", "iya", "yes", "y", "1", "true"];
        let chosen = outs.find(o => (o.condition || o.label || "").toLowerCase() === input)?.to;
        if (!chosen) {
          if (yes.includes(input)) chosen = outs.find(o => ["yes","ya","iya","true","1"].includes(String(o.condition || o.label || "").toLowerCase()))?.to;
          if (!chosen) chosen = outs[0]?.to;
        }
        cursor = chosen || cursor;
        if (!enqueue(cursor)) break;
        userInput = null;
        continue;
      }
    }

    if (node.kind === "end") {
      outputs.push("Workflow selesai.");
      return { outputs, awaitingInput: false, nextStateId: node.id, variables: vars };
    }

    const next = safeGetEdges(cursor)[0]?.to;
    if (!next) break;
    cursor = next;
    if (!enqueue(cursor)) break;
  }

  return { outputs, awaitingInput, nextStateId: cursor, variables: vars };
}


