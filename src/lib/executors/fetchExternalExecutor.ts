import { ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";

function template(str: string, vars: Record<string, any>): string {
  return str.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, key) => String(vars[key.trim()] ?? ""));
}

function toHeaders(pairs: Array<{ key: string; value: string }> = []): Record<string, string> {
  const out: Record<string, string> = {};
  pairs.forEach(p => { if (p.key) out[p.key] = p.value ?? ""; });
  return out;
}

function mapResponse(json: any, mappings: Array<{ field: string; path: string }>): Record<string, any> {
  const getPath = (obj: any, path: string) => path.split(".").reduce((a, k) => (a == null ? undefined : a[k]), json);
  const out: Record<string, any> = {};
  for (const m of mappings || []) {
    out[m.field] = getPath(json, m.path);
  }
  return out;
}

export async function fetchExternalExecutor(context: ExecutionContext, config: any): Promise<NodeResult> {
  const { http, storage, logger } = context.services;
  const vars = { ...(context.vars || {}), ...(context.payload || {}) };

  // Rate limit (naive, per-process)
  if (config.rateLimitRps && config.rateLimitRps > 0) {
    const key = "rate.nextTs";
    const now = Date.now();
    const minInterval = 1000 / config.rateLimitRps;
    const nextTs = Number((await storage?.get(key)) || 0);
    if (now < nextTs) {
      return { status: "success", data: { retryAt: new Date(nextTs).toISOString() }, next: "rateLimited" };
    }
    await storage?.set(key, now + minInterval);
  }

  // Cache by full URL
  const method = config.method || "GET";
  const baseUrl = template(String(config.url || ""), vars);
  const query = (config.query || []).filter((q: any) => q.key).map((q: any) => `${encodeURIComponent(q.key)}=${encodeURIComponent(template(String(q.value), vars))}`).join("&");
  const url = query ? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${query}` : baseUrl;

  const cacheKey = `fetch.cache:${method}:${url}`;
  if (config.cacheTtlSec && config.cacheTtlSec > 0) {
    const cached = await storage?.get(cacheKey);
    if (cached && (Date.now() - cached.ts) < config.cacheTtlSec * 1000) {
      return { status: "success", data: { response: cached.data, mapped: mapResponse(cached.data, config.responseMapping || []) }, next: "default" };
    }
  }

  const headers = toHeaders(config.headers || []);
  // Auth handling
  if (config.auth?.type === "apiKey" && config.auth.apiKeyHeader && config.auth.apiKeyValue) {
    headers[config.auth.apiKeyHeader] = template(String(config.auth.apiKeyValue), vars);
  } else if (config.auth?.type === "basic") {
    const token = btoa(`${config.auth.basicUser || ""}:${config.auth.basicPass || ""}`);
    headers["Authorization"] = `Basic ${token}`;
  } else if (config.auth?.type === "bearer" && config.auth.bearerToken) {
    headers["Authorization"] = `Bearer ${template(String(config.auth.bearerToken), vars)}`;
  }

  // Body
  let data: any = undefined;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    if (config.bodyType === "json") {
      try { data = JSON.parse(template(String(config.body || "{}"), vars)); }
      catch { data = template(String(config.body || "{}"), vars); headers["Content-Type"] = headers["Content-Type"] || "application/json"; }
    } else if (config.bodyType === "form") {
      headers["Content-Type"] = headers["Content-Type"] || "application/x-www-form-urlencoded";
      data = template(String(config.body || ""), vars);
    } else {
      data = template(String(config.body || ""), vars);
    }
  }

  // Perform request with retry
  const maxRetry = Number(config.retry?.count ?? 0);
  const backoff = Number(config.retry?.backoffMs ?? 0);
  const timeoutMs = Number(config.timeoutMs ?? 10000);
  let lastError: any;
  for (let i = 0; i <= maxRetry; i++) {
    try {
      const resp = await http?.post
        ? (method === "GET" ? http!.get(url, { headers, timeout: timeoutMs }) : http!.post(url, data, { headers, method, timeout: timeoutMs }))
        : await fetch(url, {
            method,
            headers,
            body: data && method !== "GET" ? (typeof data === "string" ? data : JSON.stringify(data)) : undefined,
            signal: context.abortSignal,
          }).then(async r => {
            const json = await r.json().catch(() => ({}));
            return { data: json, status: r.status } as any;
          });

      const json = (resp as any).data ?? resp;
      if (config.cacheTtlSec && config.cacheTtlSec > 0) {
        await storage?.set(cacheKey, { ts: Date.now(), data: json });
      }
      return { status: "success", data: { response: json, mapped: mapResponse(json, config.responseMapping || []) }, next: "default" };
    } catch (e: any) {
      lastError = e;
      logger?.warn("FetchExternal: attempt failed", { attempt: i + 1, error: String(e?.message || e) });
      if (i < maxRetry && backoff > 0) await new Promise(res => setTimeout(res, backoff * (i + 1)));
    }
  }

  return { status: "error", error: { message: "fetch_failed", details: String(lastError) }, next: "error" };
}


