// Web Worker for workflow execution
// This file runs in a separate thread to isolate workflow execution

// Message types
const MESSAGE_TYPES = {
  EXECUTE: 'EXECUTE',
  RESULT: 'RESULT',
  LOG: 'LOG',
  ERROR: 'ERROR',
  PROGRESS: 'PROGRESS',
  CANCEL: 'CANCEL',
};

// Execution state
let currentExecutionId = null;
let isExecuting = false;
let executionTimeout = null;

// Worker message handler
self.onmessage = function(event) {
  const { type, payload, executionId } = event.data;

  switch (type) {
    case MESSAGE_TYPES.EXECUTE:
      handleExecute(payload, executionId);
      break;
    case MESSAGE_TYPES.CANCEL:
      handleCancel(executionId);
      break;
    default:
      console.warn('Unknown message type:', type);
  }
};

// Execute workflow
async function handleExecute(payload, executionId) {
  if (isExecuting) {
    sendError(executionId, new Error('Another execution is already in progress'));
    return;
  }

  currentExecutionId = executionId;
  isExecuting = true;

  try {
    const { nodes, edges, variables = {} } = payload;
    
    // Validate payload size (500KB limit)
    const payloadSize = JSON.stringify(payload).length;
    if (payloadSize > 500 * 1024) {
      throw new Error(`Payload too large: ${payloadSize} bytes (max: 500KB)`);
    }

    // Set execution timeout (30 seconds)
    executionTimeout = setTimeout(() => {
      if (currentExecutionId === executionId) {
        sendError(executionId, new Error('Execution timeout (30s)'));
        cleanup();
      }
    }, 30000);

    sendLog(executionId, 'Starting workflow execution...');
    sendProgress(executionId, 0);

    // Execute workflow nodes in order
    const executionResult = await executeWorkflow(nodes, edges, variables, executionId);

    sendProgress(executionId, 100);
    sendResult(executionId, executionResult);
    sendLog(executionId, 'Workflow execution completed successfully');

  } catch (error) {
    sendError(executionId, error);
  } finally {
    cleanup();
  }
}

// Cancel execution
function handleCancel(executionId) {
  if (currentExecutionId === executionId && isExecuting) {
    sendLog(executionId, 'Execution cancelled by user');
    cleanup();
  }
}

// Cleanup execution state
function cleanup() {
  isExecuting = false;
  currentExecutionId = null;
  if (executionTimeout) {
    clearTimeout(executionTimeout);
    executionTimeout = null;
  }
}

// Execute workflow nodes
async function executeWorkflow(nodes, edges, variables, executionId) {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const edgeMap = new Map(edges.map(edge => [edge.id, edge]));
  const executionOrder = topologicalSort(nodes, edges);
  const results = new Map();
  const logs = [];

  sendLog(executionId, `Executing ${executionOrder.length} nodes in topological order`);

  for (let i = 0; i < executionOrder.length; i++) {
    const nodeId = executionOrder[i];
    const node = nodeMap.get(nodeId);
    
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    sendProgress(executionId, Math.round((i / executionOrder.length) * 100));
    sendLog(executionId, `Executing node: ${node.data?.label || nodeId}`);

    try {
      // Get input data from connected nodes
      const inputData = getNodeInputs(nodeId, edges, results);
      
      // Execute node
      const nodeResult = await executeNode(node, inputData, variables);
      results.set(nodeId, nodeResult);
      
      logs.push({
        nodeId,
        nodeLabel: node.data?.label || nodeId,
        timestamp: new Date().toISOString(),
        result: nodeResult,
        success: true,
      });

      sendLog(executionId, `Node ${node.data?.label || nodeId} executed successfully`);

    } catch (error) {
      logs.push({
        nodeId,
        nodeLabel: node.data?.label || nodeId,
        timestamp: new Date().toISOString(),
        error: error.message,
        success: false,
      });

      sendLog(executionId, `Node ${node.data?.label || nodeId} failed: ${error.message}`);
      
      // Continue execution for non-critical nodes
      if (node.type === 'start' || node.type === 'end') {
        throw error;
      }
    }
  }

  return {
    success: true,
    results: Object.fromEntries(results),
    logs,
    executionTime: Date.now(),
    nodeCount: nodes.length,
    edgeCount: edges.length,
  };
}

