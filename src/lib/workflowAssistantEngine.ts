import { Node, Edge } from '@xyflow/react';
import { nodeLibrary } from '@/core/nodeLibrary';

export interface WorkflowAnalysis {
  issues: string[];
  suggestions: string[];
  optimizations: string[];
  score: number; // 0-100
}

export interface WorkflowSuggestion {
  type: 'add_node' | 'add_edge' | 'modify_node' | 'optimize';
  description: string;
  action?: () => void;
}

export async function analyzeWorkflowGraph(
  query: string, 
  nodes: Record<string, any>, 
  edges: Record<string, any>
): Promise<string> {
  const nodeArray = Object.values(nodes);
  const edgeArray = Object.values(edges);
  
  // Basic analysis logic
  const analysis = performWorkflowAnalysis(nodeArray, edgeArray);
  
  if (query.toLowerCase().includes('analyze')) {
    return formatAnalysis(analysis);
  }
  
  // Handle specific questions
  if (query.toLowerCase().includes('error')) {
    return `I found ${analysis.issues.length} potential issues in your workflow. ${analysis.issues.join('. ')}`;
  }
  
  if (query.toLowerCase().includes('optimize')) {
    return `Here are ${analysis.optimizations.length} optimization suggestions: ${analysis.optimizations.join('. ')}`;
  }
  
  if (query.toLowerCase().includes('help') || query.toLowerCase().includes('how')) {
    return getHelpResponse(query);
  }
  
  // Default response
  return `I can help you with your workflow! You have ${nodeArray.length} nodes and ${edgeArray.length} connections. ${analysis.suggestions[0] || 'Everything looks good!'}`;
}

