import { useState, useRef, useEffect, useCallback, Suspense, lazy } from "react";
import {
  Sparkles,
  Trash2,
  Edit3,
  Box,
  Shield,
  Zap,
  AlertCircle,
  Wifi,
  WifiOff,
  Loader2,
  Book,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Node, Edge, ReactFlowProvider } from "@xyflow/react";
import {
  useWorkflowState,
  useNodes,
  useNodesRecord,
  useEdges,
  useWorkflowActions,
  useUIState,
} from "@/hooks/useWorkflowState";
import { getIconForLabel } from "@/data/nodeIcons";
import { WorkflowEngine } from "@/lib/workflowEngine";
import { ExecutionResult } from "@/types/workflow";
import { detectLocalLlama } from "@/lib/llamaClient";
import { workflowPresets, WorkflowPreset } from "@/lib/templates/workflowPresets";
import { workflowTemplates } from "@/lib/templates/workflowTemplates";
import { toast } from "sonner";
import { usePromptInterpreter } from "@/hooks/usePromptInterpreter";
import { useGenerationStore } from "@/store/generationStore";
import { MentionInput } from "@/components/workflow/MentionInput";
import { PresetPanel, type WorkflowPreset as PresetType } from "@/components/workflow/PresetPanel";
import { WorkflowSizeIndicator } from "@/components/workflow/WorkflowSizeIndicator";
import { EnhancedWorkflowAssistant } from "@/components/workflow/EnhancedWorkflowAssistant";
import { useContextAwareHelp } from "@/hooks/useContextAwareHelp";
import { globalCanvasEventBus } from "@/hooks/useCanvasEventBus";
import { QuickTemplatesPanel, BROILER_TEMPLATES, type QuickTemplate } from "@/components/workflow/QuickTemplatesPanel";
import { useBroilerWorkflowGenerator } from "@/hooks/useBroilerWorkflowGenerator";
import "@xyflow/react/dist/style.css";
import { getContextAwareMessage } from "@/lib/workflowAssistantEngine";

