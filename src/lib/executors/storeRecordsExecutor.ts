import { ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";

function getByPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

function mapRecord(rec: any, mapping: Array<{ from: string; to: string }>): any {
  if (!mapping || mapping.length === 0) return rec;
  const out: any = {};
  for (const m of mapping) out[m.to] = getByPath(rec, m.from);
  return out;
}

async function appendStorage(storage: any, key: string, records: any[]) {
  const prev = (await storage.get(key)) || [];
  await storage.set(key, [...prev, ...records]);
}

async function upsertStorage(storage: any, key: string, records: any[], upsertKey: string) {
  const prev: any[] = (await storage.get(key)) || [];
  const idx = new Map<string, number>();
  prev.forEach((r, i) => idx.set(String(r[upsertKey]), i));
  for (const r of records) {
    const k = String(r[upsertKey]);
    if (idx.has(k)) prev[idx.get(k)!] = r; else prev.push(r);
  }
  await storage.set(key, prev);
}

export async function storeRecordsExecutor(context: ExecutionContext, config: any): Promise<NodeResult> {
  const { payload, services } = context;
  try {
    const list: any[] = Array.isArray(getByPath({ payload }, config.recordsPath || "payload"))
      ? getByPath({ payload }, config.recordsPath || "payload")
      : [];
    if (!Array.isArray(list) || list.length === 0) {
      return { status: "success", data: { stored: 0, reason: "no_records" }, next: "default" };
    }

    const tsField = config.addTimestamp ? (config.timestampField || "_ts") : null;
    const mapped = list.map(r => {
      const m = mapRecord(r, config.fieldMapping || []);
      if (tsField) m[tsField] = new Date().toISOString();
      return m;
    });

    if (config.destination === "http") {
      const headers: Record<string, string> = {};
      for (const h of config.httpHeaders || []) headers[h.key] = h.value;
      const chunks = config.batchSize && config.batchSize > 0 ?
        Array.from({ length: Math.ceil(mapped.length / config.batchSize) }, (_, i) => mapped.slice(i * config.batchSize, (i + 1) * config.batchSize))
        : [mapped];
      for (const chunk of chunks) {
        if (services.http?.post) {
          await services.http.post(String(config.httpUrl || ""), { records: chunk }, { headers });
        } else {
          await fetch(String(config.httpUrl || ""), {
            method: "POST",
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify({ records: chunk }),
          });
        }
      }
      return { status: "success", data: { stored: mapped.length, destination: "http" }, next: "default" };
    }

    if (!services.storage) {
      return { status: "success", data: { error: "no_storage_service" }, next: "error" };
    }

    if (config.mode === "upsert") {
      if (!config.upsertKey) return { status: "success", data: { error: "missing_upsertKey" }, next: "error" };
      await upsertStorage(services.storage, String(config.key || "records"), mapped, String(config.upsertKey));
    } else {
      await appendStorage(services.storage, String(config.key || "records"), mapped);
    }

    return { status: "success", data: { stored: mapped.length, destination: "storage" }, next: "default" };
  } catch (e: any) {
    return { status: "success", data: { error: String(e?.message || e) }, next: "error" };
  }
}


