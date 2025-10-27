/**
 * Workflow Assembler
 * Assemble complete workflow from node plans to React Flow format
 */

import { NodePlan, WorkflowOutput } from './types';
import { nodeTypeRegistry } from '@/lib/nodeTypeRegistry';
import { v4 as uuidv4 } from 'uuid';

/**
 * Assemble complete workflow from node plans
 */
export function assembleWorkflow(plans: NodePlan[]): WorkflowOutput {
  const nodes: any[] = [];
  const edges: any[] = [];
  const warnings: string[] = [];
  
  // Build node lookup map for validation
  const nodeIdMap = new Map<string, boolean>();
  
  // Convert each node plan to React Flow format
  plans.forEach((plan) => {
    // Check if node type exists in registry
    const nodeType = nodeTypeRegistry.getNodeType(plan.nodeType);
    
    if (!nodeType && plan.nodeType !== 'default') {
      warnings.push(`Unknown node type: ${plan.nodeType}`);
    }
    
    // Build node object
    const node: any = {
      id: plan.nodeId,
      type: plan.nodeType,
      position: plan.position,
      data: {
        label: nodeType?.label || plan.config?.label || plan.nodeType,
        ...(plan.config || {}),
        ...(nodeType ? {
          category: nodeType.category,
          description: nodeType.description || plan.config?.description
        } : {})
      }
    };
    
    nodes.push(node);
    nodeIdMap.set(plan.nodeId, true);
  });
  
  // Build edges from node connections
  plans.forEach((plan) => {
    if (plan.connections && plan.connections.length > 0) {
      plan.connections.forEach((conn, index) => {
        // Validate connection targets exist
        if (!nodeIdMap.has(conn.target)) {
          warnings.push(`Invalid connection: ${plan.nodeId} -> ${conn.target} (target not found)`);
          return;
        }
        
        // Generate unique edge ID using UUID
        const edgeId = `${plan.nodeId}-${conn.target}-${index}`;
        const uniqueEdgeId = `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const edge = {
          id: uniqueEdgeId,
          source: plan.nodeId,
          target: conn.target,
          sourceHandle: conn.source_port,
          targetHandle: conn.target_port,
          type: 'smoothstep',
          data: {
            label: null
          }
        };
        
        edges.push(edge);
      });
    }
  });
  
  // Always run auto-inference as safety net (compliments explicit connections)
  if (nodes.length > 1) {
    warnings.push('Running auto-link inference for additional connections...');
    const inferredEdges = inferConnections(nodes);
    
    // Only add edges that don't already exist
    const existingEdgeIds = new Set(edges.map(e => `${e.source}-${e.target}`));
    const newEdges = inferredEdges.filter(e => !existingEdgeIds.has(`${e.source}-${e.target}`));
    
    if (newEdges.length > 0) {
      warnings.push(`Added ${newEdges.length} additional inferred edges`);
      edges.push(...newEdges);
    }
  }
  
  // Debug: Log edge generation
  console.log('🔗 Edge Generation:', {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    edgeIds: edges.map(e => e.id),
    edges: edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle
    }))
  });
  
  // Generate metadata
  const metadata = {
    title: 'AI-Generated Workflow',
    description: 'Generated from natural language prompt',
    generated_by: 'prompt_interpreter',
    timestamp: new Date().toISOString()
  };
  
  return {
    nodes,
    edges,
    metadata,
    warnings
  };
}

/**
 * Infer connections between nodes when no explicit connections are provided
 */
function inferConnections(nodes: any[]): any[] {
  const edges: any[] = [];
  
  // Helper to find node by type
  const getNode = (type: string) => nodes.find(n => n.type?.includes(type));
  
  // Find key nodes
  const start = getNode('start');
  const trigger = getNode('whatsapp.trigger') || getNode('trigger');
  const aiChat = getNode('ai.chatModel') || getNode('chat');
  const switchNode = getNode('switch') || getNode('control.switch') || getNode('decision');
  const merge = getNode('merge') || nodes.find(n => n.data?.label?.toLowerCase().includes('merge'));
  const end = getNode('end') || nodes.find(n => n.data?.label?.toLowerCase().includes('end'));
  
  // Conditional flow dengan Switch (laundry approval workflow case)
  if (switchNode) {
    // Connect start → trigger/aiChat → switch
    if (start && trigger) {
      edges.push(createEdge(start.id, trigger.id, 'default', 'default'));
    }
    if (trigger && aiChat) {
      edges.push(createEdge(trigger.id, aiChat.id, 'default', 'default'));
      if (aiChat && switchNode) {
        edges.push(createEdge(aiChat.id, switchNode.id, 'default', 'default'));
      }
    } else if (start && switchNode) {
      edges.push(createEdge(start.id, switchNode.id, 'default', 'default'));
    }
    
    // Find "If True" and "If False" nodes by label
    const trueNode = nodes.find(n => 
      n.data?.label?.toLowerCase().includes('true') || 
      n.data?.label?.toLowerCase().includes('yes')
    );
    const falseNode = nodes.find(n => 
      n.data?.label?.toLowerCase().includes('false') || 
      n.data?.label?.toLowerCase().includes('no')
    );
    
    if (trueNode) {
      edges.push(createEdge(switchNode.id, trueNode.id, 'true', 'default'));
    }
    
    if (falseNode) {
      edges.push(createEdge(switchNode.id, falseNode.id, 'false', 'default'));
    }
    
    // Connect branches to merge
    if (merge) {
      if (trueNode) {
        edges.push(createEdge(trueNode.id, merge.id, 'default', 'default'));
      }
      
      if (falseNode) {
        edges.push(createEdge(falseNode.id, merge.id, 'default', 'default'));
      }
      
      if (end) {
        edges.push(createEdge(merge.id, end.id, 'default', 'default'));
      }
    }
  }
  
  // If still no edges, simple left-to-right sequential chain
  if (edges.length === 0 && nodes.length > 1) {
    const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x);
    
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      edges.push(createEdge(sortedNodes[i].id, sortedNodes[i + 1].id, 'default', 'default'));
    }
  }
  
  return edges;
}

function createEdge(source: string, target: string, sourceHandle: string, targetHandle: string) {
  return {
    id: uuidv4(),
    source,
    target,
    sourceHandle,
    targetHandle,
    type: 'smoothstep',
    data: { label: null }
  };
}
