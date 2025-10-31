import { NodeTypeDefinition } from "../nodeLibrary_v3";

export const SendMessageNode: NodeTypeDefinition = {
  id: "comm.sendMessage",
  version: "1.0.0",
  label: "Send Message",
  description: "Send a templated message to a user via selected channel (WhatsApp/SMS/Email).",
  category: "output",

  configSchema: {
    type: "object",
    properties: {
      channel: { type: "string", enum: ["whatsapp", "sms", "email"], default: "whatsapp" },
      to: { type: "string", description: "Recipient identifier (phone or email). Supports templating {{vars}}" },
      template: { type: "string", description: "Message template. Supports {{variables}} from payload/vars/memory" },
      variables: {
        type: "array",
        description: "Optional variables to inject into the template",
        items: { type: "object", properties: { key: { type: "string" }, path: { type: "string" } }, required: ["key", "path"] },
      },
      attachments: {
        type: "array",
        items: { type: "object", properties: { url: { type: "string" }, caption: { type: "string" } }, required: ["url"] },
        description: "Optional attachments (image/document URLs)",
      },
      validateRecipient: { type: "boolean", default: true },
      saveToHistory: { type: "boolean", default: true },
      historyKey: { type: "string", default: "messages" },
    },
    required: ["channel", "to", "template"],
  },

  inputs: {
    default: { name: "default", type: "data", required: false, description: "Optional input context for templating" },
  },

  outputs: {
    default: { name: "sent", type: "confirmation", description: "Message sent confirmation" },
    error: { name: "error", type: "route", description: "Emitted if sending fails" },
  },

  ui: {
    icon: "send",
    category: "output",
    fieldsOrder: ["channel", "to", "template", "variables", "attachments"],
    advanced: { collapsed: true, fields: ["validateRecipient", "saveToHistory", "historyKey"] },
    helpLinks: ["docs/send-message"],
  },

  runtime: {
    handler: "@/lib/executors/sendMessageExecutor",
    timeoutMs: 10000,
  },

  security: { authType: "none" },
  meta: { tags: ["message", "communication"], author: "Naraflow Team", createdAt: new Date().toISOString() },
};


