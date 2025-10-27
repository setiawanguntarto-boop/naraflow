# Node Library v3 - Usage Examples

## Example 1: Simple Chat Workflow

```typescript
import { nodeTypeRegistry } from '@/lib/nodeTypeRegistry';
import { createExecutionContext, executeNodeWithRetry, applyMemoryUpdates } from '@/lib/executionEngine';
import { createLLMService, createStorageService, createLoggerService } from '@/lib/services';

async function runChatWorkflow() {
  // Initialize services
  const llm = createLLMService('openai', process.env.OPENAI_API_KEY!);
  const storage = createStorageService('indexeddb', 'naraflow');
  const logger = createLoggerService('ChatWorkflow', 'info');
  
  const services = {
    llm,
    storage,
    logger,
    http: null,
    sendMessage: null
  };
  
  // Step 1: Trigger (WhatsApp message received)
  const triggerContext = createExecutionContext(
    'chat-workflow-1',
    'exec-chat-1',
    'trigger-1',
    {
      user_id: 'user123',
      message: 'What is the weather today?',
      message_id: 'msg-123'
    },
    {},
    {},
    services,
    {
      providerPayload: {},
      userId: 'user123'
    }
  );
  
  const triggerResult = await executeNodeWithRetry(
    'whatsapp.trigger',
    triggerContext,
    { provider: 'meta', dedupeWindowSec: 300 }
  );
  
  // Step 2: Call LLM
  const chatContext = createExecutionContext(
    'chat-workflow-1',
    'exec-chat-1',
    'chat-1',
    triggerResult.data,
    {},
    {},
    services,
    { userId: 'user123' }
  );
  
  const chatResult = await executeNodeWithRetry(
    'ai.chatModel',
    chatContext,
    {
      model: 'gpt-4o',
      systemPrompt: 'You are a helpful assistant. Answer questions concisely.',
      promptTemplate: '{{payload.message}}',
      temperature: 0.7,
      maxTokens: 200
    }
  );
  
  // Step 3: Send response back to user
  const sendContext = createExecutionContext(
    'chat-workflow-1',
    'exec-chat-1',
    'send-1',
    { ...chatResult.data, user_id: 'user123' },
    {},
    {},
    { ...services, sendMessage: mockSendMessage },
    { userId: 'user123' }
  );
  
  await executeNodeWithRetry(
    'whatsapp.send',
    sendContext,
    {
      provider: 'meta',
      messageType: 'text',
      text: '{{payload.agent_response}}'
    }
  );
  
  console.log('Chat workflow completed successfully');
}

// Mock sendMessage service
async function mockSendMessage(
  channel: string,
  userId: string,
  message: string,
  options?: any
): Promise<any> {
  console.log(`Sending ${message} to ${userId} via ${channel}`);
  return { messageId: 'mock-' + Date.now() };
}
```

## Example 2: Data Entry Workflow

```typescript
async function runDataEntryWorkflow() {
  const services = {
    llm: createLLMService('openai', process.env.OPENAI_API_KEY!),
    storage: createStorageService('indexeddb', 'naraflow'),
    logger: createLoggerService('DataEntry', 'info'),
    http: null,
    sendMessage: null
  };
  
  // Step 1: Extract fields from message using LLM
  const extractContext = createExecutionContext(
    'data-entry-1',
    'exec-data-1',
    'extract-1',
    {
      user_id: 'user456',
      message: 'My name is John Doe, phone: 123-456-7890'
    },
    {},
    {},
    services,
    { userId: 'user456' }
  );
  
  const extractResult = await executeNodeWithRetry(
    'ai.chatModel',
    extractContext,
    {
      model: 'gpt-4o',
      systemPrompt: 'Extract structured data from user message. Return JSON with fields: name, phone, email if available.',
      promptTemplate: 'Extract data from: {{payload.message}}',
      temperature: 0,
      maxTokens: 200
    }
  );
  
  // Step 2: Store in memory
  const storedData = JSON.parse(extractResult.data.agent_response);
  const memorySetContext = createExecutionContext(
    'data-entry-1',
    'exec-data-1',
    'memory-set-1',
    storedData,
    {},
    {},
    services,
    { userId: 'user456' }
  );
  
  const memoryResult = await executeNodeWithRetry(
    'memory.set',
    memorySetContext,
    {
      key: '{{meta.userId}}-data',
      value: storedData,
      merge: true
    }
  );
  
  // Apply memory updates
  if (memoryResult.updatedMemory) {
    await applyMemoryUpdates(memoryResult.updatedMemory, services.storage);
  }
  
  // Step 3: Get all collected data
  const memoryGetContext = createExecutionContext(
    'data-entry-1',
    'exec-data-1',
    'memory-get-1',
    {},
    {},
    { userId: 'user456' },
    services,
    { userId: 'user456' }
  );
  
  const allData = await executeNodeWithRetry(
    'memory.get',
    memoryGetContext,
    {
      key: '{{vars.userId}}-data',
      scope: 'user'
    }
  );
  
  console.log('Collected data:', allData.data);
}
```

## Example 3: Validation & Error Handling

