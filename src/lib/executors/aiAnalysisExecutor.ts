import { ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";

function resolveTemplate(template: string, scope: any): string {
  return String(template || "").replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, path) => {
    return path.split(".").reduce((acc, k) => (acc == null ? "" : acc[k]), scope) ?? "";
  });
}

function tryParseJSON(text: string): any {
  try { return JSON.parse(text); } catch { return null; }
}

function pickMapped(json: any, mapping: Array<{ field: string; path: string }>): Record<string, any> {
  const getPath = (obj: any, path: string) => path.split(".").reduce((a, k) => (a == null ? undefined : a[k]), obj);
  const out: Record<string, any> = {};
  for (const m of mapping || []) out[m.field] = getPath(json, m.path);
  return out;
}

export async function aiAnalysisExecutor(context: ExecutionContext, config: any): Promise<NodeResult> {
  const { llm, logger, payload, memory } = context.services;
  const llmSvc = llm;
  if (!llmSvc) {
    return { status: "error", error: { message: "LLM service not available", code: "NO_LLM" } };
  }

  const scope = { payload: context.payload, memory: context.memory, vars: context.vars };
  const systemPrompt = config.systemPrompt;
  const userPrompt = resolveTemplate(config.promptTemplate, scope);

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    const response = await llmSvc.chat(messages, {
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      tools: config.tools,
    });

    const text = response.content || response.text || String(response);
    const json = tryParseJSON(text);
    const mapped = json ? pickMapped(json, config.responseMapping || []) : {};

    return { status: "success", data: { text, json, mapped }, next: "default" };
  } catch (e: any) {
    logger?.error?.("AIAnalysis failed", e);
    return { status: "error", error: { message: String(e?.message || e), details: e }, next: "error" };
  }
}


