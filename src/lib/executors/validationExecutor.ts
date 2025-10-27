/**
 * Executor for Validation Node
 * Validates data with multiple rules
 */

import { ExecutionContext, NodeResult } from '@/core/nodeLibrary_v3';

export async function validationExecutor(
  context: ExecutionContext,
  config: any
): Promise<NodeResult> {
  const { logger, payload } = context;
  
  try {
    // Get field value
    const fieldValue = resolveValue(payload, config.fieldName);
    
    // Run validators
    const errors: string[] = [];
    for (const rule of config.rules || []) {
      const result = await runValidator(rule, fieldValue, context);
      if (!result.valid) {
        errors.push(result.message || rule.errorMessage || 'Validation failed');
      }
    }
    
    // If validation failed, route to error output
    if (errors.length > 0) {
      logger.warn(`Validation failed: ${errors.join(', ')}`);
      return {
        status: 'success',
        data: {
          isValid: false,
          errors,
          fieldName: config.fieldName,
          value: fieldValue
        },
        next: 'error'
      };
    }
    
    logger.info(`Validation passed for field: ${config.fieldName}`);
    
    return {
      status: 'success',
      data: {
        isValid: true,
        fieldName: config.fieldName,
        value: fieldValue
      },
      next: 'default'
    };
  } catch (error: any) {
    logger.error(`Validation execution failed: ${error.message}`);
    return {
      status: 'error',
      error: {
        message: error.message,
        code: 'VALIDATION_ERROR',
        details: error
      }
    };
  }
}

function resolveValue(payload: any, fieldName: string): any {
  const value = getNestedValue(payload, fieldName);
  return value;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

async function runValidator(rule: any, value: any, context?: any): Promise<{ valid: boolean; message?: string }> {
  switch (rule.type) {
    case 'required':
      return { valid: value !== undefined && value !== null && value !== '' };
    
    case 'email':
      return { valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) };
    
    case 'phone':
      return { valid: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(value) };
    
    case 'number':
      return { valid: typeof value === 'number' && !isNaN(value) };
    
    case 'min':
      return { valid: value >= (rule.params?.min || 0) };
    
    case 'max':
      return { valid: value <= (rule.params?.max || Infinity) };
    
    case 'date':
      return { valid: !isNaN(Date.parse(value)) };
    
    case 'regex':
      if (!rule.pattern) return { valid: true };
      return { valid: new RegExp(rule.pattern).test(value) };
    
    case 'js':
      // Custom validation using function wrapper
      // WARNING: Only use trusted code, avoid direct eval
      if (rule.params?.code) {
        try {
          // Parse validation expression safely
          const expression = rule.params.code.trim();
          
          // Whitelist-based validation (only allow specific operations)
          const allowedPattern = /^(value|payload)\.(.+)\s*[<>=!]+|\s*-?\d+(\.\d+)?$/;
          if (!allowedPattern.test(expression)) {
            return { valid: false, message: 'Unsafe expression not allowed' };
          }
          
          // Safe evaluation using Function constructor (safer than eval)
          const validationFn = new Function('value', 'payload', `
            try {
              return ${expression};
            } catch {
              return false;
            }
          `);
          
          const result = validationFn(value, context);
          return { valid: Boolean(result) };
        } catch (error: any) {
          logger?.warn(`JS validation error: ${error.message}`);
          return { valid: false, message: error.message };
        }
      }
      return { valid: true };
    
    default:
      return { valid: true };
  }
}

