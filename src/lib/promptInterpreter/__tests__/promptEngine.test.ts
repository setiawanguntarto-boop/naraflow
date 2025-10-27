/**
 * Unit tests for Prompt Engine
 * Tests the main orchestration pipeline for prompt-to-workflow conversion
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { interpretPrompt } from '../promptEngine';
import { WorkflowOutput } from '../types';

// Mock dependencies
vi.mock('../promptParser', () => ({
  interpretPrompt: vi.fn()
}));

vi.mock('../nodePlanner', () => ({
  planNodes: vi.fn()
}));

vi.mock('../workflowAssembler', () => ({
  assembleWorkflow: vi.fn()
}));

vi.mock('../validationService', () => ({
  validateWorkflow: vi.fn()
}));

import { interpretPrompt as parsePrompt } from '../promptParser';
import { planNodes } from '../nodePlanner';
import { assembleWorkflow } from '../workflowAssembler';
import { validateWorkflow } from '../validationService';

describe('promptEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('interpretPrompt', () => {
    it('should successfully interpret a WhatsApp data entry prompt', async () => {
      const mockPrompt = 'Buat agent WhatsApp untuk input data petani: nama, nomor HP, dan luas lahan';
      
      const mockAnalysis = {
        intent: {
          type: 'whatsapp_data_entry' as const,
          confidence: 0.95,
          rawPrompt: mockPrompt
        },
        entities: [
          { field: 'nama', type: 'text', required: true, validation: ['required'] },
          { field: 'hp', type: 'phone', required: true, validation: ['required', 'phone'] },
          { field: 'luas', type: 'number', required: true, validation: ['required', 'number'] }
        ],
        target: 'storage' as const,
        workflow_type: 'sequential' as const
      };

      const mockPlans = [
        {
          nodeId: 'start-1',
          nodeType: 'default',
          position: { x: 100, y: 300 },
          config: { label: 'Start' },
          connections: [{ target: 'trigger-1', source_port: 'default', target_port: 'default' }]
        },
        {
          nodeId: 'trigger-1',
          nodeType: 'whatsapp.trigger',
          position: { x: 350, y: 300 },
          config: { provider: 'meta', webhookPath: '/webhook/whatsapp' },
          connections: [{ target: 'chat-1', source_port: 'default', target_port: 'default' }]
        }
      ];

      const mockWorkflow: WorkflowOutput = {
        nodes: [
          { id: 'start-1', type: 'default', position: { x: 100, y: 300 }, data: { label: 'Start' } },
          { id: 'trigger-1', type: 'whatsapp.trigger', position: { x: 350, y: 300 }, data: { label: 'WhatsApp Trigger' } }
        ],
        edges: [
          { id: 'e-start-trigger', source: 'start-1', target: 'trigger-1', sourceHandle: 'default', targetHandle: 'default', type: 'smoothstep', data: { label: null } }
        ],
        metadata: {
          title: 'AI-Generated Workflow',
          description: 'Generated from natural language prompt',
          generated_by: 'prompt_interpreter',
          timestamp: new Date().toISOString()
        },
        warnings: []
      };

      const mockValidation = {
        valid: true,
        warnings: [],
        errors: []
      };

      vi.mocked(parsePrompt).mockResolvedValue(mockAnalysis);
      vi.mocked(planNodes).mockReturnValue(mockPlans);
      vi.mocked(assembleWorkflow).mockReturnValue(mockWorkflow);
      vi.mocked(validateWorkflow).mockReturnValue(mockValidation);

      const result = await interpretPrompt(mockPrompt, {
        llmProvider: 'openai',
        validate: true,
        preview: true
      });

      expect(result.success).toBe(true);
      expect(result.workflow).toEqual(mockWorkflow);
      expect(result.analysis).toEqual(mockAnalysis);
      expect(result.validation).toEqual(mockValidation);
    });

    it('should handle validation errors', async () => {
      const mockPrompt = 'Invalid prompt';
      
      const mockAnalysis = {
        intent: {
          type: 'workflow_automation' as const,
          confidence: 0.6,
          rawPrompt: mockPrompt
        },
        entities: [],
        target: 'storage' as const,
        workflow_type: 'sequential' as const
      };

      const mockPlans = [
        {
          nodeId: 'node-1',
          nodeType: 'unknown.node',
          position: { x: 100, y: 300 },
          config: {},
          connections: []
        }
      ];

      const mockWorkflow: WorkflowOutput = {
        nodes: [
          { id: 'node-1', type: 'unknown.node', position: { x: 100, y: 300 }, data: { label: 'Unknown' } }
        ],
        edges: [],
        metadata: {
          title: 'AI-Generated Workflow',
          description: 'Generated from natural language prompt',
          generated_by: 'prompt_interpreter',
          timestamp: new Date().toISOString()
        },
        warnings: []
      };

      const mockValidation = {
        valid: false,
        warnings: ['Unknown node type: unknown.node'],
        errors: ['Node type not found in registry']
      };

      vi.mocked(parsePrompt).mockResolvedValue(mockAnalysis);
      vi.mocked(planNodes).mockReturnValue(mockPlans);
      vi.mocked(assembleWorkflow).mockReturnValue(mockWorkflow);
      vi.mocked(validateWorkflow).mockReturnValue(mockValidation);

      const result = await interpretPrompt(mockPrompt, {
        validate: true
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.validation?.errors.length).toBeGreaterThan(0);
    });

    it('should handle parsing errors gracefully', async () => {
      const mockPrompt = 'Test prompt';
      
      vi.mocked(parsePrompt).mockResolvedValue(null);

      const result = await interpretPrompt(mockPrompt);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to parse prompt');
      expect(result.workflow).toBeNull();
    });

    it('should work without validation when validate=false', async () => {
      const mockPrompt = 'Buat workflow untuk input data';
      
      const mockAnalysis = {
        intent: {
          type: 'workflow_automation' as const,
          confidence: 0.7,
          rawPrompt: mockPrompt
        },
        entities: [{ field: 'data', type: 'text', required: true }],
        target: 'storage' as const,
        workflow_type: 'sequential' as const
      };

      const mockPlans = [
        {
          nodeId: 'node-1',
          nodeType: 'default',
          position: { x: 100, y: 300 },
          config: { label: 'Node' },
          connections: []
        }
      ];

      const mockWorkflow: WorkflowOutput = {
        nodes: [
          { id: 'node-1', type: 'default', position: { x: 100, y: 300 }, data: { label: 'Node' } }
        ],
        edges: [],
        metadata: {
          title: 'AI-Generated Workflow',
          description: 'Generated from natural language prompt',
          generated_by: 'prompt_interpreter',
          timestamp: new Date().toISOString()
        },
        warnings: []
      };

      vi.mocked(parsePrompt).mockResolvedValue(mockAnalysis);
      vi.mocked(planNodes).mockReturnValue(mockPlans);
      vi.mocked(assembleWorkflow).mockReturnValue(mockWorkflow);

      const result = await interpretPrompt(mockPrompt, {
        validate: false
      });

      expect(result.success).toBe(true);
      expect(result.workflow).toEqual(mockWorkflow);
      expect(validateWorkflow).not.toHaveBeenCalled();
    });

    it('should handle exceptions during interpretation', async () => {
      const mockPrompt = 'Test prompt';
      
      vi.mocked(parsePrompt).mockRejectedValue(new Error('Network error'));

      const result = await interpretPrompt(mockPrompt);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should use different LLM providers', async () => {
      const mockPrompt = 'Extract data';
      
      const mockAnalysis = {
        intent: {
          type: 'whatsapp_data_entry' as const,
          confidence: 0.8,
          rawPrompt: mockPrompt
        },
        entities: [],
        target: 'storage' as const,
        workflow_type: 'sequential' as const
      };

      vi.mocked(parsePrompt).mockResolvedValue(mockAnalysis);
      vi.mocked(planNodes).mockReturnValue([]);
      vi.mocked(assembleWorkflow).mockReturnValue({
        nodes: [],
        edges: [],
        metadata: {
          title: 'AI-Generated Workflow',
          description: 'Generated from natural language prompt',
          generated_by: 'prompt_interpreter',
          timestamp: new Date().toISOString()
        },
        warnings: []
      });
      vi.mocked(validateWorkflow).mockReturnValue({
        valid: true,
        warnings: [],
        errors: []
      });

      // Test with 'llama' provider
      await interpretPrompt(mockPrompt, { llmProvider: 'llama' });
      
      // Test with 'none' provider
      await interpretPrompt(mockPrompt, { llmProvider: 'none' });

      expect(parsePrompt).toHaveBeenCalledTimes(2);
    });
  });
});
