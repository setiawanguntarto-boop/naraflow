import { Node, Edge } from '@xyflow/react';
import { ExecutionResult, ExecutionContext } from '@/types/workflow';
import { WorkflowEngine } from './workflowEngine';
import { globalCanvasEventBus } from '@/hooks/useCanvasEventBus';

export interface SandboxConfig {
  maxNodes: number;
  maxExecutionTime: number; // in milliseconds
  maxConcurrentExecutions: number;
  maxMemoryUsage: number; // in MB
  enableResourceLimits: boolean;
  workerPoolSize: number; // Number of workers to maintain
}

export interface SandboxExecutionResult extends ExecutionResult {
  sessionId: string;
  executionId: string;
  executionTime: number;
  memoryUsed: number;
  resourceLimitsHit: string[];
  workerId?: string;
  success: boolean;
}

export interface SandboxStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  totalMemoryUsed: number;
  resourceLimitViolations: number;
  activeWorkers: number;
  queuedExecutions: number;
}

// Execution queue item
interface ExecutionQueueItem {
  id: string;
  sessionId: string;
  nodes: Node[];
  edges: Edge[];
  variables: Record<string, any>;
  priority: number;
  createdAt: number;
  timeout: number;
}

// Worker pool management
class WorkerPool {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private busyWorkers: Map<Worker, string> = new Map(); // worker -> executionId
  private maxSize: number;

  constructor(maxSize: number = 3) {
    this.maxSize = maxSize;
    this.initializeWorkers();
  }

  private initializeWorkers() {
    for (let i = 0; i < this.maxSize; i++) {
      try {
        const worker = new Worker(
          new URL('/workers/workflow-executor.js', import.meta.url),
          { type: 'module' }
        );
        this.workers.push(worker);
        this.availableWorkers.push(worker);
      } catch (error) {
        console.error('Failed to create worker:', error);
      }
    }
  }

  async getWorker(): Promise<Worker | null> {
    if (this.availableWorkers.length > 0) {
      const worker = this.availableWorkers.pop()!;
      this.busyWorkers.set(worker, '');
      return worker;
    }
    return null;
  }

  releaseWorker(worker: Worker, executionId: string) {
    this.busyWorkers.delete(worker);
    this.availableWorkers.push(worker);
  }

  assignWorker(worker: Worker, executionId: string) {
    this.busyWorkers.set(worker, executionId);
  }

  getActiveWorkers(): number {
    return this.busyWorkers.size;
  }

  getAvailableWorkers(): number {
    return this.availableWorkers.length;
  }

  replaceWorker(worker: Worker) {
    const index = this.workers.indexOf(worker);
    if (index !== -1) {
      try {
        const newWorker = new Worker(
          new URL('/workers/workflow-executor.js', import.meta.url),
          { type: 'module' }
        );
        this.workers[index] = newWorker;
        this.availableWorkers.push(newWorker);
      } catch (error) {
        console.error('Failed to replace worker:', error);
      }
    }
  }

  terminate() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.availableWorkers = [];
    this.busyWorkers.clear();
  }
}

export class SandboxEngine {
  private static readonly DEFAULT_CONFIG: SandboxConfig = {
    maxNodes: 50,
    maxExecutionTime: 30000, // 30 seconds
    maxConcurrentExecutions: 5,
    maxMemoryUsage: 100, // 100MB
    enableResourceLimits: true,
    workerPoolSize: 3,
  };

  private config: SandboxConfig;
  private workflowEngine: WorkflowEngine;
  private workerPool: WorkerPool;
  private executionQueue: ExecutionQueueItem[] = [];
  private activeExecutions: Map<string, Promise<SandboxExecutionResult>> = new Map();
  private executionResults: Map<string, SandboxExecutionResult> = new Map();
  private executionStats: Map<string, SandboxStats> = new Map();
  private resourceMonitor?: ReturnType<typeof setInterval>;
  private queueProcessor?: ReturnType<typeof setInterval>;
  private executionCounter = 0;

  constructor(config: Partial<SandboxConfig> = {}) {
    this.config = { ...SandboxEngine.DEFAULT_CONFIG, ...config };
    this.workflowEngine = new WorkflowEngine();
    this.workerPool = new WorkerPool(this.config.workerPoolSize);
    this.startResourceMonitoring();
    this.startQueueProcessor();
  }

