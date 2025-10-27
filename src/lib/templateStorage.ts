import { TemplateData, TemplateMetadata } from "./templateManager";

export interface StorageAdapter {
  save(template: TemplateData): Promise<void>;
  load(id: string): Promise<TemplateData | null>;
  list(): Promise<TemplateMetadata[]>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

export class LocalStorageAdapter implements StorageAdapter {
  private readonly prefix = "naraflow_template_";
  private readonly indexKey = "naraflow_templates_index";

  async save(template: TemplateData): Promise<void> {
    try {
      const key = this.prefix + template.metadata.id;
      const data = JSON.stringify(template);

      // Check size limit (5MB for localStorage)
      if (data.length > 5 * 1024 * 1024) {
        throw new Error("Template too large for localStorage");
      }

      localStorage.setItem(key, data);
      await this.updateIndex(template.metadata);
    } catch (error) {
      throw new Error(
        `Failed to save template: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async load(id: string): Promise<TemplateData | null> {
    try {
      const key = this.prefix + id;
      const data = localStorage.getItem(key);

      if (!data) {
        return null;
      }

      return JSON.parse(data);
    } catch (error) {
      console.error("Failed to load template:", error);
      return null;
    }
  }

  async list(): Promise<TemplateMetadata[]> {
    try {
      const indexData = localStorage.getItem(this.indexKey);
      if (!indexData) {
        return [];
      }

      const index = JSON.parse(indexData);
      return Object.values(index) as TemplateMetadata[];
    } catch (error) {
      console.error("Failed to list templates:", error);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const key = this.prefix + id;
      localStorage.removeItem(key);
      await this.removeFromIndex(id);
    } catch (error) {
      throw new Error(
        `Failed to delete template: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async exists(id: string): Promise<boolean> {
    const key = this.prefix + id;
    return localStorage.getItem(key) !== null;
  }

  private async updateIndex(metadata: TemplateMetadata): Promise<void> {
    try {
      const indexData = localStorage.getItem(this.indexKey);
      const index = indexData ? JSON.parse(indexData) : {};

      index[metadata.id] = metadata;
      localStorage.setItem(this.indexKey, JSON.stringify(index));
    } catch (error) {
      console.error("Failed to update template index:", error);
    }
  }

  private async removeFromIndex(id: string): Promise<void> {
    try {
      const indexData = localStorage.getItem(this.indexKey);
      if (!indexData) return;

      const index = JSON.parse(indexData);
      delete index[id];
      localStorage.setItem(this.indexKey, JSON.stringify(index));
    } catch (error) {
      console.error("Failed to remove template from index:", error);
    }
  }
}

export class IndexedDBAdapter implements StorageAdapter {
  private readonly dbName = "NaraflowTemplates";
  private readonly storeName = "templates";
  private readonly version = 1;

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "metadata.id" });
          store.createIndex("category", "metadata.category", { unique: false });
          store.createIndex("createdAt", "metadata.createdAt", { unique: false });
        }
      };
    });
  }

  async save(template: TemplateData): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      await new Promise<void>((resolve, reject) => {
        const request = store.put(template);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      throw new Error(
        `Failed to save template: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async load(id: string): Promise<TemplateData | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);

      return new Promise<TemplateData | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Failed to load template:", error);
      return null;
    }
  }

  async list(): Promise<TemplateMetadata[]> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);

      return new Promise<TemplateMetadata[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const templates = request.result as TemplateData[];
          const metadata = templates.map(t => t.metadata);
          resolve(metadata);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Failed to list templates:", error);
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      throw new Error(
        `Failed to delete template: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const template = await this.load(id);
      return template !== null;
    } catch (error) {
      return false;
    }
  }
}

export class TemplateStorage {
  private localStorageAdapter: LocalStorageAdapter;
  private indexedDBAdapter: IndexedDBAdapter;
  private useIndexedDB: boolean = false;

  constructor() {
    this.localStorageAdapter = new LocalStorageAdapter();
    this.indexedDBAdapter = new IndexedDBAdapter();

    // Check if IndexedDB is available
    this.checkIndexedDBSupport();
  }

  private async checkIndexedDBSupport(): Promise<void> {
    try {
      if ("indexedDB" in window) {
        // Test IndexedDB availability
        await this.indexedDBAdapter.list();
        this.useIndexedDB = true;
      }
    } catch (error) {
      console.warn("IndexedDB not available, falling back to localStorage");
      this.useIndexedDB = false;
    }
  }

  private getAdapter(): StorageAdapter {
    return this.useIndexedDB ? this.indexedDBAdapter : this.localStorageAdapter;
  }

  async saveTemplate(template: TemplateData): Promise<void> {
    const adapter = this.getAdapter();
    await adapter.save(template);
  }

  async loadTemplate(id: string): Promise<TemplateData | null> {
    const adapter = this.getAdapter();
    return await adapter.load(id);
  }

  async listTemplates(): Promise<TemplateMetadata[]> {
    const adapter = this.getAdapter();
    return await adapter.list();
  }

  async deleteTemplate(id: string): Promise<void> {
    const adapter = this.getAdapter();
    await adapter.delete(id);
  }

  async templateExists(id: string): Promise<boolean> {
    const adapter = this.getAdapter();
    return await adapter.exists(id);
  }

  /**
   * Export template to file
   */
  async exportToFile(template: TemplateData, filename?: string): Promise<void> {
    const { TemplateManager } = await import("./templateManager");
    const jsonString = TemplateManager.exportTemplate(template, { includePreview: true });

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `${template.metadata.name.replace(/[^a-z0-9]/gi, "_")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * Import template from file
   */
  async importFromFile(file: File): Promise<TemplateData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async event => {
        try {
          const jsonString = event.target?.result as string;
          const { TemplateManager } = await import("./templateManager");
          const result = TemplateManager.importTemplate(jsonString);

          if (!result.success || !result.template) {
            reject(new Error(result.error || "Failed to import template"));
            return;
          }

          resolve(result.template);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalTemplates: number;
    totalSize: number;
    storageType: "localStorage" | "indexedDB";
    availableSpace: number;
  }> {
    const templates = await this.listTemplates();
    const totalTemplates = templates.length;

    // Estimate total size (rough calculation)
    let totalSize = 0;
    for (const template of templates) {
      totalSize += template.nodeCount * 100 + template.edgeCount * 50; // Rough estimate
    }

    return {
      totalTemplates,
      totalSize,
      storageType: this.useIndexedDB ? "indexedDB" : "localStorage",
      availableSpace: this.useIndexedDB ? -1 : this.getLocalStorageAvailableSpace(), // -1 means unlimited for IndexedDB
    };
  }

  private getLocalStorageAvailableSpace(): number {
    try {
      // Rough estimation of localStorage usage
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length;
        }
      }

      // Most browsers have 5-10MB limit
      const limit = 5 * 1024 * 1024; // 5MB
      return Math.max(0, limit - used);
    } catch (error) {
      return 0;
    }
  }
}
