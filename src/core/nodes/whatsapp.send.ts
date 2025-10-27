import { NodeTypeDefinition } from '../nodeLibrary_v3';

export const WhatsAppSendNode: NodeTypeDefinition = {
  id: 'whatsapp.send',
  version: '1.0.0',
  label: 'WhatsApp Send',
  description: 'Send WhatsApp messages (supports templates, buttons, interactive)',
  category: 'output',
  
  configSchema: {
    type: 'object',
    properties: {
      provider: {
        type: 'string',
        enum: ['meta', 'twilio', '360dialog', 'custom'],
        default: 'twilio'
      },
      messageType: {
        type: 'string',
        enum: ['text', 'template', 'interactive', 'media'],
        default: 'text'
      },
      templateId: {
        type: 'string',
        description: 'Template ID for template messages'
      },
      text: {
        type: 'string',
        description: 'Message text (supports {{placeholders}})'
      },
      interactive: {
        type: 'object',
        description: 'Interactive message configuration'
      },
      retryOnFail: {
        type: 'boolean',
        default: true
      }
    },
    required: ['provider', 'messageType']
  },

  inputs: {
    default: {
      name: 'default',
      type: 'message',
      required: true,
      description: 'Message data'
    }
  },
  
  outputs: {
    default: {
      name: 'default',
      type: 'confirmation',
      description: 'Send confirmation with messageId'
    },
    error: {
      name: 'error',
      type: 'data',
      description: 'Error details if send fails'
    }
  },

  ui: {
    icon: 'send',
    category: 'output',
    fieldsOrder: ['provider', 'messageType', 'text', 'templateId'],
    advanced: {
      collapsed: true,
      fields: ['interactive', 'retryOnFail']
    },
    helpLinks: ['docs/whatsapp-send']
  },

  runtime: {
    handler: '@/lib/executors/whatsappSendExecutor',
    timeoutMs: 30000,
    retry: {
      count: 2,
      backoffMs: 1000
    }
  },

  security: {
    authType: 'apiKey',
    scopes: ['messages:write']
  },

  meta: {
    tags: ['whatsapp', 'messaging', 'output']
  }
};

