import { Node, Edge } from "@xyflow/react";
import { WorkflowTemplate } from "@/lib/templates/workflowTemplates";

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  tags: string[];
  author?: string;
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
  edgeCount: number;
  preview?: string; // Base64 encoded preview image
}

export interface TemplateData {
  metadata: TemplateMetadata;
  nodes: Node[];
  edges: Edge[];
}

export interface TemplateImportResult {
  success: boolean;
  template?: TemplateData;
  error?: string;
  warnings?: string[];
}

export interface TemplateExportOptions {
  includePreview?: boolean;
  format?: "json" | "compressed";
}

export class TemplateManager {
  private static readonly TEMPLATE_VERSION = "1.0";
  private static readonly MAX_TEMPLATE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_CATEGORIES = [
    "agriculture",
    "hospitality",
    "sales",
    "sustainability",
    "general",
    "demo",
  ];

  /**
   * Create a new template from workflow data
   */
  static createTemplate(
    name: string,
    description: string,
    nodes: Node[],
    edges: Edge[],
    category: string = "general",
    tags: string[] = [],
    author?: string
  ): TemplateData {
    const now = new Date().toISOString();
    const id = this.generateTemplateId(name);

    return {
      metadata: {
        id,
        name,
        description,
        version: this.TEMPLATE_VERSION,
        category,
        tags,
        author,
        createdAt: now,
        updatedAt: now,
        nodeCount: nodes.length,
        edgeCount: edges.length,
      },
      nodes: this.sanitizeNodes(nodes),
      edges: this.sanitizeEdges(edges),
    };
  }

