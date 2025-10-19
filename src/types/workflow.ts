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
  onUpdateLabel?: (edgeId: string, label: string) => void;
}

export interface ValidationOptions {
  allowCircular: boolean;
  preventDuplicates: boolean;
  preventSelfConnections: boolean;
  maxConnectionsPerHandle?: number;
}
