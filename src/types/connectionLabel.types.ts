export interface ConnectionLabel {
  id: string; // unique key, e.g. "flow.send.to.ai"
  displayName: string; // human-readable label
  category: string; // group classification
  color: string; // UI color
  direction?: "forward" | "backward" | "loop";
  description?: string; // explains when this label should be used
  context?: Record<string, any>; // optional logic or data context
}

export interface ConnectionLabelCategory {
  title: string;
  color: string;
  labels: ConnectionLabel[];
}

export interface ConnectionLabelLibrary {
  version: string;
  categories: Record<string, ConnectionLabelCategory>;
}

export interface ConnectionLabelSuggestion {
  label: ConnectionLabel;
  confidence: number;
  reason: string;
}
