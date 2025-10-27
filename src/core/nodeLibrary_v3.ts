/**
 * Node Library v3.0 - Enterprise-ready schema
 * Supports versioning, security, runtime contracts, and WhatsApp data-entry agents
 */

import { JSONSchema7 } from "json-schema";

export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  nodeId: string;
  runId: string;
  userId?: string;
  payload: any;
  memory: any;
  vars: Record<string, any>;
  meta: {
    triggeredBy: string;
    timestamp: string;
    providerPayload?: any;
  };
  services: {
    llm?: LLMService;
    storage?: StorageService;
    http?: HttpService;
    logger: Logger;
    sendMessage?: (channel: string, userId: string, message: string, opts?: any) => Promise<any>;
  };
  abortSignal?: AbortSignal;
}

export interface NodeResult {
  status: "success" | "error" | "retry";
  data?: any;
  next?: string;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  updatedMemory?: any;
}

export interface InputPortDefinition {
  name: string;
  type: "data" | "condition" | "trigger" | "message";
  required: boolean;
  description?: string;
}

export interface OutputPortDefinition {
  name: string;
  type: "data" | "route" | "confirmation" | "insights";
  description?: string;
}

/**
 * Attachment port for sub-node connections (Langflow-style)
 * Used to connect specialized nodes to parent nodes (e.g., Model → Agent, Memory → Agent)
 */
export interface AttachmentPortDefinition {
  id: string;
  label: string;
  description?: string;
  position: "bottom" | "left" | "right" | "top";
  color?: string;
  icon?: string;
  allowedTypes?: string[]; // Restrict which node types can attach here
}

/**
 * Sub-node structure
 * Represents child nodes that are attached to a parent node
 */
export interface SubNodeDefinition {
  id: string;
  type: string;
  label: string;
  portId?: string; // Which attachment port this connects to
  config?: any;
}

export interface NodeTypeDefinition {
  id: string;
  version: string;
  label: string;
  description: string;
  category: "trigger" | "logic" | "control" | "output" | "utility" | "agent";
  configSchema: JSONSchema7;
  inputs: Record<string, InputPortDefinition>;
  outputs: Record<string, OutputPortDefinition>;

  /**
   * Attachment ports for sub-node connections (Langflow-style)
   * Key: port ID (e.g., 'model', 'memory', 'parser')
   * Value: port configuration
   */
  attachments?: Record<string, AttachmentPortDefinition>;
  ui: {
    icon: string;
    category: string;
    fieldsOrder: string[];
    helpLinks?: string[];
    advanced?: {
      collapsed: boolean;
      fields: string[];
    };
  };
  runtime: {
    handler: string;
    timeoutMs: number;
    retry?: {
      count: number;
      backoffMs: number;
    };
  };
  security?: {
    authType: "oauth2" | "apiKey" | "none";
    scopes?: string[];
  };
  meta?: {
    tags: string[];
    author?: string;
    createdAt?: string;
  };
}

export interface NodeLibraryV3 {
  version: string;
  nodeTypes: Record<string, NodeTypeDefinition>;
}

// Helper interfaces
export interface LLMService {
  chat: (messages: any[], options: any) => Promise<any>;
}

export interface StorageService {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
}

export interface HttpService {
  get: (url: string, options?: any) => Promise<any>;
  post: (url: string, data: any, options?: any) => Promise<any>;
}

export interface Logger {
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}
