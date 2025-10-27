export type EdgeConditionType = 
  | 'default'    // Gray - normal flow
  | 'success'    // Green - successful path
  | 'error'      // Red - error path
  | 'warning'    // Yellow - warning path
  | 'conditional'; // Blue - conditional logic

export interface EdgeConditionData {
  conditionType: EdgeConditionType;
  label?: string;
  description?: string;
  labelId?: string; // Reference to connection label library
  onUpdateLabel?: (edgeId: string, label: string) => void;
}

export interface ValidationOptions {
  allowCircular: boolean;
  preventDuplicates: boolean;
  preventSelfConnections: boolean;
  maxConnectionsPerHandle?: number;
}

export const NODE_COLORS = {
  'map-pin': {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    bgHover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
    border: 'border-blue-300 dark:border-blue-700',
    borderHover: 'hover:border-blue-400 dark:hover:border-blue-600',
    icon: 'text-blue-600 dark:text-blue-400',
    handleBg: 'bg-blue-600 dark:bg-blue-400',
    toolbox: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400',
  },
  'database': {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    bgHover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
    border: 'border-purple-300 dark:border-purple-700',
    borderHover: 'hover:border-purple-400 dark:hover:border-purple-600',
    icon: 'text-purple-600 dark:text-purple-400',
    handleBg: 'bg-purple-600 dark:bg-purple-400',
    toolbox: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400',
  },
  'wifi': {
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    bgHover: 'hover:bg-orange-100 dark:hover:bg-orange-900/30',
    border: 'border-orange-300 dark:border-orange-700',
    borderHover: 'hover:border-orange-400 dark:hover:border-orange-600',
    icon: 'text-orange-600 dark:text-orange-400',
    handleBg: 'bg-orange-600 dark:bg-orange-400',
    toolbox: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400',
  },
  'check-square': {
    bg: 'bg-green-50 dark:bg-green-950/20',
    bgHover: 'hover:bg-green-100 dark:hover:bg-green-900/30',
    border: 'border-green-300 dark:border-green-700',
    borderHover: 'hover:border-green-400 dark:hover:border-green-600',
    icon: 'text-green-600 dark:text-green-400',
    handleBg: 'bg-green-600 dark:bg-green-400',
    toolbox: 'bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400',
  },
  'file-text': {
    bg: 'bg-red-50 dark:bg-red-950/20',
    bgHover: 'hover:bg-red-100 dark:hover:bg-red-900/30',
    border: 'border-red-300 dark:border-red-700',
    borderHover: 'hover:border-red-400 dark:hover:border-red-600',
    icon: 'text-red-600 dark:text-red-400',
    handleBg: 'bg-red-600 dark:bg-red-400',
    toolbox: 'bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400',
  },
  'send': {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    bgHover: 'hover:bg-amber-100 dark:hover:bg-amber-900/30',
    border: 'border-amber-300 dark:border-amber-700',
    borderHover: 'hover:border-amber-400 dark:hover:border-amber-600',
    icon: 'text-amber-600 dark:text-amber-400',
    handleBg: 'bg-amber-600 dark:bg-amber-400',
    toolbox: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400',
  },
} as const;

export type NodeIconType = keyof typeof NODE_COLORS;

// Execution types
export interface ExecutionLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  nodeId: string;
}

export interface ExecutionResult {
  outputs: Record<string, any>;
  logs: ExecutionLog[];
  error?: string;
}

export interface ExecutionContext {
  workflowId: string;
  timestamp: Date;
  variables: Record<string, any>;
}

export interface NodeExecutor {
  nodeType: string;
  execute: (node: any, inputs: Record<string, any>, context: ExecutionContext, llamaConfig?: any, appendLlamaLog?: (entry: any) => void) => Promise<ExecutionResult>;
  validate: (node: any) => { valid: boolean; error?: string };
  getRequiredInputs: () => string[];
  getOutputSchema: () => Record<string, string>;
}
