import { ConnectionValidationRule, ConnectionValidationResult } from '@/types/connection';
import { Node, Edge } from '@xyflow/react';

export class ConnectionLabelValidator {
  private static rules: ConnectionValidationRule[] = [
    // Flow Control Rules
    {
      fromNodeType: 'Start Workflow',
      toNodeType: 'End Workflow',
      disallowedLabels: ['flow.complete', 'flow.abort'],
      requiredLabels: ['flow.start']
    },
    {
      fromNodeType: 'Start Workflow',
      toNodeType: 'Ask Question',
      allowedLabels: ['flow.start', 'user.ready']
    },
    
    // AI Automation Rules
    {
      fromNodeType: 'Ask Question',
      toNodeType: 'AI Analysis',
      allowedLabels: ['ai.send', 'data.processed', 'user.response']
    },
    {
      fromNodeType: 'AI Analysis',
      toNodeType: 'Decision',
      allowedLabels: ['ai.result', 'analysis.complete', 'data.transformed']
    },
    {
      fromNodeType: 'AI Analysis',
      toNodeType: 'Send Message',
      allowedLabels: ['ai.result', 'analysis.complete']
    },
    
    // Logic Routing Rules
    {
      fromNodeType: 'Decision',
      toNodeType: 'Send Message',
      allowedLabels: ['decision.yes', 'decision.no', 'logic.yes', 'logic.no', 'logic.highPriority']
    },
    {
      fromNodeType: 'Decision',
      toNodeType: 'End Workflow',
      allowedLabels: ['decision.yes', 'decision.no', 'logic.yes', 'logic.no']
    },
    
    // Data Processing Rules
    {
      fromNodeType: 'Sensor Data',
      toNodeType: 'Calculate',
      allowedLabels: ['data.received', 'data.processed']
    },
    {
      fromNodeType: 'Calculate',
      toNodeType: 'Decision',
      allowedLabels: ['calculation.complete', 'data.processed']
    },
    {
      fromNodeType: 'Calculate',
      toNodeType: 'Send Message',
      allowedLabels: ['calculation.complete']
    },
    
    // Output Rules
    {
      fromNodeType: 'Send Message',
      toNodeType: 'End Workflow',
      allowedLabels: ['message.sent', 'flow.complete']
    },
    {
      fromNodeType: 'Store Records',
      toNodeType: 'End Workflow',
      allowedLabels: ['records.saved', 'flow.complete']
    },
    
    // Error Handling Rules
    {
      fromNodeType: 'Sensor Data',
      toNodeType: 'Send Message',
      allowedLabels: ['sensor.error', 'error.alert']
    },
    {
      fromNodeType: 'Calculate',
      toNodeType: 'Send Message',
      allowedLabels: ['calculation.error', 'error.alert']
    },
    
    // Integration Rules
    {
      fromNodeType: 'Fetch External Data',
      toNodeType: 'Calculate',
      allowedLabels: ['data.fetched', 'api.receive']
    },
    {
      fromNodeType: 'Fetch External Data',
      toNodeType: 'Send Message',
      allowedLabels: ['fetch.failed', 'error.alert']
    }
  ];

  static validateConnection(
    fromNode: Node,
    toNode: Node,
    labelId: string
  ): ConnectionValidationResult {
    const fromNodeType = fromNode.data?.label || fromNode.type || '';
    const toNodeType = toNode.data?.label || toNode.type || '';
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Find applicable rules
    const applicableRules = this.rules.filter(rule => 
      this.matchesNodeType(fromNodeType, rule.fromNodeType) &&
      this.matchesNodeType(toNodeType, rule.toNodeType)
    );

    if (applicableRules.length === 0) {
      warnings.push(`No validation rules found for connection: ${fromNodeType} → ${toNodeType}`);
      return { valid: true, errors, warnings, suggestions };
    }

    // Check each applicable rule
    for (const rule of applicableRules) {
      // Check disallowed labels
      if (rule.disallowedLabels?.includes(labelId)) {
        errors.push(`Label "${labelId}" is not allowed for connection: ${fromNodeType} → ${toNodeType}`);
      }

      // Check allowed labels
      if (rule.allowedLabels && !rule.allowedLabels.includes(labelId)) {
        errors.push(`Label "${labelId}" is not valid for connection: ${fromNodeType} → ${toNodeType}`);
        suggestions.push(...rule.allowedLabels);
      }

      // Check required labels
      if (rule.requiredLabels && !rule.requiredLabels.includes(labelId)) {
        warnings.push(`Consider using one of the recommended labels: ${rule.requiredLabels.join(', ')}`);
      }
    }

    // General semantic validation
    this.validateSemanticConsistency(fromNodeType, toNodeType, labelId, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions: [...new Set(suggestions)]
    };
  }

