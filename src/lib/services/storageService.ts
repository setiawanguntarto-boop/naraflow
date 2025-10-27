/**
 * Storage Service Implementation
 * Provides unified interface for persistence (IndexedDB, localStorage, or API)
 */

import { StorageService } from '@/core/nodeLibrary_v3';

export class StorageServiceProvider implements StorageService {
  private storage: 'indexeddb' | 'localStorage' | 'api';
  private dbName: string;
  private endpoint?: string;
  private db?: IDBDatabase;
  
  constructor(storage: 'indexeddb' | 'localStorage' | 'api' = 'indexeddb', dbName: string = 'naraflow', endpoint?: string) {
    this.storage = storage;
    this.dbName = dbName;
    this.endpoint = endpoint;
  }
  
  async get(key: string): Promise<any> {
    switch (this.storage) {
      case 'indexeddb':
        return this.getFromIndexedDB(key);
      case 'localStorage':
        return this.getFromLocalStorage(key);
      case 'api':
        return this.getFromAPI(key);
      default:
        throw new Error(`Unsupported storage type: ${this.storage}`);
    }
  }
  
  async set(key: string, value: any): Promise<void> {
    switch (this.storage) {
      case 'indexeddb':
        return this.setToIndexedDB(key, value);
      case 'localStorage':
        return this.setToLocalStorage(key, value);
      case 'api':
        return this.setToAPI(key, value);
      default:
        throw new Error(`Unsupported storage type: ${this.storage}`);
    }
  }
  
  private async getFromIndexedDB(key: string): Promise<any> {
    if (!this.db) {
      await this.initIndexedDB();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['memory'], 'readonly');
      const store = transaction.objectStore('memory');
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }
  
  private async setToIndexedDB(key: string, value: any): Promise<void> {
    if (!this.db) {
      await this.initIndexedDB();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['memory'], 'readwrite');
      const store = transaction.objectStore('memory');
      const request = store.put({ key, value, timestamp: Date.now() });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('memory')) {
          db.createObjectStore('memory', { keyPath: 'key' });
        }
      };
    });
  }
  
  private async getFromLocalStorage(key: string): Promise<any> {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  }
  
  private async setToLocalStorage(key: string, value: any): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }
  
  private async getFromAPI(key: string): Promise<any> {
    if (!this.endpoint) {
      throw new Error('API endpoint not configured');
    }
    
    const response = await fetch(`${this.endpoint}/memory/${encodeURIComponent(key)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  private async setToAPI(key: string, value: any): Promise<void> {
    if (!this.endpoint) {
      throw new Error('API endpoint not configured');
    }
    
    const response = await fetch(`${this.endpoint}/memory/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
  }
}

/**
 * Create storage service instance
 */
export function createStorageService(
  storage: 'indexeddb' | 'localStorage' | 'api' = 'indexeddb',
  dbName?: string,
  endpoint?: string
): StorageService {
  return new StorageServiceProvider(storage, dbName, endpoint);
}

