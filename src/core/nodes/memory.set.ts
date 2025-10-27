import { NodeTypeDefinition } from '../nodeLibrary_v3';

export const MemorySetNode: NodeTypeDefinition = {
  id: 'memory.set',
  version: '1.0.0',
  label: 'Set Memory',
  description: 'Write conversation memory for user/session',
  category: 'utility',
  
  configSchema: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description: 'Memory key (supports {{placeholders}})'
      },
      value: {
        description: 'Memory value to store'
      },
      merge: {
        type: 'boolean',
        default: true,
        description: 'Merge with existing value instead of replace'
      }
    },
    required: ['key', 'value']
  },

  inputs: {
    default: {
      name: 'default',
      type: 'data',
      required: true
    }
  },
  
  outputs: {
    default: {
      name: 'default',
      type: 'data',
      description: 'Updated memory object'
    }
  },

  ui: {
    icon: 'database',
    category: 'utility',
    fieldsOrder: ['key', 'value', 'merge']
  },

  runtime: {
    handler: '@/lib/executors/memorySetExecutor',
    timeoutMs: 1000,
    retry: {
      count: 0
    }
  },

  meta: {
    tags: ['memory', 'state', 'utility']
  }
};

