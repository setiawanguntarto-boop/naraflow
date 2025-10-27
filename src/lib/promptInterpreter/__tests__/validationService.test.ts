/**
 * Unit tests for Validation Service
 * Tests interactive validation logic for generated workflows
 */

import { describe, it, expect, beforeEach } from "vitest";
import { validateWorkflow } from "../validationService";
import { WorkflowOutput } from "../types";

// Mock nodeTypeRegistry
vi.mock("@/lib/nodeTypeRegistry", () => ({
  nodeTypeRegistry: {
    getNodeType: vi.fn((nodeType: string) => {
      // Simulate known node types
      const knownTypes = [
        "whatsapp.trigger",
        "ai.chatModel",
        "memory.set",
        "whatsapp.send",
        "validation.basic",
      ];
      if (knownTypes.includes(nodeType)) {
        return {
          id: nodeType,
          label: nodeType,
          configSchema: {
            type: "object",
            properties: {},
            required: [],
          },
        };
      }
      return undefined;
    }),
  },
}));

describe("validationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateWorkflow", () => {
    it("should validate a valid workflow with no errors or warnings", () => {
      const workflow: WorkflowOutput = {
        nodes: [
          {
            id: "node-1",
            type: "whatsapp.trigger",
            position: { x: 100, y: 300 },
            data: { label: "Trigger" },
          },
          {
            id: "node-2",
            type: "ai.chatModel",
            position: { x: 350, y: 300 },
            data: { label: "Chat" },
          },
        ],
        edges: [
          {
            id: "e-1-2",
            source: "node-1",
            target: "node-2",
            sourceHandle: "default",
            targetHandle: "default",
            type: "smoothstep",
            data: { label: null },
          },
        ],
        metadata: {
          title: "Test Workflow",
          description: "Test",
          generated_by: "prompt_interpreter",
          timestamp: new Date().toISOString(),
        },
        warnings: [],
      };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it("should detect unknown node types and generate warnings", () => {
      const workflow: WorkflowOutput = {
        nodes: [
          {
            id: "node-1",
            type: "unknown.node",
            position: { x: 100, y: 300 },
            data: { label: "Unknown" },
          },
        ],
        edges: [],
        metadata: {
          title: "Test Workflow",
          description: "Test",
          generated_by: "prompt_interpreter",
          timestamp: new Date().toISOString(),
        },
        warnings: [],
      };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(true); // Warnings don't make it invalid
      expect(result.warnings).toContainEqual(expect.stringContaining("Unknown node type"));
    });

    it("should detect invalid edge connections and generate errors", () => {
      const workflow: WorkflowOutput = {
        nodes: [
          {
            id: "node-1",
            type: "whatsapp.trigger",
            position: { x: 100, y: 300 },
            data: { label: "Trigger" },
          },
        ],
        edges: [
          {
            id: "e-invalid",
            source: "node-1",
            target: "nonexistent-node",
            sourceHandle: "default",
            targetHandle: "default",
            type: "smoothstep",
            data: { label: null },
          },
        ],
        metadata: {
          title: "Test Workflow",
          description: "Test",
          generated_by: "prompt_interpreter",
          timestamp: new Date().toISOString(),
        },
        warnings: [],
      };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining("nonexistent target node"));
    });

    it("should warn about orphaned nodes (not connected)", () => {
      const workflow: WorkflowOutput = {
        nodes: [
          {
            id: "node-1",
            type: "whatsapp.trigger",
            position: { x: 100, y: 300 },
            data: { label: "Trigger" },
          },
          {
            id: "node-2",
            type: "ai.chatModel",
            position: { x: 350, y: 300 },
            data: { label: "Chat" },
          },
          {
            id: "orphan",
            type: "memory.set",
            position: { x: 600, y: 300 },
            data: { label: "Orphan" },
          },
        ],
        edges: [
          {
            id: "e-1-2",
            source: "node-1",
            target: "node-2",
            sourceHandle: "default",
            targetHandle: "default",
            type: "smoothstep",
            data: { label: null },
          },
        ],
        metadata: {
          title: "Test Workflow",
          description: "Test",
          generated_by: "prompt_interpreter",
          timestamp: new Date().toISOString(),
        },
        warnings: [],
      };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContainEqual(expect.stringContaining("orphan"));
    });

    it("should not warn about single node workflows", () => {
      const workflow: WorkflowOutput = {
        nodes: [
          {
            id: "node-1",
            type: "default",
            position: { x: 100, y: 300 },
            data: { label: "Single" },
          },
        ],
        edges: [],
        metadata: {
          title: "Test Workflow",
          description: "Test",
          generated_by: "prompt_interpreter",
          timestamp: new Date().toISOString(),
        },
        warnings: [],
      };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(true);
      // Should not warn about orphaned nodes when there's only one node
      const orphanWarnings = result.warnings.filter(w => w.includes("not connected"));
      expect(orphanWarnings).toHaveLength(0);
    });

    it("should detect cycles in workflow graph", () => {
      const workflow: WorkflowOutput = {
        nodes: [
          {
            id: "node-1",
            type: "whatsapp.trigger",
            position: { x: 100, y: 300 },
            data: { label: "A" },
          },
          {
            id: "node-2",
            type: "ai.chatModel",
            position: { x: 350, y: 300 },
            data: { label: "B" },
          },
        ],
        edges: [
          {
            id: "e-1-2",
            source: "node-1",
            target: "node-2",
            sourceHandle: "default",
            targetHandle: "default",
            type: "smoothstep",
            data: { label: null },
          },
          {
            id: "e-2-1",
            source: "node-2",
            target: "node-1",
            sourceHandle: "default",
            targetHandle: "default",
            type: "smoothstep",
            data: { label: null },
          },
        ],
        metadata: {
          title: "Test Workflow",
          description: "Test",
          generated_by: "prompt_interpreter",
          timestamp: new Date().toISOString(),
        },
        warnings: [],
      };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContainEqual(expect.stringContaining("circular dependency"));
    });

    it("should handle missing node configurations", () => {
      const workflow: WorkflowOutput = {
        nodes: [
          {
            id: "node-1",
            type: "whatsapp.trigger",
            position: { x: 100, y: 300 },
            data: { label: "Trigger" },
          },
        ],
        edges: [],
        metadata: {
          title: "Test Workflow",
          description: "Test",
          generated_by: "prompt_interpreter",
          timestamp: new Date().toISOString(),
        },
        warnings: [],
      };

      // Mock nodeTypeRegistry to return a schema with required fields
      const { nodeTypeRegistry } = require("@/lib/nodeTypeRegistry");
      vi.mocked(nodeTypeRegistry.getNodeType).mockReturnValue({
        id: "whatsapp.trigger",
        label: "WhatsApp Trigger",
        configSchema: {
          type: "object",
          properties: {},
          required: ["webhookPath", "provider"],
        },
      });

      const result = validateWorkflow(workflow);

      // Should warn about missing required fields
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes("missing required config field"))).toBe(true);
    });

    it("should validate complex workflow with multiple node types", () => {
      const workflow: WorkflowOutput = {
        nodes: [
          { id: "start", type: "default", position: { x: 100, y: 300 }, data: { label: "Start" } },
          {
            id: "trigger",
            type: "whatsapp.trigger",
            position: { x: 350, y: 300 },
            data: { label: "Trigger" },
          },
          {
            id: "chat",
            type: "ai.chatModel",
            position: { x: 600, y: 300 },
            data: { label: "Chat" },
          },
          {
            id: "memory",
            type: "memory.set",
            position: { x: 850, y: 300 },
            data: { label: "Memory" },
          },
          {
            id: "send",
            type: "whatsapp.send",
            position: { x: 1100, y: 300 },
            data: { label: "Send" },
          },
          { id: "end", type: "default", position: { x: 1350, y: 300 }, data: { label: "End" } },
        ],
        edges: [
          {
            id: "e-1",
            source: "start",
            target: "trigger",
            sourceHandle: "default",
            targetHandle: "default",
            type: "smoothstep",
            data: { label: null },
          },
          {
            id: "e-2",
            source: "trigger",
            target: "chat",
            sourceHandle: "default",
            targetHandle: "default",
            type: "smoothstep",
            data: { label: null },
          },
          {
            id: "e-3",
            source: "chat",
            target: "memory",
            sourceHandle: "default",
            targetHandle: "default",
            type: "smoothstep",
            data: { label: null },
          },
          {
            id: "e-4",
            source: "memory",
            target: "send",
            sourceHandle: "default",
            targetHandle: "default",
            type: "smoothstep",
            data: { label: null },
          },
          {
            id: "e-5",
            source: "send",
            target: "end",
            sourceHandle: "default",
            targetHandle: "default",
            type: "smoothstep",
            data: { label: null },
          },
        ],
        metadata: {
          title: "Complex Workflow",
          description: "Full WhatsApp data entry workflow",
          generated_by: "prompt_interpreter",
          timestamp: new Date().toISOString(),
        },
        warnings: [],
      };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle empty workflow gracefully", () => {
      const workflow: WorkflowOutput = {
        nodes: [],
        edges: [],
        metadata: {
          title: "Empty Workflow",
          description: "Empty",
          generated_by: "prompt_interpreter",
          timestamp: new Date().toISOString(),
        },
        warnings: [],
      };

      const result = validateWorkflow(workflow);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });
  });
});
