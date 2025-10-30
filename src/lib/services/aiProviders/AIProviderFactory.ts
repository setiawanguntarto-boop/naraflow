/**
 * AI Provider Factory
 * Creates provider instances and manages fallback chains
 */

import { AIProvider, AIProviderConfig } from "./AIProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { AnthropicProvider } from "./AnthropicProvider";
import { GoogleAIProvider } from "./GoogleAIProvider";

export class AIProviderFactory {
  /**
   * Create a provider instance based on configuration
   */
  static createProvider(config: AIProviderConfig): AIProvider {
    switch (config.provider) {
      case "openai":
        return new OpenAIProvider(config);
      case "anthropic":
        return new AnthropicProvider(config);
      case "google":
        return new GoogleAIProvider(config);
      case "local":
        throw new Error("Local provider not yet implemented");
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  /**
   * Create multiple providers for fallback chain
   */
  static createProviderChain(configs: AIProviderConfig[]): AIProvider[] {
    return configs.map(config => this.createProvider(config));
  }

  /**
   * Validate all providers in a configuration
   */
  static async validateProviders(configs: AIProviderConfig[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    for (const config of configs) {
      try {
        const provider = this.createProvider(config);
        const health = await provider.validateConnection();
        results.set(config.provider, health.healthy);
      } catch (error) {
        results.set(config.provider, false);
      }
    }
    
    return results;
  }

  /**
   * Get available provider types
   */
  static getAvailableProviders(): Array<"openai" | "anthropic" | "google" | "local"> {
    return ["openai", "anthropic", "google"];
  }
}
