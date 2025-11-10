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
      type: "data",
      description: "Normalized WhatsApp message payload",
    },
  },

  metrics: {
    enabled: true,
    category: "business",
    customizable: true,
    defaultMetrics: [
      {
        id: "messages_received",
        label: "Messages Received",
        description: "Total WhatsApp messages received",
        type: "count",
        defaultValue: 0,
        required: true,
      },
      {
        id: "unique_users",
        label: "Unique Users",
        description: "Number of unique users who sent messages",
        type: "count",
        defaultValue: 0,
      },
      {
        id: "avg_processing_time",
        label: "Average Processing Time",
        description: "Average time to process incoming message",
        type: "duration",
        unit: "ms",
        defaultValue: 0,
      },
      {
        id: "duplicate_messages",
        label: "Duplicate Messages",
        description: "Messages filtered by deduplication",
        type: "count",
        defaultValue: 0,
      },
      {
        id: "webhook_failures",
        label: "Webhook Failures",
        description: "Number of failed webhook validations",
        type: "count",
        defaultValue: 0,
      },
      {
        id: "message_types",
        label: "Message Type Distribution",
        description: "Distribution of message types (text/image/video/etc)",
        type: "percentage",
        unit: "%",
        defaultValue: 0,
      },
      {
        id: "provider_distribution",
        label: "Provider Distribution",
        description: "Distribution by provider (Meta/Twilio/360dialog)",
        type: "percentage",
        unit: "%",
        defaultValue: 0,
      },
    ],
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