export async function suggestImprovements(
  nodes: Record<string, any>, 
  edges: Record<string, any>
): Promise<string> {
  const nodeArray = Object.values(nodes);
  const edgeArray = Object.values(edges);
  const analysis = performWorkflowAnalysis(nodeArray, edgeArray);
  
  if (analysis.suggestions.length === 0) {
    return "🎉 Your workflow looks great! No immediate improvements needed.";
  }
  
  return `💡 Here are my suggestions:\n\n${analysis.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
}

export async function optimizeWorkflow(
  nodes: Record<string, any>, 
  edges: Record<string, any>
): Promise<string> {
  const nodeArray = Object.values(nodes);
  const edgeArray = Object.values(edges);
  const analysis = performWorkflowAnalysis(nodeArray, edgeArray);
  
  if (analysis.optimizations.length === 0) {
    return "⚡ Your workflow is already optimized!";
  }
  
  return `⚡ Performance optimizations:\n\n${analysis.optimizations.map((o, i) => `${i + 1}. ${o}`).join('\n')}`;
}

function performWorkflowAnalysis(nodes: any[], edges: any[]): WorkflowAnalysis {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const optimizations: string[] = [];
  
  // Check for common issues
  if (nodes.length === 0) {
    issues.push("No nodes in workflow");
    suggestions.push("Add a Start node to begin your workflow");
  }
  
  if (nodes.length > 0 && !nodes.some(n => n.type === 'start')) {
    issues.push("Missing Start node");
    suggestions.push("Add a Start node to define workflow entry point");
  }
  
  if (nodes.length > 1 && !nodes.some(n => n.type === 'end')) {
    suggestions.push("Consider adding an End node to complete your workflow");
  }
  
  // Check for disconnected nodes
  const connectedNodes = new Set<string>();
  edges.forEach(edge => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });
  
  const disconnectedNodes = nodes.filter(n => !connectedNodes.has(n.id));
  if (disconnectedNodes.length > 0) {
    issues.push(`${disconnectedNodes.length} disconnected nodes found`);
    suggestions.push("Connect all nodes to create a complete workflow");
  }
  
  // Check for cycles (basic detection)
  if (hasCycle(nodes, edges)) {
    issues.push("Potential circular dependency detected");
    suggestions.push("Review connections to avoid infinite loops");
  }
  
  // Check for error handling
  const hasErrorHandling = nodes.some(n => 
    n.type === 'decision' && 
    n.data?.label?.toLowerCase().includes('error')
  );
  if (nodes.length > 3 && !hasErrorHandling) {
    suggestions.push("Consider adding error handling nodes for better reliability");
  }
  
  // Check for data validation
  const hasValidation = nodes.some(n => 
    n.type === 'process' && 
    n.data?.label?.toLowerCase().includes('valid')
  );
  if (nodes.length > 2 && !hasValidation) {
    suggestions.push("Add data validation nodes to ensure data quality");
  }
  
  // Performance suggestions
  if (nodes.length > 20) {
    optimizations.push("Consider breaking large workflow into smaller sub-workflows");
  }
  
  if (edges.length > nodes.length * 2) {
    optimizations.push("High edge-to-node ratio - consider simplifying connections");
  }
  
  // Check for parallel processing opportunities
  const sequentialNodes = findSequentialBottlenecks(nodes, edges);
  if (sequentialNodes.length > 0) {
    optimizations.push(`Consider parallelizing: ${sequentialNodes.join(', ')}`);
  }
  
  // Calculate score
  const score = Math.max(0, 100 - (issues.length * 20) - (suggestions.length * 5));
  
  return { issues, suggestions, optimizations, score };
}

function hasCycle(nodes: any[], edges: any[]): boolean {
  // Simple cycle detection using DFS
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function dfs(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    const outgoingEdges = edges.filter(e => e.source === nodeId);
    for (const edge of outgoingEdges) {
      if (dfs(edge.target)) return true;
    }
    
    recursionStack.delete(nodeId);
    return false;
  }
  
  for (const node of nodes) {
    if (!visited.has(node.id) && dfs(node.id)) {
      return true;
    }
  }
  
  return false;
}

function findSequentialBottlenecks(nodes: any[], edges: any[]): string[] {
  const bottlenecks: string[] = [];
  
  // Find nodes that have only one outgoing edge and could be parallelized
  nodes.forEach(node => {
    const outgoingEdges = edges.filter(e => e.source === node.id);
    const incomingEdges = edges.filter(e => e.target === node.id);
    
    // If a node has multiple incoming edges but only one outgoing, it might be a bottleneck
    if (incomingEdges.length > 1 && outgoingEdges.length === 1) {
      bottlenecks.push(node.data?.label || node.id);
    }
  });
  
  return bottlenecks;
}

function formatAnalysis(analysis: WorkflowAnalysis): string {
  let result = `📊 Workflow Analysis (Score: ${analysis.score}/100)\n\n`;
  
  if (analysis.issues.length > 0) {
    result += `🚨 Issues Found:\n${analysis.issues.map(i => `• ${i}`).join('\n')}\n\n`;
  }
  
  if (analysis.suggestions.length > 0) {
    result += `💡 Suggestions:\n${analysis.suggestions.map(s => `• ${s}`).join('\n')}\n\n`;
  }
  
  if (analysis.optimizations.length > 0) {
    result += `⚡ Optimizations:\n${analysis.optimizations.map(o => `• ${o}`).join('\n')}\n\n`;
  }
  
  if (analysis.score >= 80) {
    result += "🎉 Great workflow! Keep up the good work!";
  } else if (analysis.score >= 60) {
    result += "👍 Good workflow with room for improvement.";
  } else {
    result += "🔧 This workflow needs some attention.";
  }
  
  return result;
}

function getHelpResponse(query: string): string {
  const helpTopics = {
    'error handling': `To add error handling:
1. Add a Decision node after critical operations
2. Create separate paths for success and error cases
3. Use End nodes to terminate error flows
4. Consider adding retry logic with loops`,
    
    'validation': `For data validation:
1. Add Process nodes to validate input data
2. Use Decision nodes to check validation results
3. Route invalid data to error handling paths
4. Consider using AI Analysis nodes for complex validation`,
    
    'optimization': `To optimize your workflow:
1. Identify bottlenecks with multiple incoming edges
2. Consider parallel processing for independent operations
3. Break large workflows into smaller sub-workflows
4. Use caching for repeated operations`,
    
    'ai integration': `For AI-powered workflows:
1. Use AI Analysis nodes for data processing
2. Add Decision nodes to route based on AI results
3. Consider human-in-the-loop patterns
4. Implement fallback mechanisms for AI failures`
  };
  
  const lowerQuery = query.toLowerCase();
  for (const [topic, response] of Object.entries(helpTopics)) {
    if (lowerQuery.includes(topic)) {
      return response;
    }
  }
  
  return `I can help you with:
• Error handling patterns
• Data validation strategies  
• Workflow optimization
• AI integration best practices
• Node connection patterns

Ask me about any of these topics!`;
}
