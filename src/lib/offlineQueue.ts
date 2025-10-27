import { Node, Edge } from "@xyflow/react";
import { ExecutionResult } from "@/types/workflow";

export interface OfflineExecution {
  id: string;
  sessionId: string;
  nodes: Node[];
  edges: Edge[];
  startNodeId: string;
  llamaConfig?: any;
  timestamp: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: ExecutionResult;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface OfflineTemplateOperation {
  id: string;
  type: "save" | "load" | "delete" | "duplicate" | "export" | "import";
  data: any;
  timestamp: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: any;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface OfflineQueueStats {
  totalExecutions: number;
  pendingExecutions: number;
  completedExecutions: number;
  failedExecutions: number;
  totalTemplateOperations: number;
  pendingTemplateOperations: number;
  completedTemplateOperations: number;
  failedTemplateOperations: number;
  oldestPendingItem: string | null;
  queueSize: number;
}

export class OfflineQueue {
  private static readonly DB_NAME = "NaraflowOfflineQueue";
  private static readonly DB_VERSION = 1;
  private static readonly EXECUTIONS_STORE = "executions";
  private static readonly TEMPLATE_OPERATIONS_STORE = "templateOperations";

  private db: IDBDatabase | null = null;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private syncCallbacks: Set<() => void> = new Set();

  constructor() {
    this.initDatabase();
    this.setupEventListeners();
  }

  /**
   * Initialize IndexedDB
   */
  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(OfflineQueue.DB_NAME, OfflineQueue.DB_VERSION);

      request.onerror = () => {
        console.error("Failed to open IndexedDB:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("OfflineQueue: IndexedDB initialized");
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create executions store
        if (!db.objectStoreNames.contains(OfflineQueue.EXECUTIONS_STORE)) {
          const executionsStore = db.createObjectStore(OfflineQueue.EXECUTIONS_STORE, {
            keyPath: "id",
          });
          executionsStore.createIndex("sessionId", "sessionId", { unique: false });
          executionsStore.createIndex("status", "status", { unique: false });
          executionsStore.createIndex("timestamp", "timestamp", { unique: false });
        }

        // Create template operations store
        if (!db.objectStoreNames.contains(OfflineQueue.TEMPLATE_OPERATIONS_STORE)) {
          const templateOperationsStore = db.createObjectStore(
            OfflineQueue.TEMPLATE_OPERATIONS_STORE,
            { keyPath: "id" }
          );
          templateOperationsStore.createIndex("type", "type", { unique: false });
          templateOperationsStore.createIndex("status", "status", { unique: false });
          templateOperationsStore.createIndex("timestamp", "timestamp", { unique: false });
        }
      };
    });
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Online/offline events
    window.addEventListener("online", () => {
      console.log("OfflineQueue: Back online, starting sync");
      this.isOnline = true;
      this.syncPendingItems();
    });

    window.addEventListener("offline", () => {
      console.log("OfflineQueue: Gone offline");
      this.isOnline = false;
    });

    // Visibility change (when user returns to tab)
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && this.isOnline) {
        this.syncPendingItems();
      }
    });

    // Periodic sync (every 30 seconds when online)
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncPendingItems();
      }
    }, 30000);
  }

  /**
   * Queue workflow execution for offline processing
   */
  async queueExecution(
    sessionId: string,
    nodes: Node[],
    edges: Edge[],
    startNodeId: string = "start",
    llamaConfig?: any
  ): Promise<string> {
    const execution: OfflineExecution = {
      id: this.generateId(),
      sessionId,
      nodes,
      edges,
      startNodeId,
      llamaConfig,
      timestamp: new Date().toISOString(),
      status: "pending",
      retryCount: 0,
      maxRetries: 3,
    };

    await this.addExecution(execution);

    // Try to process immediately if online
    if (this.isOnline) {
      this.processExecution(execution.id);
    }

    return execution.id;
  }

  /**
   * Queue template operation for offline processing
   */
  async queueTemplateOperation(type: OfflineTemplateOperation["type"], data: any): Promise<string> {
    const operation: OfflineTemplateOperation = {
      id: this.generateId(),
      type,
      data,
      timestamp: new Date().toISOString(),
      status: "pending",
      retryCount: 0,
      maxRetries: 3,
    };

    await this.addTemplateOperation(operation);

    // Try to process immediately if online
    if (this.isOnline) {
      this.processTemplateOperation(operation.id);
    }

    return operation.id;
  }

  /**
   * Get execution by ID
   */
  async getExecution(executionId: string): Promise<OfflineExecution | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([OfflineQueue.EXECUTIONS_STORE], "readonly");
      const store = transaction.objectStore(OfflineQueue.EXECUTIONS_STORE);
      const request = store.get(executionId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get template operation by ID
   */
  async getTemplateOperation(operationId: string): Promise<OfflineTemplateOperation | null> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [OfflineQueue.TEMPLATE_OPERATIONS_STORE],
        "readonly"
      );
      const store = transaction.objectStore(OfflineQueue.TEMPLATE_OPERATIONS_STORE);
      const request = store.get(operationId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pending executions
   */
  async getPendingExecutions(): Promise<OfflineExecution[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([OfflineQueue.EXECUTIONS_STORE], "readonly");
      const store = transaction.objectStore(OfflineQueue.EXECUTIONS_STORE);
      const index = store.index("status");
      const request = index.getAll("pending");

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pending template operations
   */
  async getPendingTemplateOperations(): Promise<OfflineTemplateOperation[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [OfflineQueue.TEMPLATE_OPERATIONS_STORE],
        "readonly"
      );
      const store = transaction.objectStore(OfflineQueue.TEMPLATE_OPERATIONS_STORE);
      const index = store.index("status");
      const request = index.getAll("pending");

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<OfflineQueueStats> {
    const [executions, templateOperations] = await Promise.all([
      this.getAllExecutions(),
      this.getAllTemplateOperations(),
    ]);

    const pendingExecutions = executions.filter(e => e.status === "pending");
    const completedExecutions = executions.filter(e => e.status === "completed");
    const failedExecutions = executions.filter(e => e.status === "failed");

    const pendingTemplateOperations = templateOperations.filter(o => o.status === "pending");
    const completedTemplateOperations = templateOperations.filter(o => o.status === "completed");
    const failedTemplateOperations = templateOperations.filter(o => o.status === "failed");

    const oldestPendingItem =
      [...pendingExecutions, ...pendingTemplateOperations].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )[0]?.id || null;

    return {
      totalExecutions: executions.length,
      pendingExecutions: pendingExecutions.length,
      completedExecutions: completedExecutions.length,
      failedExecutions: failedExecutions.length,
      totalTemplateOperations: templateOperations.length,
      pendingTemplateOperations: pendingTemplateOperations.length,
      completedTemplateOperations: completedTemplateOperations.length,
      failedTemplateOperations: failedTemplateOperations.length,
      oldestPendingItem,
      queueSize: pendingExecutions.length + pendingTemplateOperations.length,
    };
  }

  /**
   * Clear completed items
   */
  async clearCompletedItems(): Promise<void> {
    await Promise.all([this.clearCompletedExecutions(), this.clearCompletedTemplateOperations()]);
  }

  /**
   * Clear all items
   */
  async clearAllItems(): Promise<void> {
    await Promise.all([this.clearAllExecutions(), this.clearAllTemplateOperations()]);
  }

  /**
   * Sync pending items when back online
   */
  async syncPendingItems(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;
    console.log("OfflineQueue: Starting sync of pending items");

    try {
      // Sync executions
      const pendingExecutions = await this.getPendingExecutions();
      for (const execution of pendingExecutions) {
        await this.processExecution(execution.id);
      }

      // Sync template operations
      const pendingTemplateOperations = await this.getPendingTemplateOperations();
      for (const operation of pendingTemplateOperations) {
        await this.processTemplateOperation(operation.id);
      }

      // Notify callbacks
      this.syncCallbacks.forEach(callback => callback());
    } catch (error) {
      console.error("OfflineQueue: Sync failed", error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Add sync callback
   */
  onSync(callback: () => void): () => void {
    this.syncCallbacks.add(callback);
    return () => this.syncCallbacks.delete(callback);
  }

  /**
   * Check if online
   */
  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Process execution
   */
  private async processExecution(executionId: string): Promise<void> {
    const execution = await this.getExecution(executionId);
    if (!execution || execution.status !== "pending") return;

    try {
      // Update status to processing
      await this.updateExecutionStatus(executionId, "processing");

      // Simulate execution (in real implementation, this would call the actual execution engine)
      const result = await this.simulateExecution(execution);

      // Update with result
      await this.updateExecutionResult(executionId, result, "completed");
    } catch (error) {
      console.error("OfflineQueue: Execution failed", executionId, error);

      const newRetryCount = execution.retryCount + 1;
      if (newRetryCount >= execution.maxRetries) {
        await this.updateExecutionError(
          executionId,
          error instanceof Error ? error.message : "Unknown error",
          "failed"
        );
      } else {
        await this.updateExecutionRetryCount(executionId, newRetryCount);
        await this.updateExecutionStatus(executionId, "pending");
      }
    }
  }

  /**
   * Process template operation
   */
  private async processTemplateOperation(operationId: string): Promise<void> {
    const operation = await this.getTemplateOperation(operationId);
    if (!operation || operation.status !== "pending") return;

    try {
      // Update status to processing
      await this.updateTemplateOperationStatus(operationId, "processing");

      // Simulate operation (in real implementation, this would call the actual template manager)
      const result = await this.simulateTemplateOperation(operation);

      // Update with result
      await this.updateTemplateOperationResult(operationId, result, "completed");
    } catch (error) {
      console.error("OfflineQueue: Template operation failed", operationId, error);

      const newRetryCount = operation.retryCount + 1;
      if (newRetryCount >= operation.maxRetries) {
        await this.updateTemplateOperationError(
          operationId,
          error instanceof Error ? error.message : "Unknown error",
          "failed"
        );
      } else {
        await this.updateTemplateOperationRetryCount(operationId, newRetryCount);
        await this.updateTemplateOperationStatus(operationId, "pending");
      }
    }
  }

  /**
   * Simulate execution (placeholder)
   */
  private async simulateExecution(execution: OfflineExecution): Promise<ExecutionResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulate success/failure
    if (Math.random() < 0.1) {
      // 10% failure rate
      throw new Error("Simulated execution failure");
    }

    return {
      outputs: new Map(),
      logs: [
        {
          timestamp: new Date(),
          level: "info",
          message: `Offline execution completed for session ${execution.sessionId}`,
          nodeId: "offline-queue",
        },
      ],
    };
  }

  /**
   * Simulate template operation (placeholder)
   */
  private async simulateTemplateOperation(operation: OfflineTemplateOperation): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Simulate success/failure
    if (Math.random() < 0.05) {
      // 5% failure rate
      throw new Error("Simulated template operation failure");
    }

    return { success: true, operation: operation.type };
  }

  // Database helper methods
  private async addExecution(execution: OfflineExecution): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([OfflineQueue.EXECUTIONS_STORE], "readwrite");
      const store = transaction.objectStore(OfflineQueue.EXECUTIONS_STORE);
      const request = store.add(execution);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async addTemplateOperation(operation: OfflineTemplateOperation): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [OfflineQueue.TEMPLATE_OPERATIONS_STORE],
        "readwrite"
      );
      const store = transaction.objectStore(OfflineQueue.TEMPLATE_OPERATIONS_STORE);
      const request = store.add(operation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async updateExecutionStatus(
    executionId: string,
    status: OfflineExecution["status"]
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const execution = await this.getExecution(executionId);
    if (!execution) return;

    execution.status = status;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([OfflineQueue.EXECUTIONS_STORE], "readwrite");
      const store = transaction.objectStore(OfflineQueue.EXECUTIONS_STORE);
      const request = store.put(execution);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async updateExecutionResult(
    executionId: string,
    result: ExecutionResult,
    status: OfflineExecution["status"]
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const execution = await this.getExecution(executionId);
    if (!execution) return;

    execution.result = result;
    execution.status = status;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([OfflineQueue.EXECUTIONS_STORE], "readwrite");
      const store = transaction.objectStore(OfflineQueue.EXECUTIONS_STORE);
      const request = store.put(execution);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async updateExecutionError(
    executionId: string,
    error: string,
    status: OfflineExecution["status"]
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const execution = await this.getExecution(executionId);
    if (!execution) return;

    execution.error = error;
    execution.status = status;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([OfflineQueue.EXECUTIONS_STORE], "readwrite");
      const store = transaction.objectStore(OfflineQueue.EXECUTIONS_STORE);
      const request = store.put(execution);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async updateExecutionRetryCount(executionId: string, retryCount: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const execution = await this.getExecution(executionId);
    if (!execution) return;

    execution.retryCount = retryCount;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([OfflineQueue.EXECUTIONS_STORE], "readwrite");
      const store = transaction.objectStore(OfflineQueue.EXECUTIONS_STORE);
      const request = store.put(execution);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async updateTemplateOperationStatus(
    operationId: string,
    status: OfflineTemplateOperation["status"]
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const operation = await this.getTemplateOperation(operationId);
    if (!operation) return;

    operation.status = status;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [OfflineQueue.TEMPLATE_OPERATIONS_STORE],
        "readwrite"
      );
      const store = transaction.objectStore(OfflineQueue.TEMPLATE_OPERATIONS_STORE);
      const request = store.put(operation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async updateTemplateOperationResult(
    operationId: string,
    result: any,
    status: OfflineTemplateOperation["status"]
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const operation = await this.getTemplateOperation(operationId);
    if (!operation) return;

    operation.result = result;
    operation.status = status;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [OfflineQueue.TEMPLATE_OPERATIONS_STORE],
        "readwrite"
      );
      const store = transaction.objectStore(OfflineQueue.TEMPLATE_OPERATIONS_STORE);
      const request = store.put(operation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async updateTemplateOperationError(
    operationId: string,
    error: string,
    status: OfflineTemplateOperation["status"]
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const operation = await this.getTemplateOperation(operationId);
    if (!operation) return;

    operation.error = error;
    operation.status = status;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [OfflineQueue.TEMPLATE_OPERATIONS_STORE],
        "readwrite"
      );
      const store = transaction.objectStore(OfflineQueue.TEMPLATE_OPERATIONS_STORE);
      const request = store.put(operation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async updateTemplateOperationRetryCount(
    operationId: string,
    retryCount: number
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const operation = await this.getTemplateOperation(operationId);
    if (!operation) return;

    operation.retryCount = retryCount;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [OfflineQueue.TEMPLATE_OPERATIONS_STORE],
        "readwrite"
      );
      const store = transaction.objectStore(OfflineQueue.TEMPLATE_OPERATIONS_STORE);
      const request = store.put(operation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getAllExecutions(): Promise<OfflineExecution[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([OfflineQueue.EXECUTIONS_STORE], "readonly");
      const store = transaction.objectStore(OfflineQueue.EXECUTIONS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAllTemplateOperations(): Promise<OfflineTemplateOperation[]> {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [OfflineQueue.TEMPLATE_OPERATIONS_STORE],
        "readonly"
      );
      const store = transaction.objectStore(OfflineQueue.TEMPLATE_OPERATIONS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private async clearCompletedExecutions(): Promise<void> {
    if (!this.db) return;

    const executions = await this.getAllExecutions();
    const completedExecutions = executions.filter(e => e.status === "completed");

    for (const execution of completedExecutions) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([OfflineQueue.EXECUTIONS_STORE], "readwrite");
        const store = transaction.objectStore(OfflineQueue.EXECUTIONS_STORE);
        const request = store.delete(execution.id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  private async clearCompletedTemplateOperations(): Promise<void> {
    if (!this.db) return;

    const operations = await this.getAllTemplateOperations();
    const completedOperations = operations.filter(o => o.status === "completed");

    for (const operation of completedOperations) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction(
          [OfflineQueue.TEMPLATE_OPERATIONS_STORE],
          "readwrite"
        );
        const store = transaction.objectStore(OfflineQueue.TEMPLATE_OPERATIONS_STORE);
        const request = store.delete(operation.id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  private async clearAllExecutions(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([OfflineQueue.EXECUTIONS_STORE], "readwrite");
      const store = transaction.objectStore(OfflineQueue.EXECUTIONS_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async clearAllTemplateOperations(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [OfflineQueue.TEMPLATE_OPERATIONS_STORE],
        "readwrite"
      );
      const store = transaction.objectStore(OfflineQueue.TEMPLATE_OPERATIONS_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