```typescript
async function runValidationWorkflow() {
  const services = {
    llm: null,
    storage: createStorageService('indexeddb', 'naraflow'),
    logger: createLoggerService('Validation', 'info'),
    http: null,
    sendMessage: null
  };
  
  // Step 1: Validate email
  const validationContext = createExecutionContext(
    'validation-1',
    'exec-val-1',
    'validate-1',
    {
      email: 'john@example.com',
      phone: '123-456-7890'
    },
    {},
    {},
    services,
    {}
  );
  
  const validationResult = await executeNodeWithRetry(
    'validation.basic',
    validationContext,
    {
      fieldName: 'email',
      rules: [
        { type: 'required' },
        { type: 'email' }
      ]
    }
  );
  
  // Route based on validation result
  if (validationResult.status === 'success' && !validationResult.data.isValid) {
    console.log('Validation failed:', validationResult.data.errors);
    // Route to error handling
  } else {
    console.log('Validation passed');
    // Continue workflow
  }
}
```

## Example 4: Conditional Routing

```typescript
async function runConditionalWorkflow() {
  const services = {
    llm: null,
    storage: createStorageService('indexeddb', 'naraflow'),
    logger: createLoggerService('Conditional', 'info'),
    http: null,
    sendMessage: null
  };
  
  // Step 1: Check status
  const switchContext = createExecutionContext(
    'conditional-1',
    'exec-cond-1',
    'switch-1',
    {
      status: 'complete',
      priority: 'high'
    },
    {},
    {},
    services,
    {}
  );
  
  const switchResult = await executeNodeWithRetry(
    'control.switch',
    switchContext,
    {
      expression: 'payload.status === "complete"',
      cases: [
        { label: 'Complete', value: 'next-step' },
        { label: 'Pending', value: 'wait' },
        { label: 'Error', value: 'error-handler' }
      ]
    }
  );
  
  console.log('Routed to:', switchResult.next);
  // switchResult.next will be 'next-step', 'wait', or 'error-handler'
}
```

## Example 5: Multi-Step Form Collection

```typescript
async function runFormCollectionWorkflow() {
  const services = {
    llm: createLLMService('openai', process.env.OPENAI_API_KEY!),
    storage: createStorageService('indexeddb', 'naraflow'),
    logger: createLoggerService('FormCollection', 'info'),
    http: null,
    sendMessage: null
  };
  
  // Define form fields
  const fields = ['name', 'email', 'phone', 'address'];
  const currentField = 'name';
  const collectedData = { name: 'John' };
  
  // Step 1: Determine next field to ask
  const memoryContext = createExecutionContext(
    'form-collection-1',
    'exec-form-1',
    'memory-get-1',
    collectedData,
    {},
    {},
    services,
    { userId: 'user789' }
  );
  
  const getMemoryResult = await executeNodeWithRetry(
    'memory.get',
    memoryContext,
    {
      key: '{{meta.userId}}-form-data',
      scope: 'user'
    }
  );
  
  const existingData = getMemoryResult.data || {};
  
  // Step 2: Find missing field
  const missingFields = fields.filter(f => !existingData[f]);
  const nextField = missingFields[0];
  
  // Step 3: Use LLM to ask question
  const llmContext = createExecutionContext(
    'form-collection-1',
    'exec-form-1',
    'llm-1',
    { existingData, nextField },
    { 'user789-form-data': existingData },
    {},
    services,
    { userId: 'user789' }
  );
  
  const question = await executeNodeWithRetry(
    'ai.chatModel',
    llmContext,
    {
      model: 'gpt-4o',
      systemPrompt: 'You are a form collection assistant. Ask for missing information politely.',
      promptTemplate: 'Current data: {{payload.existingData}}. Ask for {{payload.nextField}}.',
      temperature: 0.7,
      maxTokens: 100
    }
  );
  
  console.log('Next question:', question.data.agent_response);
  
  // Step 4: Send question to user (through WhatsApp Send node)
  // ... (similar to previous examples)
}
```

## Service Mock Utilities

```typescript
// Mock SendMessage service
export async function createMockSendMessage() {
  return async (channel: string, userId: string, message: string, options?: any) => {
    logger.info(`[Mock] Sending to ${userId} via ${channel}: ${message}`);
    return {
      messageId: `mock-${Date.now()}`,
      channel,
      userId,
      sent: true
    };
  };
}

// Create full service suite
export function createServiceSuite(config: {
  llmProvider?: 'openai' | 'google' | 'local';
  llmApiKey?: string;
  llmEndpoint?: string;
  storageType?: 'indexeddb' | 'localStorage' | 'api';
  storageEndpoint?: string;
}) {
  return {
    llm: config.llmProvider 
      ? createLLMService(config.llmProvider, config.llmApiKey || '', config.llmEndpoint)
      : null,
    storage: createStorageService(
      config.storageType || 'indexeddb',
      'naraflow',
      config.storageEndpoint
    ),
    logger: createLoggerService('WorkflowEngine', 'info'),
    http: null,
    sendMessage: createMockSendMessage()
  };
}
```

## Running Examples

1. **Install dependencies** (if not already installed):
```bash
npm install json-schema ajv
```

2. **Set environment variables**:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

3. **Run examples** (create test files):
```typescript
// test-chat-workflow.ts
import { runChatWorkflow } from './examples/chat-workflow';

runChatWorkflow().catch(console.error);
```

4. **View in browser console**:
   - Open browser DevTools
   - Check Console for execution logs
   - Check Application > IndexedDB for stored data

