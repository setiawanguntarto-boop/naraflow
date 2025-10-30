/**
 * Enhanced Prompt Engine with Caching
 * Wraps the main prompt engine with caching and request deduplication
 */

import { interpretPrompt as originalInterpretPrompt } from "./promptEngine";
import { InterpreterResult } from "./promptEngine";
import {
  generateCacheKey,
  getCachedWorkflowGeneration,
  cacheWorkflowGeneration,
} from "./cacheService";

// In-flight request tracking to prevent duplicate calls
const inflightRequests = new Map<string, Promise<InterpreterResult>>();

/**
 * Interpret prompt with caching and deduplication
 */
export async function interpretPrompt(prompt: string, options?: any): Promise<InterpreterResult> {
  const cacheKey = generateCacheKey(prompt, options);
  
  // Check in-flight requests first
  if (inflightRequests.has(cacheKey)) {
    console.log("⏳ Waiting for in-flight request...");
    return inflightRequests.get(cacheKey)!;
  }
  
  // Check cache
  const cached = getCachedWorkflowGeneration(cacheKey);
  if (cached) {
    console.log("✅ Cache hit");
    return {
      success: true,
      workflow: cached.workflow,
      analysis: cached.analysis,
      validation: cached.validation,
    };
  }

  // Create new request
  const requestPromise = originalInterpretPrompt(prompt, options);
  inflightRequests.set(cacheKey, requestPromise);

  try {
    const result = await requestPromise;
    
    // Cache successful results
    if (result.success && result.workflow) {
      cacheWorkflowGeneration(cacheKey, {
        workflow: result.workflow,
        analysis: result.analysis,
        validation: result.validation,
      });
    }
    
    return result;
  } finally {
    inflightRequests.delete(cacheKey);
  }
}
