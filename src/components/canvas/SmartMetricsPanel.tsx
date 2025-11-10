import { useState, useEffect } from "react";
import { X, Activity, CheckCircle2, Circle } from "lucide-react";
import { Node } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { nodeTypeRegistry } from "@/lib/nodeTypeRegistry";
import { MetricField, NodeMetricsDefinition } from "@/core/nodeLibrary_v3";
import { METRICS_CATEGORY_COLORS } from "@/data/nodeCategories";
import { cn } from "@/lib/utils";

interface MetricConfig {
  id: string;
  label: string;
  enabled: boolean;
  type: string;
  unit?: string;
  currentValue?: any;
  description?: string;
  required?: boolean;
}

interface SmartMetricsPanelProps {
  node: Node | null;
  onClose: () => void;
  onUpdateMetrics: (nodeId: string, metrics: string[]) => void;
}

export const SmartMetricsPanel = ({ node, onClose, onUpdateMetrics }: SmartMetricsPanelProps) => {
  const [metricConfigs, setMetricConfigs] = useState<MetricConfig[]>([]);
  const [customMetricInput, setCustomMetricInput] = useState("");
  const [metricsDefinition, setMetricsDefinition] = useState<NodeMetricsDefinition | null>(null);

  useEffect(() => {
    if (node) {
      // Get node type from registry
      const nodeType = nodeTypeRegistry.getNodeType(node.type || "");
      const metrics = nodeType?.metrics;
      
      setMetricsDefinition(metrics || null);

      if (metrics?.enabled) {
        // Initialize with default metrics
        const configs: MetricConfig[] = metrics.defaultMetrics.map((metric: MetricField) => ({
          id: metric.id,
          label: metric.label,
          enabled: metric.required || false,
          type: metric.type,
          unit: metric.unit,
          currentValue: metric.defaultValue,
          description: metric.description,
          required: metric.required,
        }));

        // Add existing custom metrics from node data
        const existingMetrics = (node.data.metrics as string[]) || [];
        existingMetrics.forEach(metricLabel => {
          if (!configs.find(c => c.label === metricLabel)) {
            configs.push({
              id: metricLabel.toLowerCase().replace(/\s+/g, "_"),
              label: metricLabel,
              enabled: true,
              type: "custom",
              description: "Custom metric",
            });
          }
        });

        setMetricConfigs(configs);
      }
    }
  }, [node]);

  const handleToggleMetric = (metricId: string) => {
    setMetricConfigs(prev =>
      prev.map(m => (m.id === metricId && !m.required ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const handleAddCustomMetric = () => {
    if (customMetricInput.trim() === "") return;

    const newMetric: MetricConfig = {
      id: customMetricInput.toLowerCase().replace(/\s+/g, "_"),
      label: customMetricInput.trim(),
      enabled: true,
      type: "custom",
      description: "Custom metric",
    };

    setMetricConfigs(prev => [...prev, newMetric]);
    setCustomMetricInput("");
  };

  const handleSave = () => {
    if (!node) return;

    const enabledMetrics = metricConfigs.filter(m => m.enabled).map(m => m.label);
    onUpdateMetrics(node.id, enabledMetrics);
    onClose();
  };

  if (!node) return null;

  const categoryColors = metricsDefinition
    ? METRICS_CATEGORY_COLORS[metricsDefinition.category]
    : METRICS_CATEGORY_COLORS.performance;

  const enabledCount = metricConfigs.filter(m => m.enabled).length;

  return (
    <div className="fixed bottom-6 right-6 w-[450px] bg-card border border-border rounded-2xl shadow-strong flex flex-col overflow-hidden z-50 max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Node Metrics
          </h3>
          <p className="text-xs text-muted-foreground">{String(node.data.label || "Node")}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Metrics Category Badge */}
      {metricsDefinition && (
        <div className="px-4 py-2 border-b border-border bg-muted/30">
          <Badge className={cn(categoryColors.bg, categoryColors.text, categoryColors.border, "border")}>
            <span className="mr-1">{categoryColors.icon}</span>
            {metricsDefinition.category.charAt(0).toUpperCase() + metricsDefinition.category.slice(1)} Metrics
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            {enabledCount} of {metricConfigs.length} metrics enabled
          </p>
        </div>
      )}

      {/* Metrics List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {metricConfigs.map(metric => (
          <div
            key={metric.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border transition-all",
              metric.enabled ? "bg-muted/50 border-primary/20" : "bg-background border-border",
              metric.required && "border-primary/40"
            )}
          >
            <Checkbox
              checked={metric.enabled}
              onCheckedChange={() => handleToggleMetric(metric.id)}
              disabled={metric.required}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-medium", metric.enabled ? "text-foreground" : "text-muted-foreground")}>
                  {metric.label}
                </span>
                {metric.required && (
                  <Badge variant="outline" className="text-xs px-1 py-0 bg-primary/10 text-primary border-primary/30">
                    Required
                  </Badge>
                )}
                {metric.type === "custom" && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    Custom
                  </Badge>
                )}
              </div>
              {metric.description && (
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              )}
              {metric.unit && (
                <p className="text-xs text-muted-foreground mt-1">
                  Unit: <span className="font-mono">{metric.unit}</span>
                </p>
              )}
            </div>
            {metric.enabled ? (
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
            )}
          </div>
        ))}

        {/* Custom Metrics Section */}
        {metricsDefinition?.customizable && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-foreground mb-2">Add Custom Metric</p>
            <div className="flex gap-2">
              <Input
                value={customMetricInput}
                onChange={e => setCustomMetricInput(e.target.value)}
                placeholder="Enter custom metric name..."
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomMetric();
                  }
                }}
              />
              <Button onClick={handleAddCustomMetric} size="sm">
                Add
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-3 bg-background flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          {enabledCount} metric{enabledCount !== 1 ? "s" : ""} will be tracked
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button onClick={handleSave} size="sm">
            Save Metrics
          </Button>
        </div>
      </div>
    </div>
  );
};
