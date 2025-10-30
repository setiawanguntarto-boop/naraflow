/**
 * LLM Service Implementation
 * Provides unified interface for different LLM providers
 * Updated to use new AI Provider system
 */

import { LLMService } from "@/core/nodeLibrary_v3";
import { AIProvider, AIProviderFactory, AIProviderConfig, AIMessage } from "./aiProviders";

export class LLMServiceProvider implements LLMService {
  private aiProvider: AIProvider;

  constructor(provider: "openai" | "google" | "local" | "anthropic", apiKey: string, endpoint?: string) {
    const config: AIProviderConfig = {
      provider: provider === "anthropic" ? "anthropic" : provider,
      apiKey,
      endpoint,
    };
    
    this.aiProvider = AIProviderFactory.createProvider(config);
  }

  async chat(messages: any[], options: any): Promise<any> {
    // Convert to AIMessage format
    const aiMessages: AIMessage[] = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Use the new AI provider system
    const response = await this.aiProvider.chat(aiMessages, {
      model: options.model,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      tools: options.tools,
    });

    return {
      content: response.content,
      model: response.model,
      usage: response.usage,
    };
  }

  /**
   * Validate the provider connection
   */
  async validateConnection() {
    return await this.aiProvider.validateConnection();
  }

  /**
   * Get available models for the current provider
   */
  async getAvailableModels() {
    return await this.aiProvider.getAvailableModels();
  }

  /**
   * Get the AI provider instance (for advanced usage)
   */
  getProvider(): AIProvider {
    return this.aiProvider;
  }
}

/**
 * Create LLM service instance
 */
export function createLLMService(
  provider: "openai" | "google" | "local" | "anthropic",
  apiKey: string,
  endpoint?: string
): LLMService {
  return new LLMServiceProvider(provider, apiKey, endpoint);
}

/**
 * Create LLM service from AI Provider config
 */
export function createLLMServiceFromConfig(config: AIProviderConfig): LLMServiceProvider {
  return new LLMServiceProvider(config.provider, config.apiKey, config.endpoint);
}
