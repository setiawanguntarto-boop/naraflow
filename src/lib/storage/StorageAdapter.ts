// Storage Adapter Interface
export interface StorageAdapter {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
}

// IndexedDB Adapter Implementation
export class IndexedDBAdapter implements StorageAdapter {
  private dbName: string;
  private dbVersion: number;
  private storeName: string;
  private db: IDBDatabase | null = null;

  constructor(dbName: string = "naraflow-storage", storeName: string = "sessions") {
    this.dbName = dbName;
    this.dbVersion = 1;
    this.storeName = storeName;
  }

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "key" });
        }
      };
    });
  }

  async get(key: string): Promise<any> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : undefined);
      };
    });
  }

  async set(key: string, value: any): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ key, value });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(key: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async keys(): Promise<string[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as string[]);
    });
  }

  async size(): Promise<number> {
    const keys = await this.keys();
    return keys.length;
  }
}

// LocalStorage Adapter Implementation (fallback)
export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;

  constructor(prefix: string = "naraflow_") {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get(key: string): Promise<any> {
    try {
      const value = localStorage.getItem(this.getKey(key));
      return value ? JSON.parse(value) : undefined;
    } catch (error) {
      console.error("LocalStorage get error:", error);
      return undefined;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (error) {
      console.error("LocalStorage set error:", error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error("LocalStorage delete error:", error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error("LocalStorage clear error:", error);
      throw error;
    }
  }

  async keys(): Promise<string[]> {
    try {
      return Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.substring(this.prefix.length));
    } catch (error) {
      console.error("LocalStorage keys error:", error);
      return [];
    }
  }

  async size(): Promise<number> {
    const keys = await this.keys();
    return keys.length;
  }
}

// REST API Adapter Implementation (for future API sync)
export class RESTAdapter implements StorageAdapter {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  async get(key: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/${key}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return undefined;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.value;
    } catch (error) {
      console.error("REST API get error:", error);
      throw error;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/${key}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify({ key, value }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("REST API set error:", error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions/${key}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("REST API delete error:", error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("REST API clear error:", error);
      throw error;
    }
  }

  async keys(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/sessions`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.keys || [];
    } catch (error) {
      console.error("REST API keys error:", error);
      throw error;
    }
  }

  async size(): Promise<number> {
    const keys = await this.keys();
    return keys.length;
  }
}

// Storage Factory
export class StorageFactory {
  static createAdapter(type: "indexeddb" | "localstorage" | "rest", options?: any): StorageAdapter {
    switch (type) {
      case "indexeddb":
        return new IndexedDBAdapter(options?.dbName, options?.storeName);
      case "localstorage":
        return new LocalStorageAdapter(options?.prefix);
      case "rest":
        return new RESTAdapter(options?.baseUrl, options?.apiKey);
      default:
        throw new Error(`Unsupported storage adapter type: ${type}`);
    }
  }

  static async createDefaultAdapter(): Promise<StorageAdapter> {
    // Try IndexedDB first, fallback to LocalStorage
    try {
      if ("indexedDB" in window) {
        const adapter = new IndexedDBAdapter();
        // Test if IndexedDB is available
        await adapter.set("test", "test");
        await adapter.delete("test");
        return adapter;
      }
    } catch (error) {
      console.warn("IndexedDB not available, falling back to LocalStorage:", error);
    }

    return new LocalStorageAdapter();
  }
}
