/**
 * Enhanced Prompt Engine with Caching
 * Wraps the main prompt engine with caching for better performance
 */

import { interpretPrompt as originalInterpretPrompt } from './promptEngine';
import { InterpreterResult } from './promptEngine';
import { generateCacheKey, getCachedWorkflowGeneration, cacheWorkflowGeneration } from './cacheService';

/**
 * Interpret prompt with caching
 */
export async function interpretPrompt(
  prompt: string,
  options?: any
): Promise<InterpreterResult> {
  // Check cache first
  const cacheKey = generateCacheKey(prompt, options);
  const cached = getCachedWorkflowGeneration(cacheKey);
  
  if (cached) {
    return {
      success: true,
      workflow: cached.workflow,
      analysis: cached.analysis,
      validation: cached.validation
    };
  }
  
  // Call original interpret
  const result = await originalInterpretPrompt(prompt, options);
  
  // Cache successful results
  if (result.success && result.workflow) {
    cacheWorkflowGeneration(cacheKey, {
      workflow: result.workflow,
      analysis: result.analysis,
      validation: result.validation
    });
  }
  
  return result;
}
