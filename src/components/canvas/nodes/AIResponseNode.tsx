import { memo, useState, useCallback } from "react";
import { Position, NodeProps, NodeResizer } from "@xyflow/react";
import { Bot, Loader2, AlertCircle, CheckCircle2, Play } from "lucide-react";
import { AdvancedHandle } from "../handles/AdvancedHandle";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { AIProviderFactory } from "@/lib/services/aiProviders";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AIResponseNodeData {
  label?: string;
  provider?: "openai" | "anthropic" | "google";
  model?: string;
  context?: string;
  responseTemplate?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json" | "markdown";
  apiKey?: string;
  lastOutput?: string;
  validationStatus?: "valid" | "error" | "testing";
}

export const AIResponseNode = memo(({ id, data, selected }: NodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  
  const nodeData = (data || {}) as AIResponseNodeData;
  
  const [validationStatus, setValidationStatus] = useState<"valid" | "error" | "testing">(
    nodeData.validationStatus || "valid"
  );

  // Node configuration
  const provider = nodeData.provider || "openai";
  const model = nodeData.model || "gpt-4";
  const temperature = nodeData.temperature || 0.7;
  const maxTokens = nodeData.maxTokens || 1000;
  const responseFormat = nodeData.responseFormat || "text";

  // Test AI response in real-time
  const handleTest = useCallback(async () => {
    if (!testInput.trim()) {
      toast.error("Please enter test input");
      return;
    }

    if (!nodeData.apiKey) {
      toast.error("API key not configured");
      return;
    }

    setIsTesting(true);
    setValidationStatus("testing");

    try {
      const aiProvider = AIProviderFactory.createProvider({
        provider,
        apiKey: nodeData.apiKey,
      });

      const messages = [
        { role: "system" as const, content: nodeData.context || "You are a helpful assistant." },
        { role: "user" as const, content: testInput },
      ];

      const response = await aiProvider.chat(messages, {
        model,
        temperature,
        maxTokens,
      });

      setTestOutput(response.content);
      setValidationStatus("valid");
      toast.success("Test successful");
    } catch (error: any) {
      setValidationStatus("error");
      setTestOutput(`Error: ${error.message}`);
      toast.error("Test failed: " + error.message);
    } finally {
      setIsTesting(false);
    }
  }, [testInput, nodeData.apiKey, nodeData.context, provider, model, temperature, maxTokens]);

  const nodeWidth = isExpanded ? 500 : 280;
  const nodeHeight = isExpanded ? 650 : 180;

  return (
    <div className="relative">
      <NodeResizer
        minWidth={280}
        minHeight={180}
        isVisible={selected}
        color="#8b5cf6"
      />

      <div
        className={cn(
          "rounded-xl border-2 bg-gradient-to-br from-purple-50 to-white shadow-lg transition-all duration-200",
          selected ? "border-purple-500 shadow-xl" : "border-purple-300",
          "overflow-hidden"
        )}
        style={{ width: nodeWidth, height: nodeHeight }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-white" />
            <span className="text-sm font-semibold text-white">
              {nodeData.label || "AI Response"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Validation Status Indicator */}
            {validationStatus === "valid" && (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            )}
            {validationStatus === "error" && (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            {validationStatus === "testing" && (
              <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 px-2 text-white hover:bg-purple-600"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>

        {/* Compact View */}
        {!isExpanded && (
          <div className="p-4 space-y-3">
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Provider:</span>
                <span className="font-medium text-foreground">{provider}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Model:</span>
                <span className="font-medium text-foreground">{model}</span>
              </div>
            </div>
            {nodeData.lastOutput && (
              <div className="text-xs bg-muted p-2 rounded max-h-16 overflow-y-auto">
                {nodeData.lastOutput.substring(0, 100)}...
              </div>
            )}
          </div>
        )}

        {/* Expanded Configuration View */}
        {isExpanded && (
          <div className="p-4 space-y-4 overflow-y-auto" style={{ height: nodeHeight - 56 }}>
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label className="text-xs">AI Provider</Label>
              <Select value={provider}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="google">Google AI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label className="text-xs">Model</Label>
              <Input
                value={model}
                placeholder="e.g., gpt-4"
                className="h-8 text-xs"
                readOnly
              />
            </div>

            {/* Context/System Prompt */}
            <div className="space-y-2">
              <Label className="text-xs">System Prompt</Label>
              <Textarea
                value={nodeData.context || ""}
                placeholder="You are a helpful assistant..."
                className="text-xs min-h-16 resize-none"
                readOnly
              />
            </div>

            {/* Temperature */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center justify-between">
                <span>Temperature</span>
                <span className="text-muted-foreground">{temperature.toFixed(1)}</span>
              </Label>
              <Slider
                value={[temperature]}
                min={0}
                max={2}
                step={0.1}
                disabled
                className="cursor-not-allowed"
              />
            </div>

            {/* Max Tokens */}
            <div className="space-y-2">
              <Label className="text-xs">Max Tokens</Label>
              <Input
                type="number"
                value={maxTokens}
                className="h-8 text-xs"
                readOnly
              />
            </div>

            {/* Response Format */}
            <div className="space-y-2">
              <Label className="text-xs">Response Format</Label>
              <Select value={responseFormat}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Test Panel */}
            <div className="border-t pt-4 space-y-3">
              <Label className="text-xs font-semibold">Test AI Response</Label>
              <Textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter test input..."
                className="text-xs min-h-16 resize-none"
              />
              <Button
                size="sm"
                onClick={handleTest}
                disabled={isTesting}
                className="w-full h-8"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 mr-2" />
                    Test
                  </>
                )}
              </Button>
              {testOutput && (
                <div className="bg-muted p-2 rounded text-xs max-h-32 overflow-y-auto">
                  <div className="font-medium mb-1">Output:</div>
                  {testOutput}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input Handle */}
      <AdvancedHandle
        type="target"
        position={Position.Left}
        id="input"
        percentage={50}
        isOutput={false}
      />

      {/* Output Handle */}
      <AdvancedHandle
        type="source"
        position={Position.Right}
        id="output"
        percentage={50}
        label="Response"
        isOutput={true}
      />

      {/* Error Output Handle */}
      <AdvancedHandle
        type="source"
        position={Position.Bottom}
        id="error"
        percentage={50}
        label="Error"
        isOutput={true}
      />
    </div>
  );
});

AIResponseNode.displayName = "AIResponseNode";
