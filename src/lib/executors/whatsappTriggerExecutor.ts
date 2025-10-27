/**
 * Executor for WhatsApp Trigger Node
 * Normalizes incoming WhatsApp messages from various providers
 */

import { ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";

export async function whatsappTriggerExecutor(
  context: ExecutionContext,
  config: any
): Promise<NodeResult> {
  const { logger, memory } = context;

  try {
    // Normalize provider payload to standard format
    const normalizedPayload = normalizeWhatsAppPayload(
      context.meta.providerPayload,
      config.provider
    );

    logger.info(`Received WhatsApp message from user: ${normalizedPayload.user_id}`);

    // Optional deduplication
    if (config.dedupeWindowSec > 0) {
      const isDuplicate = await checkDedupe(normalizedPayload.message_id, config.dedupeWindowSec);

      if (isDuplicate) {
        logger.warn(`Duplicate message detected: ${normalizedPayload.message_id}`);
        return {
          status: "error",
          error: { message: "Duplicate message", code: "DEDUP" },
        };
      }
    }

    return {
      status: "success",
      data: normalizedPayload,
      next: "default",
    };
  } catch (error: any) {
    return {
      status: "error",
      error: {
        message: error.message,
        code: "EXEC_ERROR",
        details: error,
      },
    };
  }
}

function normalizeWhatsAppPayload(payload: any, provider: string) {
  switch (provider) {
    case "meta":
      return {
        user_id: payload.from || payload.wa_id,
        message: payload.text?.body || "",
        media: payload.image || payload.document || null,
        message_id: payload.id,
        timestamp: payload.timestamp,
      };
    case "twilio":
      return {
        user_id: payload.From,
        message: payload.Body || "",
        media: payload.MediaUrl0 || null,
        message_id: payload.MessageSid,
        timestamp: new Date().toISOString(),
      };
    default:
      return {
        user_id: payload.user_id || payload.from,
        message: payload.message || payload.body || "",
        media: payload.media || null,
        message_id: payload.message_id || payload.id,
        timestamp: payload.timestamp || new Date().toISOString(),
      };
  }
}

async function checkDedupe(messageId: string, windowSec: number): Promise<boolean> {
  // Simple in-memory deduplication (in production, use Redis)
  const seenMessages = (global as any).seenMessages || [];
  const now = Date.now();

  const filtered = seenMessages.filter((m: any) => now - m.timestamp < windowSec * 1000);
  (global as any).seenMessages = filtered;

  const exists = filtered.some((m: any) => m.messageId === messageId);

  if (!exists) {
    filtered.push({ messageId, timestamp: now });
  }

  return exists;
}
