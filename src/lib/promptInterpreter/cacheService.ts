/**
 * Cache Service for LLM Caching
 * Provides efficient caching for prompt interpretations and entity extractions
 */

import { ExtractedEntity } from './types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class PromptCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number = 100;
  private ttl: number = 3600000; // 1 hour in milliseconds

  /**
   * Get cached value
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * Set cached value
   */
  set<T>(key: string, data: T, customTTL?: number): void {
    const now = Date.now();
    const ttl = customTTL || this.ttl;
    
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Clear specific key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    
    this.cache.forEach((entry) => {
      if (now > entry.expiresAt) {
        expired++;
      }
    });
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expired,
      valid: this.cache.size - expired
    };
  }

  /**
   * Clean expired entries
   */
  cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;
    
    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    });
    
    return cleaned;
  }
}

// Singleton instance
export const promptCache = new PromptCache();

/**
 * Generate cache key from prompt and options
 */
export function generateCacheKey(prompt: string, options?: any): string {
  const normalized = prompt.toLowerCase().trim().replace(/\s+/g, ' ');
  const optionsStr = options ? JSON.stringify(options) : '';
  return `prompt:${normalized}:${optionsStr}`;
}

/**
 * Cache entity extraction results
 */
export function cacheEntityExtraction(
  prompt: string,
  intentType: string,
  entities: ExtractedEntity[]
): void {
  const key = `entity:${intentType}:${prompt}`;
  promptCache.set(key, entities, 7200000); // 2 hours for entity extraction
}

/**
 * Get cached entity extraction
 */
export function getCachedEntityExtraction(
  prompt: string,
  intentType: string
): ExtractedEntity[] | null {
  const key = `entity:${intentType}:${prompt}`;
  return promptCache.get(key);
}

/**
 * Cache workflow generation results
 */
export function cacheWorkflowGeneration(
  prompt: string,
  workflow: any
): void {
  const key = `workflow:${prompt}`;
  promptCache.set(key, workflow, 3600000); // 1 hour for full workflows
}

/**
 * Get cached workflow generation
 */
export function getCachedWorkflowGeneration(prompt: string): any | null {
  const key = `workflow:${prompt}`;
  return promptCache.get(key);
}

/**
 * Cleanup expired entries periodically
 */
export function startCacheCleanup(intervalMs: number = 600000) {
  // Run cleanup every 10 minutes
  setInterval(() => {
    const cleaned = promptCache.cleanExpired();
    if (cleaned > 0) {
      console.log(`Cache cleanup: removed ${cleaned} expired entries`);
    }
  }, intervalMs);
}

// Auto-start cache cleanup
startCacheCleanup();
