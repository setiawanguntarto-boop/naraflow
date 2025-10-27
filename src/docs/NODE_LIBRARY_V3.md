# Node Library v3 - Documentation

## Overview

Node Library v3 introduces a production-ready, n8n-inspired architecture for defining, validating, and executing workflow nodes in the Naraflow platform.

## Key Features

- **Structured Configuration**: JSON Schema-based node configuration
- **Runtime Execution**: Configurable timeout, retry, and error handling
- **Security**: Auth type and scope management
- **Versioning**: Semver-based version control
- **Extensibility**: Plugin system for new node types

## Architecture

```
Node Definition (NodeTypeDefinition)
  ├─ Metadata (id, version, label, description, category)
  ├─ Config Schema (JSON Schema validation)
  ├─ Input/Output Port Definitions
  ├─ UI Configuration
  ├─ Runtime Contract (handler, timeout, retry)
  └─ Security & Meta Tags

Executor (Function)
  ├─ Execution Context (workflowId, executionId, nodeId, payload, memory, vars)
  ├─ Services (LLM, Storage, HTTP, Logger, SendMessage)
  ├─ Node Config (validated against schema)
  └─ Returns NodeResult (status, data, error, next)
```

## Usage Examples

### 1. Basic Node Execution

```typescript
import { nodeTypeRegistry } from '@/lib/nodeTypeRegistry';
import { createExecutionContext, executeNodeWithRetry } from '@/lib/executionEngine';
import { createLLMService, createStorageService, createLoggerService } from '@/lib/services';

// Initialize services
const llm = createLLMService('openai', process.env.OPENAI_API_KEY!);
const storage = createStorageService('indexeddb', 'naraflow');
const logger = createLoggerService('WorkflowEngine', 'info');

// Create execution context
const context = createExecutionContext(
  'workflow-1',
  'exec-1',
  'node-1',
  { user_id: 'user123', message: 'Hello' },
  { previous_messages: [] },
  {},
  { llm, storage, logger, http: null, sendMessage: null },
  { providerPayload: {}, userId: 'user123' }
);

// Execute node
const result = await executeNodeWithRetry(
  'ai.chatModel',
  context,
  {
    model: 'gpt-4o',
    systemPrompt: 'You are a helpful assistant',
    promptTemplate: 'User says: {{payload.message}}',
    temperature: 0.7,
    maxTokens: 500
  }
);

console.log('Execution result:', result);
```

### 2. Memory Operations

```typescript
// Get memory
const memoryContext = createExecutionContext(
  'workflow-1',
  'exec-1',
  'memory-get-1',
  {},
  {},
  { userId: 'user123' },
  { llm: null, storage, logger, http: null, sendMessage: null },
  { userId: 'user123' }
);

const memoryResult = await executeNodeWithRetry(
  'memory.get',
  memoryContext,
  {
    key: '{{vars.userId}}-conversation',
    scope: 'user'
  }
);

// Set memory
const setMemoryContext = createExecutionContext(
  'workflow-1',
  'exec-1',
  'memory-set-1',
  { field: 'name', value: 'John' },
  { 'user123-conversation': { name: 'John' } },
  {},
  { llm: null, storage, logger, http: null, sendMessage: null },
  { userId: 'user123' }
);

await executeNodeWithRetry(
  'memory.set',
  setMemoryContext,
  {
    key: '{{meta.userId}}-conversation',
    value: { name: 'John', email: 'john@example.com' },
    merge: true
  }
);
```

### 3. Validation & Routing

```typescript
// Validate data
const validationResult = await executeNodeWithRetry(
  'validation.basic',
  context,
  {
    fieldName: 'payload.email',
    rules: [
      { type: 'required' },
      { type: 'email' }
    ]
  }
);

// Route based on condition
const switchResult = await executeNodeWithRetry(
  'control.switch',
  context,
  {
    expression: 'payload.status === "complete"',
    cases: [
      { label: 'Complete', value: 'success' },
      { label: 'Pending', value: 'waiting' }
    ]
  }
);
```

## Service Implementations

### LLM Service

```typescript
import { createLLMService } from '@/lib/services/llmService';

// OpenAI
const openai = createLLMService('openai', 'sk-...');

// Google AI
const googleAI = createLLMService('google', 'AIza...');

// Local LLM
const localLLM = createLLMService('local', '', 'http://localhost:8080');
```

### Storage Service

```typescript
import { createStorageService } from '@/lib/services/storageService';

// IndexedDB
const indexeddb = createStorageService('indexeddb', 'naraflow');

// LocalStorage
const localStorage = createStorageService('localStorage');

// API Backend
const apiStorage = createStorageService('api', '', 'https://api.naraflow.com');
```

### Logger Service

```typescript
import { createLoggerService } from '@/lib/services/loggerService';

const logger = createLoggerService('MyService', 'debug');

logger.info('Information message');
logger.warn('Warning message');
logger.error('Error message');
logger.debug('Debug message');
```

## Registering Custom Nodes

```typescript
import { nodeTypeRegistry } from '@/lib/nodeTypeRegistry';
import { NodeTypeDefinition } from '@/core/nodeLibrary_v3';

const myCustomNode: NodeTypeDefinition = {
  id: 'custom.myNode',
  version: '1.0.0',
  label: 'My Custom Node',
  description: 'Does custom things',
  category: 'utility',
  
  configSchema: {
    type: 'object',
    properties: {
      myField: { type: 'string', description: 'My field' }
    },
    required: ['myField']
  },
  
  inputs: {
    default: { name: 'default', type: 'data', required: true }
  },
  
  outputs: {
    default: { name: 'default', type: 'data' }
  },
  
  ui: {
    icon: 'zap',
    category: 'utility'
  },
  
  runtime: {
    handler: '@/lib/executors/myCustomExecutor',
    timeoutMs: 5000
  },
  
  meta: {
    tags: ['custom', 'utility']
  }
};

async function myCustomExecutor(context, config) {
  return {
    status: 'success',
    data: { result: config.myField },
    next: 'default'
  };
}

// Register
nodeTypeRegistry.register(myCustomNode, myCustomExecutor);
```

## Migration from v2

```typescript
import { migrateV2ToV3, migrateWorkflowToV3 } from '@/core/nodeLibraryMigration';

// Migrate single node
const v3Node = migrateV2ToV3(v2Node);

// Migrate entire workflow
const v3Workflow = migrateWorkflowToV3(v2Workflow);
```

## Best Practices

1. **Always validate config** using `configSchema`
2. **Use appropriate timeout** values for each node type
3. **Handle errors gracefully** and provide meaningful error messages
4. **Use memory efficiently** with proper scoping (user/session/workflow)
5. **Implement retry logic** for external service calls
6. **Document your executors** with clear comments
7. **Test thoroughly** before registering new nodes

## Available Node Types

- `whatsapp.trigger` - WhatsApp message trigger
- `ai.chatModel` - LLM chat model
- `memory.get` - Read memory
- `memory.set` - Write memory
- `validation.basic` - Data validation
- `control.switch` - Conditional routing
- `whatsapp.send` - Send WhatsApp messages

## Next Steps

- See `src/core/nodes/` for node definitions
- See `src/lib/executors/` for executor implementations
- See `src/lib/services/` for service implementations
- See `src/lib/executionEngine.ts` for execution logic

