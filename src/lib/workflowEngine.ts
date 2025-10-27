import { Edge } from "@xyflow/react";
import { ExecutionResult, ExecutionContext } from "@/types/workflow";
import { getExecutorForNode } from "./nodeExecutors";

export class WorkflowEngine {
  async executeWorkflow(
    nodes: any[],
    edges: Edge[],
    startNodeId: string = "start",
    llamaConfig?: any,
    appendLlamaLog?: (entry: any) => void
  ): Promise<Map<string, ExecutionResult>> {
    const results = new Map<string, ExecutionResult>();
    const context: ExecutionContext = {
      workflowId: crypto.randomUUID(),
      timestamp: new Date(),
      variables: {},
    };

    const executed = new Set<string>();
    const queue = [startNodeId];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (executed.has(nodeId)) continue;

      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      try {
        const executor = getExecutorForNode(node);
        if (!executor) {
          results.set(nodeId, {
            outputs: {},
            logs: [
              {
                timestamp: new Date(),
                level: "warn",
                message: `No executor found for node type: ${node.data.label}`,
                nodeId,
              },
            ],
          });
          executed.add(nodeId);
          continue;
        }

        // Get inputs from connected nodes
        const inputs: Record<string, any> = {};
        const incomingEdges = edges.filter(e => e.target === nodeId);
        for (const edge of incomingEdges) {
          const sourceResult = results.get(edge.source);
          if (sourceResult) {
            Object.assign(inputs, sourceResult.outputs);
          }
        }

        // Execute node
        const result = await executor.execute(node, inputs, context, llamaConfig, appendLlamaLog);
        results.set(nodeId, result);

        // Update context variables
        Object.assign(context.variables, result.outputs);

        // Queue outgoing nodes
        const outgoingEdges = edges.filter(e => e.source === nodeId);
        for (const edge of outgoingEdges) {
          queue.push(edge.target);
        }

        executed.add(nodeId);
      } catch (error) {
        results.set(nodeId, {
          outputs: {},
          logs: [
            {
              timestamp: new Date(),
              level: "error",
              message: `Execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
              nodeId,
            },
          ],
          error: error instanceof Error ? error.message : "Unknown error",
        });
        executed.add(nodeId);
      }
    }

    return results;
  }
}
