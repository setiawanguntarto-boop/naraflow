import { Node, Edge } from '@xyflow/react';
import { EdgeConditionType } from '@/types/workflow';
import { createLabeledEdge, createLabeledEdgeWithMenu } from '@/lib/connectionLabelUtils';

export interface WorkflowTemplate {
  label: string;
  description: string;
  icon: string;
  nodes: Node[];
  edges: Edge[];
}

export const workflowTemplates: Record<string, WorkflowTemplate> = {
  welcomeFlow: {
    label: 'WhatsApp Welcome Flow',
    description: 'Greet new users and introduce options',
    icon: '💬',
    nodes: [
      {
        id: 'welcome-start',
        type: 'start',
        position: { x: 150, y: 150 },
        data: { label: 'Start' },
      },
      {
        id: 'welcome-message',
        type: 'default',
        position: { x: 350, y: 150 },
        data: { 
          label: 'Ask Question', 
          description: '👋 Welcome! Please tell us your name.',
          title: 'Welcome Message',
          icon: 'message-circle',
        },
      },
      {
        id: 'welcome-input',
        type: 'default',
        position: { x: 600, y: 150 },
        data: { 
          label: 'Ask Question', 
          description: 'Collect user name',
          title: 'Name Collection',
          icon: 'message-circle',
        },
      },
      {
        id: 'welcome-end',
        type: 'end',
        position: { x: 850, y: 150 },
        data: { 
          label: 'End', 
          description: 'End of welcome flow',
          title: 'Welcome Complete',
        },
      },
    ],
    edges: [
      createLabeledEdge('welcome-e1', 'welcome-start', 'welcome-message', 'flow.start'),
      createLabeledEdge('welcome-e2', 'welcome-message', 'welcome-input', 'user.ready'),
      createLabeledEdge('welcome-e3', 'welcome-input', 'welcome-end', 'flow.complete'),
    ],
  },

  dataCollection: {
    label: 'Data Collection Flow',
    description: 'Ask users multiple questions and summarize responses',
    icon: '📊',
    nodes: [
      { 
        id: 'data-start', 
        type: 'start', 
        position: { x: 150, y: 150 }, 
        data: { label: 'Start' } 
      },
      { 
        id: 'data-welcome', 
        type: 'default', 
        position: { x: 350, y: 150 }, 
        data: { 
          label: 'Send Message', 
          description: 'Welcome! Ready to collect data?',
          title: 'Welcome Message',
          icon: 'send',
        } 
      },
      { 
        id: 'data-decision', 
        type: 'decision', 
        position: { x: 550, y: 150 }, 
        data: { 
          label: 'User Decision', 
          description: 'Does user want to proceed?',
          title: 'Proceed Decision',
        } 
      },
      { 
        id: 'data-collect', 
        type: 'default', 
        position: { x: 750, y: 50 }, 
        data: { 
          label: 'Ask Question', 
          description: 'Collect user data',
          title: 'Data Collection',
          icon: 'message-circle',
        } 
      },
      { 
        id: 'data-process', 
        type: 'default', 
        position: { x: 750, y: 250 }, 
        data: { 
          label: 'Process Data', 
          description: 'Process collected information',
          title: 'Data Processing',
          icon: 'message-circle',
        } 
      },
      { 
        id: 'data-end', 
        type: 'end', 
        position: { x: 950, y: 150 }, 
        data: { 
          label: 'End',
          title: 'Collection Complete',
        } 
      },
    ],
    edges: [
      createLabeledEdge('data-e1', 'data-start', 'data-welcome', 'flow.start'),
      createLabeledEdge('data-e2', 'data-welcome', 'data-decision', 'user.ready'),
      createLabeledEdge('data-e3', 'data-decision', 'data-collect', 'logic.yes'),
      createLabeledEdge('data-e4', 'data-decision', 'data-process', 'logic.no'),
      createLabeledEdge('data-e5', 'data-collect', 'data-end', 'flow.complete'),
      createLabeledEdge('data-e6', 'data-process', 'data-end', 'data.processed'),
    ],
  },

  llamaDecisionFlow: {
    label: 'LLaMA Decision Flow',
    description: 'Use AI to make intelligent routing decisions',
    icon: '🧠',
    nodes: [
      { 
        id: 'llama-start', 
        type: 'start', 
        position: { x: 150, y: 150 }, 
        data: { label: 'Start' } 
      },
      { 
        id: 'llama-input', 
        type: 'default', 
        position: { x: 350, y: 150 }, 
        data: { 
          label: 'Ask Question', 
          description: 'Describe your request or question',
          title: 'User Input',
          icon: 'message-circle',
        } 
      },
      { 
        id: 'llama-process', 
        type: 'llama-decision', 
        position: { x: 600, y: 150 }, 
        data: { 
          label: 'LLaMA Analysis', 
          description: 'AI processes and categorizes the input',
          title: 'AI Decision',
        } 
      },
      { 
        id: 'llama-route-a', 
        type: 'default', 
        position: { x: 850, y: 100 }, 
        data: { 
          label: 'Route A', 
          description: 'High priority handling',
          title: 'Priority Path',
          icon: 'check-square',
        } 
      },
      { 
        id: 'llama-route-b', 
        type: 'default', 
        position: { x: 850, y: 200 }, 
        data: { 
          label: 'Route B', 
          description: 'Standard handling',
          title: 'Standard Path',
          icon: 'file-text',
        } 
      },
      { 
        id: 'llama-end', 
        type: 'end', 
        position: { x: 1100, y: 150 }, 
        data: { 
          label: 'End',
          title: 'Process Complete',
        } 
      },
    ],
    edges: [
      createLabeledEdge('llama-e1', 'llama-start', 'llama-input', 'flow.start'),
      createLabeledEdge('llama-e2', 'llama-input', 'llama-process', 'ai.send'),
      createLabeledEdge('llama-e3', 'llama-process', 'llama-route-a', 'logic.highPriority'),
      createLabeledEdge('llama-e4', 'llama-process', 'llama-route-b', 'logic.standard'),
      createLabeledEdge('llama-e5', 'llama-route-a', 'llama-end', 'flow.complete'),
      createLabeledEdge('llama-e6', 'llama-route-b', 'llama-end', 'flow.complete'),
    ],
  },

  feedbackFlow: {
    label: 'Customer Feedback Flow',
    description: 'Collect and process customer feedback systematically',
    icon: '⭐',
    nodes: [
      { 
        id: 'feedback-start', 
        type: 'start', 
        position: { x: 150, y: 150 }, 
        data: { label: 'Start' } 
      },
      { 
        id: 'feedback-rating', 
        type: 'default', 
        position: { x: 350, y: 150 }, 
        data: { 
          label: 'Ask Question', 
          description: 'Rate your experience (1-5 stars)',
          title: 'Rating Collection',
          icon: 'check-square',
        } 
      },
      { 
        id: 'feedback-comment', 
        type: 'default', 
        position: { x: 600, y: 150 }, 
        data: { 
          label: 'Ask Question', 
          description: 'Share your detailed feedback',
          title: 'Comment Collection',
          icon: 'file-text',
        } 
      },
      { 
        id: 'feedback-thanks', 
        type: 'default', 
        position: { x: 850, y: 150 }, 
        data: { 
          label: 'Send Message', 
          description: 'Thank you for your feedback!',
          title: 'Thank You',
          icon: 'send',
        } 
      },
      { 
        id: 'feedback-end', 
        type: 'end', 
        position: { x: 1100, y: 150 }, 
        data: { 
          label: 'End',
          title: 'Feedback Complete',
        } 
      },
    ],
    edges: [
      createLabeledEdge('feedback-e1', 'feedback-start', 'feedback-rating', 'flow.start'),
      createLabeledEdge('feedback-e2', 'feedback-rating', 'feedback-comment', 'user.confirmed'),
      createLabeledEdge('feedback-e3', 'feedback-comment', 'feedback-thanks', 'user.confirmed'),
      createLabeledEdge('feedback-e4', 'feedback-thanks', 'feedback-end', 'flow.complete'),
    ],
  },

  orderTracking: {
    label: 'Order Tracking Flow',
    description: 'Guide customers to track their delivery status via WhatsApp',
    icon: '📦',
    nodes: [
      { 
        id: 'order-start', 
        type: 'start', 
        position: { x: 150, y: 150 }, 
        data: { label: 'Start' } 
      },
      { 
        id: 'order-welcome', 
        type: 'default', 
        position: { x: 350, y: 150 }, 
        data: { 
          label: 'Send Message', 
          description: 'Welcome! Enter your order number to track delivery.',
          title: 'Welcome Message',
          icon: 'send',
        } 
      },
      { 
        id: 'order-input', 
        type: 'default', 
        position: { x: 600, y: 150 }, 
        data: { 
          label: 'Ask Question', 
          description: 'Collect order number',
          title: 'Order Number',
          icon: 'message-circle',
        } 
      },
      { 
        id: 'order-process', 
        type: 'default', 
        position: { x: 850, y: 150 }, 
        data: { 
          label: 'Process Data', 
          description: 'Check order status in database',
          title: 'Status Check',
          icon: 'message-circle',
        } 
      },
      { 
        id: 'order-status', 
        type: 'default', 
        position: { x: 1100, y: 150 }, 
        data: { 
          label: 'Send Message', 
          description: 'Your order is out for delivery!',
          title: 'Status Update',
          icon: 'send',
        } 
      },
      { 
        id: 'order-end', 
        type: 'end', 
        position: { x: 1350, y: 150 }, 
        data: { 
          label: 'End',
          title: 'Tracking Complete',
        } 
      },
    ],
    edges: [
      createLabeledEdge('order-e1', 'order-start', 'order-welcome', 'flow.start'),
      createLabeledEdge('order-e2', 'order-welcome', 'order-input', 'user.ready'),
      createLabeledEdge('order-e3', 'order-input', 'order-process', 'data.processed'),
      createLabeledEdge('order-e4', 'order-process', 'order-status', 'data.transformed'),
      createLabeledEdge('order-e5', 'order-status', 'order-end', 'notify.user'),
    ],
  },

  surveyFlow: {
    label: 'Customer Survey Flow',
    description: 'Collect satisfaction ratings with automated AI summary',
    icon: '📝',
    nodes: [
      { 
        id: 'survey-start', 
        type: 'start', 
        position: { x: 150, y: 150 }, 
        data: { label: 'Start' } 
      },
      { 
        id: 'survey-intro', 
        type: 'default', 
        position: { x: 350, y: 150 }, 
        data: { 
          label: 'Send Message', 
          description: 'Help us improve! Please rate our service.',
          title: 'Survey Introduction',
        } 
      },
      { 
        id: 'survey-rating', 
        type: 'default', 
        position: { x: 600, y: 150 }, 
        data: { 
          label: 'Ask Question', 
          description: 'Rate service quality (1-10)',
          title: 'Service Rating',
        } 
      },
      { 
        id: 'survey-comments', 
        type: 'default', 
        position: { x: 850, y: 150 }, 
        data: { 
          label: 'Ask Question', 
          description: 'Any additional comments?',
          title: 'Comments',
        } 
      },
      { 
        id: 'survey-ai', 
        type: 'llama', 
        position: { x: 1100, y: 150 }, 
        data: { 
          label: 'LLaMA Analysis', 
          description: 'AI analyzes feedback and generates summary',
          title: 'AI Summary',
        } 
      },
      { 
        id: 'survey-end', 
        type: 'end', 
        position: { x: 1350, y: 150 }, 
        data: { 
          label: 'End',
          title: 'Survey Complete',
        } 
      },
    ],
    edges: [
      createLabeledEdge('survey-e1', 'survey-start', 'survey-intro', 'flow.start'),
      createLabeledEdge('survey-e2', 'survey-intro', 'survey-rating', 'user.ready'),
      createLabeledEdge('survey-e3', 'survey-rating', 'survey-comments', 'user.confirmed'),
      createLabeledEdge('survey-e4', 'survey-comments', 'survey-ai', 'ai.send'),
      createLabeledEdge('survey-e5', 'survey-ai', 'survey-end', 'ai.result'),
    ],
  },

  appointmentFlow: {
    label: 'Appointment Scheduling Flow',
    description: 'Allow users to choose available time slots easily',
    icon: '📅',
    nodes: [
      { 
        id: 'appt-start', 
        type: 'start', 
        position: { x: 150, y: 150 }, 
        data: { label: 'Start' } 
      },
      { 
        id: 'appt-welcome', 
        type: 'default', 
        position: { x: 350, y: 150 }, 
        data: { 
          label: 'Send Message', 
          description: 'Book your appointment! What service do you need?',
          title: 'Service Selection',
        } 
      },
      { 
        id: 'appt-service', 
        type: 'default', 
        position: { x: 600, y: 150 }, 
        data: { 
          label: 'Ask Question', 
          description: 'Select service type',
          title: 'Service Choice',
        } 
      },
      { 
        id: 'appt-slots', 
        type: 'default', 
        position: { x: 850, y: 150 }, 
        data: { 
          label: 'Send Message', 
          description: 'Available slots: Mon 2PM, Tue 10AM, Wed 3PM',
          title: 'Available Slots',
        } 
      },
      { 
        id: 'appt-confirm', 
        type: 'default', 
        position: { x: 1100, y: 150 }, 
        data: { 
          label: 'Ask Question', 
          description: 'Confirm your preferred time',
          title: 'Time Confirmation',
        } 
      },
      { 
        id: 'appt-end', 
        type: 'end', 
        position: { x: 1350, y: 150 }, 
        data: { 
          label: 'End',
          title: 'Appointment Booked',
        } 
      },
    ],
    edges: [
      createLabeledEdge('appt-e1', 'appt-start', 'appt-welcome', 'flow.start'),
      createLabeledEdge('appt-e2', 'appt-welcome', 'appt-service', 'user.ready'),
      createLabeledEdge('appt-e3', 'appt-service', 'appt-slots', 'user.confirmed'),
      createLabeledEdge('appt-e4', 'appt-slots', 'appt-confirm', 'data.processed'),
      createLabeledEdge('appt-e5', 'appt-confirm', 'appt-end', 'flow.complete'),
    ],
  },

  supportFlow: {
    label: 'Support Ticket Flow',
    description: 'Route user queries to AI or human support dynamically',
    icon: '🛠️',
    nodes: [
      { 
        id: 'support-start', 
        type: 'start', 
        position: { x: 150, y: 150 }, 
        data: { label: 'Start' } 
      },
      { 
        id: 'support-greet', 
        type: 'default', 
        position: { x: 350, y: 150 }, 
        data: { 
          label: 'Send Message', 
          description: 'Hi! How can we help you today?',
          title: 'Support Greeting',
        } 
      },
      { 
        id: 'support-query', 
        type: 'default', 
        position: { x: 600, y: 150 }, 
        data: { 
          label: 'Ask Question', 
          description: 'Describe your issue',
          title: 'Issue Description',
        } 
      },
      { 
        id: 'support-ai', 
        type: 'llama', 
        position: { x: 850, y: 100 }, 
        data: { 
          label: 'LLaMA Analysis', 
          description: 'AI attempts to resolve the issue',
          title: 'AI Support',
        } 
      },
      { 
        id: 'support-human', 
        type: 'default', 
        position: { x: 850, y: 200 }, 
        data: { 
          label: 'Process Data', 
          description: 'Route to human support agent',
          title: 'Human Support',
        } 
      },
      { 
        id: 'support-end', 
        type: 'end', 
        position: { x: 1100, y: 150 }, 
        data: { 
          label: 'End',
          title: 'Support Complete',
        } 
      },
    ],
    edges: [
      createLabeledEdge('support-e1', 'support-start', 'support-greet', 'flow.start'),
      createLabeledEdge('support-e2', 'support-greet', 'support-query', 'user.ready'),
      createLabeledEdge('support-e3', 'support-query', 'support-ai', 'ai.send'),
      createLabeledEdge('support-e4', 'support-query', 'support-human', 'logic.highPriority'),
      createLabeledEdge('support-e5', 'support-ai', 'support-end', 'ai.result'),
      createLabeledEdge('support-e6', 'support-human', 'support-end', 'flow.complete'),
    ],
  },

  advancedDecisionFlow: {
    label: 'Advanced Decision Flow',
    description: 'Complex workflow with multiple decision points and conditional logic',
    icon: '🔀',
    nodes: [
      { 
        id: 'adv-start', 
        type: 'start', 
        position: { x: 100, y: 200 }, 
        data: { label: 'Start' } 
      },
      { 
        id: 'adv-input', 
        type: 'default', 
        position: { x: 300, y: 200 }, 
        data: { 
          label: 'Ask Question', 
          description: 'What type of request is this?',
          title: 'Request Type',
          icon: 'message-circle',
        } 
      },
      { 
        id: 'adv-decision1', 
        type: 'decision', 
        position: { x: 500, y: 200 }, 
        data: { 
          label: 'Priority Check', 
          description: 'Is this urgent?',
          title: 'Urgency Decision',
        } 
      },
      { 
        id: 'adv-urgent', 
        type: 'default', 
        position: { x: 700, y: 100 }, 
        data: { 
          label: 'Urgent Handler', 
          description: 'Handle urgent requests',
          title: 'Urgent Processing',
          icon: 'check-square',
        } 
      },
      { 
        id: 'adv-normal', 
        type: 'default', 
        position: { x: 700, y: 200 }, 
        data: { 
          label: 'Normal Handler', 
          description: 'Handle normal requests',
          title: 'Normal Processing',
          icon: 'file-text',
        } 
      },
      { 
        id: 'adv-decision2', 
        type: 'decision', 
        position: { x: 900, y: 150 }, 
        data: { 
          label: 'AI Capable', 
          description: 'Can AI handle this?',
          title: 'AI Decision',
        } 
      },
      { 
        id: 'adv-ai', 
        type: 'default', 
        position: { x: 1100, y: 100 }, 
        data: { 
          label: 'AI Processing', 
          description: 'AI handles the request',
          title: 'AI Handler',
          icon: 'message-circle',
        } 
      },
      { 
        id: 'adv-human', 
        type: 'default', 
        position: { x: 1100, y: 200 }, 
        data: { 
          label: 'Human Support', 
          description: 'Human handles the request',
          title: 'Human Handler',
          icon: 'wifi',
        } 
      },
      { 
        id: 'adv-end', 
        type: 'end', 
        position: { x: 1300, y: 150 }, 
        data: { 
          label: 'End',
          title: 'Request Complete',
        } 
      },
    ],
    edges: [
      createLabeledEdge('adv-e1', 'adv-start', 'adv-input', 'flow.start'),
      createLabeledEdge('adv-e2', 'adv-input', 'adv-decision1', 'data.processed'),
      createLabeledEdge('adv-e3', 'adv-decision1', 'adv-urgent', 'logic.yes'),
      createLabeledEdge('adv-e4', 'adv-decision1', 'adv-normal', 'logic.no'),
      createLabeledEdge('adv-e5', 'adv-urgent', 'adv-decision2', 'data.transformed'),
      createLabeledEdge('adv-e6', 'adv-normal', 'adv-decision2', 'data.transformed'),
      createLabeledEdge('adv-e7', 'adv-decision2', 'adv-ai', 'logic.yes'),
      createLabeledEdge('adv-e8', 'adv-decision2', 'adv-human', 'logic.no'),
      createLabeledEdge('adv-e9', 'adv-ai', 'adv-end', 'ai.result'),
      createLabeledEdge('adv-e10', 'adv-human', 'adv-end', 'flow.complete'),
    ],
  },

  // Demo template showcasing connection labels
  connectionLabelDemo: {
    label: 'Connection Label Demo',
    description: 'Demonstrates semantic connection labels across different node types',
    icon: '🔗',
    nodes: [
      {
        id: 'demo-start',
        type: 'start',
        position: { x: 100, y: 200 },
        data: { label: 'Start' },
      },
      {
        id: 'demo-input',
        type: 'default',
        position: { x: 300, y: 200 },
        data: { 
          label: 'Ask Question', 
          description: 'Collect user data',
          title: 'Data Collection',
          icon: 'message-circle',
        },
      },
      {
        id: 'demo-process',
        type: 'default',
        position: { x: 500, y: 200 },
        data: { 
          label: 'Process Data', 
          description: 'AI analysis',
          title: 'AI Processing',
          icon: 'wifi',
        },
      },
      {
        id: 'demo-decision',
        type: 'default',
        position: { x: 700, y: 200 },
        data: { 
          label: 'Decision', 
          description: 'Route based on result',
          title: 'Logic Routing',
          icon: 'check-square',
        },
      },
      {
        id: 'demo-notify',
        type: 'default',
        position: { x: 500, y: 100 },
        data: { 
          label: 'Send Message', 
          description: 'WhatsApp notification',
          title: 'User Notification',
          icon: 'send',
        },
      },
      {
        id: 'demo-save',
        type: 'default',
        position: { x: 500, y: 300 },
        data: { 
          label: 'Save Data', 
          description: 'Store in database',
          title: 'Data Storage',
          icon: 'message-circle',
        },
      },
      {
        id: 'demo-end',
        type: 'end',
        position: { x: 900, y: 200 },
        data: { 
          label: 'End', 
          description: 'Workflow complete',
          title: 'Completion',
        },
      },
    ],
    edges: [
      createLabeledEdge('demo-e1', 'demo-start', 'demo-input', 'flow.start'),
      createLabeledEdge('demo-e2', 'demo-input', 'demo-process', 'ai.send'),
      createLabeledEdge('demo-e3', 'demo-process', 'demo-decision', 'ai.result'),
      createLabeledEdge('demo-e4', 'demo-decision', 'demo-notify', 'logic.yes'),
      createLabeledEdge('demo-e5', 'demo-decision', 'demo-save', 'logic.no'),
      createLabeledEdge('demo-e6', 'demo-notify', 'demo-end', 'flow.complete'),
      createLabeledEdge('demo-e7', 'demo-save', 'demo-end', 'flow.complete'),
    ],
  },

  // Customer Support Workflow with Embedded Connection Menu
  supportWorkflow: {
    label: 'Customer Support Workflow',
    description: 'Workflow dukungan pelanggan dengan AI dan Human routing',
    icon: '🎧',
    nodes: [
      {
        id: 'support-start',
        type: 'start',
        position: { x: 100, y: 200 },
        data: { label: 'Start' },
      },
      {
        id: 'support-greeting',
        type: 'default',
        position: { x: 300, y: 200 },
        data: { 
          label: 'Support Greeting', 
          description: 'Hi! How can we help you today?',
          title: 'Welcome Message',
          icon: 'send',
        },
      },
      {
        id: 'issue-description',
        type: 'default',
        position: { x: 500, y: 200 },
        data: { 
          label: 'Issue Description', 
          description: 'Describe your issue in detail',
          title: 'Issue Collection',
          icon: 'message-circle',
        },
      },
      {
        id: 'support-decision',
        type: 'decision',
        position: { x: 700, y: 200 },
        data: { 
          label: 'Route Decision',
          description: 'Choose support path',
          title: 'Support Routing',
          icon: 'git-branch',
        },
      },
      {
        id: 'ai-support',
        type: 'default',
        position: { x: 900, y: 150 },
        data: { 
          label: 'AI Support', 
          description: 'AI attempts to resolve automatically',
          title: 'AI Resolution',
          icon: 'bot',
        },
      },
      {
        id: 'human-support',
        type: 'default',
        position: { x: 900, y: 250 },
        data: { 
          label: 'Human Support', 
          description: 'Route to human agent',
          title: 'Human Escalation',
          icon: 'user',
        },
      },
      {
        id: 'support-merge',
        type: 'default',
        position: { x: 1100, y: 200 },
        data: { 
          label: 'Merge Results',
          description: 'Combine support outcomes',
          title: 'Result Processing',
          icon: 'merge',
        },
      },
      {
        id: 'support-end',
        type: 'end',
        position: { x: 1300, y: 200 },
        data: { 
          label: 'End', 
          description: 'Support process complete',
          title: 'Complete',
        },
      },
    ],
    edges: [
      createLabeledEdge('support-e1', 'support-start', 'support-greeting', 'flow.start'),
      createLabeledEdge('support-e2', 'support-greeting', 'issue-description', 'greeting.sent'),
      createLabeledEdge('support-e3', 'issue-description', 'support-decision', 'issue.collected'),
      // Conditional edges with embedded connection menu
      createLabeledEdgeWithMenu('support-e4', 'support-decision', 'ai-support', 'route.ai', undefined, {
        condition: 'simple_issue',
        connectionMenu: true,
        connectionOptions: [
          { 
            label: 'AI Support', 
            value: 'ai', 
            condition: 'simple_issue',
            icon: 'bot',
            description: 'Route to AI for simple issues',
            color: 'success'
          },
          { 
            label: 'Human Support', 
            value: 'human', 
            condition: 'complex_issue',
            icon: 'user',
            description: 'Route to human for complex issues',
            color: 'warning'
          }
        ]
      }),
      createLabeledEdgeWithMenu('support-e5', 'support-decision', 'human-support', 'route.human', undefined, {
        condition: 'complex_issue', 
        connectionMenu: true,
        connectionOptions: [
          { 
            label: 'AI Support', 
            value: 'ai', 
            condition: 'simple_issue',
            icon: 'bot',
            description: 'Route to AI for simple issues',
            color: 'success'
          },
          { 
            label: 'Human Support', 
            value: 'human', 
            condition: 'complex_issue',
            icon: 'user',
            description: 'Route to human for complex issues',
            color: 'warning'
          }
        ]
      }),
      createLabeledEdge('support-e6', 'ai-support', 'support-merge', 'ai.complete'),
      createLabeledEdge('support-e7', 'human-support', 'support-merge', 'human.complete'),
      createLabeledEdge('support-e8', 'support-merge', 'support-end', 'flow.complete'),
    ],
  },

  // Approval Process with Multiple Decision Points
  approvalWorkflow: {
    label: 'Approval Process',
    description: 'Proses persetujuan dengan multiple decision points',
    icon: '✅',
    nodes: [
      {
        id: 'approval-start',
        type: 'start',
        position: { x: 100, y: 200 },
        data: { label: 'Start' },
      },
      {
        id: 'submit-request',
        type: 'default',
        position: { x: 300, y: 200 },
        data: { 
          label: 'Submit Request', 
          description: 'Submit approval request',
          title: 'Request Submission',
          icon: 'send',
        },
      },
      {
        id: 'approval-decision',
        type: 'decision',
        position: { x: 500, y: 200 },
        data: { 
          label: 'Approval Decision',
          description: 'Choose approval path',
          title: 'Approval Routing',
          icon: 'git-branch',
        },
      },
      {
        id: 'manager-approval',
        type: 'default',
        position: { x: 700, y: 150 },
        data: { 
          label: 'Manager Approval', 
          description: 'Manual approval by manager',
          title: 'Manual Review',
          icon: 'user-check',
        },
      },
      {
        id: 'auto-approve',
        type: 'default',
        position: { x: 700, y: 250 },
        data: { 
          label: 'Auto Approve', 
          description: 'Automatic approval',
          title: 'Auto Approval',
          icon: 'zap',
        },
      },
      {
        id: 'notification',
        type: 'default',
        position: { x: 900, y: 200 },
        data: { 
          label: 'Notification',
          description: 'Send approval notification',
          title: 'Notify User',
          icon: 'bell',
        },
      },
      {
        id: 'approval-end',
        type: 'end',
        position: { x: 1100, y: 200 },
        data: { 
          label: 'End', 
          description: 'Approval process complete',
          title: 'Complete',
        },
      },
    ],
    edges: [
      createLabeledEdge('approval-e1', 'approval-start', 'submit-request', 'flow.start'),
      createLabeledEdge('approval-e2', 'submit-request', 'approval-decision', 'request.submitted'),
      createLabeledEdgeWithMenu('approval-e3', 'approval-decision', 'manager-approval', 'route.manual', undefined, {
        condition: 'requires_manager',
        connectionMenu: true,
        connectionOptions: [
          { 
            label: 'Manager Approval', 
            value: 'manager', 
            condition: 'requires_manager',
            icon: 'user-check',
            description: 'Route to manager for approval',
            color: 'warning'
          },
          { 
            label: 'Auto Approve', 
            value: 'auto', 
            condition: 'auto_eligible',
            icon: 'zap',
            description: 'Auto approve if eligible',
            color: 'success'
          }
        ]
      }),
      createLabeledEdgeWithMenu('approval-e4', 'approval-decision', 'auto-approve', 'route.auto', undefined, {
        condition: 'auto_eligible',
        connectionMenu: true,
        connectionOptions: [
          { 
            label: 'Manager Approval', 
            value: 'manager', 
            condition: 'requires_manager',
            icon: 'user-check',
            description: 'Route to manager for approval',
            color: 'warning'
          },
          { 
            label: 'Auto Approve', 
            value: 'auto', 
            condition: 'auto_eligible',
            icon: 'zap',
            description: 'Auto approve if eligible',
            color: 'success'
          }
        ]
      }),
      createLabeledEdge('approval-e5', 'manager-approval', 'notification', 'approval.complete'),
      createLabeledEdge('approval-e6', 'auto-approve', 'notification', 'approval.complete'),
      createLabeledEdge('approval-e7', 'notification', 'approval-end', 'flow.complete'),
    ],
  },

  // Data Processing Pipeline
  dataProcessing: {
    label: 'Data Processing Pipeline',
    description: 'Pipeline pemrosesan data dengan validation steps',
    icon: '📊',
    nodes: [
      {
        id: 'data-start',
        type: 'start',
        position: { x: 100, y: 200 },
        data: { label: 'Start' },
      },
      {
        id: 'data-input',
        type: 'default',
        position: { x: 300, y: 200 },
        data: { 
          label: 'Data Input', 
          description: 'Receive data input',
          title: 'Data Collection',
          icon: 'database',
        },
      },
      {
        id: 'data-decision',
        type: 'decision',
        position: { x: 500, y: 200 },
        data: { 
          label: 'Processing Decision',
          description: 'Choose processing path',
          title: 'Processing Route',
          icon: 'git-branch',
        },
      },
      {
        id: 'validate-data',
        type: 'default',
        position: { x: 700, y: 150 },
        data: { 
          label: 'Validate Data', 
          description: 'Validate data format and content',
          title: 'Data Validation',
          icon: 'check-circle',
        },
      },
      {
        id: 'transform-data',
        type: 'default',
        position: { x: 700, y: 250 },
        data: { 
          label: 'Transform Data', 
          description: 'Transform data structure',
          title: 'Data Transformation',
          icon: 'refresh-cw',
        },
      },
      {
        id: 'store-data',
        type: 'default',
        position: { x: 900, y: 200 },
        data: { 
          label: 'Store Data',
          description: 'Store processed data',
          title: 'Data Storage',
          icon: 'save',
        },
      },
      {
        id: 'generate-report',
        type: 'default',
        position: { x: 1100, y: 200 },
        data: { 
          label: 'Generate Report',
          description: 'Generate processing report',
          title: 'Report Generation',
          icon: 'file-text',
        },
      },
      {
        id: 'data-end',
        type: 'end',
        position: { x: 1300, y: 200 },
        data: { 
          label: 'End', 
          description: 'Data processing complete',
          title: 'Complete',
        },
      },
    ],
    edges: [
      createLabeledEdge('data-e1', 'data-start', 'data-input', 'flow.start'),
      createLabeledEdge('data-e2', 'data-input', 'data-decision', 'data.received'),
      createLabeledEdgeWithMenu('data-e3', 'data-decision', 'validate-data', 'route.validate', undefined, {
        condition: 'needs_validation',
        connectionMenu: true,
        connectionOptions: [
          { 
            label: 'Validate Data', 
            value: 'validate', 
            condition: 'needs_validation',
            icon: 'check-circle',
            description: 'Validate data before processing',
            color: 'info'
          },
          { 
            label: 'Transform Data', 
            value: 'transform', 
            condition: 'needs_transform',
            icon: 'refresh-cw',
            description: 'Transform data structure',
            color: 'warning'
          }
        ]
      }),
      createLabeledEdgeWithMenu('data-e4', 'data-decision', 'transform-data', 'route.transform', undefined, {
        condition: 'needs_transform',
        connectionMenu: true,
        connectionOptions: [
          { 
            label: 'Validate Data', 
            value: 'validate', 
            condition: 'needs_validation',
            icon: 'check-circle',
            description: 'Validate data before processing',
            color: 'info'
          },
          { 
            label: 'Transform Data', 
            value: 'transform', 
            condition: 'needs_transform',
            icon: 'refresh-cw',
            description: 'Transform data structure',
            color: 'warning'
          }
        ]
      }),
      createLabeledEdge('data-e5', 'validate-data', 'store-data', 'validation.complete'),
      createLabeledEdge('data-e6', 'transform-data', 'store-data', 'transformation.complete'),
      createLabeledEdge('data-e7', 'store-data', 'generate-report', 'storage.complete'),
      createLabeledEdge('data-e8', 'generate-report', 'data-end', 'flow.complete'),
    ],
  },

  // Preset Templates with Semantic Connection Labels
};
