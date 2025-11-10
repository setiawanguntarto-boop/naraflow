/**
 * Anthropic Provider Implementation
 */

import { AIProvider, AIProviderConfig, AIMessage, AIOptions, AIResponse, AIProviderHealth } from "./AIProvider";

export class AnthropicProvider implements AIProvider {
  readonly name = "Anthropic";
  readonly config: AIProviderConfig;

  private readonly baseUrl = "https://api.anthropic.com/v1";
  
  private readonly models = [
    "claude-sonnet-4-5",
    "claude-opus-4-1-20250805",
    "claude-sonnet-4-20250514",
    "claude-3-7-sonnet-20250219",
    "claude-3-5-haiku-20241022"
  ];

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  async chat(messages: AIMessage[], options: AIOptions = {}): Promise<AIResponse> {
    const model = options.model || this.config.defaultModel || this.getDefaultModel();
    
    // Separate system messages from conversation
    const systemMessages = messages.filter(m => m.role === "system");
    const conversationMessages = messages.filter(m => m.role !== "system");
    
    const requestBody: any = {
      model,
      messages: conversationMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: options.maxTokens || 4096,
    };

    // Add system prompt if exists
    if (systemMessages.length > 0) {
      requestBody.system = systemMessages.map(m => m.content).join("\n\n");
    }

    if (options.temperature !== undefined) {
      requestBody.temperature = options.temperature;
    }

    if (options.tools) {
      requestBody.tools = options.tools;
    }

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    return {
      content: data.content[0].text,
      model: data.model,
      usage: {
        promptTokens: data.usage?.input_tokens,
        completionTokens: data.usage?.output_tokens,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
      finishReason: data.stop_reason,
    };
  }

  async validateConnection(): Promise<AIProviderHealth> {
    const startTime = Date.now();
    
    try {
      // Test with a minimal request
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.getDefaultModel(),
          messages: [{ role: "user", content: "test" }],
          max_tokens: 1,
        }),
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        return {
          healthy: false,
          provider: this.name,
          latencyMs,
          error: `API error (${response.status}): ${errorText}`,
        };
      }

      return {
        healthy: true,
        provider: this.name,
        latencyMs,
        availableModels: this.models,
      };
    } catch (error: any) {
      return {
        healthy: false,
        provider: this.name,
        latencyMs: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  async getAvailableModels(): Promise<string[]> {
    return this.models;
  }

  getDefaultModel(): string {
    return "claude-sonnet-4-5";
  }
}
