import { Node, Edge } from "@xyflow/react";
import { TemplateData, TemplateImportResult } from "@/lib/templateManager";

export interface ValidationRule {
  name: string;
  validate: (template: TemplateData, templateString?: string) => ValidationResult;
  severity: "error" | "warning" | "info";
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
  details?: string[];
}

export class TemplateValidator {
  private static readonly rules: ValidationRule[] = [
    {
      name: "required-fields",
      severity: "error",
      validate: template => {
        const { metadata, nodes, edges } = template;

        if (!metadata.name || metadata.name.trim().length === 0) {
          return { valid: false, message: "Template name is required" };
        }

        if (!metadata.description || metadata.description.trim().length === 0) {
          return { valid: false, message: "Template description is required" };
        }

        if (!Array.isArray(nodes) || nodes.length === 0) {
          return { valid: false, message: "Template must contain at least one node" };
        }

        if (!Array.isArray(edges)) {
          return { valid: false, message: "Edges must be an array" };
        }

        return { valid: true };
      },
    },

    {
      name: "node-structure",
      severity: "error",
      validate: template => {
        const { nodes } = template;
        const errors: string[] = [];

        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];

          if (!node.id || typeof node.id !== "string") {
            errors.push(`Node ${i}: ID is required and must be a string`);
          }

          if (!node.type || typeof node.type !== "string") {
            errors.push(`Node ${i}: Type is required and must be a string`);
          }

          if (
            !node.position ||
            typeof node.position?.x !== "number" ||
            typeof node.position?.y !== "number"
          ) {
            errors.push(`Node ${i}: Position with numeric x,y coordinates is required`);
          }

          if (!node.data || typeof node.data !== "object") {
            errors.push(`Node ${i}: Data object is required`);
          }
        }

        return {
          valid: errors.length === 0,
          message: errors.length > 0 ? "Node structure validation failed" : undefined,
          details: errors.length > 0 ? errors : undefined,
        };
      },
    },

    {
      name: "edge-structure",
      severity: "error",
      validate: template => {
        const { edges, nodes } = template;
        const errors: string[] = [];
        const nodeIds = new Set(nodes.map(n => n.id));

        for (let i = 0; i < edges.length; i++) {
          const edge = edges[i];

          if (!edge.id || typeof edge.id !== "string") {
            errors.push(`Edge ${i}: ID is required and must be a string`);
          }

          if (!edge.source || typeof edge.source !== "string") {
            errors.push(`Edge ${i}: Source is required and must be a string`);
          }

          if (!edge.target || typeof edge.target !== "string") {
            errors.push(`Edge ${i}: Target is required and must be a string`);
          }

          if (edge.source && !nodeIds.has(edge.source)) {
            errors.push(`Edge ${i}: Source node '${edge.source}' does not exist`);
          }

          if (edge.target && !nodeIds.has(edge.target)) {
            errors.push(`Edge ${i}: Target node '${edge.target}' does not exist`);
          }
        }

        return {
          valid: errors.length === 0,
          message: errors.length > 0 ? "Edge structure validation failed" : undefined,
          details: errors.length > 0 ? errors : undefined,
        };
      },
    },

    {
      name: "unique-ids",
      severity: "error",
      validate: template => {
        const { nodes, edges } = template;

        // Check for duplicate node IDs
        const nodeIds = nodes.map(n => n.id);
        const uniqueNodeIds = new Set(nodeIds);
        if (nodeIds.length !== uniqueNodeIds.size) {
          const duplicates = nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index);
          return {
            valid: false,
            message: "Duplicate node IDs found",
            details: [`Duplicate IDs: ${[...new Set(duplicates)].join(", ")}`],
          };
        }

        // Check for duplicate edge IDs
        const edgeIds = edges.map(e => e.id);
        const uniqueEdgeIds = new Set(edgeIds);
        if (edgeIds.length !== uniqueEdgeIds.size) {
          const duplicates = edgeIds.filter((id, index) => edgeIds.indexOf(id) !== index);
          return {
            valid: false,
            message: "Duplicate edge IDs found",
            details: [`Duplicate IDs: ${[...new Set(duplicates)].join(", ")}`],
          };
        }

        return { valid: true };
      },
    },

    {
      name: "start-node",
      severity: "warning",
      validate: template => {
        const { nodes } = template;
        const hasStartNode = nodes.some(
          n =>
            n.type === "start" ||
            String(n.data?.label || "")
              .toLowerCase()
              .includes("start")
        );

        if (!hasStartNode) {
          return {
            valid: false,
            message: "No start node found",
            details: ["Consider adding a start node to define workflow entry point"],
          };
        }

        return { valid: true };
      },
    },

    {
      name: "end-node",
      severity: "warning",
      validate: template => {
        const { nodes } = template;
        const hasEndNode = nodes.some(
          n =>
            n.type === "end" ||
            String(n.data?.label || "")
              .toLowerCase()
              .includes("end")
        );

        if (!hasEndNode) {
          return {
            valid: false,
            message: "No end node found",
            details: ["Consider adding an end node to define workflow completion"],
          };
        }

        return { valid: true };
      },
    },

    {
      name: "orphaned-nodes",
      severity: "warning",
      validate: template => {
        const { nodes, edges } = template;
        const connectedNodes = new Set<string>();

        edges.forEach(edge => {
          connectedNodes.add(edge.source);
          connectedNodes.add(edge.target);
        });

        const orphanedNodes = nodes.filter(node => !connectedNodes.has(node.id));

        if (orphanedNodes.length > 0) {
          return {
            valid: false,
            message: "Orphaned nodes found",
            details: [`Nodes without connections: ${orphanedNodes.map(n => n.id).join(", ")}`],
          };
        }

        return { valid: true };
      },
    },

    {
      name: "circular-dependencies",
      severity: "warning",
      validate: template => {
        const { nodes, edges } = template;

        // Build adjacency list
        const graph = new Map<string, string[]>();
        nodes.forEach(node => graph.set(node.id, []));
        edges.forEach(edge => {
          const neighbors = graph.get(edge.source) || [];
          neighbors.push(edge.target);
          graph.set(edge.source, neighbors);
        });

        // Check for cycles using DFS with depth guard
        const visited = new Set<string>();
        const recursionStack = new Set<string>();
        let depth = 0;
        const MAX_DEPTH = 1000;

        const hasCycle = (nodeId: string): boolean => {
          if (++depth > MAX_DEPTH) {
            throw new Error("Cycle detection aborted (too deep)");
          }

          if (recursionStack.has(nodeId)) return true;
          if (visited.has(nodeId)) return false;

          visited.add(nodeId);
          recursionStack.add(nodeId);

          const neighbors = graph.get(nodeId) || [];
          for (const neighbor of neighbors) {
            if (hasCycle(neighbor)) return true;
          }

          recursionStack.delete(nodeId);
          return false;
        };

        try {
          for (const nodeId of graph.keys()) {
            if (!visited.has(nodeId)) {
              if (hasCycle(nodeId)) {
                return {
                  valid: false,
                  message: "Circular dependencies detected",
                  details: ["Workflow contains cycles which may cause infinite loops"],
                };
              }
            }
          }
        } catch (error) {
          return {
            valid: false,
            message: "Cycle detection failed",
            details: [error instanceof Error ? error.message : "Unknown error"],
          };
        }

        return { valid: true };
      },
    },

    {
      name: "content-security",
      severity: "error",
      validate: (template, templateString?: string) => {
        const maliciousPatterns = [
          { pattern: /<script[^>]*>.*?<\/script>/gi, name: "Script tags" },
          { pattern: /\bjavascript:/gi, name: "JavaScript URLs" },
          { pattern: /\bon\w+\s*=/gi, name: "Event handlers" },
          { pattern: /\beval\s*\(/gi, name: "Eval function" },
          { pattern: /\bdocument\s*\./gi, name: "Document object access" },
          { pattern: /\bwindow\s*\./gi, name: "Window object access" },
        ];

        const jsonString = templateString || JSON.stringify(template);
        const violations: string[] = [];

        maliciousPatterns.forEach(({ pattern, name }) => {
          if (pattern.test(jsonString)) {
            violations.push(name);
          }
        });

        if (violations.length > 0) {
          return {
            valid: false,
            message: "Potentially malicious content detected",
            details: [`Found: ${violations.join(", ")}`],
          };
        }

        return { valid: true };
      },
    },

    {
      name: "size-limits",
      severity: "error",
      validate: template => {
        const json = JSON.stringify(template);
        const templateSize =
          typeof Blob !== "undefined" ? new Blob([json]).size : Buffer.byteLength(json, "utf8");
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (templateSize > maxSize) {
          return {
            valid: false,
            message: "Template exceeds size limit",
            details: [
              `Size: ${Math.round(templateSize / 1024)}KB, Limit: ${Math.round(maxSize / 1024)}KB`,
            ],
          };
        }

        return { valid: true };
      },
    },

    {
      name: "node-count",
      severity: "info",
      validate: template => {
        const { nodes } = template;

        if (nodes.length > 50) {
          return {
            valid: false,
            message: "Large number of nodes",
            details: [`${nodes.length} nodes may impact performance`],
          };
        }

        return { valid: true };
      },
    },
  ];

  /**
   * Validate a template against all rules
   */
  static validateTemplate(template: TemplateData): TemplateImportResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const info: string[] = [];

    // Precompute template string for performance
    const templateString = JSON.stringify(template);

    for (const rule of this.rules) {
      const result = rule.validate(template, templateString);

      if (!result.valid) {
        const message = result.message || `Validation failed for rule: ${rule.name}`;

        switch (rule.severity) {
          case "error":
            errors.push(message);
            if (result.details) errors.push(...result.details);
            break;
          case "warning":
            warnings.push(message);
            if (result.details) warnings.push(...result.details);
            break;
          case "info":
            info.push(message);
            if (result.details) info.push(...result.details);
            break;
        }
      }
    }

    // If there are any errors, the template is invalid
    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join("; "),
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    }

    // Template is valid, but may have warnings
    return {
      success: true,
      template,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validate specific rule
   */
  static validateRule(template: TemplateData, ruleName: string): ValidationResult {
    const rule = this.rules.find(r => r.name === ruleName);
    if (!rule) {
      return {
        valid: false,
        message: `Unknown validation rule: ${ruleName}`,
      };
    }

    return rule.validate(template);
  }

  /**
   * Get all available validation rules
   */
  static getAvailableRules(): ValidationRule[] {
    return [...this.rules];
  }

  /**
   * Sanitize template data
   */
  static sanitizeTemplate(template: TemplateData): TemplateData {
    const sanitized = structuredClone
      ? structuredClone(template)
      : JSON.parse(JSON.stringify(template)); // Deep clone

    // Sanitize metadata
    sanitized.metadata.name = this.sanitizeText(String(sanitized.metadata.name || ""));
    sanitized.metadata.description = this.sanitizeText(
      String(sanitized.metadata.description || "")
    );

    // Sanitize nodes
    sanitized.nodes = sanitized.nodes.map((node: Node) => {
      const data = node.data || {};
      return {
        ...node,
        data: {
          ...data,
          title: this.sanitizeText(String(data.title || "")),
          description: this.sanitizeText(String(data.description || "")),
          label: this.sanitizeText(String(data.label || "")),
        },
      };
    });

    // Sanitize edges
    sanitized.edges = sanitized.edges.map((edge: Edge) => ({
      ...edge,
      data: edge.data
        ? {
            ...edge.data,
            label: this.sanitizeText(String(edge.data.label || "")),
          }
        : undefined,
    }));

    return sanitized;
  }

  /**
   * Sanitize text content
   */
  private static sanitizeText(text: string): string {
    if (typeof text !== "string") return "";

    return text
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/<[^>]*>/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .replace(/eval\s*\(/gi, "")
      .replace(/function\s*\(/gi, "")
      .trim();
  }
}
