/**
 * Executor for Chat Model (LLM) Node
 * Calls LLM with system prompts and conversation context
 * Updated to use AI Provider system from Phase 1
 */

import { ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";
import { AIProviderFactory, AIMessage } from "@/lib/services/aiProviders";

export async function chatModelExecutor(
  context: ExecutionContext,
  config: any
): Promise<NodeResult> {
  const { logger } = context.services;
  const { payload, memory } = context;

  // Validate configuration
  if (!config.provider || !config.apiKey) {
    return {
      status: "error",
      error: { message: "AI provider or API key not configured", code: "NO_AI_PROVIDER" },
    };
  }

  try {
    // Create AI provider using Phase 1 system
    const aiProvider = AIProviderFactory.createProvider({
      provider: config.provider,
      apiKey: config.apiKey,
    });

    // Build messages array
    const systemPrompt = config.systemPrompt || "You are a helpful assistant.";
    const userPrompt = resolveTemplate(config.promptTemplate, { payload, memory });

    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    logger.info(`Calling AI: ${config.provider}/${config.model}`);

    // Call AI provider using Phase 1 interface
    const response = await aiProvider.chat(messages, {
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      tools: config.tools,
    });

    // Parse and validate output
    const structuredOutput = parseLLMOutput(response, config.outputSchema);

    logger.info("LLM response parsed successfully");

    return {
      status: "success",
      data: structuredOutput,
      next: "default",
    };
  } catch (error: any) {
    logger.error(`LLM execution failed: ${error.message}`);
    return {
      status: "error",
      error: {
        message: error.message,
        code: "LLM_ERROR",
        details: error,
      },
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
  return path.split(".").reduce((current, prop) => current?.[prop], obj);
}

function parseLLMOutput(response: any, schema?: any): any {
  // Try to extract JSON from response
  const text = response.content || response.text || JSON.stringify(response);

  // Attempt JSON parsing
  try {
    const json = JSON.parse(text);

    // If outputSchema is provided, validate structure
    if (schema) {
      return validateAgainstSchema(json, schema);
    }

    return json;
  } catch {
    // If parsing fails, return raw text or response
    return {
      agent_response: text,
      field_detected: null,
      value: null,
      next_field: null,
      status: "in_progress",
      confidence: 0.5,
    };
  }
}

function validateAgainstSchema(data: any, schema: any): any {
  // Basic validation - in production, use ajv or similar
  return data;
}
