import { globalCanvasEventBus } from "@/hooks/useCanvasEventBus";
import { StorageAdapter, StorageFactory, LocalStorageAdapter } from "@/lib/storage/StorageAdapter";
import * as LZString from "lz-string";

export interface SessionMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
  nodeCount: number;
  edgeCount: number;
  isActive: boolean;
  userId?: string; // For future multi-user support
  version: string; // Schema version for migration
}

export interface SessionData {
  metadata: SessionMetadata;
  nodes: any[];
  edges: any[];
  variables: Record<string, any>;
  executionHistory: any[];
}

export interface SessionConfig {
  maxSessions: number;
  sessionTimeout: number; // in milliseconds
  autoSaveInterval: number; // in milliseconds
  maxSessionAge: number; // in milliseconds
  lruCacheSize: number; // Number of sessions to keep in memory
}

// LRU Cache implementation for session metadata
class LRUCache<T> {
  private cache = new Map<string, T>();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Event types for SessionManager
export interface SessionEvent {
  type: "create" | "load" | "save" | "delete" | "switch" | "expire";
  sessionId: string;
  data?: SessionData;
  error?: Error;
}

export class SessionManager {
  private static readonly STORAGE_PREFIX = "naraflow_session_";
  private static readonly SESSION_INDEX_KEY = "naraflow_sessions_index";
  private static readonly CURRENT_SESSION_KEY = "naraflow_current_session";

  private static readonly DEFAULT_CONFIG: SessionConfig = {
    maxSessions: 10,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    autoSaveInterval: 30 * 1000, // 30 seconds
    maxSessionAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    lruCacheSize: 5, // Keep 5 sessions in memory
  };

  private config: SessionConfig;
  private currentSessionId: string | null = null;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private sessionTimeoutTimer: NodeJS.Timeout | null = null;
  private lruCache: LRUCache<SessionMetadata>;
  private eventListeners: Map<string, Set<(event: SessionEvent) => void>> = new Map();
  private storageAdapter: StorageAdapter;

  constructor(config: Partial<SessionConfig> = {}, storageAdapter?: StorageAdapter) {
    this.config = { ...SessionManager.DEFAULT_CONFIG, ...config };
    this.lruCache = new LRUCache<SessionMetadata>(this.config.lruCacheSize);
    this.storageAdapter = storageAdapter || new LocalStorageAdapter();
    this.loadCurrentSession();
    this.startAutoSave();
    this.startSessionTimeout();
  }

  // Compression methods
  private compress(data: any): string {
    const jsonString = JSON.stringify(data);
    return LZString.compress(jsonString) || jsonString;
  }

  private decompress(compressedData: string): any {
    try {
      const decompressed = LZString.decompress(compressedData);
      return decompressed ? JSON.parse(decompressed) : JSON.parse(compressedData);
    } catch (error) {
      console.error("Decompression error:", error);
      return JSON.parse(compressedData);
    }
  }

  // Storage methods with compression
  private async saveSessionData(sessionData: SessionData): Promise<void> {
    const compressedData = this.compress(sessionData);
    await this.storageAdapter.set(`session_${sessionData.metadata.id}`, compressedData);
  }

  private async loadSessionData(sessionId: string): Promise<SessionData | null> {
    try {
      const compressedData = await this.storageAdapter.get(`session_${sessionId}`);
      if (!compressedData) return null;

      return this.decompress(compressedData);
    } catch (error) {
      console.error("Failed to load session data:", error);
      return null;
    }
  }

