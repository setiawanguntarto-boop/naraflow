/**
 * Node Planner for WhatsApp Data Entry
 * Plans node sequence based on intent and extracted entities
 */

import { PromptAnalysis, NodePlan } from './types';
import { nodeTypeRegistry } from '@/lib/nodeTypeRegistry';
import { planNotificationWorkflow } from './nodePlanners/notification.planner';
import { planConditionalWorkflow } from './nodePlanners/conditional.planner';

const NODE_SPACING_X = 250;
const NODE_SPACING_Y = 150;

/**
 * Plan node sequence based on intent and entities
 */
export function planNodes(analysis: PromptAnalysis): NodePlan[] {
  // Route to specific planner based on workflow type
  if (analysis.workflow_type === 'conditional') {
    return planConditionalWorkflow(analysis);
  }
  
  if (analysis.intent.type === 'data_processing') {
    return planNotificationWorkflow(analysis);
  }
  
  // Default: WhatsApp data entry
  const plans: NodePlan[] = [];
  
  // Generate unique node IDs
  const nodeIds = {
    start: `start-${Date.now()}`,
    trigger: `trigger-${Date.now()}`,
    aiChat: `chat-${Date.now()}`,
    memorySet: `store-${Date.now()}`,
    validation: `validate-${Date.now()}`,
    send: `send-${Date.now()}`,
    end: `end-${Date.now()}`
  };
  
  // Start position
  let currentX = 100;
  let currentY = 300;
  
  // Node 1: Start
  plans.push({
    nodeId: nodeIds.start,
    nodeType: 'default', // Use default node type
    position: { x: currentX, y: currentY },
    config: {
      label: 'Start',
      description: 'Workflow entry point'
    },
    connections: [{ target: nodeIds.trigger, source_port: 'default', target_port: 'default' }]
  });
  
  // Node 2: WhatsApp Trigger
  currentX += NODE_SPACING_X;
  plans.push({
    nodeId: nodeIds.trigger,
    nodeType: 'whatsapp.trigger',
    position: { x: currentX, y: currentY },
    config: {
      provider: 'meta',
      webhookPath: '/webhook/whatsapp',
      verifyToken: process.env.WEBHOOK_VERIFY_TOKEN || 'verify-token',
      validateSignature: true
    },
    connections: [{ target: nodeIds.aiChat, source_port: 'default', target_port: 'default' }]
  });
  
  // Node 3: AI Chat Model (for form extraction)
  currentX += NODE_SPACING_X;
  const systemPrompt = generateSystemPrompt(analysis);
  
  plans.push({
    nodeId: nodeIds.aiChat,
    nodeType: 'ai.chatModel',
    position: { x: currentX, y: currentY },
    config: {
      provider: 'openai',
      model: 'gpt-4o',
      systemPrompt: systemPrompt,
      promptTemplate: 'Extract data from the WhatsApp message:\n\n{{payload.message}}\n\nReturn only a valid JSON object.',
      temperature: 0.1,
      maxTokens: 500,
      outputSchema: {
        type: 'object',
        properties: analysis.entities.reduce((acc, entity) => {
          acc[entity.field] = { type: entity.type };
          return acc;
        }, {} as Record<string, any>)
      }
    },
    connections: [{ target: nodeIds.memorySet, source_port: 'default', target_port: 'default' }]
  });
  
  // Node 4: Memory Set (store extracted data)
  currentX += NODE_SPACING_X;
  plans.push({
    nodeId: nodeIds.memorySet,
    nodeType: 'memory.set',
    position: { x: currentX, y: currentY },
    config: {
      key: 'extracted_data',
      value: '{{payload.structuredOutput}}',
      merge: false
    },
    connections: [{ target: nodeIds.validation, source_port: 'default', target_port: 'default' }]
  });
  
  // Node 5: Validation (optional, only if we have validation rules)
  if (analysis.entities.some(e => e.validation && e.validation.length > 1)) {
    currentX += NODE_SPACING_X;
    plans.push({
      nodeId: nodeIds.validation,
      nodeType: 'validation.basic',
      position: { x: currentX, y: currentY },
      config: {
        rules: generateValidationRules(analysis.entities),
        errorMessage: 'Validasi gagal'
      },
      connections: [{ target: nodeIds.send, source_port: 'default', target_port: 'default' }]
    });
  } else {
    // Connect memory directly to send if no validation
    plans[plans.length - 1].connections[0].target = nodeIds.send;
  }
  
  // Node 6: WhatsApp Send (acknowledgment)
  currentX += NODE_SPACING_X;
  plans.push({
    nodeId: nodeIds.send,
    nodeType: 'whatsapp.send',
    position: { x: currentX, y: currentY },
    config: {
      provider: 'meta',
      messageType: 'text',
      text: generateAcknowledgmentMessage(analysis)
    },
    connections: [{ target: nodeIds.end, source_port: 'default', target_port: 'default' }]
  });
  
  // Node 7: End
  currentX += NODE_SPACING_X;
  plans.push({
    nodeId: nodeIds.end,
    nodeType: 'default',
    position: { x: currentX, y: currentY },
    config: {
      label: 'End',
      description: 'Workflow complete'
    },
    connections: []
  });
  
  return plans;
}

/**
 * Generate system prompt for AI Chat Model based on extracted entities
 */
function generateSystemPrompt(analysis: PromptAnalysis): string {
  const fieldsList = analysis.entities.map(entity => 
    `- ${entity.field}: ${entity.type} (required: ${entity.required ? 'yes' : 'no'})`
  ).join('\n');
  
  return `You are a data extraction assistant for WhatsApp. Extract the following fields from user messages.

Fields to extract:
${fieldsList}

Rules:
1. Return only a valid JSON object
2. Use exact field names as specified above
3. If a field is missing, return null for that field
4. Validate phone numbers if phone field exists
5. Validate email format if email field exists

Example output format:
{
  ${analysis.entities.map(e => `"${e.field}": "value"`).join(',\n  ')}
}`;
}

/**
 * Generate validation rules for Validation node
 */
function generateValidationRules(entities: PromptAnalysis['entities']): any[] {
  const rules: any[] = [];
  
  for (const entity of entities) {
    if (entity.validation && entity.validation.includes('required')) {
      rules.push({
        field: entity.field,
        type: entity.type,
        required: true
      });
    }
    
    // Add specific validation rules
    if (entity.validation?.includes('phone')) {
      rules.push({
        field: entity.field,
        pattern: '^[+]?[0-9]{10,15}$',
        message: `${entity.field} must be a valid phone number`
      });
    }
    
    if (entity.validation?.includes('email')) {
      rules.push({
        field: entity.field,
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        message: `${entity.field} must be a valid email`
      });
    }
  }
  
  return rules;
}

/**
 * Generate acknowledgment message
 */
function generateAcknowledgmentMessage(analysis: PromptAnalysis): string {
  const fieldCount = analysis.entities.length;
  
  if (fieldCount > 0) {
    return `Terima kasih! Data Anda telah disimpan:\n\n${analysis.entities.map(e => `✓ ${e.field}`).join('\n')}`;
  }
  
  return 'Terima kasih! Data Anda telah disimpan.';
}
