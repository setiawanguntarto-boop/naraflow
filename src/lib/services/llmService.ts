/**
 * LLM Service Implementation
 * Provides unified interface for different LLM providers
 */

import { LLMService } from '@/core/nodeLibrary_v3';

export class LLMServiceProvider implements LLMService {
  private provider: 'openai' | 'google' | 'local';
  private apiKey: string;
  private endpoint?: string;
  
  constructor(provider: 'openai' | 'google' | 'local', apiKey: string, endpoint?: string) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.endpoint = endpoint;
  }
  
  async chat(messages: any[], options: any): Promise<any> {
    switch (this.provider) {
      case 'openai':
        return this.callOpenAI(messages, options);
      case 'google':
        return this.callGoogleAI(messages, options);
      case 'local':
        return this.callLocal(messages, options);
      default:
        throw new Error(`Unsupported LLM provider: ${this.provider}`);
    }
  }
  
  private async callOpenAI(messages: any[], options: any): Promise<any> {
    const url = 'https://api.openai.com/v1/chat/completions';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: options.model || 'gpt-4o',
        messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        tools: options.tools
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    };
  }
  
  private async callGoogleAI(messages: any[], options: any): Promise<any> {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    const response = await fetch(`${url}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: messages.map(msg => ({
          role: msg.role === 'system' ? 'user' : msg.role,
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          temperature: options.temperature,
          maxOutputTokens: options.maxTokens
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      content: data.candidates[0].content.parts[0].text,
      model: 'gemini-pro',
      usage: data.usageMetadata
    };
  }
  
  private async callLocal(messages: any[], options: any): Promise<any> {
    if (!this.endpoint) {
      throw new Error('Local LLM endpoint not configured');
    }
    
    const response = await fetch(`${this.endpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: messages[messages.length - 1].content,
        max_tokens: options.maxTokens || 512,
        temperature: options.temperature
      })
    });
    
    if (!response.ok) {
      throw new Error(`Local LLM error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      content: data.response || data.text || '',
      model: 'local',
      usage: { total_tokens: data.tokens || 0 }
    };
  }
}

/**
 * Create LLM service instance
 */
export function createLLMService(
  provider: 'openai' | 'google' | 'local',
  apiKey: string,
  endpoint?: string
): LLMService {
  return new LLMServiceProvider(provider, apiKey, endpoint);
}

