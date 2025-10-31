import { ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";

interface AskQuestionConfig {
  question: string;
  responseType: "text" | "number" | "choice";
  choices?: string[];
  required?: boolean;
  validationRegex?: string;
  minValue?: number;
  maxValue?: number;
  timeoutSec?: number;
  retries?: number;
  saveToMemoryKey?: string;
  captureMetrics?: boolean;
}

function normalizeResponse(config: AskQuestionConfig, raw: any): { valid: boolean; value?: any; reason?: string } {
  if ((raw === undefined || raw === null || raw === "") && config.required !== false) {
    return { valid: false, reason: "required" };
  }

  if (raw === undefined || raw === null || raw === "") {
    return { valid: true, value: raw };
  }

  if (config.responseType === "number") {
    const num = typeof raw === "number" ? raw : Number(raw);
    if (Number.isNaN(num)) return { valid: false, reason: "not_a_number" };
    if (typeof config.minValue === "number" && num < config.minValue) return { valid: false, reason: "lt_min" };
    if (typeof config.maxValue === "number" && num > config.maxValue) return { valid: false, reason: "gt_max" };
    return { valid: true, value: num };
  }

  if (config.responseType === "choice") {
    if (!Array.isArray(config.choices) || config.choices.length === 0) {
      return { valid: false, reason: "choices_missing" };
    }
    const str = String(raw);
    if (!config.choices.includes(str)) return { valid: false, reason: "not_in_choices" };
    return { valid: true, value: str };
  }

  // text
  const str = String(raw);
  if (config.validationRegex) {
    try {
      const re = new RegExp(config.validationRegex);
      if (!re.test(str)) return { valid: false, reason: "regex_failed" };
    } catch {
      // invalid regex: ignore validation
    }
  }
  return { valid: true, value: str };
}

export async function askQuestionExecutor(
  context: ExecutionContext,
  config: AskQuestionConfig
): Promise<NodeResult> {
  const { logger, sendMessage, storage } = context.services;
  const { question, saveToMemoryKey, captureMetrics = true } = config;

  const userId = context.userId || context.vars?.userId || context.payload?.userId;

  // If there is no response yet, send the question and ask runtime to retry later
  const incomingResponse = context.payload?.userResponse;
  if (incomingResponse === undefined) {
    if (sendMessage && userId) {
      await sendMessage("whatsapp", String(userId), String(question), { choices: config.choices, responseType: config.responseType });
    }

    if (captureMetrics && logger) {
      logger.info("AskQuestion: question sent", { nodeId: context.nodeId });
    }

    return { status: "retry" };
  }

  // Validate and normalize
  const normalized = normalizeResponse(config, incomingResponse);
  if (!normalized.valid) {
    if (captureMetrics && logger) {
      logger.warn("AskQuestion: invalid response", { reason: normalized.reason });
    }
    return {
      status: "success",
      data: { reason: normalized.reason },
      next: "invalid",
    };
  }

  // Optionally save to memory
  if (saveToMemoryKey && storage) {
    try {
      const current = (await storage.get("memory")) || {};
      current[saveToMemoryKey] = normalized.value;
      await storage.set("memory", current);
    } catch (e) {
      logger?.warn("AskQuestion: failed to persist to memory", e);
    }
  }

  if (captureMetrics && logger) {
    logger.info("AskQuestion: response accepted", { nodeId: context.nodeId });
  }

  return {
    status: "success",
    data: { value: normalized.value },
    next: "default",
  };
}


