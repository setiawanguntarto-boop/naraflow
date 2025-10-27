import { ConnectionLabel } from "./connectionLabel.types";

export interface Connection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  labelId?: string;
  labelName?: string;
  color?: string;
  metadata?: Record<string, any>;
  animated?: boolean;
  style?: React.CSSProperties;
  type?: string;
}

export interface ConnectionWithLabel extends Connection {
  label?: ConnectionLabel;
}

export interface ConnectionLabelMetadata {
  labelId: string;
  labelName: string;
  color: string;
  category: string;
  description?: string;
  direction?: "forward" | "backward" | "loop";
  context?: Record<string, any>;
}

export interface FlowSchema {
  version: string;
  nodes: any[];
  connections: Connection[];
  metadata?: {
    name?: string;
    description?: string;
    author?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface ConnectionValidationRule {
  fromNodeType: string;
  toNodeType: string;
  allowedLabels?: string[];
  disallowedLabels?: string[];
  requiredLabels?: string[];
}

export interface ConnectionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}
