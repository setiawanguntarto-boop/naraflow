import { ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";

type MetricType = "number" | "text" | "boolean";

interface MetricDef {
  id: string;
  label?: string;
  path: string;
  type: MetricType;
  unit?: string;
  required?: boolean;
  min?: number;
  max?: number;
  aggregation?: "none" | "avg" | "min" | "max";
  windowSec?: number;
}

interface SensorConfig {
  sourceType: "webhook" | "mqtt" | "http_poll";
  webhookPath?: string;
  mqtt?: any;
  httpPoll?: any;
  metrics: MetricDef[];
  dedupeWindowSec?: number;
  dropOutOfRange?: boolean;
  saveToMemoryKey?: string;
}

function getByPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

export async function sensorDataExecutor(context: ExecutionContext, config: SensorConfig): Promise<NodeResult> {
  const { payload, services } = context;
  const { logger, storage } = services;

  const results: Record<string, any> = {};
  let dropped = false;
  let dropReason: string | undefined;

  for (const m of config.metrics || []) {
    const raw = getByPath(payload, m.path);

    if ((raw === undefined || raw === null || raw === "") && m.required !== false) {
      dropped = true;
      dropReason = `required_missing:${m.id}`;
      break;
    }

    if (raw === undefined || raw === null || raw === "") {
      results[m.id] = raw;
      continue;
    }

    if (m.type === "number") {
      const num = typeof raw === "number" ? raw : Number(raw);
      if (Number.isNaN(num)) {
        dropped = true;
        dropReason = `not_a_number:${m.id}`;
        break;
      }
      if (typeof m.min === "number" && num < m.min) {
        if (config.dropOutOfRange) { dropped = true; dropReason = `lt_min:${m.id}`; break; }
      }
      if (typeof m.max === "number" && num > m.max) {
        if (config.dropOutOfRange) { dropped = true; dropReason = `gt_max:${m.id}`; break; }
      }
      results[m.id] = num;
    } else if (m.type === "boolean") {
      results[m.id] = Boolean(raw);
    } else {
      results[m.id] = String(raw);
    }
  }

  if (dropped) {
    logger?.warn("SensorData: reading dropped", { reason: dropReason });
    return { status: "success", data: { reason: dropReason }, next: "dropped" };
  }

  if (config.saveToMemoryKey && storage) {
    try {
      const current = (await storage.get("sensor.latest")) || {};
      current[config.saveToMemoryKey] = { timestamp: new Date().toISOString(), metrics: results };
      await storage.set("sensor.latest", current);
    } catch (e) {
      logger?.warn("SensorData: failed to persist to memory", e);
    }
  }

  return { status: "success", data: { metrics: results }, next: "default" };
}


