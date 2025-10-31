import { ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";

function template(str: string, scope: any): string {
  return String(str || "").replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, path) => {
    return path.split(".").reduce((a, k) => (a == null ? "" : a[k]), scope) ?? "";
  });
}

export async function sendMessageExecutor(context: ExecutionContext, config: any): Promise<NodeResult> {
  const { services, payload, memory, vars, logger } = context;
  const scope = { payload, memory, vars };

  const channel = config.channel || "whatsapp";
  const to = template(config.to || "", scope);
  const body = template(config.template || "", scope);

  if (config.validateRecipient) {
    if (channel === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return { status: "success", data: { error: "invalid_email" }, next: "error" };
    }
    if ((channel === "whatsapp" || channel === "sms") && !/^\+?\d{8,15}$/.test(to)) {
      return { status: "success", data: { error: "invalid_phone" }, next: "error" };
    }
  }

  try {
    if (services.sendMessage) {
      await services.sendMessage(channel, String(to), String(body), { attachments: config.attachments });
    } else {
      logger?.info?.("SendMessage simulated", { channel, to, body });
    }

    if (config.saveToHistory && services.storage && config.historyKey) {
      const key = `history:${config.historyKey}`;
      const prev = (await services.storage.get(key)) || [];
      prev.push({ ts: new Date().toISOString(), channel, to, body });
      await services.storage.set(key, prev);
    }

    return { status: "success", data: { channel, to }, next: "default" };
  } catch (e: any) {
    logger?.error?.("SendMessage failed", e);
    return { status: "success", data: { error: String(e?.message || e) }, next: "error" };
  }
}


