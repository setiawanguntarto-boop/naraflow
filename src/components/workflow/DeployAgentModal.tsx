import React, { useState, useEffect } from "react";
import {
  Rocket,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Settings,
  Zap,
  Globe,
  XCircle,
  Clock,
  Shield,
  Network,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { deploymentClient, DeploymentStep, DeploymentData, DeploymentConfig } from "@/lib/deploymentClient";
import { useDeployment } from "@/hooks/useDeployment";
import { DeploymentErrorDisplay } from "./DeploymentErrorDisplay";
import { detectCloudNeeds, CloudConfig, defaultCloudConfig } from "@/lib/cloudInfrastructureDetector";
import { CloudInfrastructureStep } from "./CloudInfrastructureStep";

interface DeployAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow: {
    nodes: any[];
    edges: any[];
  };
  initialConfig?: {
    agentName?: string;
    phoneNumberId?: string;
    accessToken?: string;
    wabaId?: string;
    environment?: string;
    webhookUrl?: string;
    apiKey?: string;
  };
}

interface SimulationLog {
  timestamp: number;
  nodeId: string;
  nodeLabel: string;
  message: string;
  status: "success" | "info" | "warning" | "error";
}

export function DeployAgentModal({ open, onOpenChange, workflow, initialConfig }: DeployAgentModalProps) {
  // Use deployment hook
  const { isDeploying, error, deployWithRetry, clearError } = useDeployment();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([]);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [deploymentProgress, setDeploymentProgress] = useState(0);

  // Step 1: Configuration - Use initialConfig if provided
  const [agentName, setAgentName] = useState(initialConfig?.agentName || "");
  const [environment, setEnvironment] = useState(initialConfig?.environment || "staging");
  const [phoneNumberId, setPhoneNumberId] = useState(initialConfig?.phoneNumberId || "");
  const [accessToken, setAccessToken] = useState(initialConfig?.accessToken || "");
  const [wabaId, setWabaId] = useState(initialConfig?.wabaId || "");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("");

  // Step 2: Cloud Infrastructure (conditional)
  const [cloudConfig, setCloudConfig] = useState<CloudConfig>(defaultCloudConfig);
  const cloudNeeds = detectCloudNeeds(workflow.nodes);
  const showCloudStep = cloudNeeds.requiresCloud;

  // Step 3: Simulation
  const [simulationLogs, setSimulationLogs] = useState<SimulationLog[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);

  // Load initial config from ConfigurationPanel when modal opens
  useEffect(() => {
    if (open && initialConfig) {
      if (initialConfig.agentName) setAgentName(initialConfig.agentName);
      if (initialConfig.environment) setEnvironment(initialConfig.environment);
      if (initialConfig.phoneNumberId) setPhoneNumberId(initialConfig.phoneNumberId);
      if (initialConfig.accessToken) setAccessToken(initialConfig.accessToken);
      if (initialConfig.wabaId) setWabaId(initialConfig.wabaId);
      if (initialConfig.webhookUrl) setWebhookUrl(initialConfig.webhookUrl);
      if (initialConfig.apiKey) setApiKey(initialConfig.apiKey);
    }
  }, [open, initialConfig]);

  // Generate default agent name from workflow (fallback if no initialConfig)
  useEffect(() => {
    if (open && !agentName && !initialConfig && workflow.nodes?.length > 0) {
      const workflowName =
        workflow.nodes.find(n => n.type === "start")?.data?.label ||
        workflow.nodes[0]?.data?.label ||
        "Untitled Workflow";
      setAgentName(workflowName.replace(/[^a-zA-Z0-9]/g, "") + "Agent");
    }
  }, [open, agentName, workflow.nodes, initialConfig]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      setSimulationLogs([]);
      setSimulationComplete(false);
      setDeploymentSteps([]);
      setDeploymentError(null);
      setDeploymentProgress(0);
      clearError();
    }
  }, [open, clearError]);

  // Step navigation is now handled inline with setCurrentStep directly


  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationLogs([]);
    setSimulationComplete(false);

    const logs: SimulationLog[] = [];
    const startTime = Date.now();

    const nodes = (workflow.nodes || []) as any[];
    const edges = (workflow.edges || []) as any[];

    if (nodes.length === 0) {
      setIsSimulating(false);
      toast.error("No nodes to simulate");
      return;
    }

    const idToNode = new Map<string, any>();
    for (const n of nodes) idToNode.set(n.id, n);

    // pick explicit start node; fallback to first node
    const start = nodes.find(n => n.type === "start") || nodes[0];

    const queue: string[] = [start.id];
    const visitCounts = new Map<string, number>();
    const MAX_STEPS = Math.min(100, nodes.length * 4);
    let steps = 0;

    // helper to push log
    const pushLog = (node: any, message: string, status: SimulationLog["status"]) => {
      logs.push({
        timestamp: Date.now() - startTime,
        nodeId: node.id,
        nodeLabel: node.data?.label || node.type || "Node",
        message,
        status,
      });
      setSimulationLogs([...logs]);
    };

    pushLog(start, "Start Node Executed", "success");

    while (queue.length > 0 && steps < MAX_STEPS) {
      const currentId = queue.shift()!;
      const current = idToNode.get(currentId);
      if (!current) continue;

      // prevent infinite loops: limit each node to 2 visits
      const v = (visitCounts.get(currentId) || 0) + 1;
      visitCounts.set(currentId, v);

      // traverse outgoing edges
      const outgoing = edges.filter(e => e.source === currentId);
      for (const e of outgoing) {
        const target = idToNode.get(e.target);
        if (!target) continue;
        await new Promise(r => setTimeout(r, 250));
        pushLog(target, `Executing ${target.data?.label || target.type}...`, "info");
        if ((visitCounts.get(e.target) || 0) < 2) queue.push(e.target);
      }

      steps++;
    }

    // if there is an end node, finish with it
    const end = nodes.find(n => n.type === "end");
    if (end) {
      await new Promise(r => setTimeout(r, 250));
      pushLog(end, "Workflow completed successfully!", "success");
    }

    setSimulationComplete(true);
    setIsSimulating(false);
    toast.success("Simulation completed successfully!");
  };

  const handleDeploy = async () => {
    setIsProcessing(true);
    if (!agentName.trim()) {
      toast.error("Agent name is required");
      setIsProcessing(false);
      return;
    }

    if (!phoneNumberId.trim()) {
      toast.error("Phone Number ID is required");
      setCurrentStep(1);
      setIsProcessing(false);
      return;
    }

    if (!accessToken.trim()) {
      toast.error("Access Token is required");
      setCurrentStep(1);
      setIsProcessing(false);
      return;
    }

    // Validate workflow
    if (!workflow.nodes || workflow.nodes.length === 0) {
      toast.error("Workflow is empty");
      return;
    }

    setDeploymentError(null);
    setDeploymentProgress(0);

    try {
      // Validate configuration first
      const validation = deploymentClient.validateConfig(
        {
          agentName,
          environment: environment as "staging" | "production",
          phoneNumberId,
          accessToken,
          wabaId,
          webhookUrl,
          apiKey,
        },
        { nodes: workflow.nodes, edges: workflow.edges }
      );

      if (!validation.valid) {
        throw new Error(validation.errors.join(", "));
      }

      // Initialize deployment steps
      const initialSteps: DeploymentStep[] = [
        { name: "Validation Check", status: "running" },
        { name: "Environment Setup", status: "pending" },
        { name: "Resource Allocation", status: "pending" },
        { name: "Workflow Compilation", status: "pending" },
        { name: "Agent Deployment", status: "pending" },
        { name: "Health Check", status: "pending" },
      ];
      setDeploymentSteps(initialSteps);

      // Run deployment with progress tracking
      const deployData: DeploymentData = {
        agentName,
        environment,
        phoneNumberId,
        accessToken,
        wabaId,
        webhookUrl,
        apiKey,
        workflow: {
          nodes: workflow.nodes,
          edges: workflow.edges,
        },
        ...(showCloudStep && { cloudConfig }),
      };

      const config: DeploymentConfig = {
        agentName,
        environment: environment as "staging" | "production",
        phoneNumberId,
        accessToken,
        wabaId,
        webhookUrl,
        apiKey,
        ...(showCloudStep && { cloudConfig }),
      };

      // Simulate deployment steps (for demo)
      // In production, this would be replaced with actual deployment:
      // const result = await deployWithRetry(deployData, config);
      
      // Simulate deployment
      const simulatedSteps = await deploymentClient.simulateDeploymentSteps();
      setDeploymentSteps(simulatedSteps);
      setDeploymentProgress(100);

      const endpoint = `https://api.naraflow.ai/agents/${agentName}`;

      toast.success(`Agent ${agentName} deployed successfully!`, {
        description: `Deployed to ${environment}. Endpoint: ${endpoint}`,
        duration: 7000,
      });

      // Keep modal open; user can close manually after reviewing success

    } catch (err: any) {
      console.error("Deployment error:", err);
      
      // Show detailed error message
      const errorMessage = err.message || "Unknown error occurred";
      setDeploymentError(errorMessage);
      
      toast.error("Deployment failed", {
        description: errorMessage,
        duration: 5000,
      });

      // Update deployment steps to show error
      setDeploymentSteps((prev) =>
        prev.map((step) =>
          step.status === "running"
            ? { ...step, status: "error", message: errorMessage }
            : step
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryDeployment = async () => {
    setDeploymentError(null);
    setDeploymentSteps([]);
    setDeploymentProgress(0);
    await handleDeploy();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "running":
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Define steps dynamically based on cloud infrastructure needs
  const totalSteps = showCloudStep ? 4 : 3;
  const getStepNumber = (stepName: 'config' | 'cloud' | 'simulation' | 'deployment') => {
    if (stepName === 'config') return 1;
    if (stepName === 'cloud') return 2;
    if (stepName === 'simulation') return showCloudStep ? 3 : 2;
    if (stepName === 'deployment') return showCloudStep ? 4 : 3;
    return 1;
  };

  const canProceedToNext = (step: number) => {
    if (step === 1) {
      return agentName.trim() && phoneNumberId.trim() && accessToken.trim();
    }
    if (step === 2 && showCloudStep) {
      return true; // Cloud infrastructure step - no validation needed
    }
    if ((step === 2 && !showCloudStep) || (step === 3 && showCloudStep)) {
      return simulationComplete; // Simulation step
    }
    return true; // Deployment step
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col overflow-hidden !bg-white !text-black">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-indigo-600" />
            Deploy Agent
          </DialogTitle>
          <DialogDescription className="text-black/80">
            Configure deployment environment and publish your workflow as an operational automation
            agent.
          </DialogDescription>
        </DialogHeader>

        {/* Step Navigation */}
        <div className="flex items-center justify-center py-4 border-b">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => {
              let stepLabel = "";
              if (step === 1) stepLabel = "Configuration";
              else if (step === 2 && showCloudStep) stepLabel = "Cloud Setup";
              else if ((step === 2 && !showCloudStep) || (step === 3 && showCloudStep)) stepLabel = "Simulation";
              else stepLabel = "Deployment";

              return (
                <React.Fragment key={step}>
                  <div
                    className={`flex items-center gap-2 text-black`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentStep === step
                          ? "bg-indigo-600 text-white"
                          : currentStep > step
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {currentStep > step ? <CheckCircle2 className="w-4 h-4" /> : step}
                    </div>
                    <span className={`hidden sm:block text-sm font-medium text-black`}>
                      {stepLabel}
                    </span>
                  </div>
                  {step < totalSteps && <ChevronRight className="w-4 h-4 text-gray-400" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content - scrollable to keep footer visible */}
        <div className="py-4 flex-1 overflow-y-auto">
          {currentStep === 1 && (
            <div className="space-y-4">
              {/* Info Alert - Pre-filled from ConfigurationPanel */}
              {initialConfig && (
                <div className="rounded-lg bg-blue-100 border-2 border-blue-300 p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-black">
                      <p className="font-semibold mb-1">Configuration pre-filled from workspace</p>
                      <p className="text-xs text-black">
                        Review and update if needed, then proceed to simulation
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="agentName" className="text-black">Agent Name</Label>
                <Input
                  id="agentName"
                  value={agentName}
                  onChange={e => setAgentName(e.target.value)}
                  placeholder="e.g., CustomerSupportBot"
                  className="text-black placeholder:text-gray-400"
                />
                <p className="text-xs text-black">
                  Choose a unique name for your deployed agent
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumberId" className="text-black">Phone Number ID</Label>
                <Input
                  id="phoneNumberId"
                  value={phoneNumberId}
                  onChange={e => setPhoneNumberId(e.target.value)}
                  placeholder="e.g., 123456789012345"
                  className="text-black placeholder:text-gray-400"
                />
                <p className="text-xs text-black">
                  Your WhatsApp Business Phone Number ID from Meta
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessToken" className="text-black">Access Token</Label>
                <Input
                  id="accessToken"
                  value={accessToken}
                  onChange={e => setAccessToken(e.target.value)}
                  placeholder="EAAJB..."
                  type="password"
                  className="text-black placeholder:text-gray-400"
                />
                <p className="text-xs text-black">
                  System User Access Token from your Meta App
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wabaId" className="text-black">WABA ID (Optional)</Label>
                <Input
                  id="wabaId"
                  value={wabaId}
                  onChange={e => setWabaId(e.target.value)}
                  placeholder="e.g., 102290129340398"
                  className="text-black placeholder:text-gray-400"
                />
                <p className="text-xs text-black">
                  Your WhatsApp Business Account ID for reference
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="environment" className="text-black">Environment</Label>
                <Select value={environment} onValueChange={setEnvironment}>
                  <SelectTrigger
                    id="environment"
                    className="text-black bg-white"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem
                      value="staging"
                      className="text-black cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-black">🔧 Staging</span>
                        <span className="text-xs text-black ml-2">
                          For testing
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="production"
                      className="text-black cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-black">🚀 Production</span>
                        <span className="text-xs text-black ml-2">
                          Live deployment
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-black">
                  Staging is recommended for initial testing
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookUrl" className="text-black">Webhook URL (Optional)</Label>
                <Input
                  id="webhookUrl"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/webhook"
                  className="text-black placeholder:text-gray-400"
                />
                <p className="text-xs text-black">
                  Optional external webhook integration
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-black">API Key (Optional)</Label>
                <Input
                  id="apiKey"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  type="password"
                  className="text-black placeholder:text-gray-400"
                />
                <p className="text-xs text-black">
                  Optional API key for external service integration
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && showCloudStep && (
            <CloudInfrastructureStep
              agentName={agentName}
              environment={environment}
              needs={cloudNeeds}
              config={cloudConfig}
              onChange={setCloudConfig}
            />
          )}

          {((currentStep === 2 && !showCloudStep) || (currentStep === 3 && showCloudStep)) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-black">
                    Workflow Simulation
                  </h3>
                  <p className="text-sm text-black">
                    Preview how your workflow will execute
                  </p>
                </div>
                <Button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isSimulating ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Running...
                    </>
                  ) : simulationComplete ? (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Rerun
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Simulation
                    </>
                  )}
                </Button>
              </div>

              <ScrollArea className="h-80 border rounded-md bg-white p-4 font-mono text-xs">
                {simulationLogs.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    <div className="text-center">
                      <Zap className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-black">
                        Click &quot;Run Simulation&quot; to preview workflow execution
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {simulationLogs.map((log, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg border bg-white border-gray-200 text-black"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">
                            [{Math.floor(log.timestamp / 1000)}s]
                          </span>
                          <span className="font-semibold">→ {log.nodeLabel}</span>
                        </div>
                        <p className="ml-6 text-xs opacity-90">{log.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {simulationComplete && (
                <div className="rounded-lg bg-white border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-black">
                        Simulation completed successfully!
                      </p>
                      <p className="text-xs text-black mt-0.5">
                        Your workflow is ready to deploy.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {((currentStep === 3 && !showCloudStep) || (currentStep === 4 && showCloudStep)) && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-black mb-4">Deployment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-md text-black">
                    <span className="text-sm font-medium">Agent Name</span>
                    <Badge>{agentName}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-md text-black">
                    <span className="text-sm font-medium">Environment</span>
                    <Badge variant={environment === "production" ? "default" : "secondary"}>
                      {environment === "production" ? "🚀 Production" : "🔧 Staging"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-md text-black">
                    <span className="text-sm font-medium">Phone Number ID</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{phoneNumberId}</span>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-md text-black">
                    <span className="text-sm font-medium">Workflow</span>
                    <Badge variant="outline">
                      {workflow.nodes?.length || 0} nodes, {workflow.edges?.length || 0} connections
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-md text-black">
                    <span className="text-sm font-medium">Expected Endpoint</span>
                    <span className="text-xs font-mono text-black truncate max-w-[200px]">
                      https://api.naraflow.ai/agents/{agentName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deployment Progress */}
              {isDeploying && deploymentSteps.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">Deployment Progress</h4>
                    <Badge variant="outline">
                      {Math.round(deploymentProgress)}%
                    </Badge>
                  </div>
                  <Progress value={deploymentProgress} className="h-2" />
                  <ScrollArea className="h-48 border rounded-md p-4">
                    <div className="space-y-2">
                      {deploymentSteps.map((step, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-3 p-2 rounded border ${
                            step.status === "success"
                              ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                              : step.status === "error"
                                ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                                : step.status === "running"
                                  ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                                  : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                          }`}
                        >
                          {getStatusIcon(step.status)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{step.name}</p>
                            {step.message && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {step.message}
                              </p>
                            )}
                            {step.duration && (
                              <p className="text-xs text-muted-foreground">
                                Completed in {step.duration}ms
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Error Message */}
              {deploymentError && (
                <DeploymentErrorDisplay
                  error={deploymentError}
                  onRetry={handleRetryDeployment}
                  onDismiss={() => setDeploymentError(null)}
                  retryEnabled={!isDeploying}
                />
              )}

              {/* Success Message */}
              {!isDeploying && deploymentSteps.length > 0 && deploymentSteps.every(s => s.status === "success") && !deploymentError && (
                <div className="rounded-lg bg-white border border-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-black mb-1">
                        Deployment Successful!
                      </h4>
                      <p className="text-sm text-black mb-2">
                        Your agent has been deployed successfully to {environment}.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Network className="w-4 h-4" />
                        <span className="font-mono text-xs text-black">
                          https://api.naraflow.ai/agents/{agentName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Message (only show when not deploying and no error) */}
              {!isDeploying && !deploymentError && deploymentSteps.length === 0 && (
                <div className="rounded-lg bg-white border border-gray-200 p-3">
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-black mt-0.5" />
                    <div className="text-sm text-black">
                      <p className="font-medium mb-1">What happens next:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Your agent will be deployed to {environment}</li>
                        <li>Workflow execution will be activated</li>
                        <li>You&apos;ll receive a confirmation notification</li>
                        <li>Monitor agent status from the dashboard</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 1) {
                onOpenChange(false);
              } else {
                setCurrentStep(currentStep - 1);
              }
            }}
            disabled={isDeploying}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceedToNext(currentStep)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleDeploy}
              disabled={isDeploying || isProcessing}
              className="bg-gradient-to-r from-indigo-600 to-green-500 hover:from-indigo-700 hover:to-green-600 text-white"
            >
              {isDeploying || isProcessing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy Agent
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
