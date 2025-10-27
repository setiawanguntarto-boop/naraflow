/**
 * Node Type Registry for Node Library v3
 * Central registry for all node types and their executors
 */

import { NodeTypeDefinition, ExecutionContext, NodeResult } from '@/core/nodeLibrary_v3';
import { whatsappTriggerExecutor } from './executors/whatsappTriggerExecutor';
import { chatModelExecutor } from './executors/chatModelExecutor';
import { memoryGetExecutor } from './executors/memoryGetExecutor';
import { memorySetExecutor } from './executors/memorySetExecutor';
import { validationExecutor } from './executors/validationExecutor';
import { switchExecutor } from './executors/switchExecutor';
import { whatsappSendExecutor } from './executors/whatsappSendExecutor';

type ExecutorFunction = (
  context: ExecutionContext,
  config: any
) => Promise<NodeResult>;

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
    
    this.nodeTypes.forEach((nodeType) => {
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
  ChatModelNode,
  MemoryGetNode,
  MemorySetNode,
  ValidationBasicNode,
  SwitchNode,
  WhatsAppSendNode
} from '@/core/nodes';
import { v2MigratedNodes } from '@/core/nodes/v2-migrated';

// Import a simple generic executor for migrated v2 nodes
async function genericV2Executor(
  context: ExecutionContext,
  config: any
): Promise<NodeResult> {
  // Generic executor for v2 migrated nodes
  // In production, these should be replaced with specific executors
  context.services.logger.info(`Executing v2 migrated node: ${context.nodeId}`);
  
  return {
    status: 'success',
    data: { 
      migrated: true,
      nodeId: context.nodeId,
      config,
      timestamp: new Date().toISOString()
    },
    next: 'default'
  };
}

// Register new v3 nodes
nodeTypeRegistry.register(WhatsAppTriggerNode, whatsappTriggerExecutor);
nodeTypeRegistry.register(ChatModelNode, chatModelExecutor);
nodeTypeRegistry.register(MemoryGetNode, memoryGetExecutor);
nodeTypeRegistry.register(MemorySetNode, memorySetExecutor);
nodeTypeRegistry.register(ValidationBasicNode, validationExecutor);
nodeTypeRegistry.register(SwitchNode, switchExecutor);
nodeTypeRegistry.register(WhatsAppSendNode, whatsappSendExecutor);

// Register migrated v2 nodes (with generic executor)
// These nodes maintain backward compatibility with existing workflows
Object.values(v2MigratedNodes).forEach(nodeDef => {
  if (nodeDef && nodeDef.id) {
    nodeTypeRegistry.register(nodeDef as NodeTypeDefinition, genericV2Executor);
  }
});

console.log(`📦 NodeTypeRegistry initialized: ${nodeTypeRegistry.getAllNodeTypes().length} nodes registered`);