  // Selective diff syncing methods
  async getDiff(
    sessionId: string,
    currentNodes: any[],
    currentEdges: any[]
  ): Promise<{
    hasChanges: boolean;
    nodeChanges: { added: any[]; updated: any[]; removed: string[] };
    edgeChanges: { added: any[]; updated: any[]; removed: string[] };
  }> {
    const sessionData = await this.loadSessionData(sessionId);
    if (!sessionData) {
      return {
        hasChanges: true,
        nodeChanges: { added: currentNodes, updated: [], removed: [] },
        edgeChanges: { added: currentEdges, updated: [], removed: [] },
      };
    }

    const savedNodes = sessionData.nodes || [];
    const savedEdges = sessionData.edges || [];

    // Compare nodes
    const nodeChanges = this.compareNodes(savedNodes, currentNodes);
    const edgeChanges = this.compareEdges(savedEdges, currentEdges);

    const hasChanges =
      nodeChanges.added.length > 0 ||
      nodeChanges.updated.length > 0 ||
      nodeChanges.removed.length > 0 ||
      edgeChanges.added.length > 0 ||
      edgeChanges.updated.length > 0 ||
      edgeChanges.removed.length > 0;

    return {
      hasChanges,
      nodeChanges,
      edgeChanges,
    };
  }

  private compareNodes(
    savedNodes: any[],
    currentNodes: any[]
  ): {
    added: any[];
    updated: any[];
    removed: string[];
  } {
    const savedNodeMap = new Map(savedNodes.map(node => [node.id, node]));
    const currentNodeMap = new Map(currentNodes.map(node => [node.id, node]));

    const added: any[] = [];
    const updated: any[] = [];
    const removed: string[] = [];

    // Find added and updated nodes
    for (const currentNode of currentNodes) {
      const savedNode = savedNodeMap.get(currentNode.id);
      if (!savedNode) {
        added.push(currentNode);
      } else if (JSON.stringify(savedNode) !== JSON.stringify(currentNode)) {
        updated.push(currentNode);
      }
    }

    // Find removed nodes
    for (const savedNode of savedNodes) {
      if (!currentNodeMap.has(savedNode.id)) {
        removed.push(savedNode.id);
      }
    }

    return { added, updated, removed };
  }

  private compareEdges(
    savedEdges: any[],
    currentEdges: any[]
  ): {
    added: any[];
    updated: any[];
    removed: string[];
  } {
    const savedEdgeMap = new Map(savedEdges.map(edge => [edge.id, edge]));
    const currentEdgeMap = new Map(currentEdges.map(edge => [edge.id, edge]));

    const added: any[] = [];
    const updated: any[] = [];
    const removed: string[] = [];

    // Find added and updated edges
    for (const currentEdge of currentEdges) {
      const savedEdge = savedEdgeMap.get(currentEdge.id);
      if (!savedEdge) {
        added.push(currentEdge);
      } else if (JSON.stringify(savedEdge) !== JSON.stringify(currentEdge)) {
        updated.push(currentEdge);
      }
    }

    // Find removed edges
    for (const savedEdge of savedEdges) {
      if (!currentEdgeMap.has(savedEdge.id)) {
        removed.push(savedEdge.id);
      }
    }

    return { added, updated, removed };
  }

  async syncToSession(sessionId: string, nodes: any[], edges: any[]): Promise<void> {
    const diff = await this.getDiff(sessionId, nodes, edges);

    if (!diff.hasChanges) {
      console.log("No changes to sync for session:", sessionId);
      return;
    }

    console.log("Syncing changes to session:", sessionId, diff);

    // Load current session data
    const sessionData = await this.loadSessionData(sessionId);
    if (!sessionData) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Update session data with current state
    sessionData.nodes = nodes;
    sessionData.edges = edges;
    sessionData.metadata.nodeCount = nodes.length;
    sessionData.metadata.edgeCount = edges.length;
    sessionData.metadata.updatedAt = new Date().toISOString();
    sessionData.metadata.lastAccessedAt = new Date().toISOString();

    // Save updated session data
    await this.saveSessionData(sessionData);

    // Update LRU cache
    this.lruCache.set(sessionId, sessionData.metadata);

    // Update session index
    await this.updateSessionIndex(sessionData.metadata);

    // Emit save event
    this.emit({
      type: "save",
      sessionId,
      data: sessionData,
    });
  }