  /**
   * Execute workflow in sandbox with resource limits
   */
  async executeWorkflow(
    sessionId: string,
    nodes: Node[],
    edges: Edge[],
    variables: Record<string, any> = {},
    priority: number = 0
  ): Promise<SandboxExecutionResult> {
    const executionId = `exec-${++this.executionCounter}-${Date.now()}`;
    
    // Validate resource limits
    const resourceLimitsHit = this.validateResourceLimits(nodes, edges);
    if (resourceLimitsHit.length > 0) {
      throw new Error(`Resource limits exceeded: ${resourceLimitsHit.join(', ')}`);
    }

    // Check if we can execute immediately or need to queue
    if (this.activeExecutions.size >= this.config.maxConcurrentExecutions) {
      return this.enqueueExecution(executionId, sessionId, nodes, edges, variables, priority);
    }

    return this.executeInWorker(executionId, sessionId, nodes, edges, variables);
  }

  // Enqueue execution for later processing
  private async enqueueExecution(
    executionId: string,
    sessionId: string,
    nodes: Node[],
    edges: Edge[],
    variables: Record<string, any>,
    priority: number
  ): Promise<SandboxExecutionResult> {
    const queueItem: ExecutionQueueItem = {
      id: executionId,
      sessionId,
      nodes,
      edges,
      variables,
      priority,
      createdAt: Date.now(),
      timeout: this.config.maxExecutionTime,
    };

    // Insert based on priority (higher priority first)
    const insertIndex = this.executionQueue.findIndex(item => item.priority < priority);
    if (insertIndex === -1) {
      this.executionQueue.push(queueItem);
    } else {
      this.executionQueue.splice(insertIndex, 0, queueItem);
    }

    // Emit queued event
    try {
      globalCanvasEventBus.emit({
        type: 'execution:queued',
        payload: { executionId, sessionId, queuePosition: this.executionQueue.length },
      });
    } catch (err) {
      console.warn('Event bus emit failed:', err);
    }

    // Return a promise that resolves when execution completes
    return new Promise((resolve, reject) => {
      const handleExecutionComplete = (event: any) => {
        if (event.payload.executionId === executionId) {
          globalCanvasEventBus.off('execution:complete', handleExecutionComplete);
          globalCanvasEventBus.off('execution:error', handleExecutionError);
          resolve(event.payload.result);
        }
      };

      const handleExecutionError = (event: any) => {
        if (event.payload.executionId === executionId) {
          globalCanvasEventBus.off('execution:complete', handleExecutionComplete);
          globalCanvasEventBus.off('execution:error', handleExecutionError);
          reject(new Error(event.payload.error));
        }
      };

      globalCanvasEventBus.on('execution:complete', handleExecutionComplete);
      globalCanvasEventBus.on('execution:error', handleExecutionError);
    });
  }

  // Execute workflow in worker
  private async executeInWorker(
    executionId: string,
    sessionId: string,
    nodes: Node[],
    edges: Edge[],
    variables: Record<string, any>
  ): Promise<SandboxExecutionResult> {
    const worker = await this.workerPool.getWorker();
    if (!worker) {
      throw new Error('No available workers');
    }

    this.workerPool.assignWorker(worker, executionId);

    const startTime = Date.now();
    const resourceLimitsHit: string[] = [];

    // Emit execution start event
    try {
      globalCanvasEventBus.emit({
        type: 'execution:start',
        payload: { executionId, sessionId },
      });
    } catch (err) {
      console.warn('Event bus emit failed:', err);
    }

    const executionPromise = this.executeWithWorker(worker, executionId, {
      nodes,
      edges,
      variables,
    });

    // Register the execution promise
    this.activeExecutions.set(executionId, executionPromise);

    try {
      const result = await executionPromise;

      const executionTime = Date.now() - startTime;
      const memoryUsed = this.estimateMemoryUsage(nodes, edges, result);

      const sandboxResult: SandboxExecutionResult = {
        ...result,
        sessionId,
        executionId,
        executionTime,
        memoryUsed,
        resourceLimitsHit,
        workerId: `worker-${this.workerPool.getActiveWorkers()}`,
        success: true,
      };

      // Store the result
      this.executionResults.set(executionId, sandboxResult);
      this.updateStats(sessionId, sandboxResult, true);
      this.activeExecutions.delete(executionId);

      // Emit execution complete event
      try {
        globalCanvasEventBus.emit({
          type: 'execution:complete',
          payload: { executionId, sessionId, result: sandboxResult },
        });
      } catch (err) {
        console.warn('Event bus emit failed:', err);
      }

      return sandboxResult;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      const errorResult: SandboxExecutionResult = {
        sessionId,
        executionId,
        executionTime,
        memoryUsed: 0,
        resourceLimitsHit,
        success: false,
        outputs: {},
        logs: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      this.executionResults.set(executionId, errorResult);
      this.updateStats(sessionId, errorResult, false);
      this.activeExecutions.delete(executionId);

      // Emit execution error event
      try {
        globalCanvasEventBus.emit({
          type: 'execution:error',
          payload: { executionId, sessionId, error: error instanceof Error ? error.message : 'Unknown error' },
        });
      } catch (err) {
        console.warn('Event bus emit failed:', err);
      }

      throw error;
    } finally {
      this.workerPool.releaseWorker(worker, executionId);
    }
  }

  // Execute with worker
  private async executeWithWorker(worker: Worker, executionId: string, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        worker.postMessage({ type: 'CANCEL', executionId });
        reject(new Error('Execution timeout'));
      }, this.config.maxExecutionTime);

