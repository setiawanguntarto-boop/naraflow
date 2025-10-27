import React, { useState, useEffect } from 'react';
import { Rocket, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Play, RotateCcw, Settings, Zap, Globe } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface DeployAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow: {
    nodes: any[];
    edges: any[];
  };
}

interface SimulationLog {
  timestamp: number;
  nodeId: string;
  nodeLabel: string;
  message: string;
  status: 'success' | 'info' | 'warning' | 'error';
}

export function DeployAgentModal({ open, onOpenChange, workflow }: DeployAgentModalProps) {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [deploying, setDeploying] = useState(false);
  
  // Step 1: Configuration
  const [agentName, setAgentName] = useState('');
  const [environment, setEnvironment] = useState('staging');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappVerified, setWhatsappVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Step 2: Simulation
  const [simulationLogs, setSimulationLogs] = useState<SimulationLog[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);

  // Generate default agent name from workflow
  useEffect(() => {
    if (open && !agentName && workflow.nodes?.length > 0) {
      const workflowName = workflow.nodes.find(n => n.type === 'start')?.data?.label || 
                          workflow.nodes[0]?.data?.label || 
                          'Untitled Workflow';
      setAgentName(workflowName.replace(/[^a-zA-Z0-9]/g, '') + 'Agent');
    }
  }, [open, agentName, workflow.nodes]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      setWhatsappVerified(false);
      setSimulationLogs([]);
      setSimulationComplete(false);
    }
  }, [open]);

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleVerifyWhatsApp = async () => {
    if (!whatsappNumber.trim()) {
      toast.error('Please enter a WhatsApp number');
      return;
    }

    setVerifying(true);
    
    // Simulate API verification
    setTimeout(() => {
      setWhatsappVerified(true);
      toast.success('WhatsApp number verified! ✅');
      setVerifying(false);
    }, 1500);
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationLogs([]);
    setSimulationComplete(false);

    const logs: SimulationLog[] = [];
    const startTime = Date.now();

    // Simulate workflow execution
    const nodes = workflow.nodes || [];
    const edges = workflow.edges || [];

    // Add start node log
    const startNode = nodes.find(n => n.type === 'start');
    if (startNode) {
      logs.push({
        timestamp: Date.now() - startTime,
        nodeId: startNode.id,
        nodeLabel: startNode.data?.label || 'Start',
        message: 'Start Node Executed',
        status: 'success'
      });
    }

    // Simulate flow through nodes
    for (let i = 0; i < nodes.length && i < 5; i++) {
      const node = nodes[i];
      if (node.type === 'start' || !node.data?.label) continue;

      await new Promise(resolve => setTimeout(resolve, 300));

      logs.push({
        timestamp: Date.now() - startTime,
        nodeId: node.id,
        nodeLabel: node.data?.label || 'Node',
        message: `Executing ${node.data.label}...`,
        status: 'info'
      });

      setSimulationLogs([...logs]);
    }

    // Add end node log
    const endNode = nodes.find(n => n.type === 'end');
    if (endNode) {
      await new Promise(resolve => setTimeout(resolve, 300));
      logs.push({
        timestamp: Date.now() - startTime,
        nodeId: endNode.id,
        nodeLabel: endNode.data?.label || 'End',
        message: 'Workflow completed successfully!',
        status: 'success'
      });
      setSimulationLogs([...logs]);
    }

    setSimulationComplete(true);
    setIsSimulating(false);
    toast.success('Simulation completed successfully!');
  };

  const handleDeploy = async () => {
    if (!agentName.trim()) {
      toast.error('Agent name is required');
      return;
    }

    if (!whatsappVerified) {
      toast.error('Please verify your WhatsApp number first');
      setCurrentStep(1);
      return;
    }

    // Validate workflow
    if (!workflow.nodes || workflow.nodes.length === 0) {
      toast.error('Workflow is empty');
      return;
    }

    setDeploying(true);

    try {
      // TODO: Replace with actual backend endpoint
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName,
          environment,
          whatsappNumber,
          webhookUrl: webhookUrl || undefined,
          apiKey: apiKey || undefined,
          workflow: {
            nodes: workflow.nodes,
            edges: workflow.edges,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Deployment failed');
      }

      const data = await response.json();
      const endpoint = data.endpoint || `https://api.naraflow.ai/agents/${agentName}`;
      
      toast.success(`Agent ${agentName} deployed successfully!`, {
        description: `Deployed to ${environment}. Endpoint: ${endpoint}`,
        duration: 7000,
      });

      onOpenChange(false);
      
      // Reset form
      setAgentName('');
      setEnvironment('staging');
      setWhatsappNumber('');
      setWhatsappVerified(false);
    } catch (err: any) {
      toast.error(`Deployment failed: ${err.message || 'Unknown error'}`);
      console.error('Deployment error:', err);
    } finally {
      setDeploying(false);
    }
  };

  const canProceedToStep2 = agentName.trim() && whatsappVerified;
  const canProceedToStep3 = simulationComplete;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-indigo-600" />
            Deploy Agent
          </DialogTitle>
          <DialogDescription>
            Configure deployment environment and publish your workflow as an operational automation agent.
          </DialogDescription>
        </DialogHeader>

        {/* Step Navigation */}
        <div className="flex items-center justify-center py-4 border-b">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`flex items-center gap-2 ${currentStep === step ? 'text-indigo-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === step
                      ? 'bg-indigo-600 text-white'
                      : currentStep > step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step ? <CheckCircle2 className="w-4 h-4" /> : step}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {step === 1 && 'Configuration'}
                    {step === 2 && 'Simulation'}
                    {step === 3 && 'Deployment'}
                  </span>
                </div>
                {step < 3 && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="py-4 min-h-[400px]">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agentName">Agent Name</Label>
                <Input
                  id="agentName"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="e.g., CustomerSupportBot"
                />
                <p className="text-xs text-muted-foreground">
                  Choose a unique name for your deployed agent
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="whatsappNumber"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+62 812-3456-7890"
                    disabled={whatsappVerified}
                    className={whatsappVerified ? 'bg-green-50 border-green-500' : ''}
                  />
                  <Button
                    onClick={handleVerifyWhatsApp}
                    disabled={verifying || whatsappVerified || !whatsappNumber.trim()}
                    variant={whatsappVerified ? "default" : "outline"}
                    className={whatsappVerified ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {verifying ? '...' : whatsappVerified ? '✓ Verified' : 'Verify'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This number will be used as the agent&apos;s WhatsApp identity.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Select value={environment} onValueChange={setEnvironment}>
                  <SelectTrigger id="environment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800">
                    <SelectItem value="staging" className="text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <span>🔧 Staging</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">For testing</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="production" className="text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        <span>🚀 Production</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Live deployment</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Staging is recommended for initial testing
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
                <Input
                  id="webhookUrl"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/webhook"
                />
                <p className="text-xs text-muted-foreground">
                  Optional external webhook integration
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key (Optional)</Label>
                <Input
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  type="password"
                />
                <p className="text-xs text-muted-foreground">
                  Optional API key for external service integration
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Workflow Simulation</h3>
                  <p className="text-sm text-muted-foreground">
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

              <ScrollArea className="h-80 border rounded-md bg-gray-50 dark:bg-gray-900 p-4 font-mono text-xs">
                {simulationLogs.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Zap className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Click &quot;Run Simulation&quot; to preview workflow execution</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {simulationLogs.map((log, index) => (
                      <div key={index} className={`p-2 rounded border ${
                        log.status === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                        log.status === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                        log.status === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                        'bg-red-50 border-red-200 text-red-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">
                            [{Math.floor(log.timestamp / 1000)}s]
                          </span>
                          <span className="font-semibold">→ {log.nodeLabel}</span>
                        </div>
                        <p className="ml-6 text-xs">{log.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {simulationComplete && (
                <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Simulation completed successfully! Your workflow is ready to deploy.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-4">Deployment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <span className="text-sm font-medium">Agent Name</span>
                    <Badge>{agentName}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <span className="text-sm font-medium">Environment</span>
                    <Badge variant={environment === 'production' ? 'default' : 'secondary'}>
                      {environment === 'production' ? '🚀 Production' : '🔧 Staging'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <span className="text-sm font-medium">WhatsApp Number</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{whatsappNumber}</span>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <span className="text-sm font-medium">Workflow</span>
                    <Badge variant="outline">
                      {workflow.nodes?.length || 0} nodes, {workflow.edges?.length || 0} connections
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <span className="text-sm font-medium">Expected Endpoint</span>
                    <span className="text-xs font-mono text-blue-600">
                      https://api.naraflow.ai/agents/{agentName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3">
                <div className="flex items-start gap-2">
                  <Globe className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
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
                prevStep();
              }
            }}
            disabled={deploying}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          {currentStep < 3 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceedToStep2 || (currentStep === 2 && !canProceedToStep3)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleDeploy}
              disabled={deploying}
              className="bg-gradient-to-r from-indigo-600 to-green-500 hover:from-indigo-700 hover:to-green-600 text-white"
            >
              {deploying ? (
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