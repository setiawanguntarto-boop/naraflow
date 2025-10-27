import { useState, useEffect } from "react";
import { X, Save, AlertCircle, Plus, Trash2 } from "lucide-react";
import { Node } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MetricDefinition {
  name: string;
  label: string;
  description: string;
  type: "text" | "number" | "date" | "select";
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

interface NodeConfigPanelProps {
  node: Node;
  onClose: () => void;
  onSave: (
    nodeId: string,
    title: string,
    description: string,
    metrics?: MetricDefinition[]
  ) => void;
}

const getContextHint = (nodeLabel: string): string => {
  const hints: Record<string, string> = {
    "WhatsApp Message":
      "Write the message that will be sent via WhatsApp. You can use {{name}} placeholders for dynamic content.",
    "Ask Input":
      "Define the question or prompt that will be sent to the user. Be clear and concise.",
    "Receive Update":
      "Describe what automatic updates this node will receive (e.g., sensor readings, webhook data).",
    "Process Data": "Explain how this node will process or transform incoming data.",
    "Filter Data": "Define the filtering criteria or conditions that will be applied.",
    Transform:
      "Describe the data transformation that will occur (e.g., format change, calculation).",
    Condition: "Specify the condition or rule that determines the flow path.",
    Loop: "Define the loop criteria: what to iterate over and when to stop.",
    Switch: "List the cases/conditions that determine which branch to follow.",
    Notification: "Specify the notification message and who should receive it.",
    "Report (PDF)": "Describe what data will be included in the PDF report.",
    Email: "Compose the email subject and body. You can use placeholders like {{name}}.",
  };

  return hints[nodeLabel] || "Provide a short description or configuration details for this node.";
};

const getNodeTypeInfo = (nodeLabel: string): { icon: string; color: string } => {
  if (nodeLabel.includes("WhatsApp") || nodeLabel.includes("Message")) {
    return { icon: "💬", color: "text-green-600" };
  }
  if (nodeLabel.includes("Input") || nodeLabel.includes("Ask")) {
    return { icon: "📥", color: "text-blue-600" };
  }
  if (nodeLabel.includes("Process") || nodeLabel.includes("Transform")) {
    return { icon: "📋", color: "text-purple-600" };
  }
  if (nodeLabel.includes("Condition") || nodeLabel.includes("Logic")) {
    return { icon: "🔀", color: "text-yellow-600" };
  }
  return { icon: "📋", color: "text-gray-600" };
};

export const NodeConfigPanel = ({ node, onClose, onSave }: NodeConfigPanelProps) => {
  const [title, setTitle] = useState(String(node.data?.title || node.data?.label || ""));
  const [description, setDescription] = useState(String(node.data?.description || ""));
  const [metrics, setMetrics] = useState<MetricDefinition[]>(node.data?.metrics || []);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTitle(String(node.data?.title || node.data?.label || ""));
    setDescription(String(node.data?.description || ""));
    setMetrics(node.data?.metrics || []);
    setHasChanges(false);
  }, [node.id]);

  useEffect(() => {
    const changed =
      title !== String(node.data?.title || node.data?.label || "") ||
      description !== String(node.data?.description || "") ||
      JSON.stringify(metrics) !== JSON.stringify(node.data?.metrics || []);
    setHasChanges(changed);
  }, [title, description, metrics, node]);

  const addMetric = () => {
    setMetrics([
      ...metrics,
      {
        name: "",
        label: "",
        description: "",
        type: "text",
        required: true,
      },
    ]);
  };

  const updateMetric = (index: number, field: keyof MetricDefinition, value: any) => {
    const updated = [...metrics];
    updated[index] = { ...updated[index], [field]: value };
    setMetrics(updated);
  };

  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (node.data?.label === "Ask Question") {
      onSave(node.id, title, description, metrics);
    } else {
      onSave(node.id, title, description);
    }
    setHasChanges(false);
  };

  const contextHint = getContextHint(String(node.data?.label || ""));
  const typeInfo = getNodeTypeInfo(String(node.data?.label || ""));

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-lg z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{typeInfo.icon}</span>
          <div>
            <h3 className="font-semibold text-foreground">Configure Node</h3>
            <p className={`text-sm ${typeInfo.color}`}>{String(node.data?.label || "")}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Context Hint */}
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-sm">{contextHint}</AlertDescription>
        </Alert>

        {/* Title Input */}
        <div className="space-y-2">
          <Label htmlFor="node-title">Title</Label>
          <Input
            id="node-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={`e.g., ${String(node.data?.label || "")}`}
          />
          <p className="text-xs text-muted-foreground">A short, descriptive name for this node</p>
        </div>

        {/* Description Textarea */}
        <div className="space-y-2">
          <Label htmlFor="node-description">Configuration</Label>
          <Textarea
            id="node-description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={contextHint}
            rows={8}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Detailed configuration or content for this node
          </p>
        </div>

        {/* Metrics Configuration (for Ask Question nodes) */}
        {node.data?.label === "Ask Question" && (
          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <Label>Question Metrics</Label>
              <Button variant="outline" size="sm" onClick={addMetric}>
                <Plus className="w-4 h-4 mr-1" />
                Add Metric
              </Button>
            </div>

            {metrics.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {metrics.map((metric, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-lg p-3 space-y-3 bg-muted/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Metric {index + 1}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeMetric(index)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor={`metric-name-${index}`} className="text-xs">
                          Name (ID)
                        </Label>
                        <Input
                          id={`metric-name-${index}`}
                          value={metric.name}
                          onChange={e => updateMetric(index, "name", e.target.value)}
                          placeholder="e.g., flock_age"
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor={`metric-label-${index}`} className="text-xs">
                          Display Label
                        </Label>
                        <Input
                          id={`metric-label-${index}`}
                          value={metric.label}
                          onChange={e => updateMetric(index, "label", e.target.value)}
                          placeholder="e.g., Flock Age"
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`metric-description-${index}`} className="text-xs">
                        Description
                      </Label>
                      <Textarea
                        id={`metric-description-${index}`}
                        value={metric.description}
                        onChange={e => updateMetric(index, "description", e.target.value)}
                        placeholder="Explain what this metric measures (e.g., Age of chicken flock in weeks)"
                        rows={2}
                        className="text-xs resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor={`metric-type-${index}`} className="text-xs">
                          Type
                        </Label>
                        <select
                          id={`metric-type-${index}`}
                          value={metric.type}
                          onChange={e =>
                            updateMetric(index, "type", e.target.value as MetricDefinition["type"])
                          }
                          className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="select">Select (Options)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor={`metric-required-${index}`} className="text-xs">
                          Required
                        </Label>
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="checkbox"
                            id={`metric-required-${index}`}
                            checked={metric.required}
                            onChange={e => updateMetric(index, "required", e.target.checked)}
                            className="w-4 h-4"
                          />
                          <label htmlFor={`metric-required-${index}`} className="text-xs">
                            Field is required
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Validation fields for number type */}
                    {metric.type === "number" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor={`metric-min-${index}`} className="text-xs">
                            Min Value
                          </Label>
                          <Input
                            id={`metric-min-${index}`}
                            type="number"
                            value={metric.validation?.min || ""}
                            onChange={e =>
                              updateMetric(index, "validation", {
                                ...metric.validation,
                                min: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            placeholder="e.g., 0"
                            className="text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor={`metric-max-${index}`} className="text-xs">
                            Max Value
                          </Label>
                          <Input
                            id={`metric-max-${index}`}
                            type="number"
                            value={metric.validation?.max || ""}
                            onChange={e =>
                              updateMetric(index, "validation", {
                                ...metric.validation,
                                max: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            placeholder="e.g., 100"
                            className="text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Validation fields for select type */}
                    {metric.type === "select" && (
                      <div className="space-y-1">
                        <Label htmlFor={`metric-options-${index}`} className="text-xs">
                          Options (comma-separated)
                        </Label>
                        <Input
                          id={`metric-options-${index}`}
                          value={metric.validation?.options?.join(", ") || ""}
                          onChange={e =>
                            updateMetric(index, "validation", {
                              ...metric.validation,
                              options: e.target.value
                                .split(",")
                                .map(s => s.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="e.g., Option 1, Option 2, Option 3"
                          className="text-xs"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {metrics.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                No metrics defined. Click "Add Metric" to start collecting data.
              </div>
            )}
          </div>
        )}

        {/* Quick Templates (for WhatsApp nodes) */}
        {node.data?.label === "WhatsApp Message" && (
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDescription("Hello {{name}}! Welcome to our service.")}
              >
                Welcome
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDescription("Your order {{order_id}} has been confirmed.")}
              >
                Confirmation
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDescription("Thank you for your feedback!")}
              >
                Thank You
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDescription("We will contact you shortly at {{phone}}.")}
              >
                Follow-up
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border flex gap-2">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};
