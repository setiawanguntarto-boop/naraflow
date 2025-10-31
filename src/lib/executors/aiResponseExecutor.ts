/**
 * AI Response Executor
 * Handles AI provider calls with variable interpolation and error handling
 */

import { ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";
import { AIProviderFactory } from "@/lib/services/aiProviders";

export async function aiResponseExecutor(
  context: ExecutionContext,
  config: any
): Promise<NodeResult> {
  const { services, abortSignal, payload, memory, vars } = context;
  const { logger } = services;

  // Validate configuration
  if (!config.provider || !config.model || !config.apiKey) {
    return {
      status: "error",
      error: {
        message: "Missing required configuration: provider, model, or apiKey",
        code: "INVALID_CONFIG",
      },
    };
  }

  try {
    logger.info(`Creating AI provider: ${config.provider}/${config.model}`);

    // Create AI provider
    const aiProvider = AIProviderFactory.createProvider({
      provider: config.provider,
      apiKey: config.apiKey,
    });

    // Build messages
    const systemPrompt = config.context || "You are a helpful assistant.";
    const userPrompt = interpolateVariables(
      config.responseTemplate || JSON.stringify(payload),
      { payload, memory, vars }
    );

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt },
    ];

    logger.info(`Sending request to ${config.provider}...`);

    // Call AI provider
    const response = await aiProvider.chat(messages, {
      model: config.model,
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 1000,
    });

    logger.info("AI response received successfully");

    // Parse response based on format
    let parsedResponse = response.content;
    if (config.responseFormat === "json") {
      try {
        parsedResponse = JSON.parse(response.content);
      } catch (error) {
        logger.warn("Failed to parse JSON response, returning raw text");
      }
    }

    return {
      status: "success",
      data: {
        response: parsedResponse,
        model: response.model,
        usage: response.usage,
        finishReason: response.finishReason,
      },
      next: "default",
    };
  } catch (error: any) {
    logger.error(`AI execution failed: ${error.message}`);

    // Check if aborted
    if (abortSignal?.aborted) {
      return {
        status: "error",
        error: {
          message: "AI request was aborted",
          code: "ABORTED",
        },
      };
    }

    // Return error through error output
    return {
      status: "error",
      error: {
        message: error.message || "AI execution failed",
        code: "AI_ERROR",
        details: {
          provider: config.provider,
          model: config.model,
          originalError: error,
        },
      },
    };
  }
}

/**
 * Interpolate variables in template string
 * Supports {{variable}}, {{payload.field}}, {{memory.key}} syntax
 */
function interpolateVariables(
  template: string,
  context: { payload: any; memory: any; vars: Record<string, any> }
): string {
  let result = template;

  // Replace {{variable}} placeholders
  result = result.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
    const value = getNestedValue(context, path);
    return value !== undefined ? String(value) : match;
  });

  return result;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, prop) => current?.[prop], obj);
}
