import { useState, useRef, useEffect, useCallback, Suspense, lazy } from 'react';
import { Sparkles, Trash2, Edit3, Box, Shield, Zap, Rocket, AlertCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Node, Edge, ReactFlowProvider } from '@xyflow/react';
import { useWorkflowState, useNodes, useEdges, useWorkflowActions, useUIState } from '@/hooks/useWorkflowState';
import { getIconForLabel } from '@/data/nodeIcons';
import { WorkflowEngine } from '@/lib/workflowEngine';
import { ExecutionResult } from '@/types/workflow';
import { detectLocalLlama } from '@/lib/llamaClient';
import { workflowPresets, WorkflowPreset } from '@/lib/templates/workflowPresets';
import { workflowTemplates } from '@/lib/templates/workflowTemplates';
import { toast } from 'sonner';
import { usePromptInterpreter } from '@/hooks/usePromptInterpreter';
import { useGenerationStore } from '@/store/generationStore';
import { MentionInput } from '@/components/workflow/MentionInput';
import { PresetPanel, type WorkflowPreset as PresetType } from '@/components/workflow/PresetPanel';
import { globalCanvasEventBus } from '@/hooks/useCanvasEventBus';
import '@xyflow/react/dist/style.css';

// Lazy load heavy components
const WorkflowCanvas = lazy(() =>
  import('@/components/canvas/WorkflowCanvas').then(mod => ({ default: mod.WorkflowCanvas }))
);
const NodeLibrary = lazy(() =>
  import('@/components/workflow/NodeLibrary').then(mod => ({ default: mod.NodeLibrary }))
);
const NodeConfigPanel = lazy(() =>
  import('@/components/workflow/NodeConfigPanel').then(mod => ({ default: mod.NodeConfigPanel }))
);
const NodeExecutionPanel = lazy(() =>
  import('@/components/workflow/NodeExecutionPanel').then(mod => ({ default: mod.NodeExecutionPanel }))
);
const MetricsInputPanel = lazy(() =>
  import('@/components/canvas/MetricsInputPanel').then(mod => ({ default: mod.MetricsInputPanel }))
);
const ValidationPanel = lazy(() =>
  import('@/components/canvas/ValidationPanel').then(mod => ({ default: mod.ValidationPanel }))
);
const WorkflowAssistant = lazy(() =>
  import('@/components/workflow/WorkflowAssistant').then(mod => ({ default: mod.WorkflowAssistant }))
);
const ExportImportPanel = lazy(() =>
  import('@/components/canvas/ExportImportPanel').then(mod => ({ default: mod.ExportImportPanel }))
);
const LlamaConnectionPanel = lazy(() =>
  import('@/components/LlamaConnectionPanel').then(mod => ({ default: mod.LlamaConnectionPanel }))
);
const ResponsibleAIPanel = lazy(() =>
  import('@/components/Settings/ResponsibleAIPanel').then(mod => ({ default: mod.ResponsibleAIPanel }))
);
const GenerateWithLlamaButton = lazy(() =>
  import('@/components/GenerateWithLlamaButton').then(mod => ({ default: mod.GenerateWithLlamaButton }))
);
const WorkflowPreviewModal = lazy(() =>
  import('@/components/workflow/WorkflowPreviewModal').then(mod => ({ default: mod.WorkflowPreviewModal }))
);
const DeployAgentModal = lazy(() =>
  import('@/components/workflow/DeployAgentModal').then(mod => ({ default: mod.DeployAgentModal }))
);
const ConfigurationPanel = lazy(() =>
  import('@/components/workflow/ConfigurationPanel').then(mod => ({ default: mod.ConfigurationPanel }))
);
const WhatsAppSimulationPanel = lazy(() =>
  import('@/components/workflow/WhatsAppSimulationPanel').then(mod => ({ default: mod.WhatsAppSimulationPanel }))
);
const FloatingChatButton = lazy(() =>
  import('@/components/workflow/FloatingChatButton').then(mod => ({ default: mod.FloatingChatButton }))
);

// Loading component for canvas
const CanvasLoader = () => (
  <div className="flex-1 flex items-center justify-center bg-muted/20">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      <p className="text-sm text-muted-foreground">Loading Canvas...</p>
    </div>
  </div>
);

