import { Node, Edge, Connection } from "@xyflow/react";

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  severity?: "error" | "warning";
}

export class EdgeValidator {
  /**
   * Check if Start node is trying to receive an incoming connection
   */
  static validateStartNode(connection: Connection, nodes: Node[]): ValidationResult {
    const targetNode = nodes.find(n => n.id === connection.target);

    if (targetNode?.type === "start") {
      return {
        isValid: false,
        message: "Start node cannot receive incoming connections",
        severity: "error",
      };
    }

    return { isValid: true };
  }

  /**
   * Check if End node is trying to create an outgoing connection
   */
  static validateEndNode(connection: Connection, nodes: Node[]): ValidationResult {
    const sourceNode = nodes.find(n => n.id === connection.source);

    if (sourceNode?.type === "end") {
      return {
        isValid: false,
        message: "End node cannot have outgoing connections",
        severity: "error",
      };
    }

    return { isValid: true };
  }

  /**
   * Prevent self-connections (node connecting to itself)
   */
  static validateSelfConnection(connection: Connection): ValidationResult {
    if (connection.source === connection.target) {
      return {
        isValid: false,
        message: "A node cannot connect to itself",
        severity: "error",
      };
    }

    return { isValid: true };
  }

  /**
   * Prevent duplicate connections (same source + target + handles)
   */
  static validateDuplicateConnection(connection: Connection, edges: Edge[]): ValidationResult {
    const isDuplicate = edges.some(
      edge =>
        edge.source === connection.source &&
        edge.target === connection.target &&
        edge.sourceHandle === connection.sourceHandle &&
        edge.targetHandle === connection.targetHandle
    );

    if (isDuplicate) {
      return {
        isValid: false,
        message: "Connection already exists between these nodes",
        severity: "error",
      };
    }

    return { isValid: true };
  }

  /**
   * Check for circular dependencies (A → B → C → A)
   */
  static validateCircularDependency(
    connection: Connection,
    nodes: Node[],
    edges: Edge[]
  ): ValidationResult {
    // Create temporary edge for checking
    const tempEdges = [
      ...edges,
      {
        id: "temp",
        source: connection.source!,
        target: connection.target!,
      } as Edge,
    ];

    // BFS to detect cycle
    const visited = new Set<string>();
    const queue: string[] = [connection.target!];

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      if (currentId === connection.source) {
        return {
          isValid: false,
          message: "This connection would create a circular dependency",
          severity: "warning",
        };
      }

      if (visited.has(currentId)) continue;
      visited.add(currentId);

      // Find all outgoing edges from current node
      const outgoingEdges = tempEdges.filter(e => e.source === currentId);
      outgoingEdges.forEach(edge => {
        if (!visited.has(edge.target)) {
          queue.push(edge.target);
        }
      });
    }

    return { isValid: true };
  }

  /**
   * Validate connection limit per handle
   */
  static validateConnectionLimit(
    connection: Connection,
    edges: Edge[],
    maxConnections: number = 1
  ): ValidationResult {
    const existingConnections = edges.filter(
      edge => edge.source === connection.source && edge.sourceHandle === connection.sourceHandle
    );

    if (existingConnections.length >= maxConnections) {
      return {
        isValid: false,
        message: `Maximum ${maxConnections} connection(s) allowed from this handle`,
        severity: "error",
      };
    }

    return { isValid: true };
  }

  /**
   * Run all validations
   */
  static validateConnection(
    connection: Connection,
    nodes: Node[],
    edges: Edge[],
    options: {
      allowCircular?: boolean;
      preventDuplicates?: boolean;
      preventSelfConnections?: boolean;
      maxConnectionsPerHandle?: number;
    } = {}
  ): ValidationResult {
    const validations = [
      this.validateStartNode(connection, nodes),
      this.validateEndNode(connection, nodes),
    ];

    // Optional self-connection check
    if (options.preventSelfConnections !== false) {
      validations.push(this.validateSelfConnection(connection));
    }

    // Optional duplicate check
    if (options.preventDuplicates !== false) {
      validations.push(this.validateDuplicateConnection(connection, edges));
    }

    // Optional circular dependency check
    if (!options.allowCircular) {
      validations.push(this.validateCircularDependency(connection, nodes, edges));
    }

    // Optional connection limit check
    if (options.maxConnectionsPerHandle) {
      validations.push(
        this.validateConnectionLimit(connection, edges, options.maxConnectionsPerHandle)
      );
    }

    // Return first failed validation
    const failed = validations.find(v => !v.isValid);
    return failed || { isValid: true };
  }
}
