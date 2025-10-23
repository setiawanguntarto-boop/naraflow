import { NodeExecutor, ExecutionResult, ExecutionContext, ExecutionLog } from '@/types/workflow';

// Registry
const executorRegistry = new Map<string, NodeExecutor>();

export const registerExecutor = (executor: NodeExecutor) => {
  executorRegistry.set(executor.nodeType, executor);
};

export const getExecutorForNode = (node: any): NodeExecutor | null => {
  return executorRegistry.get(String(node.data?.label || '')) || null;
};

// ============= WhatsApp Message Executor =============
export const WhatsAppMessageExecutor: NodeExecutor = {
  nodeType: 'WhatsApp Message',

  async execute(node, inputs, context) {
    const logs: ExecutionLog[] = [];
    const message = node.data.description || node.data.title || 'No message defined';

    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Preparing WhatsApp message...`,
      nodeId: node.id,
    });

    // Replace placeholders
    let finalMessage = message;
    for (const [key, value] of Object.entries(context.variables)) {
      finalMessage = finalMessage.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }

    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Message content: "${finalMessage.substring(0, 50)}${finalMessage.length > 50 ? '...' : ''}"`,
      nodeId: node.id,
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));

    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: '✓ WhatsApp message sent successfully (simulated)',
      nodeId: node.id,
    });

    return {
      outputs: {
        sent: true,
        message: finalMessage,
        timestamp: new Date().toISOString(),
      },
      logs,
    };
  },

  validate(node) {
    if (!node.data.description && !node.data.title) {
      return { valid: false, error: 'Message content is required' };
    }
    return { valid: true };
  },

  getRequiredInputs() {
    return [];
  },

  getOutputSchema() {
    return {
      sent: 'boolean',
      message: 'string',
      timestamp: 'string',
    };
  },
};

// ============= Input Data Executor =============
export const InputDataExecutor: NodeExecutor = {
  nodeType: 'Ask Input',

  async execute(node, inputs, context) {
    const logs: ExecutionLog[] = [];
    const question = node.data.description || node.data.title || 'Please provide input';

    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Requesting user input: "${question}"`,
      nodeId: node.id,
    });

    // Simulate user response
    await new Promise(resolve => setTimeout(resolve, 300));
    const mockResponse = 'User response (simulated)';

    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `✓ Received response: "${mockResponse}"`,
      nodeId: node.id,
    });

    return {
      outputs: {
        userInput: mockResponse,
        timestamp: new Date().toISOString(),
      },
      logs,
    };
  },

  validate(node) {
    return { valid: true };
  },

  getRequiredInputs() {
    return [];
  },

  getOutputSchema() {
    return {
      userInput: 'string',
      timestamp: 'string',
    };
  },
};

// ============= Process Data Executor =============
export const ProcessDataExecutor: NodeExecutor = {
  nodeType: 'Process Data',

  async execute(node, inputs, context) {
    const logs: ExecutionLog[] = [];

    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Processing data with ${Object.keys(inputs).length} inputs...`,
      nodeId: node.id,
    });

    await new Promise(resolve => setTimeout(resolve, 200));

    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: '✓ Data processed successfully',
      nodeId: node.id,
    });

    return {
      outputs: {
        processed: true,
        data: inputs,
      },
      logs,
    };
  },

  validate(node) {
    return { valid: true };
  },

  getRequiredInputs() {
    return [];
  },

  getOutputSchema() {
    return {
      processed: 'boolean',
      data: 'object',
    };
  },
};

// Initialize registry
registerExecutor(WhatsAppMessageExecutor);
registerExecutor(InputDataExecutor);
registerExecutor(ProcessDataExecutor);
