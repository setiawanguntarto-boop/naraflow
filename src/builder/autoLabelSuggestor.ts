import { ConnectionLabel, ConnectionLabelSuggestion } from "@/types/connectionLabel.types";
import { connectionLabelLibrary } from "@/core/connectionLabelLibrary";
import { getConnectionLabelById } from "./connectionRenderer";

export function suggestLabel(
  fromNodeType: string,
  toNodeType: string
): ConnectionLabelSuggestion | null {
  // Simple heuristic rules — can be extended with ML/AI later

  // Input to Processing patterns
  if (
    fromNodeType.toLowerCase().includes("input") &&
    toNodeType.toLowerCase().includes("process")
  ) {
    const label = getConnectionLabelById("ai.send", connectionLabelLibrary);
    if (label) {
      return {
        label,
        confidence: 0.9,
        reason: "Input data typically flows to AI processing",
      };
    }
  }

  // Processing to Decision patterns
  if (
    fromNodeType.toLowerCase().includes("process") &&
    toNodeType.toLowerCase().includes("decision")
  ) {
    const label = getConnectionLabelById("ai.result", connectionLabelLibrary);
    if (label) {
      return {
        label,
        confidence: 0.8,
        reason: "AI processing results feed into decision logic",
      };
    }
  }

  // Decision to Action patterns
  if (
    fromNodeType.toLowerCase().includes("decision") &&
    toNodeType.toLowerCase().includes("action")
  ) {
    const label = getConnectionLabelById("logic.yes", connectionLabelLibrary);
    if (label) {
      return {
        label,
        confidence: 0.7,
        reason: "Decision nodes typically have yes/no branches",
      };
    }
  }

  // Any node to End patterns
  if (toNodeType.toLowerCase().includes("end")) {
    const label = getConnectionLabelById("flow.complete", connectionLabelLibrary);
    if (label) {
      return {
        label,
        confidence: 0.8,
        reason: "End nodes typically mark workflow completion",
      };
    }
  }

  // Start to any node patterns
  if (fromNodeType.toLowerCase().includes("start")) {
    const label = getConnectionLabelById("flow.start", connectionLabelLibrary);
    if (label) {
      return {
        label,
        confidence: 0.9,
        reason: "Start nodes initiate workflow flow",
      };
    }
  }

  // Notification patterns
  if (
    toNodeType.toLowerCase().includes("notification") ||
    toNodeType.toLowerCase().includes("message")
  ) {
    const label = getConnectionLabelById("notify.user", connectionLabelLibrary);
    if (label) {
      return {
        label,
        confidence: 0.7,
        reason: "Message/notification nodes typically notify users",
      };
    }
  }

  // Database/Storage patterns
  if (
    toNodeType.toLowerCase().includes("database") ||
    toNodeType.toLowerCase().includes("storage")
  ) {
    const label = getConnectionLabelById("db.save", connectionLabelLibrary);
    if (label) {
      return {
        label,
        confidence: 0.8,
        reason: "Database nodes typically save data",
      };
    }
  }

  // API/Integration patterns
  if (toNodeType.toLowerCase().includes("api") || toNodeType.toLowerCase().includes("webhook")) {
    const label = getConnectionLabelById("api.send", connectionLabelLibrary);
    if (label) {
      return {
        label,
        confidence: 0.7,
        reason: "API nodes typically send data to external services",
      };
    }
  }

  return null;
}

export function suggestMultipleLabels(
  fromNodeType: string,
  toNodeType: string
): ConnectionLabelSuggestion[] {
  const suggestions: ConnectionLabelSuggestion[] = [];

  // Get primary suggestion
  const primarySuggestion = suggestLabel(fromNodeType, toNodeType);
  if (primarySuggestion) {
    suggestions.push(primarySuggestion);
  }

  // Add alternative suggestions based on context
  const alternatives = getAlternativeSuggestions(fromNodeType, toNodeType);
  suggestions.push(...alternatives);

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

function getAlternativeSuggestions(
  fromNodeType: string,
  toNodeType: string
): ConnectionLabelSuggestion[] {
  const alternatives: ConnectionLabelSuggestion[] = [];

  // Generic flow control alternatives
  if (fromNodeType.toLowerCase().includes("start")) {
    const label = getConnectionLabelById("flow.start", connectionLabelLibrary);
    if (label) {
      alternatives.push({
        label,
        confidence: 0.6,
        reason: "Generic start flow",
      });
    }
  }

  // Data processing alternatives
  if (
    fromNodeType.toLowerCase().includes("process") ||
    toNodeType.toLowerCase().includes("process")
  ) {
    const label = getConnectionLabelById("data.processed", connectionLabelLibrary);
    if (label) {
      alternatives.push({
        label,
        confidence: 0.5,
        reason: "Generic data processing flow",
      });
    }
  }

  return alternatives;
}

export function validateConnectionLabel(
  labelId: string,
  fromNodeType: string,
  toNodeType: string
): boolean {
  const label = getConnectionLabelById(labelId, connectionLabelLibrary);
  if (!label) return false;

  // Add validation rules based on node types and label categories
  const validationRules = {
    "ai.send": (from: string, to: string) =>
      from.toLowerCase().includes("input") && to.toLowerCase().includes("process"),
    "ai.result": (from: string, to: string) =>
      from.toLowerCase().includes("process") && to.toLowerCase().includes("decision"),
    "logic.yes": (from: string, to: string) => from.toLowerCase().includes("decision"),
    "flow.complete": (from: string, to: string) => to.toLowerCase().includes("end"),
    "notify.user": (from: string, to: string) =>
      to.toLowerCase().includes("notification") || to.toLowerCase().includes("message"),
    "db.save": (from: string, to: string) =>
      to.toLowerCase().includes("database") || to.toLowerCase().includes("storage"),
    "api.send": (from: string, to: string) =>
      to.toLowerCase().includes("api") || to.toLowerCase().includes("webhook"),
  };

  const rule = validationRules[labelId as keyof typeof validationRules];
  return rule ? rule(fromNodeType, toNodeType) : true;
}