// Lazy load heavy components
const WorkflowCanvas = lazy(() =>
  import("@/components/canvas/WorkflowCanvas").then(mod => ({ default: mod.WorkflowCanvas }))
);
const NodeLibrary = lazy(() =>
  import("@/components/workflow/NodeLibrary").then(mod => ({ default: mod.NodeLibrary }))
);
const NodeConfigPanel = lazy(() =>
  import("@/components/workflow/NodeConfigPanel").then(mod => ({ default: mod.NodeConfigPanel }))
);
const NodeExecutionPanel = lazy(() =>
  import("@/components/workflow/NodeExecutionPanel").then(mod => ({
    default: mod.NodeExecutionPanel,
  }))
);
const MetricsInputPanel = lazy(() =>
  import("@/components/canvas/MetricsInputPanel").then(mod => ({ default: mod.MetricsInputPanel }))
);
// Validation panel removed: validation is now available via the Workflow Assistant chat
const WorkflowAssistant = lazy(() =>
  import("@/components/workflow/WorkflowAssistant").then(mod => ({
    default: mod.WorkflowAssistant,
  }))
);
const ExportImportPanel = lazy(() =>
  import("@/components/canvas/ExportImportPanel").then(mod => ({ default: mod.ExportImportPanel }))
);
const LlamaConnectionPanel = lazy(() =>
  import("@/components/LlamaConnectionPanel").then(mod => ({ default: mod.LlamaConnectionPanel }))
);
const ResponsibleAIPanel = lazy(() =>
  import("@/components/Settings/ResponsibleAIPanel").then(mod => ({
    default: mod.ResponsibleAIPanel,
  }))
);
const GenerateWithLlamaButton = lazy(() =>
  import("@/components/GenerateWithLlamaButton").then(mod => ({
    default: mod.GenerateWithLlamaButton,
  }))
);
const WorkflowPreviewModal = lazy(() =>
  import("@/components/workflow/WorkflowPreviewModal").then(mod => ({
    default: mod.WorkflowPreviewModal,
  }))
);
const DeployAgentModal = lazy(() =>
  import("@/components/workflow/DeployAgentModal").then(mod => ({ default: mod.DeployAgentModal }))
);
const FloatingChatButton = lazy(() =>
  import("@/components/workflow/FloatingChatButton").then(mod => ({
    default: mod.FloatingChatButton,
  }))
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
  const [prompt, setPrompt] = useState("");

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
  const [deploymentConfig, setDeploymentConfig] = useState<any>(null);

  // Selected template from @mention
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowPreset | null>(null);

  // Selected preset from Quick Templates
  const [selectedPreset, setSelectedPreset] = useState<PresetType | null>(null);

  // Broiler workflow quick templates
  const [showBroilerTemplates, setShowBroilerTemplates] = useState(false);
  const [selectedBroilerTemplate, setSelectedBroilerTemplate] = useState<QuickTemplate | null>(null);

  // Enhanced Workflow Assistant state
  const [showEnhancedAssistant, setShowEnhancedAssistant] = useState(false);

  // Use new state management
  const nodes = useNodes();
  const nodesRecord = useNodesRecord();
  const edges = useEdges();
  const uiState = useUIState();
  const actions = useWorkflowActions();
  const { llamaConfig, validationErrors } = useWorkflowState();

  // Context-aware help
  const { getContextualHelp, getSuggestedFeatures } = useContextAwareHelp();

  // Broiler workflow generator
  const { generateBroilerWorkflow } = useBroilerWorkflowGenerator();

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
    setSelectedTemplate: setInterpreterTemplate,
  } = usePromptInterpreter();

  // Handler for broiler template selection
  const handleBroilerTemplateSelect = useCallback((template: QuickTemplate) => {
    setSelectedBroilerTemplate(template);
    setPrompt(template.prompt);
    toast.success(`Template "${template.name}" loaded`);
  }, []);

  // Handler for broiler workflow generation
  const handleBroilerWorkflowGenerate = useCallback((generatedPrompt: string, templateId: string) => {
    // Generate nodes and edges
    const { nodes: broilerNodes, edges: broilerEdges } = generateBroilerWorkflow(templateId);
    
    // Convert to format expected by batchUpdate
    const nodesRecord = Object.fromEntries(broilerNodes.map(node => [node.id, node]));
    const edgesRecord = Object.fromEntries(broilerEdges.map(edge => [edge.id, edge]));
    
    // Apply to canvas
    actions.batchUpdate({
      nodes: nodesRecord,
      edges: edgesRecord,
    });
    
    setPrompt(generatedPrompt);
    setShowBroilerTemplates(false);
    toast.success(`Workflow "${BROILER_TEMPLATES.find(t => t.id === templateId)?.name}" generated successfully!`);

    try {
      const msg = getContextAwareMessage("generated", {
        ...buildCtx(),
        // Use the just generated data when available (nodes/edges were set above)
      });
      pushAssistantMessage({ role: "assistant", text: msg });
    } catch {}
  }, [generateBroilerWorkflow, actions]);

  // Count errors (not warnings) for badge display
  const errorCount = validationErrors?.filter(e => e.type === "error").length || 0;

  // Zustand generation store for assistant communication
  const { pushMessage: pushAssistantMessage } = useGenerationStore();
  const buildCtx = useCallback(() => ({
    nodes,
    edges: Object.fromEntries(edges.map(e => [e.id, e])),
    llamaConnected: !!llamaConfig.connected,
    selectedPreset: selectedPreset?.title ?? null,
    errorCount,
  }), [nodes, edges, llamaConfig.connected, selectedPreset?.title, errorCount]);
  const prevPromptRef = useRef<string>("");
  const lastCountsRef = useRef<{ nodes: number; edges: number }>({ nodes: 0, edges: 0 });
  const prevLlamaConnectedRef = useRef<boolean | null>(null);
  const extractSteps = (text: string): string[] => {
    return text
      .split(/→|->|,/)
      .map(s => s.trim())
      .filter(Boolean);
  };

  // Detect local LLaMA on startup
  useEffect(() => {
    const detectLocalLlamaOnStartup = async () => {
      if (llamaConfig.mode === "local" && llamaConfig.llamaStatus === "disconnected") {
        actions.setLlamaConfig({ llamaStatus: "checking" });

        try {
          const isLocalAvailable = await detectLocalLlama(llamaConfig.endpoint);

          if (isLocalAvailable) {
            actions.setLlamaConfig({
              llamaStatus: "connected",
              connected: true,
            });
            toast.success("Local LLaMA detected and connected");
          } else {
            actions.setLlamaConfig({
              llamaStatus: "disconnected",
              connected: false,
            });
            toast.info("Local LLaMA not available - switch to cloud mode or start Ollama");
          }
        } catch (error) {
          actions.setLlamaConfig({
            llamaStatus: "disconnected",
            connected: false,
          });
          console.warn("Failed to detect local LLaMA:", error);
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

  // Notify assistant when counts increase (node/edge added)
  useEffect(() => {
    const nodeCount = Object.keys(nodes).length;
    const edgeCount = edges.length;
    const prev = lastCountsRef.current;
    if (nodeCount > prev.nodes) {
      try {
        const msg = getContextAwareMessage("node_added", buildCtx());
        pushAssistantMessage({ role: "assistant", text: msg });
      } catch {}
    }
    if (edgeCount > prev.edges) {
      try {
        const msg = getContextAwareMessage("edge_added", buildCtx());
        pushAssistantMessage({ role: "assistant", text: msg });
      } catch {}
    }
    lastCountsRef.current = { nodes: nodeCount, edges: edgeCount };
  }, [Object.keys(nodes).length, edges.length]);

  // Notify assistant on LLaMA connection status changes
  useEffect(() => {
    if (prevLlamaConnectedRef.current === null) {
      prevLlamaConnectedRef.current = !!llamaConfig.connected;
      return;
    }
    const prev = prevLlamaConnectedRef.current;
    const curr = !!llamaConfig.connected;
    if (curr !== prev) {
      try {
        const type = curr ? "llama_connected" : "llama_disconnected";
        const msg = getContextAwareMessage(type, buildCtx());
        pushAssistantMessage({ role: "assistant", text: msg });
      } catch {}
      prevLlamaConnectedRef.current = curr;
    }
  }, [llamaConfig.connected]);

  // Send validation summary to WorkflowAssistant when validation runs
  useEffect(() => {
    if (validationErrors && validationErrors.length > 0) {
      const errorCount = validationErrors.filter(e => e.type === "error").length;
      const warningCount = validationErrors.filter(e => e.type === "warning").length;

      if (uiState.showValidation && errorCount > 0) {
        pushAssistantMessage({
          role: "assistant",
          text: `🔍 Validation Results:\n\nFound ${errorCount} error${errorCount !== 1 ? "s" : ""} and ${warningCount} warning${warningCount !== 1 ? "s" : ""} in your workflow.\n\nClick "Validate" to see detailed breakdown.`,
        });
      }
    }
  }, [validationErrors.length, uiState.showValidation]);

  // Listen for node config requests from ValidationPanel
  useEffect(() => {
    const handleConfigRequest = (event: any) => {
      if (event.type === "node:config-request" && event.payload?.nodeId) {
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

  const generateWorkflow = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("Masukkan deskripsi workflow");
      return;
    }

    // Check if this is a broiler workflow based on selected template or prompt content
    const isBroilerWorkflow = 
      selectedPreset?.id === 'broiler' ||
      prompt.toLowerCase().includes('broiler') ||
      prompt.toLowerCase().includes('budidaya');

    // If broiler template is selected, use the template generator directly
    if (isBroilerWorkflow && selectedBroilerTemplate) {
      // Use Broiler Template Generator - this generates the full workflow structure
      const templateId = selectedBroilerTemplate.id;
      toast.info("Generating broiler workflow template...");
      handleBroilerWorkflowGenerate(selectedBroilerTemplate.prompt, templateId);
      return;
    }

    // If preset is broiler but no template selected, find and use the default template
    if (isBroilerWorkflow && !selectedBroilerTemplate) {
      const defaultTemplate = BROILER_TEMPLATES.find(t => t.id === 'broiler-full');
      if (defaultTemplate) {
        setSelectedBroilerTemplate(defaultTemplate);
        handleBroilerWorkflowGenerate(defaultTemplate.prompt, defaultTemplate.id);
        return;
      }
    }

    // Push user message to assistant
    pushAssistantMessage({
      role: "user",
      text: prompt,
    });

    // Acknowledge generation
    pushAssistantMessage({
      role: "assistant",
      text: "Got it! Let me interpret your workflow... 🧠",
    });

    // Use prompt interpreter with template context
    await interpret(prompt, selectedTemplate);

    // After interpretation, show result if successful
    if (previewData) {
      pushAssistantMessage({
        role: "assistant",
        text: `✅ Workflow generated successfully! I've created ${previewData.nodes.length} nodes. Would you like to apply it to the canvas?`,
      });
    }
  }, [prompt, selectedTemplate, selectedPreset, selectedBroilerTemplate, interpret, pushAssistantMessage, previewData, handleBroilerWorkflowGenerate]);

  const handleApplyToCanvas = useCallback(() => {
    if (previewData) {
      // Debug: Print edge data
      console.log("📊 Preview Data:", {
        nodeCount: previewData.nodes.length,
        edgeCount: previewData.edges.length,
        edges: previewData.edges,
        nodes: previewData.nodes,
      });

      // Convert workflow output to React Flow format
      const nodesRecord = Object.fromEntries(previewData.nodes.map(node => [node.id, node]));
      const edgesRecord = Object.fromEntries(previewData.edges.map(edge => [edge.id, edge]));

      console.log("📊 Records:", {
        nodeKeys: Object.keys(nodesRecord),
        edgeKeys: Object.keys(edgesRecord),
        edgesRecord,
      });

      actions.batchUpdate({
        nodes: nodesRecord,
        edges: edgesRecord,
      });

      // Close modal
      closePreview();
      toast.success("Workflow diterapkan ke canvas!");
    }
  }, [previewData, actions, closePreview]);

  const clearCanvas = useCallback(() => {
    actions.clearCanvas();
    setPrompt("");
    setSelectedPreset(null);
    setSelectedTemplate(null);
  }, [actions]);
  const handleCanvasDrop = useCallback(
    (nodeData: any, position: { x: number; y: number }) => {
      const newNode: Node = {
        id: `node_${Date.now()}`,
        type: nodeData.type || "default",
        position,
        data: {
          label: nodeData.label,
          icon: getIconForLabel(nodeData.label)?.displayName,
        },
      };

      actions.addNode(newNode);
    },
    [actions.addNode]
  );

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
            <h2 className="text-4xl md:text-5xl font-extrabold text-brand-primary">
              Workflow Studio
            </h2>
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
                onSelect={preset => {
                  // Open broiler templates modal when Budidaya Broiler is selected
                  if (preset.id === "broiler") {
                    setShowBroilerTemplates(true);
                  } else {
                    setSelectedPreset(preset);
                    try {
                      const msg = getContextAwareMessage("preset_selected", buildCtx());
                      pushAssistantMessage({ role: "assistant", text: msg });
                    } catch {}
                  }
                }}
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
                  <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowResponsibleAIPanel(true)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    AI Ethics
                  </Button>
                  </div>
                </div>
                <div className="mb-4"></div>
              </div>

              {/* Content Area */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Mention Input */}
                <div className="flex-1 min-h-0">
                  <MentionInput
                    value={prompt}
                    onChange={value => {
                      setPrompt(value);
                      if (!prevPromptRef.current && value.trim().length > 0) {
                        try {
                          const msg = getContextAwareMessage("describe_started", buildCtx());
                          pushAssistantMessage({ role: "assistant", text: msg });
                        } catch {}
                      }
                      prevPromptRef.current = value;
                      // Also update interpreter template
                      const mentionMatch = value.match(/@(\w+)/);
                      if (mentionMatch && mentionMatch[1]) {
                        const template = workflowPresets.find(p => p.id === mentionMatch[1]);
                        if (template) setSelectedTemplate(template);
                      }
                    }}
                    onTemplateSelect={template => {
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
                    {isInterpreting ? "Generating..." : "Generate"}
                  </Button>
                  <Suspense fallback={null}>
                    <GenerateWithLlamaButton
                      prompt={prompt}
                      onUseWorkflow={parsed => {
                        if (parsed && parsed.nodes && parsed.edges) {
                          actions.batchUpdate({
                            nodes: Object.fromEntries(parsed.nodes.map(node => [node.id, node])),
                            edges: Object.fromEntries(parsed.edges.map(edge => [edge.id, edge])),
                          });
                          toast.success("LLaMA workflow applied to canvas");
                        }
                      }}
                    />
                  </Suspense>
                  <Button onClick={clearCanvas} variant="outline" size="icon" title="Clear All">
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
                <p className="text-sm text-foreground-muted">Drag nodes to the canvas below.</p>
              </div>

              {/* Scrollable Content */}
              <ScrollArea className="flex-1 p-5">
                <Suspense fallback={<PanelLoader />}>
                  <NodeLibrary
                    onNodeDragStart={(e, label) => {
                      e.dataTransfer.effectAllowed = "copy";
                      e.dataTransfer.setData("application/reactflow", JSON.stringify({ label }));
                    }}
                    showTitle={false}
                  />
                </Suspense>
              </ScrollArea>
            </div>

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
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLlamaPanel(true)}
                      className={`flex-shrink-0 ${llamaConfig.connected ? "bg-green-50 border-green-200 text-green-700" : ""}`}
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Connect to LLaMA
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => setShowDeployModal(true)}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white flex-shrink-0 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Deploy
                    </Button>

                    {/* Workflow Size Indicator */}
                    <div className="hidden md:block border-l border-border pl-4 ml-2">
                      <WorkflowSizeIndicator nodes={nodesRecord} />
                    </div>

                    <span className="text-xs text-foreground-light font-normal flex-shrink-0 whitespace-nowrap">
                      {Object.keys(nodesRecord).length} node{Object.keys(nodesRecord).length !== 1 ? "s" : ""} | {edges.length} edge
                      {edges.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Canvas Content */}
                <div className="relative flex-1 overflow-hidden">
                  <Suspense fallback={<CanvasLoader />}>
                    <WorkflowCanvas
                      onNodeClick={node => actions.selectNode(node.id)}
                      onOpenConfig={node => {
                        setConfigNode(node);
                        try {
                          const msg = getContextAwareMessage("node_config_opened", buildCtx());
                          pushAssistantMessage({ role: "assistant", text: msg });
                        } catch {}
                      }}
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

              {/* ValidationPanel removed: use chat-based validation in WorkflowAssistant */}
            </div>

            {/* Simulation panel removed */}
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
                toast.success("Node configuration saved");
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
          <LlamaConnectionPanel open={showLlamaPanel} onOpenChange={setShowLlamaPanel} />
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
            initialConfig={deploymentConfig}
            onWorkflowUpdate={(updatedWorkflow) => {
              // Update the workflow in the store so the modal reflects changes
              const patchNodes: Record<string, any> = {};
              updatedWorkflow.nodes.forEach(n => (patchNodes[n.id] = n as any));
              const patchEdges: Record<string, any> = {};
              updatedWorkflow.edges.forEach(e => (patchEdges[e.id as any] = e as any));
              actions.batchUpdate({ nodes: patchNodes, edges: patchEdges });
            }}
          />
        </Suspense>

        {/* Floating Chat Button */}
        <Suspense fallback={null}>
          <FloatingChatButton />
        </Suspense>

        {/* Enhanced Workflow Assistant Button - Floating */}
        <Button
          onClick={() => setShowEnhancedAssistant(true)}
          variant="secondary"
          size="lg"
          className="fixed bottom-24 right-6 rounded-full shadow-lg z-50 h-14 w-14 p-0 flex items-center justify-center"
          title="Learn all features"
        >
          <Book className="w-6 h-6" />
        </Button>

        {/* Enhanced Workflow Assistant Modal */}
        {showEnhancedAssistant && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="relative w-full max-w-5xl">
              <EnhancedWorkflowAssistant
                {...({
                  onClose: () => setShowEnhancedAssistant(false),
                  context: {
                    nodeCount: Object.keys(nodesRecord).length,
                    edgeCount: edges.length,
                    errorCount,
                    llamaConnected: !!llamaConfig.connected,
                    selectedPreset: selectedPreset?.title ?? null,
                  },
                } as any)}
              />
            </div>
          </div>
        )}

        {/* Broiler Quick Templates Panel */}
        {showBroilerTemplates && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="relative w-full max-w-4xl h-[90vh] bg-card rounded-2xl shadow-2xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-2xl font-bold">Broiler Quick Templates</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBroilerTemplates(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <QuickTemplatesPanel
                  onTemplateSelect={handleBroilerTemplateSelect}
                  onGenerate={handleBroilerWorkflowGenerate}
                />
              </div>
            </div>
          </div>
        )}
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