      const messageHandler = (event: MessageEvent) => {
        const { type, executionId: msgExecutionId, payload: msgPayload } = event.data;
        
        if (msgExecutionId !== executionId) return;

        switch (type) {
          case 'RESULT':
            clearTimeout(timeout);
            worker.removeEventListener('message', messageHandler);
            resolve(msgPayload);
            break;
          case 'ERROR':
            clearTimeout(timeout);
            worker.removeEventListener('message', messageHandler);
            reject(new Error(msgPayload.message));
            break;
          case 'LOG':
            try {
              globalCanvasEventBus.emit({
                type: 'execution:log',
                payload: { executionId, message: msgPayload.message },
              });
            } catch (err) {
              console.warn('Event bus emit failed:', err);
            }
            break;
          case 'PROGRESS':
            try {
              globalCanvasEventBus.emit({
                type: 'execution:progress',
                payload: { executionId, progress: msgPayload.progress },
              });
            } catch (err) {
              console.warn('Event bus emit failed:', err);
            }
            break;
        }
      };

      worker.addEventListener('message', messageHandler);
      worker.postMessage({
        type: 'EXECUTE',
        executionId,
        payload,
      });
    });
  }

  // Queue processor
  private startQueueProcessor() {
    this.queueProcessor = setInterval(() => {
      this.processQueue();
    }, 100);
  }

  private processQueue() {
    if (this.executionQueue.length === 0) return;
    if (this.activeExecutions.size >= this.config.maxConcurrentExecutions) return;

    const queueItem = this.executionQueue.shift();
    if (!queueItem) return;

    // Check if item has expired
    if (Date.now() - queueItem.createdAt > queueItem.timeout) {
      globalCanvasEventBus.emit({
        type: 'execution:timeout',
        payload: { executionId: queueItem.id, sessionId: queueItem.sessionId },
      });
      return;
    }

    // Execute the queued item
    this.executeInWorker(queueItem.id, queueItem.sessionId, queueItem.nodes, queueItem.edges, queueItem.variables)
      .catch(error => {
        console.error('Queued execution failed:', error);
      });
  }

  // Cancel execution
  async cancelExecution(executionId: string): Promise<void> {
    if (this.activeExecutions.has(executionId)) {
      // Find the worker handling this execution
      const workers = this.workerPool['workers'];
      for (const worker of workers) {
        worker.postMessage({
          type: 'CANCEL',
          executionId,
        });
      }
    }

    // Remove from queue
    this.executionQueue = this.executionQueue.filter(item => item.id !== executionId);
    this.activeExecutions.delete(executionId);

    globalCanvasEventBus.emit({
      type: 'execution:cancel',
      payload: { executionId },
    });
  }

  // Helper methods
  private validateResourceLimits(nodes: Node[], edges: Edge[]): string[] {
    if (!this.config.enableResourceLimits) return [];

    const limitsHit: string[] = [];

    if (nodes.length > this.config.maxNodes) {
      limitsHit.push(`Node count (${nodes.length}) exceeds limit (${this.config.maxNodes})`);
    }

    if (edges.length > this.config.maxNodes * 2) {
      limitsHit.push(`Edge count (${edges.length}) exceeds limit (${this.config.maxNodes * 2})`);
    }

    // Check payload size
    const payloadSize = JSON.stringify({ nodes, edges }).length;
    if (payloadSize > 500 * 1024) {
      limitsHit.push(`Payload size (${payloadSize} bytes) exceeds limit (500KB)`);
    }

    return limitsHit;
  }

  private estimateMemoryUsage(nodes: Node[], edges: Edge[], result: any): number {
    // More accurate memory estimation based on serialized object size
    const serializedSize = JSON.stringify({ nodes, edges, result }).length;
    return serializedSize / (1024 * 1024); // Convert to MB
  }

  private updateStats(sessionId: string, result: SandboxExecutionResult, success: boolean) {
    let stats = this.executionStats.get(sessionId);
    if (!stats) {
      stats = {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageExecutionTime: 0,
        totalMemoryUsed: 0,
        resourceLimitViolations: 0,
        activeWorkers: 0,
        queuedExecutions: 0,
      };
    }

    stats.totalExecutions++;
    if (success) {
      stats.successfulExecutions++;
    } else {
      stats.failedExecutions++;
    }

    stats.averageExecutionTime = 
      (stats.averageExecutionTime * (stats.totalExecutions - 1) + result.executionTime) / stats.totalExecutions;
    
    stats.totalMemoryUsed += result.memoryUsed;
    stats.resourceLimitViolations += result.resourceLimitsHit.length;
    stats.activeWorkers = this.workerPool.getActiveWorkers();
    stats.queuedExecutions = this.executionQueue.length;

    this.executionStats.set(sessionId, stats);
  }

  private getExecutionResult(executionId: string): SandboxExecutionResult | null {
    return this.executionResults.get(executionId) || null;
  }

  // Resource monitoring
  private startResourceMonitoring() {
    this.resourceMonitor = setInterval(() => {
      this.monitorResources();
    }, 5000); // Check every 5 seconds
  }

  private monitorResources() {
    const stats = this.getOverallStats();
    
    // Emit resource monitoring event
    globalCanvasEventBus.emit({
      type: 'sandbox:stats',
      payload: stats,
    });

    // Check for resource violations
    if (stats.activeWorkers > this.config.workerPoolSize) {
      console.warn('Worker pool exceeded capacity');
    }

    if (stats.queuedExecutions > this.config.maxConcurrentExecutions * 2) {
      console.warn('Execution queue is getting long');
    }
  }

  // Public methods
  getOverallStats(): SandboxStats {
    const allStats = Array.from(this.executionStats.values());
    
    if (allStats.length === 0) {
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageExecutionTime: 0,
        totalMemoryUsed: 0,
        resourceLimitViolations: 0,
        activeWorkers: this.workerPool.getActiveWorkers(),
        queuedExecutions: this.executionQueue.length,
      };
    }

    return {
      totalExecutions: allStats.reduce((sum, stats) => sum + stats.totalExecutions, 0),
      successfulExecutions: allStats.reduce((sum, stats) => sum + stats.successfulExecutions, 0),
      failedExecutions: allStats.reduce((sum, stats) => sum + stats.failedExecutions, 0),
      averageExecutionTime: allStats.reduce((sum, stats) => sum + stats.averageExecutionTime, 0) / allStats.length,
      totalMemoryUsed: allStats.reduce((sum, stats) => sum + stats.totalMemoryUsed, 0),
      resourceLimitViolations: allStats.reduce((sum, stats) => sum + stats.resourceLimitViolations, 0),
      activeWorkers: this.workerPool.getActiveWorkers(),
      queuedExecutions: this.executionQueue.length,
    };
  }

  getSessionStats(sessionId: string): SandboxStats | null {
    return this.executionStats.get(sessionId) || null;
  }

  getQueueStatus(): { length: number; items: ExecutionQueueItem[] } {
    return {
      length: this.executionQueue.length,
      items: [...this.executionQueue],
    };
  }

  // Cleanup
  destroy() {
    if (this.resourceMonitor) {
      clearInterval(this.resourceMonitor);
    }
    if (this.queueProcessor) {
      clearInterval(this.queueProcessor);
    }
    this.workerPool.terminate();
    this.activeExecutions.clear();
    this.executionResults.clear();
    this.executionQueue = [];
  }
}