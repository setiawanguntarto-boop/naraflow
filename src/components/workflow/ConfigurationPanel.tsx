import { useState, useEffect } from "react";
import { Settings, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface ConfigurationPanelProps {
  nodes: any[];
  edges: any[];
  onDeploy?: (config: any) => void;
}

export function ConfigurationPanel({ nodes, edges, onDeploy }: ConfigurationPanelProps) {
  const [agentName, setAgentName] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("");

  // Generate default agent name from workflow
  useEffect(() => {
    if (nodes.length > 0 && !agentName) {
      const workflowName =
        nodes.find(n => n.type === "start")?.data?.label ||
        nodes[0]?.data?.label ||
        "Untitled Workflow";
      setAgentName(workflowName.replace(/[^a-zA-Z0-9]/g, "") + "Agent");
    }
  }, [nodes, agentName]);

  // Check if all required fields are filled (mockup validation)
  const canDeploy = 
    agentName.trim().length >= 3 &&  // Minimum 3 characters
    phoneNumberId.trim().length > 0 && 
    accessToken.trim().length > 0 && 
    nodes.length > 0;

  const handleDeploy = () => {
    if (!canDeploy) {
      toast.error("Please complete all requirements before deploying");
      return;
    }

    const deployConfig = {
      agentName: agentName.trim(),
      phoneNumberId: phoneNumberId.trim(),
      accessToken: accessToken.trim(),
      wabaId: wabaId.trim() || undefined,
      webhookUrl: webhookUrl.trim() || undefined,
      apiKey: apiKey.trim() || undefined,
      nodes: nodes.length,
      edges: edges.length
    };

    console.log("📤 Sending config to DeployAgentModal:", deployConfig);
    toast.success("Opening deployment wizard...");
    
    // Call the callback if provided - this will pass data to DeployAgentModal
    onDeploy?.(deployConfig);
  };

  return (
    <div className="bg-card rounded-2xl border border-border-light shadow-soft flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-primary" />
          <h3 className="font-semibold text-foreground">3. Agent Configuration</h3>
        </div>
        <Badge variant="secondary">Setup</Badge>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4 max-h-[400px]">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agentName">
              Agent Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="agentName"
              value={agentName}
              onChange={e => setAgentName(e.target.value)}
              placeholder="e.g., CustomerSupportBot"
            />
            <p className="text-xs text-muted-foreground">
              Minimum 3 characters required
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumberId">
              Phone Number ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phoneNumberId"
              value={phoneNumberId}
              onChange={e => setPhoneNumberId(e.target.value)}
              placeholder="e.g., 123456789012345"
            />
            <p className="text-xs text-muted-foreground">
              Your WhatsApp Business Phone Number ID
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessToken">
              Access Token <span className="text-red-500">*</span>
            </Label>
            <Input
              id="accessToken"
              value={accessToken}
              onChange={e => setAccessToken(e.target.value)}
              placeholder="EAAL..."
              type="password"
            />
            <p className="text-xs text-muted-foreground">
              System User Access Token from Meta
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wabaId">WABA ID (Optional)</Label>
            <Input
              id="wabaId"
              value={wabaId}
              onChange={e => setWabaId(e.target.value)}
              placeholder="e.g., 102290129340398"
            />
            <p className="text-xs text-muted-foreground">
              Your WhatsApp Business Account ID
            </p>
          </div>

          {/* Environment selection removed */}

          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
            <Input
              id="webhookUrl"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              placeholder="https://your-domain.com/webhook"
            />
            <p className="text-xs text-muted-foreground">
              For receiving WhatsApp messages and status updates
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key (Optional)</Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-..."
              type="password"
            />
            <p className="text-xs text-muted-foreground">
              For external service integration
            </p>
          </div>

          {/* Requirements Summary */}
          <div className="rounded-lg bg-muted/50 p-3 border">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 mt-0.5">📋</div>
              <div className="text-sm">
                <p className="font-semibold mb-2">Deployment Requirements:</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li className={`flex items-center gap-2 ${agentName.length >= 3 ? 'text-green-600' : ''}`}>
                    <span>{agentName.length >= 3 ? '✅' : '◯'}</span>
                    Agent Name (min. 3 characters)
                  </li>
                  <li className={`flex items-center gap-2 ${phoneNumberId ? 'text-green-600' : ''}`}>
                    <span>{phoneNumberId ? '✅' : '◯'}</span>
                    Phone Number ID
                  </li>
                  <li className={`flex items-center gap-2 ${accessToken ? 'text-green-600' : ''}`}>
                    <span>{accessToken ? '✅' : '◯'}</span>
                    Access Token
                  </li>
                  <li className={`flex items-center gap-2 ${nodes.length > 0 ? 'text-green-600' : ''}`}>
                    <span>{nodes.length > 0 ? '✅' : '◯'}</span>
                    Workflow Nodes (min. 1 node)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          onClick={handleDeploy}
          disabled={!canDeploy}
          className="w-full bg-gradient-to-r from-indigo-600 to-green-500 hover:from-indigo-700 hover:to-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-4 h-4 mr-2" />
          Deploy Agent
        </Button>
        
        {!canDeploy && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Complete all requirements above to deploy
          </p>
        )}
      </div>
    </div>
  );
}

