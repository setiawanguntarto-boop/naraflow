import React, { useState, useEffect } from "react";
import {
  Rocket,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Play,
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
// Removed environment selector – deployment targets are handled by server config
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { deploymentClient, DeploymentStep, DeploymentData, DeploymentConfig } from "@/lib/deploymentClient";
import { WorkflowValidator, ValidationError } from "@/utils/workflowValidation";
import { useDeployment } from "@/hooks/useDeployment";
import { DeploymentErrorDisplay } from "./DeploymentErrorDisplay";
import { useWorkflowState } from "@/hooks/useWorkflowState";
// Cloud and simulation steps removed – simplified to Configure and Deploy only

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
  onWorkflowUpdate?: (workflow: { nodes: any[]; edges: any[] }) => void;
}

interface SimulationLog {
  timestamp: number;
  nodeId: string;
  nodeLabel: string;
  message: string;
  status: "success" | "info" | "warning" | "error";
}

export function DeployAgentModal({ open, onOpenChange, workflow, initialConfig, onWorkflowUpdate }: DeployAgentModalProps) {
  // Use deployment hook
  const { isDeploying, error, deployWithRetry, clearError } = useDeployment();
  const workflowStore = useWorkflowState();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Track current workflow state in modal (updated by auto-fix)
  const [currentWorkflow, setCurrentWorkflow] = useState(workflow);
  const [autoFixApplied, setAutoFixApplied] = useState(false);
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([]);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [deploymentProgress, setDeploymentProgress] = useState(0);

  // Post-deploy metrics (populated after successful deploy; backend can enrich later)
  const [tokenMetrics, setTokenMetrics] = useState<{
    scopes?: string[];
    expiresAt?: number;
    dataAccessExpiresAt?: number;
  }>({});
  const [wabaMetrics, setWabaMetrics] = useState<{
    wabaId?: string;
    reviewStatus?: "PENDING" | "APPROVED" | "REJECTED" | "UNKNOWN";
    ownership?: "shared" | "owned" | "unknown";
  }>({});
  const [webhookMetrics, setWebhookMetrics] = useState<{
    verified?: boolean;
    lastDeliveryAt?: string;
    lastStatusCode?: number;
  }>({});

  // Step 1: Configuration - Use initialConfig if provided
  const [agentName, setAgentName] = useState(initialConfig?.agentName || "");
  // Environment removed from UI; backend will decide target environment
  const [phoneNumberId, setPhoneNumberId] = useState(initialConfig?.phoneNumberId || "");
  const [accessToken, setAccessToken] = useState(initialConfig?.accessToken || "");
  const [wabaId, setWabaId] = useState(initialConfig?.wabaId || "");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("");

  // Simplified: Only two steps now – 1) Configure, 2) Deploy

  // Update current workflow when prop changes
  useEffect(() => {
    setCurrentWorkflow(workflow);
  }, [workflow.nodes, workflow.edges]);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [validationKey, setValidationKey] = useState(0);
  
  useEffect(() => {
    try {
      const errs = WorkflowValidator.validateWorkflow(currentWorkflow.nodes as any[], currentWorkflow.edges as any[]);
      console.log("[DeployAgentModal] Validation updated:", errs.length, "errors");
      setValidationErrors(errs);
    } catch (e) {
      console.error("Validation error:", e);
    }
  }, [currentWorkflow, validationKey]);

  const handleAutoFix = () => {
    try {
      const { nodes: fixedNodes, edges: fixedEdges, changes } = WorkflowValidator.autoFixWorkflow(
        currentWorkflow.nodes as any[],
        currentWorkflow.edges as any[]
      );
      
      console.log("[DeployAgentModal] Auto-fix applied:", {
        nodeCount: fixedNodes.length,
        edgeCount: fixedEdges.length,
        changesCount: changes.length,
        changes
      });
      
      // Ensure all edges have IDs for proper mapping
      const edgesWithIds = fixedEdges.map(e => ({
        ...e,
        id: e.id || `edge-${e.source}-${e.target}-${Date.now()}`
      }));
      
      // Apply to canvas state
      const patchNodes: Record<string, any> = {};
      fixedNodes.forEach(n => { patchNodes[n.id] = n as any; });
      const patchEdges: Record<string, any> = {};
      edgesWithIds.forEach(e => { patchEdges[e.id] = e as any; });
      
      console.log("[DeployAgentModal] Batch updating canvas with:", {
        nodeCount: Object.keys(patchNodes).length,
        edgeCount: Object.keys(patchEdges).length,
        edgeIds: Object.keys(patchEdges)
      });
      
      workflowStore.actions.batchUpdate({ nodes: patchNodes, edges: patchEdges });

      // Update modal's current workflow state
      const fixedWorkflow = { nodes: fixedNodes as any[], edges: edgesWithIds as any[] };
      setCurrentWorkflow(fixedWorkflow);
      setAutoFixApplied(true);
      
      // Trigger validation re-run after a short delay to ensure state propagation
      setTimeout(() => {
        setValidationKey(prev => prev + 1);
      }, 100);

      // Notify parent to update the workflow prop
      if (onWorkflowUpdate) {
        onWorkflowUpdate(fixedWorkflow);
      }
      
      // Show success message
      const preview = changes.slice(0, 3).map(c => `• ${c.description}`).join("\n");
      const more = changes.length > 3 ? `\n…and ${changes.length - 3} more` : "";
      toast.success("Applied quick fixes", { description: `${changes.length} change(s) applied)\n${preview}${more}` });
    } catch (e: any) {
      console.error("[DeployAgentModal] Auto-fix error:", e);
      toast.error("Auto-fix failed", { description: e?.message });
    }
  };

  // Load initial config from ConfigurationPanel when modal opens
  useEffect(() => {
    if (open && initialConfig) {
      if (initialConfig.agentName) setAgentName(initialConfig.agentName);
      // environment removed
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
      setDeploymentSteps([]);
      setDeploymentError(null);
      setDeploymentProgress(0);
      clearError();
    }
  }, [open, clearError]);

  // Step navigation is now handled inline with setCurrentStep directly

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

    // Validate workflow (basic)
    if (!workflow.nodes || workflow.nodes.length === 0) {
      toast.error("Workflow is empty");
      return;
    }

    // Block deploy on structural errors
    const blocking = validationErrors.filter(e => e.type === "error");
    if (blocking.length > 0) {
      toast.error("Fix workflow errors before deploying", { description: blocking[0]?.message });
      setCurrentStep(1);
      setIsProcessing(false);
      return;
    }

    setDeploymentError(null);
    setDeploymentProgress(0);

    try {
      // Validate configuration first
      const validation = deploymentClient.validateConfig(
        {
          agentName,
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
        { name: "Configuration", status: "pending" },
        { name: "Resource Allocation", status: "pending" },
        { name: "Workflow Compilation", status: "pending" },
        { name: "Agent Deployment", status: "pending" },
        { name: "Health Check", status: "pending" },
      ];
      setDeploymentSteps(initialSteps);

      // Run deployment with progress tracking
      const deployData: DeploymentData = {
        agentName,
        phoneNumberId,
        accessToken,
        wabaId,
        webhookUrl,
        apiKey,
        workflow: {
          nodes: workflow.nodes,
          edges: workflow.edges,
        },
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
        description: `Endpoint: ${endpoint}`,
        duration: 7000,
      });

      // Keep modal open; user can close manually after reviewing success
      // Populate basic metrics (placeholder values; server should enrich via real checks)
      setTokenMetrics({ scopes: ["whatsapp_business_management", "whatsapp_business_messaging" ] });
      setWabaMetrics({ wabaId: wabaId || undefined, reviewStatus: "UNKNOWN", ownership: "unknown" });
      setWebhookMetrics({ verified: Boolean(webhookUrl), lastDeliveryAt: undefined, lastStatusCode: undefined });

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

  // Two-step flow: 1) Configure 2) Deploy
  const totalSteps = 2;

  const canProceedToNext = (step: number) => {
    if (step === 1) {
      const hasBlocking = validationErrors.some(e => e.type === "error");
      const requiredFieldsValid = Boolean(agentName.trim() && phoneNumberId.trim() && accessToken.trim());
      
      console.log("[DeployAgentModal] canProceedToNext check:", {
        step,
        hasBlocking,
        validationErrors: validationErrors.length,
        blockingErrors: validationErrors.filter(e => e.type === "error").length,
        requiredFieldsValid,
        agentName: agentName.trim(),
        phoneNumberId: phoneNumberId.trim(),
        accessToken: accessToken.trim(),
      });
      
      return requiredFieldsValid && !hasBlocking;
    }
    return true;
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
            Configure and publish your workflow as an operational automation
            agent.
          </DialogDescription>
        </DialogHeader>

        {/* Step Navigation */}
        <div className="flex items-center justify-center py-4 border-b">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => {
              let stepLabel = "";
              if (step === 1) stepLabel = "Configuration";
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
                  placeholder="e.g., NaraflowOpsBot"
                  className="text-black placeholder:text-gray-400"
                />
                <p className="text-xs text-black">
                  Nama unik untuk endpoint dan identitas agent Anda.
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
                  ID nomor WhatsApp dari WABA (Meta Business). <a className="underline" href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/" target="_blank" rel="noreferrer">Pelajari cara mendapatkannya</a>.
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
                  System User Access Token dari Meta App Anda. <a className="underline" href="https://developers.facebook.com/docs/whatsapp/business-management-api/get-started#generate-system-user-access-tokens" target="_blank" rel="noreferrer">Panduan token</a>.
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
                  WhatsApp Business Account ID (opsional) untuk validasi/diagnostik. <a className="underline" href="https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers/" target="_blank" rel="noreferrer">Lihat referensi</a>.
                </p>
              </div>

              {/* Environment selection removed – deployment target configured server-side */}

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
                  Endpoint untuk menerima event (messages/status). <a className="underline" href="https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components#callback" target="_blank" rel="noreferrer">Tentang webhook</a>.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-black">API Key (Optional)</Label>
                <Input
                  id="apiKey"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk_live_... (opsional)"
                  type="password"
                  className="text-black placeholder:text-gray-400"
                />
                <p className="text-xs text-black">
                  Kunci untuk layanan eksternal (opsional), mis. AI/DB/Integrasi lain.
                </p>
              </div>

              {/* Validation Summary */}
              <div className={`rounded-md border p-3 ${validationErrors.some(e => e.type === 'error') ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
                <p className="text-sm font-semibold mb-2 text-black">Validation</p>
                <p className="text-xs text-black mb-2">
                  {validationErrors.some(e => e.type === 'error')
                    ? 'Please fix the errors below before continuing:'
                    : 'No blocking errors detected. Warnings may still apply.'}
                </p>
                {validationErrors.slice(0, 5).map((e, idx) => (
                  <div key={idx} className="text-xs text-black flex items-start gap-2 mb-1">
                    <span>{e.type === 'error' ? '❌' : '⚠️'}</span>
                    <span>{e.message}</span>
                  </div>
                ))}
                {validationErrors.length > 5 && (
                  <p className="text-[10px] text-black/70">and {validationErrors.length - 5} more…</p>
                )}
                <div className="mt-2">
                  <Button size="sm" variant="secondary" onClick={handleAutoFix}>
                    Try Auto-Fix
                  </Button>
                </div>
              </div>
            </div>
          )}

          {false && currentStep === 2 && <div />} 

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-black mb-4">Deployment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-md text-black">
                    <span className="text-sm font-medium">Agent Name</span>
                    <Badge>{agentName}</Badge>
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
                        Your agent has been deployed successfully.
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Network className="w-4 h-4" />
                        <span className="font-mono text-xs text-black">
                          https://api.naraflow.ai/agents/{agentName}
                        </span>
                      </div>

                      {/* Post-deploy Metrics */}
                      <div className="mt-4 grid sm:grid-cols-3 gap-3">
                        <div className="rounded-md border border-gray-200 p-3">
                          <p className="text-xs font-semibold mb-2">Token Scopes</p>
                          <div className="flex flex-wrap gap-2">
                            {(tokenMetrics.scopes && tokenMetrics.scopes.length > 0
                              ? tokenMetrics.scopes
                              : ["unknown"]).map((s, i) => (
                                <Badge key={i} variant="outline">{s}</Badge>
                              ))}
                          </div>
                          {tokenMetrics.expiresAt && (
                            <p className="text-[10px] text-gray-500 mt-2">Expires: {new Date(tokenMetrics.expiresAt * 1000).toLocaleString()}</p>
                          )}
                        </div>
                        <div className="rounded-md border border-gray-200 p-3">
                          <p className="text-xs font-semibold mb-2">WABA Status</p>
                          <div className="space-y-1 text-xs">
                            <div>ID: {wabaMetrics.wabaId || "unknown"}</div>
                            <div>Review: {wabaMetrics.reviewStatus || "UNKNOWN"}</div>
                            <div>Ownership: {wabaMetrics.ownership || "unknown"}</div>
                          </div>
                        </div>
                        <div className="rounded-md border border-gray-200 p-3">
                          <p className="text-xs font-semibold mb-2">Webhook</p>
                          <div className="space-y-1 text-xs">
                            <div>Verified: {webhookMetrics.verified ? "yes" : "no"}</div>
                            <div>Last Delivery: {webhookMetrics.lastDeliveryAt || "-"}</div>
                            <div>Last Status: {webhookMetrics.lastStatusCode || "-"}</div>
                          </div>
                        </div>
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
                        <li>Your agent will be deployed</li>
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
