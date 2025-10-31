/**
 * Node Type Registry for Node Library v3
 * Central registry for all node types and their executors
 */

import { NodeTypeDefinition, ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";
import { whatsappTriggerExecutor } from "./executors/whatsappTriggerExecutor";
import { chatModelExecutor } from "./executors/chatModelExecutor";
import { memoryGetExecutor } from "./executors/memoryGetExecutor";
import { memorySetExecutor } from "./executors/memorySetExecutor";
import { validationExecutor } from "./executors/validationExecutor";
import { switchExecutor } from "./executors/switchExecutor";
import { whatsappSendExecutor } from "./executors/whatsappSendExecutor";

type ExecutorFunction = (context: ExecutionContext, config: any) => Promise<NodeResult>;

export class NodeTypeRegistry {
  private nodeTypes = new Map<string, NodeTypeDefinition>();
  private executors = new Map<string, ExecutorFunction>();

  register(nodeType: NodeTypeDefinition, executor: ExecutorFunction) {
    this.nodeTypes.set(nodeType.id, nodeType);
    this.executors.set(nodeType.id, executor);
  }

  getNodeType(nodeTypeId: string): NodeTypeDefinition | undefined {
    return this.nodeTypes.get(nodeTypeId);
  }

  async executeNode(
    nodeTypeId: string,
    context: ExecutionContext,
    config: any
  ): Promise<NodeResult> {
    const executor = this.executors.get(nodeTypeId);

    if (!executor) {
      throw new Error(`Executor not found for node type: ${nodeTypeId}`);
    }

    return executor(context, config);
  }

  getAllNodeTypes(): NodeTypeDefinition[] {
    return Array.from(this.nodeTypes.values());
  }

  getAllNodeTypesGroupedByCategory(): Record<string, NodeTypeDefinition[]> {
    const grouped: Record<string, NodeTypeDefinition[]> = {};

    this.nodeTypes.forEach(nodeType => {
      const category = nodeType.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(nodeType);
    });

    return grouped;
  }
}

// Singleton instance
export const nodeTypeRegistry = new NodeTypeRegistry();

// Auto-register nodes
import {
  WhatsAppTriggerNode,
  AskQuestionNode,
  SensorDataNode,
  FetchExternalDataNode,
  AIAnalysisNode,
  CalculateNode,
  DecisionNode,
  SendMessageNode,
  StoreRecordsNode,
  ChatModelNode,
  MemoryGetNode,
  MemorySetNode,
  ValidationBasicNode,
  SwitchNode,
  WhatsAppSendNode,
} from "@/core/nodes";
// Legacy v2 nodes are no longer auto-registered to avoid duplicates in the UI
// import { v2MigratedNodes } from "@/core/nodes/v2-migrated";
import { askQuestionExecutor } from "./executors/askQuestionExecutor";
import { sensorDataExecutor } from "./executors/sensorDataExecutor";
import { fetchExternalExecutor } from "./executors/fetchExternalExecutor";
import { aiAnalysisExecutor } from "./executors/aiAnalysisExecutor";
import { calculateExecutor } from "./executors/calculateExecutor";
import { decisionExecutorV3 } from "./executors/decisionExecutorV3";
import { sendMessageExecutor } from "./executors/sendMessageExecutor";
import { storeRecordsExecutor } from "./executors/storeRecordsExecutor";

// Import a simple generic executor for migrated v2 nodes
async function genericV2Executor(context: ExecutionContext, config: any): Promise<NodeResult> {
  // Generic executor for v2 migrated nodes
  // In production, these should be replaced with specific executors
  context.services.logger.info(`Executing v2 migrated node: ${context.nodeId}`);

  return {
    status: "success",
    data: {
      migrated: true,
      nodeId: context.nodeId,
      config,
      timestamp: new Date().toISOString(),
    },
    next: "default",
  };
}

// Register new v3 nodes
nodeTypeRegistry.register(WhatsAppTriggerNode, whatsappTriggerExecutor);
nodeTypeRegistry.register(AskQuestionNode, askQuestionExecutor);
nodeTypeRegistry.register(SensorDataNode, sensorDataExecutor);
nodeTypeRegistry.register(FetchExternalDataNode, fetchExternalExecutor);
nodeTypeRegistry.register(AIAnalysisNode, aiAnalysisExecutor);
nodeTypeRegistry.register(CalculateNode, calculateExecutor);
nodeTypeRegistry.register(DecisionNode, decisionExecutorV3);
nodeTypeRegistry.register(SendMessageNode, sendMessageExecutor);
nodeTypeRegistry.register(StoreRecordsNode, storeRecordsExecutor);
nodeTypeRegistry.register(ChatModelNode, chatModelExecutor);
nodeTypeRegistry.register(MemoryGetNode, memoryGetExecutor);
nodeTypeRegistry.register(MemorySetNode, memorySetExecutor);
nodeTypeRegistry.register(ValidationBasicNode, validationExecutor);
nodeTypeRegistry.register(SwitchNode, switchExecutor);
nodeTypeRegistry.register(WhatsAppSendNode, whatsappSendExecutor);

// NOTE: If you need backward compatibility, call migrateWorkflowToV3 on load instead of registering v2 here.

console.log(
  `📦 NodeTypeRegistry initialized: ${nodeTypeRegistry.getAllNodeTypes().length} nodes registered`
);
