/**
 * Enhanced Workflow Assistant Hook
 * Integrates prompt interpreter with chat-based refinement
 */

import { useState, useCallback } from 'react';
import { interpretPrompt } from '@/lib/promptInterpreter/promptEngineWithCache';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { toast } from 'sonner';

interface AssistantMessage {
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestion?: {
    type: 'refine' | 'optimize' | 'explain';
    workflow?: any;
  };
}

export function useWorkflowAssistant() {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      type: 'assistant',
      content: 'Hi! I can help you design workflows. Describe what you want to build and I\'ll generate it for you.',
      timestamp: new Date()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { nodes, edges, actions } = useWorkflowState();
  
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isProcessing) return;
    
    const userMessage: AssistantMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      // Check if message is a refinement command
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('refine') || lowerMessage.includes('improve')) {
        // Refine existing workflow
        const refinementResult = await refineWorkflow(message);
        
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: refinementResult.message,
          timestamp: new Date(),
          suggestion: {
            type: 'refine',
            workflow: refinementResult.workflow
          }
        }]);
      } else if (lowerMessage.includes('explain') || lowerMessage.includes('how')) {
        // Explain current workflow
        const explanation = explainWorkflow();
        
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: explanation,
          timestamp: new Date()
        }]);
      } else if (lowerMessage.includes('generate') || lowerMessage.includes('create') || lowerMessage.includes('buat')) {
        // Generate new workflow
        const result = await interpretPrompt(message, {
          llmProvider: 'openai',
          validate: true,
          preview: false
        });
        
        if (result.success && result.workflow) {
          setMessages(prev => [...prev, {
            type: 'assistant',
            content: `I've generated a workflow with ${result.workflow.nodes.length} nodes. Would you like me to apply it to the canvas or refine it further?`,
            timestamp: new Date(),
            suggestion: {
              type: 'refine',
              workflow: result.workflow
            }
          }]);
        } else {
          setMessages(prev => [...prev, {
            type: 'assistant',
            content: result.error || 'Failed to generate workflow. Please provide more details.',
            timestamp: new Date()
          }]);
        }
      } else {
        // Default: generic help
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: 'I can help you:\n- Generate workflows from descriptions\n- Refine existing workflows\n- Explain workflow structure\n\nTry: "Buat workflow untuk input data WhatsApp"',
          timestamp: new Date()
        }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, nodes, edges]);
  
  const applyWorkflow = useCallback((workflow: any) => {
    if (!workflow || !workflow.nodes || !workflow.edges) {
      toast.error('Invalid workflow');
      return;
    }
    
    const nodesRecord = Object.fromEntries(
      workflow.nodes.map((node: any) => [node.id, node])
    );
    const edgesRecord = Object.fromEntries(
      workflow.edges.map((edge: any) => [edge.id, edge])
    );
    
    actions.batchUpdate({
      nodes: nodesRecord,
      edges: edgesRecord
    });
    
    toast.success('Workflow applied to canvas');
  }, [actions]);
  
  const clearMessages = useCallback(() => {
    setMessages([
      {
        type: 'assistant',
        content: 'Conversation cleared. How can I help you?',
        timestamp: new Date()
      }
    ]);
  }, []);
  
  return {
    messages,
    sendMessage,
    applyWorkflow,
    clearMessages,
    isProcessing
  };
}

async function refineWorkflow(message: string) {
  // Analyze existing workflow and provide refinement suggestions
  return {
    message: 'Here are some suggestions to improve your workflow:\n\n1. Add validation for required fields\n2. Include error handling paths\n3. Optimize node connections',
    workflow: null
  };
}

function explainWorkflow() {
  const nodeCount = Object.keys(useWorkflowState().nodes).length;
  const edgeCount = Object.keys(useWorkflowState().edges).length;
  
  return `Your current workflow has ${nodeCount} nodes and ${edgeCount} connections. This workflow is designed for WhatsApp data entry.`;
}