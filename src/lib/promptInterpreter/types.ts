/**
 * Type definitions for Prompt-to-Workflow Interpreter
 * Hybrid approach: Rule-based intent detection + LLM entity extraction
 */

export interface Intent {
  type: "whatsapp_data_entry" | "workflow_automation" | "data_processing";
  confidence: number;
  rawPrompt: string;
}

export interface ExtractedEntity {
  field: string;
  type: "text" | "number" | "phone" | "email" | "date";
  required: boolean;
  validation?: string[];
}

export interface PromptAnalysis {
  intent: Intent;
  entities: ExtractedEntity[];
  target: "google_sheets" | "database" | "storage";
  workflow_type: "sequential" | "parallel" | "conditional";
}

export interface NodePlan {
  nodeId: string;
  nodeType: string;
  position: { x: number; y: number };
  config: any;
  connections: Array<{
    target: string;
    source_port: string;
    target_port: string;
  }>;
}

export interface WorkflowOutput {
  nodes: any[];
  edges: any[];
  metadata: {
    title: string;
    description: string;
    generated_by: "prompt_interpreter";
    timestamp: string;
  };
  warnings: string[];
}
