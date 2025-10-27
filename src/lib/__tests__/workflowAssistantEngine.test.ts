// Test file for Workflow Assistant Engine
import { analyzeWorkflowGraph, suggestImprovements, optimizeWorkflow } from './workflowAssistantEngine';

// Mock data for testing
const mockNodes = {
  'start-1': {
    id: 'start-1',
    type: 'start',
    data: { label: 'Start' },
    position: { x: 0, y: 0 }
  },
  'process-1': {
    id: 'process-1',
    type: 'process',
    data: { label: 'Process Data' },
    position: { x: 200, y: 0 }
  },
  'end-1': {
    id: 'end-1',
    type: 'end',
    data: { label: 'End' },
    position: { x: 400, y: 0 }
  }
};

const mockEdges = {
  'edge-1': {
    id: 'edge-1',
    source: 'start-1',
    target: 'process-1'
  },
  'edge-2': {
    id: 'edge-2',
    source: 'process-1',
    target: 'end-1'
  }
};

// Test functions
async function testWorkflowAssistant() {
  console.log('🧪 Testing Workflow Assistant Engine...\n');
  
  try {
    // Test analysis
    console.log('1. Testing workflow analysis:');
    const analysis = await analyzeWorkflowGraph('analyze', mockNodes, mockEdges);
    console.log(analysis);
    console.log('\n');
    
    // Test suggestions
    console.log('2. Testing suggestions:');
    const suggestions = await suggestImprovements(mockNodes, mockEdges);
    console.log(suggestions);
    console.log('\n');
    
    // Test optimization
    console.log('3. Testing optimization:');
    const optimization = await optimizeWorkflow(mockNodes, mockEdges);
    console.log(optimization);
    console.log('\n');
    
    // Test help response
    console.log('4. Testing help response:');
    const help = await analyzeWorkflowGraph('how do I add error handling?', mockNodes, mockEdges);
    console.log(help);
    console.log('\n');
    
    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for potential use
export { testWorkflowAssistant };

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  testWorkflowAssistant();
}
