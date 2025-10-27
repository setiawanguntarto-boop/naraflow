/**
 * Logger Service Implementation
 * Provides unified logging interface
 */

import { Logger } from '@/core/nodeLibrary_v3';

export class LoggerService implements Logger {
  private prefix: string;
  private level: 'info' | 'warn' | 'error' | 'debug';
  
  constructor(prefix: string = 'Naraflow', level: 'info' | 'warn' | 'error' | 'debug' = 'info') {
    this.prefix = prefix;
    this.level = level;
  }
  
  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(`[${this.prefix}] INFO:`, message, ...args);
    }
  }
  
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[${this.prefix}] WARN:`, message, ...args);
    }
  }
  
  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`[${this.prefix}] ERROR:`, message, ...args);
    }
  }
  
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(`[${this.prefix}] DEBUG:`, message, ...args);
    }
  }
  
  private shouldLog(level: string): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level as keyof typeof levels] >= levels[this.level];
  }
}

/**
 * Create logger service instance
 */
export function createLoggerService(prefix?: string, level?: 'info' | 'warn' | 'error' | 'debug'): Logger {
  return new LoggerService(prefix, level);
}

