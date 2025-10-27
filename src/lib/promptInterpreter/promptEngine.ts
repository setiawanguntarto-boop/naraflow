/**
 * Prompt Engine - Main Orchestration Pipeline
 * Hybrid approach: Rule-based intent detection + LLM entity extraction
 */

import { interpretPrompt as originalInterpretPrompt } from './promptParser';
import { planNodes, NodePlan } from './nodePlanner';
import { assembleWorkflow, WorkflowOutput } from './workflowAssembler';
import { validateWorkflow, ValidationResult } from './validationService';
import { PromptAnalysis } from './types';

export interface InterpreterOptions {
  llmProvider?: 'openai' | 'llama' | 'none';
  validate?: boolean;
  preview?: boolean;
}

export interface InterpreterResult {
  success: boolean;
  workflow: WorkflowOutput | null;
  analysis: PromptAnalysis | null;
  validation?: ValidationResult;
  error?: string;
}

/**
 * Main function: Interpret natural language prompt into executable workflow
 */
export async function interpretPrompt(
  prompt: string,
  options: InterpreterOptions = {}
): Promise<InterpreterResult> {
  const {
    llmProvider = 'openai',
    validate = true,
    preview = true
  } = options;
  
  try {
    // Step 1: Parse prompt (intent detection + entity extraction)
    const analysis = await originalInterpretPrompt(prompt, { llmProvider });
    
    if (!analysis) {
      return {
        success: false,
        workflow: null,
        analysis: null,
        error: 'Failed to parse prompt'
      };
    }
    
    // Step 2: Plan nodes based on intent and entities
    const nodePlans = planNodes(analysis);
    
    // Step 3: Assemble workflow
    const workflow = assembleWorkflow(nodePlans);
    
    // Step 4: Validate workflow
    let validation: ValidationResult | undefined;
    
    if (validate) {
      validation = validateWorkflow(workflow);
      
      // Add validation warnings to workflow warnings
      if (validation.warnings.length > 0) {
        workflow.warnings.push(...validation.warnings);
      }
      
      // If there are errors, return early
      if (validation.errors.length > 0) {
        return {
          success: false,
          workflow: null,
          analysis,
          validation,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }
    }
    
    return {
      success: true,
      workflow,
      analysis,
      validation
    };
    
  } catch (error: any) {
    console.error('Prompt interpreter error:', error);
    
    return {
      success: false,
      workflow: null,
      analysis: null,
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Execute a generated workflow (for testing)
 */
export async function executeGeneratedWorkflow(
  workflow: WorkflowOutput
): Promise<any> {
  // This would orchestrate execution through the execution engine
  // For now, returns the workflow structure
  return {
    success: true,
    workflow,
    executed: true
  };
}
