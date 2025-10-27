import { Edge } from '@xyflow/react';
import { EdgeConditionType } from '@/types/workflow';
import { ConnectionLabel } from '@/types/connectionLabel.types';
import { getConnectionLabelById } from '@/builder/connectionRenderer';
import { connectionLabelLibrary } from '@/core/connectionLabelLibrary';

export interface LabeledEdge extends Edge {
  data: {
    conditionType: EdgeConditionType;
    label?: string;
    description?: string;
    labelId?: string;
  };
}

export function createLabeledEdge(
  id: string,
  source: string,
  target: string,
  labelId?: string,
  customLabel?: string
): LabeledEdge {
  const label = labelId ? getConnectionLabelById(labelId, connectionLabelLibrary) : null;
  
  return {
    id,
    source,
    target,
    type: 'smoothstep',
    animated: true,
    style: { 
      stroke: label?.color || '#CBD5E1', // Use neutral gray-blue as default
      strokeWidth: 1.5,
      opacity: 0.8
    },
    label: customLabel || label?.displayName || '',
    data: {
      conditionType: 'success' as EdgeConditionType,
      label: customLabel || label?.displayName || '',
      description: label?.description || '',
      labelId: labelId || undefined
    }
  };
}

export interface ConnectionMenuOption {
  label: string;
  value: string;
  condition?: string;
  icon?: string;
  description?: string;
  color?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export interface ConnectionMenuConfig {
  condition?: string;
  connectionMenu?: boolean;
  connectionOptions?: ConnectionMenuOption[];
}

export function createLabeledEdgeWithMenu(
  id: string,
  source: string,
  target: string,
  labelId?: string,
  customLabel?: string,
  menuConfig?: ConnectionMenuConfig
): LabeledEdge {
  const label = labelId ? getConnectionLabelById(labelId, connectionLabelLibrary) : null;
  
  return {
    id,
    source,
    target,
    type: 'smoothstep',
    animated: true,
    style: { 
      stroke: label?.color || '#CBD5E1', // Use neutral gray-blue as default
      strokeWidth: 1.5,
      opacity: 0.8
    },
    label: customLabel || label?.displayName || '',
    data: {
      conditionType: 'success' as EdgeConditionType,
      label: customLabel || label?.displayName || '',
      description: label?.description || '',
      labelId: labelId || undefined,
      // Add connection menu configuration
      ...(menuConfig && {
        condition: menuConfig.condition,
        connectionMenu: menuConfig.connectionMenu,
        connectionOptions: menuConfig.connectionOptions
      })
    }
  };
}

export function updateEdgeLabel(edge: Edge, labelId: string): Edge {
  const label = getConnectionLabelById(labelId, connectionLabelLibrary);
  
  if (!label) return edge;

  return {
    ...edge,
    style: {
      ...edge.style,
      stroke: label.color,
      strokeWidth: 1.5,
      opacity: 0.8
    },
    label: label.displayName,
    data: {
      ...edge.data,
      label: label.displayName,
      description: label.description,
      labelId: labelId
    }
  };
}

export function getEdgeLabelColor(labelId: string): string {
  const label = getConnectionLabelById(labelId, connectionLabelLibrary);
  return label?.color || '#CBD5E1'; // Use neutral gray-blue as default
}

export function validateEdgeLabel(fromNodeType: string, toNodeType: string, labelId: string): boolean {
  const label = getConnectionLabelById(labelId, connectionLabelLibrary);
  if (!label) return false;

  // Basic validation rules
  const validationRules: Record<string, (from: string, to: string) => boolean> = {
    'flow.start': (from, to) => from.toLowerCase().includes('start'),
    'flow.complete': (from, to) => to.toLowerCase().includes('end'),
    'ai.send': (from, to) => from.toLowerCase().includes('input') && to.toLowerCase().includes('process'),
    'ai.result': (from, to) => from.toLowerCase().includes('process') && to.toLowerCase().includes('decision'),
    'logic.yes': (from, to) => from.toLowerCase().includes('decision'),
    'logic.no': (from, to) => from.toLowerCase().includes('decision'),
    'notify.user': (from, to) => to.toLowerCase().includes('notification') || to.toLowerCase().includes('message'),
    'db.save': (from, to) => to.toLowerCase().includes('database') || to.toLowerCase().includes('storage'),
    'api.send': (from, to) => to.toLowerCase().includes('api') || to.toLowerCase().includes('webhook')
  };

  const rule = validationRules[labelId];
  return rule ? rule(fromNodeType, toNodeType) : true;
}

export function getSuggestedEdgeLabels(fromNodeType: string, toNodeType: string): ConnectionLabel[] {
  const suggestions: ConnectionLabel[] = [];
  
  // Flow control suggestions
  if (fromNodeType.toLowerCase().includes('start')) {
    const label = getConnectionLabelById('flow.start', connectionLabelLibrary);
    if (label) suggestions.push(label);
  }
  
  if (toNodeType.toLowerCase().includes('end')) {
    const label = getConnectionLabelById('flow.complete', connectionLabelLibrary);
    if (label) suggestions.push(label);
  }

  // AI automation suggestions
  if (fromNodeType.toLowerCase().includes('input') && toNodeType.toLowerCase().includes('process')) {
    const label = getConnectionLabelById('ai.send', connectionLabelLibrary);
    if (label) suggestions.push(label);
  }

  if (fromNodeType.toLowerCase().includes('process') && toNodeType.toLowerCase().includes('decision')) {
    const label = getConnectionLabelById('ai.result', connectionLabelLibrary);
    if (label) suggestions.push(label);
  }

  // Logic routing suggestions
  if (fromNodeType.toLowerCase().includes('decision')) {
    const yesLabel = getConnectionLabelById('logic.yes', connectionLabelLibrary);
    const noLabel = getConnectionLabelById('logic.no', connectionLabelLibrary);
    if (yesLabel) suggestions.push(yesLabel);
    if (noLabel) suggestions.push(noLabel);
  }

  // Notification suggestions
  if (toNodeType.toLowerCase().includes('notification') || toNodeType.toLowerCase().includes('message')) {
    const label = getConnectionLabelById('notify.user', connectionLabelLibrary);
    if (label) suggestions.push(label);
  }

  // Integration suggestions
  if (toNodeType.toLowerCase().includes('database') || toNodeType.toLowerCase().includes('storage')) {
    const label = getConnectionLabelById('db.save', connectionLabelLibrary);
    if (label) suggestions.push(label);
  }

  if (toNodeType.toLowerCase().includes('api') || toNodeType.toLowerCase().includes('webhook')) {
    const label = getConnectionLabelById('api.send', connectionLabelLibrary);
    if (label) suggestions.push(label);
  }

  return suggestions;
}
