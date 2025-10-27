/**
 * Executor for Memory Set Node
 * Writes conversation memory for user/session
 */

import { ExecutionContext, NodeResult } from '@/core/nodeLibrary_v3';

export async function memorySetExecutor(
  context: ExecutionContext,
  config: any
): Promise<NodeResult> {
  const { storage, logger, vars } = context;
  
  if (!storage) {
    return {
      status: 'error',
      error: { message: 'Storage service not available', code: 'NO_STORAGE' }
    };
  }
  
  try {
    // Resolve key with template variables
    const resolvedKey = resolveTemplate(config.key, { ...vars, ...context.meta });
    
    // Get memory by scope
    let key = resolvedKey;
    if (config.scope === 'user') {
      key = `memory:user:${key}`;
    } else if (config.scope === 'session') {
      key = `memory:session:${context.executionId}:${key}`;
    } else if (config.scope === 'workflow') {
      key = `memory:workflow:${context.workflowId}:${key}`;
    }
    
    // Get existing value if merge is enabled
    let newValue = config.value;
    if (config.merge) {
      try {
        const existing = await storage.get(key);
        if (existing && typeof existing === 'object' && typeof config.value === 'object') {
          newValue = { ...existing, ...config.value };
        } else {
          newValue = config.value;
        }
      } catch {
        // If key doesn't exist, just use new value
        newValue = config.value;
      }
    }
    
    // Store updated value
    await storage.set(key, newValue);
    
    logger.info(`Stored memory to key: ${key}`);
    
    return {
      status: 'success',
      data: newValue,
      updatedMemory: { [key]: newValue },
      next: 'default'
    };
  } catch (error: any) {
    logger.error(`Memory set failed: ${error.message}`);
    return {
      status: 'error',
      error: {
        message: error.message,
        code: 'MEMORY_ERROR',
        details: error
      }
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

