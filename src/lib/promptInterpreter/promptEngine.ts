/**
 * Prompt Engine - Main Orchestration Pipeline
 * Hybrid approach: Rule-based intent detection + LLM entity extraction
 */

import { interpretPrompt as originalInterpretPrompt } from "./promptParser";
import { planNodes, NodePlan } from "./nodePlanner";
import { assembleWorkflow, WorkflowOutput } from "./workflowAssembler";
import { validateWorkflow, ValidationResult } from "./validationService";
import { PromptAnalysis } from "./types";

export interface InterpreterOptions {
  llmProvider?: "openai" | "llama" | "none";
  validate?: boolean;
  preview?: boolean;
  template?: any;
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
  console.log("🚀 [Prompt Interpreter] Starting...", {
    promptLength: prompt.length,
    options,
    timestamp: new Date().toISOString()
  });

  const { llmProvider = "openai", validate = true, preview = true } = options;

  try {
    // Step 1: Parse prompt (intent detection + entity extraction)
    console.log("📊 [Step 1/4] Parsing prompt...");
    const analysis = await originalInterpretPrompt(prompt, { llmProvider, template: options.template });

    if (!analysis) {
      console.error("❌ [Step 1/4] Parse failed");
      return {
        success: false,
        workflow: null,
        analysis: null,
        error: "Failed to parse prompt",
      };
    }
    console.log("✅ [Step 1/4] Parse complete:", analysis?.intent.type);

    // Step 2: Plan nodes based on intent and entities
    console.log("📊 [Step 2/4] Planning nodes...");
    const nodePlans = planNodes(analysis);
    console.log("✅ [Step 2/4] Planned", nodePlans.length, "nodes");

    // Step 3: Assemble workflow
    console.log("📊 [Step 3/4] Assembling workflow...");
    const workflow = assembleWorkflow(nodePlans);
    console.log("✅ [Step 3/4] Generated", workflow.nodes.length, "nodes,", workflow.edges.length, "edges");

    // Step 4: Validate workflow
    console.log("📊 [Step 4/4] Validating...");
    let validation: ValidationResult | undefined;

    if (validate) {
      validation = validateWorkflow(workflow);

      // Add validation warnings to workflow warnings
      if (validation.warnings.length > 0) {
        workflow.warnings.push(...validation.warnings);
      }

      console.log("✅ [Step 4/4] Validation:", validation.errors.length, "errors,", validation.warnings.length, "warnings");

      // If there are errors, return early
      if (validation.errors.length > 0) {
        console.error("❌ Validation failed:", validation.errors);
        return {
          success: false,
          workflow: null,
          analysis,
          validation,
          error: `Validation failed: ${validation.errors.join(", ")}`,
        };
      }
    }

    console.log("✅ [Prompt Interpreter] Complete - Success!");
    return {
      success: true,
      workflow,
      analysis,
      validation,
    };
  } catch (error: any) {
    console.error("❌ [Prompt Interpreter] Error:", error);

    return {
      success: false,
      workflow: null,
      analysis: null,
      error: error.message || "Unknown error occurred",
    };
  }
}

/**
 * Execute a generated workflow (for testing)
 */
export async function executeGeneratedWorkflow(workflow: WorkflowOutput): Promise<any> {
  // This would orchestrate execution through the execution engine
  // For now, returns the workflow structure
  return {
    success: true,
    workflow,
    executed: true,
  };
}