  // Event system methods
  on(eventType: SessionEvent["type"], listener: (event: SessionEvent) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);

    // Return cleanup function
    return () => {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.eventListeners.delete(eventType);
        }
      }
    };
  }

  private emit(event: SessionEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in session event listener for ${event.type}:`, error);
        }
      });
    }

    // Also emit to global event bus
    globalCanvasEventBus.emit({
      type: `session:${event.type}`,
      payload: event,
    });
  }

  /**
   * Create a new session
   */
  async createSession(name: string, description?: string): Promise<string> {
    const sessionId = this.generateSessionId();
    const now = new Date().toISOString();

    const metadata: SessionMetadata = {
      id: sessionId,
      name,
      description,
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: now,
      nodeCount: 0,
      edgeCount: 0,
      isActive: true,
      version: "1.0", // Schema version
    };

    const sessionData: SessionData = {
      metadata,
      nodes: [],
      edges: [],
      variables: {},
      executionHistory: [],
    };

    // Save session data
    await this.saveSessionData(sessionData);

    // Update session index
    await this.updateSessionIndex(metadata);

    // Add to LRU cache
    this.lruCache.set(sessionId, metadata);

    // Set as current session
    this.setCurrentSession(sessionId);

    // Cleanup old sessions if needed
    await this.cleanupOldSessions();

    // Emit create event
    this.emit({
      type: "create",
      sessionId,
      data: sessionData,
    });

    console.log(`Session created: ${sessionId}`);
    return sessionId;
  }

  /**
   * Load an existing session
   */
  async loadSession(sessionId: string): Promise<SessionData | null> {
    try {
      const sessionData = await this.loadSessionData(sessionId);
      if (!sessionData) {
        return null;
      }

      // Update last accessed time
      sessionData.metadata.lastAccessedAt = new Date().toISOString();
      sessionData.metadata.isActive = true;

      await this.saveSessionData(sessionData);
      await this.updateSessionIndex(sessionData.metadata);

      // Set as current session
      this.setCurrentSession(sessionId);

      console.log(`Session loaded: ${sessionId}`);
      return sessionData;
    } catch (error) {
      console.error(`Failed to load session ${sessionId}:`, error);
      return null;
    }
  }

  /**
   * Save session data
   */
  async saveSession(
    sessionId: string,
    nodes: any[],
    edges: any[],
    variables: Record<string, any> = {}
  ): Promise<void> {
    try {
      const sessionData = await this.loadSessionData(sessionId);
      if (!sessionData) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Update session data
      sessionData.nodes = nodes;
      sessionData.edges = edges;
      sessionData.variables = variables;
      sessionData.metadata.nodeCount = nodes.length;
      sessionData.metadata.edgeCount = edges.length;
      sessionData.metadata.updatedAt = new Date().toISOString();
      sessionData.metadata.lastAccessedAt = new Date().toISOString();

      await this.saveSessionData(sessionData);
      await this.updateSessionIndex(sessionData.metadata);

      console.log(`Session saved: ${sessionId}`);
    } catch (error) {
      console.error(`Failed to save session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      // Remove session data
      const key = SessionManager.STORAGE_PREFIX + sessionId;
      localStorage.removeItem(key);

      // Update session index
      await this.removeFromSessionIndex(sessionId);

      // If this was the current session, clear it
      if (this.currentSessionId === sessionId) {
        this.clearCurrentSession();
      }

      console.log(`Session deleted: ${sessionId}`);
    } catch (error) {
      console.error(`Failed to delete session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * List all sessions
   */
  async listSessions(): Promise<SessionMetadata[]> {
    try {
      const indexData = localStorage.getItem(SessionManager.SESSION_INDEX_KEY);
      if (!indexData) {
        return [];
      }

      const index = JSON.parse(indexData);
      const sessions = Object.values(index) as SessionMetadata[];

      // Sort by last accessed time (most recent first)
      return sessions.sort(
        (a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
      );
    } catch (error) {
      console.error("Failed to list sessions:", error);
      return [];
    }
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  /**
   * Get current session data
   */
  async getCurrentSession(): Promise<SessionData | null> {
    if (!this.currentSessionId) {
      return null;
    }
    return await this.loadSessionData(this.currentSessionId);
  }

  /**
   * Switch to a different session
   */
  async switchSession(sessionId: string): Promise<SessionData | null> {
    const sessionData = await this.loadSession(sessionId);
    if (sessionData) {
      this.setCurrentSession(sessionId);
    }
    return sessionData;
  }

  /**
   * Clear current session
   */
  clearCurrentSession(): void {
    this.currentSessionId = null;
    localStorage.removeItem(SessionManager.CURRENT_SESSION_KEY);
    this.stopAutoSave();
    this.stopSessionTimeout();
  }

  /**
   * Duplicate a session
   */
  async duplicateSession(sessionId: string, newName?: string): Promise<string> {
    const sessionData = await this.loadSessionData(sessionId);
    if (!sessionData) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const duplicatedName = newName || `${sessionData.metadata.name} (Copy)`;
    const newSessionId = await this.createSession(duplicatedName, sessionData.metadata.description);

    // Copy session data
    const newSessionData = await this.loadSessionData(newSessionId);
    if (newSessionData) {
      newSessionData.nodes = [...sessionData.nodes];
      newSessionData.edges = [...sessionData.edges];
      newSessionData.variables = { ...sessionData.variables };
      newSessionData.metadata.nodeCount = sessionData.metadata.nodeCount;
      newSessionData.metadata.edgeCount = sessionData.metadata.edgeCount;

      await this.saveSessionData(newSessionData);
      await this.updateSessionIndex(newSessionData.metadata);
    }

    return newSessionId;
  }

  /**
   * Export session to JSON
   */
  async exportSession(sessionId: string): Promise<string> {
    const sessionData = await this.loadSessionData(sessionId);
    if (!sessionData) {
      throw new Error(`Session ${sessionId} not found`);
    }

    return JSON.stringify(sessionData, null, 2);
  }

  /**
   * Import session from JSON
   */
  async importSession(jsonString: string, name?: string): Promise<string> {
    try {
      const sessionData: SessionData = JSON.parse(jsonString);

      // Validate session data structure
      if (!sessionData.metadata || !sessionData.nodes || !sessionData.edges) {
        throw new Error("Invalid session data format");
      }

      // Create new session with imported data
      const sessionName = name || sessionData.metadata.name || "Imported Session";
      const newSessionId = await this.createSession(sessionName, sessionData.metadata.description);

      // Load and update the new session
      const newSessionData = await this.loadSessionData(newSessionId);
      if (newSessionData) {
        newSessionData.nodes = sessionData.nodes;
        newSessionData.edges = sessionData.edges;
        newSessionData.variables = sessionData.variables || {};
        newSessionData.metadata.nodeCount = sessionData.nodes.length;
        newSessionData.metadata.edgeCount = sessionData.edges.length;

        await this.saveSessionData(newSessionData);
        await this.updateSessionIndex(newSessionData.metadata);
      }

      return newSessionId;
    } catch (error) {
      console.error("Failed to import session:", error);
      throw new Error(
        `Failed to import session: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    totalStorageUsed: number;
    oldestSession: string | null;
    newestSession: string | null;
  }> {
    const sessions = await this.listSessions();
    const activeSessions = sessions.filter(s => s.isActive);

    let totalStorageUsed = 0;
    let oldestSession: string | null = null;
    let newestSession: string | null = null;
    let oldestTime = Infinity;
    let newestTime = 0;

    for (const session of sessions) {
      const key = SessionManager.STORAGE_PREFIX + session.id;
      const data = localStorage.getItem(key);
      if (data) {
        totalStorageUsed += data.length;
      }

      const createdAt = new Date(session.createdAt).getTime();
      if (createdAt < oldestTime) {
        oldestTime = createdAt;
        oldestSession = session.id;
      }
      if (createdAt > newestTime) {
        newestTime = createdAt;
        newestSession = session.id;
      }
    }

    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      totalStorageUsed,
      oldestSession,
      newestSession,
    };
  }

  /**
   * Cleanup old sessions
   */
  private async cleanupOldSessions(): Promise<void> {
    const sessions = await this.listSessions();
    const now = Date.now();

    // Remove sessions older than maxSessionAge
    for (const session of sessions) {
      const createdAt = new Date(session.createdAt).getTime();
      if (now - createdAt > this.config.maxSessionAge) {
        await this.deleteSession(session.id);
      }
    }

    // If we still have too many sessions, remove oldest ones
    const remainingSessions = await this.listSessions();
    if (remainingSessions.length > this.config.maxSessions) {
      const sessionsToRemove = remainingSessions
        .sort((a, b) => new Date(a.lastAccessedAt).getTime() - new Date(b.lastAccessedAt).getTime())
        .slice(0, remainingSessions.length - this.config.maxSessions);

      for (const session of sessionsToRemove) {
        await this.deleteSession(session.id);
      }
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `session_${timestamp}_${random}`;
  }

  /**
   * Update session index
   */
  private async updateSessionIndex(metadata: SessionMetadata): Promise<void> {
    try {
      const indexData = localStorage.getItem(SessionManager.SESSION_INDEX_KEY);
      const index = indexData ? JSON.parse(indexData) : {};

      index[metadata.id] = metadata;
      localStorage.setItem(SessionManager.SESSION_INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.error("Failed to update session index:", error);
    }
  }

  /**
   * Remove session from index
   */
  private async removeFromSessionIndex(sessionId: string): Promise<void> {
    try {
      const indexData = localStorage.getItem(SessionManager.SESSION_INDEX_KEY);
      if (!indexData) return;

      const index = JSON.parse(indexData);
      delete index[sessionId];
      localStorage.setItem(SessionManager.SESSION_INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.error("Failed to remove session from index:", error);
    }
  }

  /**
   * Load current session from localStorage
   */
  private loadCurrentSession(): void {
    try {
      const currentSessionId = localStorage.getItem(SessionManager.CURRENT_SESSION_KEY);
      if (currentSessionId) {
        this.currentSessionId = currentSessionId;
      }
    } catch (error) {
      console.error("Failed to load current session:", error);
    }
  }

  /**
   * Set current session
   */
  private setCurrentSession(sessionId: string): void {
    this.currentSessionId = sessionId;
    localStorage.setItem(SessionManager.CURRENT_SESSION_KEY, sessionId);
    this.startSessionTimeout();
  }

  /**
   * Start auto-save timer
   */
  private startAutoSave(): void {
    this.stopAutoSave();
    this.autoSaveTimer = setInterval(() => {
      // Auto-save will be handled by the workflow state
      // This is just a placeholder for future implementation
    }, this.config.autoSaveInterval);
  }

  /**
   * Stop auto-save timer
   */
  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Start session timeout timer
   */
  private startSessionTimeout(): void {
    this.stopSessionTimeout();
    this.sessionTimeoutTimer = setTimeout(() => {
      console.log("Session timeout reached, clearing current session");
      this.clearCurrentSession();
    }, this.config.sessionTimeout);
  }

  /**
   * Stop session timeout timer
   */
  private stopSessionTimeout(): void {
    if (this.sessionTimeoutTimer) {
      clearTimeout(this.sessionTimeoutTimer);
      this.sessionTimeoutTimer = null;
    }
  }

  /**
   * Reset session timeout (call when user is active)
   */
  resetSessionTimeout(): void {
    if (this.currentSessionId) {
      this.startSessionTimeout();
    }
  }

  /**
   * Destroy session manager and cleanup
   */
  destroy(): void {
    this.stopAutoSave();
    this.stopSessionTimeout();
  }
}