  private static matchesNodeType(nodeType: string, ruleType: string): boolean {
    // Exact match
    if (nodeType === ruleType) return true;
    
    // Partial match for generic types
    const genericMappings: Record<string, string[]> = {
      'Start Workflow': ['Start', 'start'],
      'End Workflow': ['End', 'end'],
      'Ask Question': ['Ask Input', 'Ask Question', 'input'],
      'AI Analysis': ['Process Data', 'AI Analysis', 'process'],
      'Decision': ['Decision', 'decision'],
      'Send Message': ['WhatsApp Message', 'Send Message', 'notification'],
      'Calculate': ['Calculate', 'calculate'],
      'Sensor Data': ['Sensor', 'sensor'],
      'Store Records': ['Save Data', 'Store Records', 'database']
    };

    const mappedTypes = genericMappings[ruleType] || [ruleType];
    return mappedTypes.some(type => nodeType.includes(type) || type.includes(nodeType));
  }

  private static validateSemanticConsistency(
    fromNodeType: string,
    toNodeType: string,
    labelId: string,
    errors: string[],
    warnings: string[]
  ): void {
    // Semantic consistency checks
    const semanticRules = [
      {
        condition: () => fromNodeType.includes('Start') && labelId === 'flow.end',
        message: 'Start nodes should not connect directly to End with "End" label'
      },
      {
        condition: () => fromNodeType.includes('End') && !labelId.includes('complete'),
        message: 'End nodes should typically receive completion signals'
      },
      {
        condition: () => labelId.includes('error') && toNodeType.includes('End'),
        message: 'Error paths should not lead directly to End nodes'
      },
      {
        condition: () => labelId.includes('ai.') && !toNodeType.includes('AI') && !toNodeType.includes('Decision'),
        message: 'AI labels should typically connect to AI or Decision nodes'
      }
    ];

    for (const rule of semanticRules) {
      if (rule.condition()) {
        warnings.push(rule.message);
      }
    }
  }

  static getSuggestedLabels(fromNode: Node, toNode: Node): string[] {
    const fromNodeType = fromNode.data?.label || fromNode.type || '';
    const toNodeType = toNode.data?.label || toNode.type || '';
    
    const applicableRules = this.rules.filter(rule => 
      this.matchesNodeType(fromNodeType, rule.fromNodeType) &&
      this.matchesNodeType(toNodeType, rule.toNodeType)
    );

    const suggestions = new Set<string>();
    
    for (const rule of applicableRules) {
      if (rule.allowedLabels) {
        rule.allowedLabels.forEach(label => suggestions.add(label));
      }
      if (rule.requiredLabels) {
        rule.requiredLabels.forEach(label => suggestions.add(label));
      }
    }

    return Array.from(suggestions);
  }

  static validateWorkflow(nodes: Node[], edges: Edge[]): ConnectionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate each edge
    for (const edge of edges) {
      const fromNode = nodes.find(n => n.id === edge.source);
      const toNode = nodes.find(n => n.id === edge.target);
      
      if (!fromNode || !toNode) {
        errors.push(`Edge ${edge.id} references non-existent nodes`);
        continue;
      }

      const labelId = edge.data?.labelId;
      if (labelId) {
        const result = this.validateConnection(fromNode, toNode, labelId);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
        suggestions.push(...result.suggestions);
      } else {
        warnings.push(`Edge ${edge.id} has no connection label`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions: [...new Set(suggestions)]
    };
  }
}