// Execute individual node
async function executeNode(node, inputData, variables) {
  const nodeType = node.type || 'default';
  
  switch (nodeType) {
    case 'start':
      return executeStartNode(node, inputData, variables);
    case 'end':
      return executeEndNode(node, inputData, variables);
    case 'decision':
      return executeDecisionNode(node, inputData, variables);
    case 'default':
      return executeDefaultNode(node, inputData, variables);
    default:
      return executeDefaultNode(node, inputData, variables);
  }
}

// Execute start node
function executeStartNode(node, inputData, variables) {
  return {
    type: 'start',
    data: {
      message: 'Workflow started',
      timestamp: new Date().toISOString(),
      variables: { ...variables },
    },
  };
}

// Execute end node
function executeEndNode(node, inputData, variables) {
  return {
    type: 'end',
    data: {
      message: 'Workflow completed',
      timestamp: new Date().toISOString(),
      finalData: inputData,
    },
  };
}

// Execute decision node
function executeDecisionNode(node, inputData, variables) {
  const condition = node.data?.condition || 'default';
  
  // Simple condition evaluation
  let result = false;
  if (condition === 'default') {
    result = Math.random() > 0.5; // Random decision for demo
  } else if (typeof condition === 'string') {
    // Evaluate simple conditions
    try {
      result = eval(condition.replace(/\{(\w+)\}/g, (match, varName) => {
        return variables[varName] || inputData[varName] || 'false';
      }));
    } catch (error) {
      result = false;
    }
  }

  return {
    type: 'decision',
    data: {
      condition,
      result,
      timestamp: new Date().toISOString(),
    },
  };
}

// Execute default node
function executeDefaultNode(node, inputData, variables) {
  const nodeLabel = node.data?.label || 'Unknown';
  
  return {
    type: 'default',
    data: {
      message: `Executed ${nodeLabel}`,
      timestamp: new Date().toISOString(),
      inputData,
      processed: true,
    },
  };
}

// Get input data for a node from connected edges
function getNodeInputs(nodeId, edges, results) {
  const inputEdges = edges.filter(edge => edge.target === nodeId);
  const inputData = {};

  for (const edge of inputEdges) {
    const sourceResult = results.get(edge.source);
    if (sourceResult) {
      inputData[edge.source] = sourceResult;
    }
  }

  return inputData;
}

// Topological sort for execution order
function topologicalSort(nodes, edges) {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const inDegree = new Map();
  const graph = new Map();

  // Initialize in-degree and graph
  for (const node of nodes) {
    inDegree.set(node.id, 0);
    graph.set(node.id, []);
  }

  // Build graph and calculate in-degrees
  for (const edge of edges) {
    const source = edge.source;
    const target = edge.target;
    
    if (nodeMap.has(source) && nodeMap.has(target)) {
      graph.get(source).push(target);
      inDegree.set(target, inDegree.get(target) + 1);
    }
  }

  // Find nodes with no incoming edges
  const queue = [];
  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) {
      queue.push(nodeId);
    }
  }

  const result = [];
  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current);

    // Process neighbors
    for (const neighbor of graph.get(current)) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Check for cycles
  if (result.length !== nodes.length) {
    throw new Error('Workflow contains cycles or disconnected nodes');
  }

  return result;
}

// Send result to main thread
function sendResult(executionId, result) {
  self.postMessage({
    type: MESSAGE_TYPES.RESULT,
    executionId,
    payload: result,
  });
}

// Send log to main thread
function sendLog(executionId, message) {
  self.postMessage({
    type: MESSAGE_TYPES.LOG,
    executionId,
    payload: {
      message,
      timestamp: new Date().toISOString(),
    },
  });
}

// Send error to main thread
function sendError(executionId, error) {
  self.postMessage({
    type: MESSAGE_TYPES.ERROR,
    executionId,
    payload: {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    },
  });
}

// Send progress to main thread
function sendProgress(executionId, progress) {
  self.postMessage({
    type: MESSAGE_TYPES.PROGRESS,
    executionId,
    payload: {
      progress,
      timestamp: new Date().toISOString(),
    },
  });
}
