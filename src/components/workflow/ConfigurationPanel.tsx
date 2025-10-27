import { useState, useEffect } from "react";
import { Settings, Check, Play } from "lucide-react";
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
import { toast } from "sonner";

interface ConfigurationPanelProps {
  nodes: any[];
  edges: any[];
  onDeploy?: (config: any) => void;
}

export function ConfigurationPanel({ nodes, edges, onDeploy }: ConfigurationPanelProps) {
  const [agentName, setAgentName] = useState("");
  const [environment, setEnvironment] = useState("staging");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappVerified, setWhatsappVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
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

  const handleVerifyWhatsApp = async () => {
    if (!whatsappNumber.trim()) {
      toast.error("Please enter a WhatsApp number");
      return;
    }

    setVerifying(true);

    // Simulate API verification
    setTimeout(() => {
      setWhatsappVerified(true);
      toast.success("WhatsApp number verified! ✅");
      setVerifying(false);
    }, 1500);
  };

  const handleDeploy = () => {
    if (!agentName.trim()) {
      toast.error("Agent name is required");
      return;
    }

    if (!whatsappVerified) {
      toast.error("Please verify your WhatsApp number first");
      return;
    }

    if (!nodes.length) {
      toast.error("Workflow is empty");
      return;
    }

    onDeploy?.({
      agentName,
      environment,
      whatsappNumber,
      webhookUrl,
      apiKey,
    });
  };

  return (
    <div className="bg-card rounded-2xl border border-border-light shadow-soft flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-primary" />
          <h3 className="font-semibold text-foreground">3. Agent Configuration</h3>
        </div>
        <Badge variant={environment === "production" ? "default" : "secondary"}>
          {environment === "production" ? "🚀 Production" : "🔧 Staging"}
        </Badge>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4 max-h-[400px]">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agentName">Agent Name</Label>
            <Input
              id="agentName"
              value={agentName}
              onChange={e => setAgentName(e.target.value)}
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
                onChange={e => setWhatsappNumber(e.target.value)}
                placeholder="+62 812-3456-7890"
                disabled={whatsappVerified}
                className={whatsappVerified ? "bg-green-50 border-green-500" : ""}
              />
              <Button
                onClick={handleVerifyWhatsApp}
                disabled={verifying || whatsappVerified || !whatsappNumber.trim()}
                variant={whatsappVerified ? "default" : "outline"}
                size="sm"
                className={whatsappVerified ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {verifying ? "..." : whatsappVerified ? "✓" : "Verify"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This number will be used as the agent&apos;s WhatsApp identity
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="environment">Environment</Label>
            <Select value={environment} onValueChange={setEnvironment}>
              <SelectTrigger
                id="environment"
                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                <SelectItem
                  value="staging"
                  className="text-gray-900 dark:text-gray-100 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-gray-100">🔧 Staging</span>
                  </div>
                </SelectItem>
                <SelectItem
                  value="production"
                  className="text-gray-900 dark:text-gray-100 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-gray-100">🚀 Production</span>
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
              onChange={e => setWebhookUrl(e.target.value)}
              placeholder="https://your-domain.com/webhook"
            />
            <p className="text-xs text-muted-foreground">Optional external webhook integration</p>
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
              Optional API key for external service integration
            </p>
          </div>

          {/* Workflow Summary */}
          <div className="rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-start gap-2">
              <div className="text-indigo-600 dark:text-indigo-400 mt-0.5">ℹ️</div>
              <div className="text-sm text-gray-900 dark:text-gray-100">
                <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">
                  Workflow Summary:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-700 dark:text-gray-300">
                  <li>{nodes.length} nodes</li>
                  <li>{edges.length} connections</li>
                  <li>Runtime configuration</li>
                  <li>Agent endpoint & API keys</li>
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
          disabled={!agentName.trim() || !whatsappVerified || !nodes.length}
          className="w-full bg-gradient-to-r from-indigo-600 to-green-500 hover:from-indigo-700 hover:to-green-600 text-white"
        >
          <Play className="w-4 h-4 mr-2" />
          Deploy Agent
        </Button>
      </div>
    </div>
  );
}