  /**
   * Validate template data structure and content
   */
  static validateTemplate(template: any): TemplateImportResult {
    const warnings: string[] = [];

    // Check if template has required structure
    if (!template.metadata || !template.nodes || !template.edges) {
      return {
        success: false,
        error: "Invalid template format: missing required fields (metadata, nodes, edges)",
      };
    }

    const { metadata, nodes, edges } = template;

    // Validate metadata
    if (!metadata.name || typeof metadata.name !== "string") {
      return {
        success: false,
        error: "Invalid template metadata: name is required and must be a string",
      };
    }

    if (!metadata.description || typeof metadata.description !== "string") {
      return {
        success: false,
        error: "Invalid template metadata: description is required and must be a string",
      };
    }

    if (metadata.category && !this.ALLOWED_CATEGORIES.includes(metadata.category)) {
      warnings.push(`Unknown category '${metadata.category}', using 'general'`);
      metadata.category = "general";
    }

    // Validate nodes
    if (!Array.isArray(nodes)) {
      return {
        success: false,
        error: "Invalid template: nodes must be an array",
      };
    }

    if (nodes.length === 0) {
      return {
        success: false,
        error: "Invalid template: must contain at least one node",
      };
    }

    // Validate edges
    if (!Array.isArray(edges)) {
      return {
        success: false,
        error: "Invalid template: edges must be an array",
      };
    }

    // Check for malicious content
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\(/i,
      /function\s*\(/i,
    ];

    const allText = JSON.stringify(template);
    for (const pattern of maliciousPatterns) {
      if (pattern.test(allText)) {
        return {
          success: false,
          error: "Template contains potentially malicious content",
        };
      }
    }

    // Check template size
    const templateSize = new Blob([JSON.stringify(template)]).size;
    if (templateSize > this.MAX_TEMPLATE_SIZE) {
      return {
        success: false,
        error: `Template too large: ${Math.round(templateSize / 1024)}KB (max: ${Math.round(this.MAX_TEMPLATE_SIZE / 1024)}KB)`,
      };
    }

    // Validate node IDs are unique
    const nodeIds = nodes.map(n => n.id);
    const uniqueNodeIds = new Set(nodeIds);
    if (nodeIds.length !== uniqueNodeIds.size) {
      return {
        success: false,
        error: "Invalid template: duplicate node IDs found",
      };
    }

    // Validate edge references
    const edgeNodeIds = [...new Set([...edges.map(e => e.source), ...edges.map(e => e.target)])];
    const missingNodeIds = edgeNodeIds.filter(id => !nodeIds.includes(id));
    if (missingNodeIds.length > 0) {
      warnings.push(`Edges reference non-existent nodes: ${missingNodeIds.join(", ")}`);
    }

    return {
      success: true,
      template: this.sanitizeTemplate(template),
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Export template to JSON string
   */
  static exportTemplate(template: TemplateData, options: TemplateExportOptions = {}): string {
    const exportData = { ...template };

    // Remove preview if not requested
    if (!options.includePreview) {
      delete exportData.metadata.preview;
    }

    // Compress if requested
    if (options.format === "compressed") {
      return JSON.stringify(exportData, null, 0);
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import template from JSON string
   */
  static importTemplate(jsonString: string): TemplateImportResult {
    try {
      const template = JSON.parse(jsonString);
      return this.validateTemplate(template);
    } catch (error) {
      return {
        success: false,
        error: `Invalid JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Convert existing WorkflowTemplate to TemplateData
   */
  static fromWorkflowTemplate(id: string, template: WorkflowTemplate): TemplateData {
    const now = new Date().toISOString();

    return {
      metadata: {
        id,
        name: template.label,
        description: template.description,
        version: this.TEMPLATE_VERSION,
        category: "general",
        tags: [],
        createdAt: now,
        updatedAt: now,
        nodeCount: template.nodes.length,
        edgeCount: template.edges.length,
      },
      nodes: template.nodes,
      edges: template.edges,
    };
  }

  /**
   * Generate unique template ID
   */
  private static generateTemplateId(name: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const sanitizedName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 8);
    return `template_${sanitizedName}_${timestamp}_${random}`;
  }

  /**
   * Sanitize nodes to remove any potentially dangerous content
   */
  private static sanitizeNodes(nodes: Node[]): Node[] {
    return nodes.map(node => {
      const data = node.data || {};
      return {
        ...node,
        data: {
          ...data,
          // Remove any script tags or dangerous attributes
          title: this.sanitizeText(String(data.title || "")),
          description: this.sanitizeText(String(data.description || "")),
          label: this.sanitizeText(String(data.label || "")),
        },
      };
    });
  }

  /**
   * Sanitize edges to remove any potentially dangerous content
   */
  private static sanitizeEdges(edges: Edge[]): Edge[] {
    return edges.map(edge => ({
      ...edge,
      data: edge.data
        ? {
            ...edge.data,
            label: this.sanitizeText(String(edge.data.label || "")),
          }
        : undefined,
    }));
  }

  /**
   * Sanitize template data
   */
  private static sanitizeTemplate(template: any): TemplateData {
    return {
      metadata: {
        ...template.metadata,
        name: this.sanitizeText(template.metadata.name),
        description: this.sanitizeText(template.metadata.description),
        category: template.metadata.category || "general",
        tags: Array.isArray(template.metadata.tags)
          ? template.metadata.tags.map((tag: any) => this.sanitizeText(tag))
          : [],
        version: template.metadata.version || this.TEMPLATE_VERSION,
      },
      nodes: this.sanitizeNodes(template.nodes),
      edges: this.sanitizeEdges(template.edges),
    };
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
      .trim();
  }

  /**
   * Generate template preview (placeholder for future image generation)
   */
  static generatePreview(template: TemplateData): string {
    // For now, return a placeholder
    // In the future, this could generate a canvas-based preview image
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="120" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="120" fill="#f3f4f6"/>
        <text x="100" y="60" text-anchor="middle" font-family="Arial" font-size="12" fill="#6b7280">
          ${template.metadata.name}
        </text>
        <text x="100" y="80" text-anchor="middle" font-family="Arial" font-size="10" fill="#9ca3af">
          ${template.metadata.nodeCount} nodes, ${template.metadata.edgeCount} edges
        </text>
      </svg>
    `)}`;
  }

  /**
   * Get template statistics
   */
  static getTemplateStats(template: TemplateData): {
    nodeCount: number;
    edgeCount: number;
    complexity: "simple" | "moderate" | "complex";
    estimatedExecutionTime: string;
  } {
    const nodeCount = template.nodes.length;
    const edgeCount = template.edges.length;

    let complexity: "simple" | "moderate" | "complex" = "simple";
    if (nodeCount > 10 || edgeCount > 15) {
      complexity = "complex";
    } else if (nodeCount > 5 || edgeCount > 8) {
      complexity = "moderate";
    }

    const estimatedTime = nodeCount * 2; // Rough estimate: 2 seconds per node

    return {
      nodeCount,
      edgeCount,
      complexity,
      estimatedExecutionTime: `${estimatedTime}s`,
    };
  }
}
