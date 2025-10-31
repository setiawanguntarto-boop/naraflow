import { NodeTypeDefinition } from "../nodeLibrary_v3";

export const WhatsAppSendNode: NodeTypeDefinition = {
  id: "whatsapp.send",
  version: "1.0.0",
  label: "WhatsApp Send",
  description: "Send WhatsApp messages (supports templates, buttons, interactive)",
  category: "output",

  configSchema: {
    type: "object",
    properties: {
      provider: {
        type: "string",
        enum: ["meta", "twilio", "360dialog", "custom"],
        default: "twilio",
      },
      messageType: {
        type: "string",
        enum: ["text", "template", "interactive", "media"],
        default: "text",
      },
      templateId: {
        type: "string",
        description: "Template ID for template messages",
      },
      text: {
        type: "string",
        description: "Message text (supports {{placeholders}})",
      },
      interactive: {
        type: "object",
        description: "Interactive message configuration",
      },
      retryOnFail: {
        type: "boolean",
        default: true,
      },
    },
    required: ["provider", "messageType"],
  },

  inputs: {
    default: {
      name: "default",
      type: "message",
      required: true,
      description: "Message data",
    },
  },

  outputs: {
    default: {
      name: "default",
      type: "confirmation",
      description: "Send confirmation with messageId",
    },
    error: {
      name: "error",
      type: "data",
      description: "Error details if send fails",
    },
  },

  metrics: {
    enabled: true,
    category: "business",
    customizable: true,
    defaultMetrics: [
      {
        id: "messages_sent",
        label: "Messages Sent",
        description: "Total messages sent successfully",
        type: "count",
        defaultValue: 0,
        required: true,
      },
      {
        id: "delivery_rate",
        label: "Delivery Rate",
        description: "Percentage of messages delivered",
        type: "percentage",
        unit: "%",
        defaultValue: 0,
      },
      {
        id: "avg_send_time",
        label: "Average Send Time",
        description: "Average time to send message",
        type: "duration",
        unit: "ms",
        defaultValue: 0,
      },
      {
        id: "failed_sends",
        label: "Failed Sends",
        description: "Number of failed message attempts",
        type: "count",
        defaultValue: 0,
      },
      {
        id: "retry_count",
        label: "Retry Count",
        description: "Number of retried sends",
        type: "count",
        defaultValue: 0,
      },
      {
        id: "message_type_distribution",
        label: "Message Type Distribution",
        description: "Distribution of message types (text/template/interactive)",
        type: "percentage",
        unit: "%",
        defaultValue: 0,
      },
    ],
  },

  ui: {
    icon: "send",
    category: "output",
    fieldsOrder: ["provider", "messageType", "text", "templateId"],
    advanced: {
      collapsed: true,
      fields: ["interactive", "retryOnFail"],
    },
    helpLinks: ["docs/whatsapp-send"],
  },

  runtime: {
    handler: "@/lib/executors/whatsappSendExecutor",
    timeoutMs: 30000,
    retry: {
      count: 2,
      backoffMs: 1000,
    },
  },

  security: {
    authType: "apiKey",
    scopes: ["messages:write"],
  },

  meta: {
    tags: ["whatsapp", "messaging", "output"],
  },
};
