import { NodeTypeDefinition } from '../nodeLibrary_v3';

export const MemoryGetNode: NodeTypeDefinition = {
  id: 'memory.get',
  version: '1.0.0',
  label: 'Get Memory',
  description: 'Read conversation memory for user/session',
  category: 'utility',
  
  configSchema: {
    type: 'object',
    properties: {
      key: {
        type: 'string',
        description: 'Memory key (supports {{placeholders}})'
      },
      scope: {
        type: 'string',
        enum: ['user', 'session', 'workflow'],
        default: 'user',
        description: 'Memory scope'
      }
    },
    required: ['key', 'scope']
  },

  inputs: {
    default: {
      name: 'default',
      type: 'data',
      required: false,
      description: 'Optional input data'
    }
  },
  
  outputs: {
    default: {
      name: 'default',
      type: 'data',
      description: 'Retrieved memory value (null if not found)'
    }
  },

  ui: {
    icon: 'database',
    category: 'utility',
    fieldsOrder: ['key', 'scope'],
    helpLinks: ['docs/memory-management']
  },

  runtime: {
    handler: '@/lib/executors/memoryGetExecutor',
    timeoutMs: 1000,
    retry: {
      count: 0
    }
  },

  meta: {
    tags: ['memory', 'state', 'utility'],
    author: 'Naraflow Team',
    createdAt: '2025-01-01'
  }
};

