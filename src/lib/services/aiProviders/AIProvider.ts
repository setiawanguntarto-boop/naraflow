/**
 * AI Provider Interface
 * Unified abstraction for different LLM providers
 */

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: any[];
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface AIProviderConfig {
  provider: "openai" | "anthropic" | "google" | "local";
  apiKey: string;
  endpoint?: string;
  defaultModel?: string;
}

export interface AIProviderHealth {
  healthy: boolean;
  provider: string;
  latencyMs?: number;
  availableModels?: string[];
  error?: string;
}

/**
 * Base AI Provider Interface
 * All providers must implement this interface
 */
export interface AIProvider {
  readonly name: string;
  readonly config: AIProviderConfig;
  
  /**
   * Send a chat completion request
   */
  chat(messages: AIMessage[], options?: AIOptions): Promise<AIResponse>;
  
  /**
   * Validate provider connection and API key
   */
  validateConnection(): Promise<AIProviderHealth>;
  
  /**
   * Get available models for this provider
   */
  getAvailableModels(): Promise<string[]>;
  
  /**
   * Get default model for this provider
   */
  getDefaultModel(): string;
}
