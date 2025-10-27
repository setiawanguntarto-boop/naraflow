/**
 * HTTP Service Implementation
 * Provides unified interface for making HTTP requests
 */

import { HttpService } from '@/core/nodeLibrary_v3';

export class HttpServiceProvider implements HttpService {
  private baseURL?: string;
  private headers: Record<string, string>;
  
  constructor(baseURL?: string, headers?: Record<string, string>) {
    this.baseURL = baseURL;
    this.headers = headers || {};
  }
  
  async get(url: string, options?: any): Promise<any> {
    const fullURL = this.baseURL ? `${this.baseURL}${url}` : url;
    
    const response = await fetch(fullURL, {
      method: 'GET',
      headers: {
        ...this.headers,
        ...options?.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP GET error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async post(url: string, data: any, options?: any): Promise<any> {
    const fullURL = this.baseURL ? `${this.baseURL}${url}` : url;
    
    const response = await fetch(fullURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
        ...options?.headers
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP POST error: ${response.statusText}`);
    }
    
    return response.json();
  }
}

/**
 * Create HTTP service instance
 */
export function createHttpService(baseURL?: string, headers?: Record<string, string>): HttpService {
  return new HttpServiceProvider(baseURL, headers);
}

