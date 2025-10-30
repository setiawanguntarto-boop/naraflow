/**
 * Google AI Provider Implementation
 */

import { AIProvider, AIProviderConfig, AIMessage, AIOptions, AIResponse, AIProviderHealth } from "./AIProvider";

export class GoogleAIProvider implements AIProvider {
  readonly name = "Google AI";
  readonly config: AIProviderConfig;

  private readonly baseUrl = "https://generativelanguage.googleapis.com/v1beta";
  
  private readonly models = [
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-pro",
    "gemini-pro-vision"
  ];

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  async chat(messages: AIMessage[], options: AIOptions = {}): Promise<AIResponse> {
    const model = options.model || this.config.defaultModel || this.getDefaultModel();
    
    const requestBody: any = {
      contents: messages.map(msg => ({
        role: msg.role === "system" ? "user" : msg.role === "assistant" ? "model" : msg.role,
        parts: [{ text: msg.content }],
      })),
      generationConfig: {},
    };

    if (options.temperature !== undefined) {
      requestBody.generationConfig.temperature = options.temperature;
    }

    if (options.maxTokens) {
      requestBody.generationConfig.maxOutputTokens = options.maxTokens;
    }

    const response = await fetch(
      `${this.baseUrl}/models/${model}:generateContent?key=${this.config.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google AI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Google AI");
    }

    const candidate = data.candidates[0];
    
    return {
      content: candidate.content.parts[0].text,
      model: model,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount,
        completionTokens: data.usageMetadata?.candidatesTokenCount,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
      finishReason: candidate.finishReason,
    };
  }

  async validateConnection(): Promise<AIProviderHealth> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(
        `${this.baseUrl}/models?key=${this.config.apiKey}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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

      const data = await response.json();
      const availableModels = data.models?.map((m: any) => m.name.replace("models/", "")) || [];

      return {
        healthy: true,
        provider: this.name,
        latencyMs,
        availableModels: availableModels.filter((id: string) => 
          this.models.some(model => id.includes(model))
        ),
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
    return "gemini-2.5-flash";
  }
}
