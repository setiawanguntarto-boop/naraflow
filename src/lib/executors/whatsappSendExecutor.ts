/**
 * Executor for WhatsApp Send Node
 * Sends WhatsApp messages with template support
 */

import { ExecutionContext, NodeResult } from '@/core/nodeLibrary_v3';

export async function whatsappSendExecutor(
  context: ExecutionContext,
  config: any
): Promise<NodeResult> {
  const { logger, sendMessage, vars } = context;
  
  if (!sendMessage) {
    return {
      status: 'error',
      error: { message: 'Send message service not available', code: 'NO_SERVICE' }
    };
  }
  
  try {
    // Resolve message text with template variables
    let messageText = config.text || '';
    messageText = resolveTemplate(messageText, { payload: context.payload, memory: context.memory, ...vars });
    
    logger.info(`Sending WhatsApp message via ${config.provider}`);
    
    // Get user_id from payload
    const userId = context.payload?.user_id || context.payload?.from || '';
    
    if (!userId) {
      throw new Error('No user_id found in payload');
    }
    
    // Send message
    let result;
    if (config.messageType === 'template' && config.templateId) {
      // Template message
      result = await sendMessage('whatsapp', userId, messageText, {
        templateId: config.templateId,
        provider: config.provider
      });
    } else if (config.messageType === 'interactive' && config.interactive) {
      // Interactive message
      result = await sendMessage('whatsapp', userId, messageText, {
        interactive: config.interactive,
        provider: config.provider
      });
    } else {
      // Simple text message
      result = await sendMessage('whatsapp', userId, messageText, {
        provider: config.provider
      });
    }
    
    logger.info(`Message sent successfully: ${result.messageId || 'unknown'}`);
    
    return {
      status: 'success',
      data: {
        sent: true,
        messageId: result.messageId || result.id,
        timestamp: new Date().toISOString(),
        userId,
        provider: config.provider
      },
      next: 'default'
    };
  } catch (error: any) {
    logger.error(`WhatsApp send failed: ${error.message}`);
    
    // Retry if configured
    if (config.retryOnFail) {
      return {
        status: 'retry',
        error: {
          message: error.message,
          code: 'SEND_ERROR'
        }
      };
    }
    
    return {
      status: 'error',
      data: {
        sent: false,
        error: error.message
      },
      next: 'error'
    };
  }
}

function resolveTemplate(template: string, vars: any): string {
  let result = template;
  
  // Replace {{variable}} placeholders
  result = result.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const value = getNestedValue(vars, path);
    return value !== undefined ? String(value) : match;
  });
  
  return result;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

