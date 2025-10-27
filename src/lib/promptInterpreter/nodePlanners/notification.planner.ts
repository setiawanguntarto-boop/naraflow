/**
 * Notification Flow Planner
 * Plans nodes for notification workflows
 */

import { PromptAnalysis, NodePlan } from '../types';

const NODE_SPACING_X = 250;
const NODE_SPACING_Y = 150;

/**
 * Plan notification workflow
 */
export function planNotificationWorkflow(analysis: PromptAnalysis): NodePlan[] {
  const plans: NodePlan[] = [];
  
  const nodeIds = {
    start: `start-${Date.now()}`,
    trigger: `trigger-${Date.now()}`,
    condition: `condition-${Date.now()}`,
    notifier: `notifier-${Date.now()}`,
    notification: `notification-${Date.now()}`,
    end: `end-${Date.now()}`
  };
  
  let currentX = 100;
  let currentY = 300;
  
  // Start node
  plans.push({
    nodeId: nodeIds.start,
    nodeType: 'default',
    position: { x: currentX, y: currentY },
    config: { label: 'Start' },
    connections: [{ target: nodeIds.trigger, source_port: 'default', target_port: 'default' }]
  });
  
  // Trigger node
  currentX += NODE_SPACING_X;
  plans.push({
    nodeId: nodeIds.trigger,
    nodeType: 'whatsapp.trigger',
    position: { x: currentX, y: currentY },
    config: {
      provider: 'meta',
      webhookPath: '/webhook/notification',
      validateSignature: true
    },
    connections: [{ target: nodeIds.condition, source_port: 'default', target_port: 'default' }]
  });
  
  // Condition node (check if notification should be sent)
  currentX += NODE_SPACING_X;
  plans.push({
    nodeId: nodeIds.condition,
    nodeType: 'control.switch',
    position: { x: currentX, y: currentY },
    config: {
      condition: '{{payload.should_notify}}',
      cases: [
        { value: 'true', output: 'notify' },
        { value: 'false', output: 'skip' }
      ]
    },
    connections: [
      { target: nodeIds.notification, source_port: 'notify', target_port: 'default' },
      { target: nodeIds.end, source_port: 'skip', target_port: 'default' }
    ]
  });
  
  // Notification node
  currentX += NODE_SPACING_X;
  plans.push({
    nodeId: nodeIds.notification,
    nodeType: 'whatsapp.send',
    position: { x: currentX, y: currentY },
    config: {
      provider: 'meta',
      messageType: 'text',
      text: generateNotificationMessage(analysis)
    },
    connections: [{ target: nodeIds.end, source_port: 'default', target_port: 'default' }]
  });
  
  // End node
  currentX += NODE_SPACING_X;
  plans.push({
    nodeId: nodeIds.end,
    nodeType: 'default',
    position: { x: currentX, y: currentY },
    config: { label: 'End' },
    connections: []
  });
  
  return plans;
}

function generateNotificationMessage(analysis: PromptAnalysis): string {
  return '🔔 Notification: New event detected!';
}