// Loading component for panels
const PanelLoader = () => (
  <div className="w-80 bg-background border-l border-border flex items-center justify-center">
    <div className="flex flex-col items-center space-y-2">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
      <p className="text-xs text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Removed scenarios array for cleaner UX - templates now handled by Quick Templates section

// Removed getIconForLabel - now using from @/data/nodeIcons
const WorkflowStudioContent = () => {
  const [prompt, setPrompt] = useState('');
  
  // New state for config and execution panels
  const [configNode, setConfigNode] = useState<Node | null>(null);
  const [executionNode, setExecutionNode] = useState<Node | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // LLaMA connection panel state
  const [showLlamaPanel, setShowLlamaPanel] = useState(false);
  
  // Responsible AI panel state
  const [showResponsibleAIPanel, setShowResponsibleAIPanel] = useState(false);
  
  // Deploy agent modal state
  const [showDeployModal, setShowDeployModal] = useState(false);
  
  // Selected template from @mention
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowPreset | null>(null);
  
  // Selected preset from Quick Templates
  const [selectedPreset, setSelectedPreset] = useState<PresetType | null>(null);
  
  // Use new state management
  const nodes = useNodes();
  const edges = useEdges();
  const uiState = useUIState();
  const actions = useWorkflowActions();
  const { 
    llamaConfig,
    validationErrors,
  } = useWorkflowState();
  
  // Prompt Interpreter hook
  const {
    interpret,
    applyToCanvas,
    exportJSON,
    closePreview,
    isInterpreting,
    showPreview,
    previewData,
    analysis,
    selectedTemplate: interpreterTemplate,
    setSelectedTemplate: setInterpreterTemplate
  } = usePromptInterpreter();
  
  // Zustand generation store for assistant communication
  const {
    pushMessage: pushAssistantMessage,
  } = useGenerationStore();
  const extractSteps = (text: string): string[] => {
    return text.split(/→|->|,/).map(s => s.trim()).filter(Boolean);
  };

  // Detect local LLaMA on startup
  useEffect(() => {
    const detectLocalLlamaOnStartup = async () => {
      if (llamaConfig.mode === 'local' && llamaConfig.llamaStatus === 'disconnected') {
        actions.setLlamaConfig({ llamaStatus: 'checking' });
        
        try {
          const isLocalAvailable = await detectLocalLlama(llamaConfig.endpoint);
          
          if (isLocalAvailable) {
            actions.setLlamaConfig({ 
              llamaStatus: 'connected',
              connected: true 
            });
            toast.success('Local LLaMA detected and connected');
          } else {
            actions.setLlamaConfig({ 
              llamaStatus: 'disconnected',
              connected: false 
            });
            toast.info('Local LLaMA not available - switch to cloud mode or start Ollama');
          }
        } catch (error) {
          actions.setLlamaConfig({ 
            llamaStatus: 'disconnected',
            connected: false 
          });
          console.warn('Failed to detect local LLaMA:', error);
        }
      }
    };

    detectLocalLlamaOnStartup();
  }, []); // Run once on mount

  // Auto-validate workflow when nodes or edges change (if validation panel is visible)
  useEffect(() => {
    if (uiState.showValidation) {
      actions.validateWorkflow();
    }
  }, [Object.keys(nodes).length, Object.keys(edges).length]); // Only depend on counts to avoid excessive re-validation

  // Send validation summary to WorkflowAssistant when validation runs
  useEffect(() => {
    if (validationErrors && validationErrors.length > 0) {
      const errorCount = validationErrors.filter(e => e.type === 'error').length;
      const warningCount = validationErrors.filter(e => e.type === 'warning').length;
      
      if (uiState.showValidation && errorCount > 0) {
        pushAssistantMessage({
          role: 'assistant',
          text: `🔍 Validation Results:\n\nFound ${errorCount} error${errorCount !== 1 ? 's' : ''} and ${warningCount} warning${warningCount !== 1 ? 's' : ''} in your workflow.\n\nClick "Validate" to see detailed breakdown.`
        });
      }
    }
  }, [validationErrors.length, uiState.showValidation]);

  // Listen for node config requests from ValidationPanel
  useEffect(() => {
    const handleConfigRequest = (event: any) => {
      if (event.type === 'node:config-request' && event.payload?.nodeId) {
        const nodeId = event.payload.nodeId;
        const node = nodes[nodeId];
        if (node) {
          setConfigNode(node);
        }
      }
    };

    const unsubscribe = globalCanvasEventBus.subscribe(handleConfigRequest);
    
    return () => {
      unsubscribe();
    };
  }, [nodes]);

  // Auto-fill prompt when preset is selected
  useEffect(() => {
    if (selectedPreset && !prompt.trim()) {
      setPrompt(selectedPreset.prompt);
      toast.success(`Template "${selectedPreset.title}" loaded`);
    }
  }, [selectedPreset, prompt]);

  // Count errors (not warnings) for badge display
  const errorCount = validationErrors?.filter(e => e.type === 'error').length || 0;

  const generateWorkflow = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Masukkan deskripsi workflow');
      return;
    }
    
    // Push user message to assistant
    pushAssistantMessage({
      role: 'user',
      text: prompt
    });
    
    // Acknowledge generation
    pushAssistantMessage({
      role: 'assistant',
      text: 'Got it! Let me interpret your workflow... 🧠'
    });
    
    // Use prompt interpreter with template context
    await interpret(prompt, selectedTemplate);
    
    // After interpretation, show result if successful
    if (previewData) {
      pushAssistantMessage({
        role: 'assistant',
        text: `✅ Workflow generated successfully! I've created ${previewData.nodes.length} nodes. Would you like to apply it to the canvas?`
      });
    }
  }, [prompt, selectedTemplate, interpret, pushAssistantMessage, previewData]);
  
  const handleApplyToCanvas = useCallback(() => {
    if (previewData) {
      // Debug: Print edge data
      console.log('📊 Preview Data:', {
        nodeCount: previewData.nodes.length,
        edgeCount: previewData.edges.length,
        edges: previewData.edges,
        nodes: previewData.nodes
      });
      
      // Convert workflow output to React Flow format
      const nodesRecord = Object.fromEntries(
        previewData.nodes.map(node => [node.id, node])
      );
      const edgesRecord = Object.fromEntries(
        previewData.edges.map(edge => [edge.id, edge])
      );
      
      console.log('📊 Records:', {
        nodeKeys: Object.keys(nodesRecord),
        edgeKeys: Object.keys(edgesRecord),
        edgesRecord
      });
      
      actions.batchUpdate({
        nodes: nodesRecord,
        edges: edgesRecord
      });
      
      // Close modal
      closePreview();
      toast.success('Workflow diterapkan ke canvas!');
    }
  }, [previewData, actions, closePreview]);

  const clearCanvas = useCallback(() => {
    actions.clearCanvas();
    setPrompt('');
    setSelectedPreset(null);
    setSelectedTemplate(null);
  }, [actions]);
  const handleCanvasDrop = useCallback((nodeData: any, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: nodeData.type || 'default',
      position,
      data: {
        label: nodeData.label,
        icon: getIconForLabel(nodeData.label)?.displayName,
      },
    };
    
          actions.addNode(newNode);
  }, [actions.addNode]);

  const handleExecuteNode = useCallback(async () => {
    if (!executionNode) return;
    
    setIsExecuting(true);
    const engine = new WorkflowEngine();
    const results = await engine.executeWorkflow(
      nodes, 
      edges, 
      executionNode.id, 
      llamaConfig, 
      actions.appendLlamaLog
    );
    setExecutionResult(results.get(executionNode.id) || null);
    setIsExecuting(false);
  }, [executionNode, nodes, edges, llamaConfig, actions.appendLlamaLog]);

  return (
    <section className="py-20 px-4 bg-background-soft">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-4xl md:text-5xl font-extrabold text-brand-primary">Workflow Studio</h2>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20">
              BETA
            </span>
          </div>
          <p className="text-lg text-foreground-muted">
            Build WhatsApp automation workflows visually—from concept to deployed agent.
          </p>
        </div>

        {/* Describe Workflow - Grid Layout with Preset Panel */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
            {/* Left: Preset Panel */}
            <Suspense fallback={null}>
              <PresetPanel 
                onSelect={(preset) => setSelectedPreset(preset)}
                selectedPresetId={selectedPreset?.id}
              />
            </Suspense>

            {/* Right: Workflow Input */}
            <div className="bg-card rounded-2xl border border-border-light shadow-soft p-5 flex flex-col h-[420px]">
              {/* Header - Fixed */}
              <div className="flex-shrink-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
                      <Edit3 className="w-5 h-5 text-brand-secondary" />
                      1. Describe Workflow
                    </h3>
                    <p className="text-sm text-foreground-muted">
                      Describe your workflow in natural language or select a Quick Template.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowResponsibleAIPanel(true)}
                    variant="primary"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    AI Ethics
                  </Button>
                </div>
                <div className="mb-4"></div>
              </div>

              {/* Content Area */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Mention Input */}
                <div className="flex-1 min-h-0">
                  <MentionInput
                    value={prompt}
                    onChange={(value) => {
                      setPrompt(value);
                      // Also update interpreter template
                      const mentionMatch = value.match(/@(\w+)/);
                      if (mentionMatch && mentionMatch[1]) {
                        const template = workflowPresets.find(p => p.id === mentionMatch[1]);
                        if (template) setSelectedTemplate(template);
                      }
                    }}
                    onTemplateSelect={(template) => {
                      setSelectedTemplate(template);
                      setInterpreterTemplate(template);
                    }}
                    selectedPreset={selectedPreset}
                    placeholder="Describe your workflow in natural language..."
                  />
                </div>
            
              </div>
              
              {/* Generate Buttons */}
              <div className="flex-shrink-0 pt-3 border-t border-border/40 mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Button 
                    onClick={generateWorkflow} 
                    disabled={isInterpreting || !prompt.trim()}
                    className="flex-1 bg-brand-secondary hover:bg-brand-secondary-light text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isInterpreting ? 'Generating...' : 'Generate'}
                  </Button>
                  <Suspense fallback={null}>
                    <GenerateWithLlamaButton 
                      prompt={prompt}
                      onUseWorkflow={(parsed) => {
                        if (parsed && parsed.nodes && parsed.edges) {
                          actions.batchUpdate({
                            nodes: Object.fromEntries(parsed.nodes.map(node => [node.id, node])),
                            edges: Object.fromEntries(parsed.edges.map(edge => [edge.id, edge])),
                          });
                          toast.success('LLaMA workflow applied to canvas');
                        }
                      }}
                    />
                  </Suspense>
                  <Button 
                    onClick={clearCanvas} 
                    variant="outline" 
                    size="icon" 
                    title="Clear All"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas + Node Library Side by Side */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Left Column: Node Library + Configuration */}
          <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-6">
            {/* Node Library */}
            <div className="bg-card rounded-2xl border border-border-light shadow-soft h-[600px] flex flex-col">
              {/* Header - Fixed */}
              <div className="p-5 border-b border-border flex-shrink-0">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-1">
                  <Box className="w-5 h-5 text-brand-primary" />
                  2. Node Library
                </h3>
                <p className="text-sm text-foreground-muted">
                  Drag nodes to the canvas below.
                </p>
              </div>
              
              {/* Scrollable Content */}
              <ScrollArea className="flex-1 p-5">
                <Suspense fallback={<PanelLoader />}>
                  <NodeLibrary 
                    onNodeDragStart={(e, label) => {
                      e.dataTransfer.effectAllowed = 'copy';
                      e.dataTransfer.setData('application/reactflow', JSON.stringify({ label }));
                    }}
                  />
                </Suspense>
              </ScrollArea>
            </div>
            
            {/* Configuration Panel - Below Node Library */}
            <Suspense fallback={<PanelLoader />}>
              <ConfigurationPanel
                nodes={Object.values(nodes)}
                edges={Object.values(edges)}
                onDeploy={(config) => {
                  setShowDeployModal(true);
                }}
              />
            </Suspense>
          </div>

          {/* Right Column: Canvas + Simulation */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Canvas */}
            <div className="flex-1">
              <div className="bg-card rounded-2xl border border-border-light shadow-soft flex flex-col min-h-[500px] h-full">
                <div className="flex-shrink-0 px-4 py-3 border-b border-border font-semibold flex justify-between items-center text-foreground">
                  <span className="flex-shrink-0">Workflow Canvas</span>
                  <div className="flex items-center gap-2 overflow-x-auto max-w-full">
                    <Button
                      variant={errorCount > 0 ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => {
                        actions.validateWorkflow();
                        actions.toggleValidation();
                      }}
                      className={`relative flex-shrink-0 ${uiState.showValidation && errorCount === 0 ? 'bg-green-500/10 border-green-500' : ''} ${errorCount > 0 ? 'hover:bg-destructive/90' : ''}`}
                      title={
                        errorCount > 0 
                          ? `Found ${errorCount} validation errors. Click to view details.`
                          : 'Validate workflow and view validation results.'
                      }
                    >
                      <Shield className={`w-4 h-4 mr-1 ${errorCount > 0 ? 'text-white' : ''}`} />
                      Validate
                      {errorCount > 0 && (
                        <span className="ml-1.5 bg-white text-red-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-red-500">
                          {errorCount}
                        </span>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLlamaPanel(true)}
                      className={`flex-shrink-0 ${llamaConfig.connected ? 'bg-green-50 border-green-200 text-green-700' : ''}`}
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Connect to LLaMA
                    </Button>
                    
                    <span className="text-xs text-foreground-light font-normal flex-shrink-0 whitespace-nowrap">
                      {nodes.length} node{nodes.length !== 1 ? 's' : ''} | {edges.length} edge{edges.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                {/* Canvas Content */}
                <div className="relative flex-1 overflow-hidden">
                  <Suspense fallback={<CanvasLoader />}>
                    <WorkflowCanvas
                      onNodeClick={(node) => actions.selectNode(node.id)}
                      onOpenConfig={(node) => setConfigNode(node)}
                      onDrop={handleCanvasDrop}
                      onDeleteEdge={actions.removeEdge}
                      onUpdateEdge={actions.updateEdge}
                      onCopy={() => actions.copySelection([], [])}
                      onPaste={() => actions.pasteSelection()}
                      onDuplicate={() => actions.duplicateSelection([], [])}
                      onOpenLlamaSettings={() => setShowLlamaPanel(true)}
                    />
                  </Suspense>
                  
                  {/* Export/Import Panel */}
                  <Suspense fallback={null}>
                    <ExportImportPanel />
                  </Suspense>
                </div>
              </div>

              {/* Validation Panel - Render outside overflow container */}
              <Suspense fallback={null}>
                <ValidationPanel />
              </Suspense>
            </div>
            
            {/* WhatsApp Simulation Panel - Below Canvas */}
            <Suspense fallback={<PanelLoader />}>
              <WhatsAppSimulationPanel
                nodes={Object.values(nodes)}
                edges={Object.values(edges)}
              />
            </Suspense>
          </div>
        </div>

      {/* Modals and Floating Components */}
      <Suspense fallback={null}>
        <MetricsInputPanel
          node={uiState.selectedNodeId ? nodes[uiState.selectedNodeId] : null}
          onClose={() => actions.selectNode(null)}
          onUpdateMetrics={(nodeId, metrics) => {
            actions.updateNode(nodeId, { data: { ...nodes[nodeId]?.data, ...metrics } });
          }}
        />
      </Suspense>

      {/* Node Config Panel */}
      {configNode && (
        <Suspense fallback={<PanelLoader />}>
          <NodeConfigPanel
            node={configNode}
            onClose={() => setConfigNode(null)}
            onSave={(nodeId, title, description, metrics?) => {
              // Get existing node data
              const existingNode = nodes[nodeId];
              const existingData = existingNode?.data || {};
              
              // Merge with new data (preserve existing fields)
              const updatedData = {
                ...existingData,
                title,
                description,
              };
              
              // If metrics provided, add to node data
              if (metrics && metrics.length > 0) {
                updatedData.metrics = metrics;
              }
              
              actions.updateNode(nodeId, { data: updatedData });
              setConfigNode(null);
              toast.success('Node configuration saved');
            }}
          />
        </Suspense>
      )}

      {/* Node Execution Panel */}
      {executionNode && (
        <Suspense fallback={<PanelLoader />}>
          <NodeExecutionPanel
            node={executionNode}
            result={executionResult}
            isExecuting={isExecuting}
            onClose={() => {
              setExecutionNode(null);
              setExecutionResult(null);
            }}
            onExecute={() => {
              handleExecuteNode();
            }}
          />
        </Suspense>
      )}

      {/* LLaMA Connection Panel */}
      <Suspense fallback={null}>
        <LlamaConnectionPanel
          open={showLlamaPanel}
          onOpenChange={setShowLlamaPanel}
        />
      </Suspense>

      {/* Responsible AI Panel */}
      <Suspense fallback={null}>
        <ResponsibleAIPanel
          open={showResponsibleAIPanel}
          onOpenChange={setShowResponsibleAIPanel}
        />
      </Suspense>
      
      {/* Workflow Preview Modal */}
      <Suspense fallback={null}>
        <WorkflowPreviewModal
          open={showPreview}
          onClose={closePreview}
          workflow={previewData}
          validation={analysis?.validation}
          onApply={handleApplyToCanvas}
          onExport={exportJSON}
        />
      </Suspense>
      
      {/* Deploy Agent Modal */}
      <Suspense fallback={null}>
        <DeployAgentModal
          open={showDeployModal}
          onOpenChange={setShowDeployModal}
          workflow={{
            nodes: Object.values(nodes),
            edges: Object.values(edges),
          }}
        />
      </Suspense>

      {/* Floating Chat Button */}
      <Suspense fallback={null}>
        <FloatingChatButton />
      </Suspense>
      </div>
    </section>
  );
};

export const WorkflowStudio = () => {
  return (
    <ReactFlowProvider>
      <WorkflowStudioContent />
    </ReactFlowProvider>
  );
};