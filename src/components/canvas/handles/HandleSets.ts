import { Position } from "@xyflow/react";

/**
 * Handle configuration interface
 */
export interface HandleConfig {
  id: string;
  position: Position;
  percentage: number;
  label?: string;
}

/**
 * Handle set configuration for a node
 */
export interface HandleSetConfig {
  inputs: HandleConfig[];
  outputs: HandleConfig[];
}

/**
 * Pre-configured handle patterns for different node types
 * These patterns provide optimal positioning and reduce connection crossing
 */
export const HANDLE_SETS = {
  /**
   * Standard single input, single output
   * Used for most basic processing nodes
   */
  standard: {
    inputs: [
      { id: "input-1", position: Position.Left, percentage: 50 }
    ],
    outputs: [
      { id: "output-1", position: Position.Right, percentage: 50 }
    ]
  },

  /**
   * Decision/conditional node with one input and two outputs
   * Yes output at top, No output at bottom
   */
  decision: {
    inputs: [
      { id: "input-1", position: Position.Left, percentage: 50 }
    ],
    outputs: [
      { id: "yes", position: Position.Top, percentage: 50, label: "Yes" },
      { id: "no", position: Position.Bottom, percentage: 50, label: "No" }
    ]
  },

  /**
   * Multiple inputs, single output
   * Inputs at 30% and 70% for better flow
   */
  multiInput: {
    inputs: [
      { id: "input-1", position: Position.Left, percentage: 30 },
      { id: "input-2", position: Position.Left, percentage: 70 }
    ],
    outputs: [
      { id: "output-1", position: Position.Right, percentage: 50 }
    ]
  },

  /**
   * Single input, multiple outputs
   * Outputs at 30% and 70% for better routing
   */
  multiOutput: {
    inputs: [
      { id: "input-1", position: Position.Left, percentage: 50 }
    ],
    outputs: [
      { id: "output-1", position: Position.Right, percentage: 30 },
      { id: "output-2", position: Position.Right, percentage: 70 }
    ]
  },

  /**
   * LLM/AI node with success and error outputs
   * Used for nodes that can fail (API calls, AI processing)
   */
  llama: {
    inputs: [
      { id: "input-1", position: Position.Left, percentage: 50 }
    ],
    outputs: [
      { id: "success", position: Position.Right, percentage: 30, label: "Success" },
      { id: "error", position: Position.Right, percentage: 70, label: "Error" }
    ]
  },

  /**
   * Trigger node - only outputs, no inputs
   */
  trigger: {
    inputs: [],
    outputs: [
      { id: "output-1", position: Position.Right, percentage: 50 }
    ]
  },

  /**
   * End node - only inputs, no outputs
   */
  end: {
    inputs: [
      { id: "input-1", position: Position.Left, percentage: 50 }
    ],
    outputs: []
  },

  /**
   * Triple output for switch/routing nodes
   */
  switch: {
    inputs: [
      { id: "input-1", position: Position.Left, percentage: 50 }
    ],
    outputs: [
      { id: "output-1", position: Position.Right, percentage: 20 },
      { id: "output-2", position: Position.Right, percentage: 50 },
      { id: "output-3", position: Position.Right, percentage: 80 }
    ]
  }
} as const;

/**
 * Helper function to generate evenly spaced handles
 * @param count Number of handles to generate
 * @param position Position (Left, Right, Top, Bottom)
 * @param prefix ID prefix (e.g., "input", "output")
 * @returns Array of handle configurations
 */
export function generateEvenlySpacedHandles(
  count: number,
  position: Position,
  prefix: string
): HandleConfig[] {
  if (count === 0) return [];
  if (count === 1) return [{ id: `${prefix}-1`, position, percentage: 50 }];

  const handles: HandleConfig[] = [];
  const spacing = 100 / (count + 1);

  for (let i = 0; i < count; i++) {
    handles.push({
      id: `${prefix}-${i + 1}`,
      position,
      percentage: spacing * (i + 1)
    });
  }

  return handles;
}

/**
 * Helper to create a custom handle set
 */
export function createHandleSet(
  inputs: HandleConfig[],
  outputs: HandleConfig[]
): HandleSetConfig {
  return { inputs, outputs };
}
