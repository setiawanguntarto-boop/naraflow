import { NodeTypeDefinition } from '../nodeLibrary_v3';

export const SwitchNode: NodeTypeDefinition = {
  id: 'control.switch',
  version: '1.0.0',
  label: 'Switch (Route)',
  description: 'Route flow based on expression results',
  category: 'control',
  
  configSchema: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'Expression to evaluate (e.g., "payload.status === \'complete\'")'
      },
      cases: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            label: {
              type: 'string',
              description: 'Case label'
            },
            value: {
              type: 'string',
              description: 'Case value to route to'
            }
          },
          required: ['label', 'value']
        },
        default: []
      }
    },
    required: ['expression', 'cases']
  },

  inputs: {
    default: {
      name: 'default',
      type: 'condition',
      required: true,
      description: 'Input data for condition evaluation'
    }
  },
  
  outputs: {
    default: {
      name: 'default',
      type: 'route',
      description: 'Default route if no case matches'
    }
  },

  ui: {
    icon: 'git-branch',
    category: 'control',
    fieldsOrder: ['expression', 'cases'],
    helpLinks: ['docs/routing']
  },

  runtime: {
    handler: '@/lib/executors/switchExecutor',
    timeoutMs: 2000
  },

  meta: {
    tags: ['routing', 'condition', 'control']
  }
};

