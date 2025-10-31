import { NodeTypeDefinition } from "../nodeLibrary_v3";

export const WhatsAppTriggerNode: NodeTypeDefinition = {
  id: "whatsapp.trigger",
  version: "1.0.0",
  label: "WhatsApp Trigger",
  description:
    "Trigger workflow when WhatsApp message is received. Normalizes Meta, Twilio, and 360dialog payloads",
  category: "trigger",

  configSchema: {
    type: "object",
    properties: {
      provider: {
        type: "string",
        enum: ["meta"],
        default: "meta",
        description: "WhatsApp provider (locked to Meta)",
      },
      webhookPath: {
        type: "string",
        pattern: "^/webhook/",
        description: "Webhook endpoint path",
      },
      validateSignature: {
        type: "boolean",
        default: true,
        description: "Validate webhook signature",
      },
      dedupeWindowSec: {
        type: "number",
        default: 300,
        description: "Deduplication window in seconds",
      },
    },
    required: ["provider", "webhookPath"],
  },

  inputs: {
    webhook: {
      name: "webhook",
      type: "trigger",
      required: true,
      description: "Webhook trigger",
    },
  },

  outputs: {
    default: {
      name: "default",
      type: "message",
      description: "Normalized WhatsApp message payload",
    },
  },

  ui: {
    icon: "message-square",
    category: "trigger",
    fieldsOrder: ["webhookPath", "validateSignature", "dedupeWindowSec"],
    advanced: {
      collapsed: true,
      fields: ["dedupeWindowSec"],
    },
    helpLinks: ["docs/whatsapp-trigger"],
  },

  runtime: {
    handler: "@/lib/executors/whatsappTriggerExecutor",
    timeoutMs: 5000,
  },

  security: {
    authType: "oauth2",
    scopes: ["messages:read"],
  },

  meta: {
    tags: ["whatsapp", "messaging", "trigger"],
    author: "Naraflow Team",
    createdAt: "2025-01-01",
  },
};
