/**
 * OpenAI Provider Implementation
 */

import { AIProvider, AIProviderConfig, AIMessage, AIOptions, AIResponse, AIProviderHealth } from "./AIProvider";

export class OpenAIProvider implements AIProvider {
  readonly name = "OpenAI";
  readonly config: AIProviderConfig;

  private readonly baseUrl = "https://api.openai.com/v1";
  
  private readonly models = [
    "gpt-5-2025-08-07",
    "gpt-5-mini-2025-08-07",
    "gpt-5-nano-2025-08-07",
    "gpt-4.1-2025-04-14",
    "gpt-4.1-mini-2025-04-14",
    "o3-2025-04-16",
    "o4-mini-2025-04-16",
    "gpt-4o",
    "gpt-4o-mini"
  ];

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  async chat(messages: AIMessage[], options: AIOptions = {}): Promise<AIResponse> {
    const model = options.model || this.config.defaultModel || this.getDefaultModel();
    
    // Newer models (GPT-5, O3, O4) use max_completion_tokens and don't support temperature
    const isNewerModel = model.startsWith("gpt-5") || model.startsWith("o3") || model.startsWith("o4");
    
    const requestBody: any = {
      model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
    };

    // Use appropriate token parameter
    if (options.maxTokens) {
      if (isNewerModel) {
        requestBody.max_completion_tokens = options.maxTokens;
      } else {
        requestBody.max_tokens = options.maxTokens;
      }
    }

    // Only add temperature for older models
    if (!isNewerModel && options.temperature !== undefined) {
      requestBody.temperature = options.temperature;
    }

    if (options.tools) {
      requestBody.tools = options.tools;
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens || 0,
      },
      finishReason: data.choices[0].finish_reason,
    };
  }

  async validateConnection(): Promise<AIProviderHealth> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
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

      const data = await response.json();
      const availableModels = data.data?.map((m: any) => m.id) || [];

      return {
        healthy: true,
        provider: this.name,
        latencyMs,
        availableModels: availableModels.filter((id: string) => 
          this.models.some(model => id.includes(model.split('-')[0]))
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
    return "gpt-5-2025-08-07";
  }
}
