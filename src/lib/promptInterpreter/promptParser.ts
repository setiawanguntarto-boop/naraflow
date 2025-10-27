/**
 * Prompt Parser
 * Main entry point for parsing natural language prompts
 */

import { detectIntent } from './intentDetector';
import { extractEntities } from './entityExtractor';
import { PromptAnalysis } from './types';

/**
 * Parse natural language prompt into structured analysis
 */
export async function interpretPrompt(
  prompt: string,
  options?: {
    llmProvider?: 'openai' | 'llama' | 'none';
    template?: any; // Template from @mention
  }
): Promise<PromptAnalysis | null> {
  try {
    // Build enhanced prompt with template context if provided
    let enhancedPrompt = prompt;
    
    if (options?.template) {
      const context = `
Template Selected: ${options.template.label}
Category: ${options.template.category}
Description: ${options.template.description}

User Requirements:
${prompt}
`;
      enhancedPrompt = context;
    }
    
    // Step 1: Detect intent (rule-based, fast)
    const intent = detectIntent(enhancedPrompt);
    
    // Step 2: Extract entities (LLM with regex fallback)
    const entities = await extractEntities(enhancedPrompt, intent, options?.llmProvider);
    
    // Step 3: Extract target storage
    const target = extractTarget(enhancedPrompt);
    
    // Step 4: Detect workflow type
    const workflowType = detectWorkflowType(enhancedPrompt);
    
    return {
      intent,
      entities,
      target,
      workflow_type: workflowType
    };
  } catch (error) {
    console.error('Error parsing prompt:', error);
    return null;
  }
}

/**
 * Extract target storage from prompt
 */
function extractTarget(prompt: string): 'google_sheets' | 'database' | 'storage' {
  const lower = prompt.toLowerCase();
  
  if (lower.includes('google sheets') || lower.includes('google sheets')) {
    return 'google_sheets';
  }
  
  if (lower.includes('database') || lower.includes('db')) {
    return 'database';
  }
  
  if (lower.includes('excel') || lower.includes('spreadsheet')) {
    return 'google_sheets'; // Treat Excel as Google Sheets equivalent
  }
  
  return 'storage';
}

/**
 * Detect workflow type from prompt
 */
function detectWorkflowType(prompt: string): 'sequential' | 'parallel' | 'conditional' {
  const lower = prompt.toLowerCase();
  
  if (lower.includes('if') || lower.includes('conditional') || lower.includes('jika')) {
    return 'conditional';
  }
  
  if (lower.includes('parallel') || lower.includes('simultaneous') || lower.includes('bersama')) {
    return 'parallel';
  }
  
  return 'sequential';
}
