import { useState, useEffect } from "react";
import { X, Save, AlertCircle, Plus, Trash2, Zap, ChevronDown } from "lucide-react";
import { Node } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useWorkflowMetadata } from "@/hooks/useWorkflowState";

interface MetricDefinition {
  name: string;
  label: string;
  description: string;
  type: "text" | "number" | "date" | "select" | "boolean";
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
    metrics?: MetricDefinition[],
    config?: any
  ) => void;
}

// Konfigurasi spesifik untuk broiler
const BROILER_NODE_CONFIGS = {
  "WhatsApp Message": {
    templates: [
      {
        name: "daily_checkin",
        label: "Daily Check-in Reminder",
        template: "📋 Reminder Input Data Harian\n🏠 Farm: {{farm_name}}\n📅 Hari ke: {{day}}\n\nSilakan input data harian dengan format:\n• MATI [jumlah]\n• PAKAN [kg]\n• BERAT [gram]"
      },
      {
        name: "mortality_alert",
        label: "Mortality Alert",
        template: "⚠️ ALERT: Mortalitas Tinggi\n🏠 {{farm_name}}\n📋 Kandang: {{shed_id}}\n📅 {{date}}\n💀 Mati: {{mortality}} ekor ({{mortality_pct}}%)\n\nSegera lakukan pengecekan!"
      },
      {
        name: "harvest_notification",
        label: "Harvest Notification", 
        template: "📦 PANEN SIAP\n🏠 {{farm_name}}\n📋 Kandang: {{shed_id}}\n📅 {{harvest_date}}\n\nSilakan konfirmasi data panen: jumlah ekor dan berat total."
      }
    ]
  },
  "Ask Question": {
    metricPresets: {
      daily_checkin: [
        {
          name: "mortality",
          label: "Jumlah Mati (ekor)",
          description: "Jumlah ayam mati hari ini",
          type: "number" as const,
          required: true,
          validation: { min: 0, max: 1000 }
        },
        {
          name: "feed_kg", 
          label: "Pakan (kg)",
          description: "Total pakan yang dikonsumsi hari ini dalam kg",
          type: "number" as const,
          required: true,
          validation: { min: 0, max: 5000 }
        },
        {
          name: "avg_weight_g",
          label: "Berat Rata-rata (gram)",
          description: "Berat rata-rata sampel ayam dalam gram",
          type: "number" as const, 
          required: false,
          validation: { min: 0, max: 5000 }
        },
        {
          name: "temp_c",
          label: "Suhu Kandang (°C)",
          description: "Suhu rata-rata kandang",
          type: "number" as const,
          required: false,
          validation: { min: 20, max: 35 }
        }
      ],
      farm_registration: [
        {
          name: "farm_name",
          label: "Nama Farm",
          description: "Nama lengkap farm",
          type: "text" as const,
          required: true
        },
        {
          name: "owner_name",
          label: "Nama Peternak", 
          description: "Nama pemilik/peternak",
          type: "text" as const,
          required: true
        },
        {
          name: "location",
          label: "Lokasi",
          description: "Alamat lengkap farm",
          type: "text" as const,
          required: true
        },
        {
          name: "capacity",
          label: "Kapasitas Kandang (ekor)",
          description: "Kapasitas maksimal per kandang",
          type: "number" as const,
          required: true,
          validation: { min: 100, max: 50000 }
        }
      ]
    }
  },
  "Process Data": {
    broilerCalculators: [
      {
        name: "performance_calc",
        label: "Performance Calculator",
        description: "Hitung FCR, ADG, Mortality %",
        template: `// Performance Calculator untuk Broiler
const population = input.population_start;
const mortality = input.mortality;
const feed = input.feed_kg;
const weight = input.avg_weight_g;

// Hitung metrics
const mortality_pct = ((mortality / population) * 100).toFixed(2);
const FCR = weight > 0 ? (feed / (weight * population / 1000)).toFixed(2) : null;
const ADG = input.day_of_cycle > 1 ? (weight / input.day_of_cycle).toFixed(1) : null;

return {
  mortality_pct,
  FCR, 
  ADG,
  current_population: population - mortality
};`
      },
      {
        name: "harvest_calc",
        label: "Harvest Calculator",
        description: "Hitung metrics panen akhir",
        template: `// Harvest Calculator
const total_weight = input.total_weight_kg;
const qty = input.qty;
const days = input.duration_days;

const avg_weight = (total_weight / qty * 1000).toFixed(0);
const cycle_FCR = calculateCycleFCR(); // Implement based on cumulative data
const cycle_ADG = (avg_weight / days).toFixed(1);

return {
  avg_weight_g: avg_weight,
  cycle_FCR,
  cycle_ADG
};`
      }
    ]
  }
};

const getContextHint = (nodeLabel: string, isBroilerWorkflow: boolean): string => {
  // General hints for all workflows
  const generalHints: Record<string, string> = {
    "WhatsApp Message":
      "Write the message that will be sent via WhatsApp. You can use {{name}} placeholders for dynamic content.",
    "WhatsApp Trigger": 
      "Configure WhatsApp trigger for your workflow. You can use {{variable}} placeholders for dynamic content.",
    "Ask Input":
      "Define the question or prompt that will be sent to the user. Be clear and concise.",
    "Ask Question": 
      "Define the question and input fields for data collection. Configure field types, validation, and requirements.",
    "Receive Update":
      "Describe what automatic updates this node will receive (e.g., sensor readings, webhook data).",
    "Process Data": 
      "Configure data processing logic. Set up calculations, transformations, or custom business rules.",
    "Filter Data": 
      "Define the filtering criteria or conditions that will be applied.",
    Transform:
      "Describe the data transformation that will occur (e.g., format change, calculation).",
    Condition: 
      "Set up conditional logic for workflow branching (e.g., if value > threshold, send alert).",
    Loop: 
      "Define the loop criteria: what to iterate over and when to stop.",
    Switch: 
      "List the cases/conditions that determine which branch to follow.",
    Notification: 
      "Configure notifications for users, admins, or team members.",
    "Report (PDF)": 
      "Generate PDF reports from workflow data.",
    "Data Storage": 
      "Configure where to save data (Google Sheets, database, or cloud storage).",
    "QR Generator": 
      "Generate QR codes for item identification or tracking.",
    Email: 
      "Compose the email subject and body. You can use placeholders like {{name}}.",
  };

  // Broiler-specific hints (when broiler template is active)
  const broilerHints: Record<string, string> = {
    "WhatsApp Trigger": 
      "Konfigurasi trigger WhatsApp untuk workflow broiler. Pilih template atau buat pesan custom dengan placeholder {{variable}}.",
    "Ask Question": 
      "Definisikan pertanyaan dan field input untuk data entry broiler. Gunakan preset untuk field standar seperti mortalitas, pakan, berat.",
    "Process Data": 
      "Konfigurasi pemrosesan data broiler. Gunakan calculator preset untuk FCR, ADG, mortality % atau tulis kustom logic.",
    Condition: 
      "Setup kondisi untuk alur workflow (contoh: jika mortalitas > 2%, kirim alert).",
    Notification: 
      "Konfigurasi notifikasi untuk peternak, PPL, atau admin.",
    "Report (PDF)": 
      "Generate laporan PDF untuk data harian atau panen.",
    "Data Storage": 
      "Simpan data ke Google Sheets atau database.",
    "QR Generator": 
      "Generate QR code untuk identifikasi kandang.",
  };

  // Return appropriate hint based on workflow type
  if (isBroilerWorkflow && broilerHints[nodeLabel]) {
    return broilerHints[nodeLabel];
  }

  return generalHints[nodeLabel] || "Provide a short description or configuration details for this node.";
};

const getNodeTypeInfo = (nodeLabel: string): { icon: string; color: string; category: string } => {
  const types: Record<string, { icon: string; color: string; category: string }> = {
    "WhatsApp Trigger": { icon: "💬", color: "text-green-600", category: "communication" },
    "WhatsApp Message": { icon: "💬", color: "text-green-600", category: "communication" },
    "Ask Question": { icon: "📥", color: "text-blue-600", category: "input" },
    "Ask Input": { icon: "📥", color: "text-blue-600", category: "input" },
    "Process Data": { icon: "⚙️", color: "text-purple-600", category: "processing" },
    "Condition": { icon: "🔀", color: "text-yellow-600", category: "logic" },
    "Notification": { icon: "🔔", color: "text-orange-600", category: "communication" },
    "Report (PDF)": { icon: "📊", color: "text-red-600", category: "output" },
    "Data Storage": { icon: "💾", color: "text-indigo-600", category: "storage" },
    "QR Generator": { icon: "📱", color: "text-cyan-600", category: "utility" },
  };

  // Fallback for nodes that include these keywords
  if (nodeLabel.includes("WhatsApp") || nodeLabel.includes("Message")) {
    return { icon: "💬", color: "text-green-600", category: "communication" };
  }
  if (nodeLabel.includes("Input") || nodeLabel.includes("Ask")) {
    return { icon: "📥", color: "text-blue-600", category: "input" };
  }
  if (nodeLabel.includes("Process") || nodeLabel.includes("Transform")) {
    return { icon: "📋", color: "text-purple-600", category: "processing" };
  }
  if (nodeLabel.includes("Condition") || nodeLabel.includes("Logic")) {
    return { icon: "🔀", color: "text-yellow-600", category: "logic" };
  }
  
  return types[nodeLabel] || { icon: "📋", color: "text-gray-600", category: "general" };
};

export const NodeConfigPanel = ({ node, onClose, onSave }: NodeConfigPanelProps) => {
  const workflowMetadata = useWorkflowMetadata();
  const [title, setTitle] = useState(String(node.data?.title || node.data?.label || ""));
  const [description, setDescription] = useState(String(node.data?.description || ""));
  const [metrics, setMetrics] = useState<MetricDefinition[]>((node.data?.metrics as MetricDefinition[]) || []);
  const [nodeConfig, setNodeConfig] = useState<Record<string, any>>(node.data?.config as Record<string, any> || {});
  const [selectedPreset, setSelectedPreset] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTitle(String(node.data?.title || node.data?.label || ""));
    setDescription(String(node.data?.description || ""));
    setMetrics((node.data?.metrics as MetricDefinition[]) || []);
    setNodeConfig((node.data?.config as Record<string, any>) || {});
    setHasChanges(false);
  }, [node.id]);

  useEffect(() => {
    const changed =
      title !== String(node.data?.title || node.data?.label || "") ||
      description !== String(node.data?.description || "") ||
      JSON.stringify(metrics) !== JSON.stringify(node.data?.metrics || []) ||
      JSON.stringify(nodeConfig) !== JSON.stringify(node.data?.config || {});
    setHasChanges(changed);
  }, [title, description, metrics, nodeConfig, node]);

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

  const applyMetricPreset = (presetKey: string) => {
    const presets = BROILER_NODE_CONFIGS["Ask Question"].metricPresets;
    if (presets[presetKey as keyof typeof presets]) {
      setMetrics([...presets[presetKey as keyof typeof presets]]);
      setSelectedPreset(presetKey);
    }
  };

  const applyWhatsAppTemplate = (template: any) => {
    setDescription(template.template);
    setTitle(template.label);
  };

  const applyCalculatorTemplate = (calculator: any) => {
    setDescription(calculator.template);
    setTitle(calculator.label);
    setNodeConfig({ calculatorType: calculator.name });
  };

  const handleSave = () => {
    onSave(node.id, title, description, metrics, nodeConfig);
    setHasChanges(false);
  };

  const contextHint = getContextHint(String(node.data?.label || ""), workflowMetadata?.showBroilerPresets || false);
  const typeInfo = getNodeTypeInfo(String(node.data?.label || ""));

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-lg z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{typeInfo.icon}</span>
          <div>
            <h3 className="font-semibold text-foreground">Configure Node</h3>
            <div className="flex items-center gap-2">
            <p className={`text-sm ${typeInfo.color}`}>{String(node.data?.label || "")}</p>
              <Badge variant="outline" className="text-xs">
                {typeInfo.category}
              </Badge>
            </div>
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

        {/* Broiler Quick Templates Section - Only show in broiler workflows */}
        {workflowMetadata?.showBroilerPresets &&
         (node.data?.label === "WhatsApp Message" || 
          node.data?.label === "WhatsApp Trigger" ||
          node.data?.label === "Ask Question" || 
          node.data?.label === "Process Data") && (
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              <Label className="text-sm font-medium">Broiler Quick Templates</Label>
            </div>
            
            {(node.data?.label === "WhatsApp Message" || node.data?.label === "WhatsApp Trigger") && (
              <div className="grid gap-2">
                {BROILER_NODE_CONFIGS["WhatsApp Message"].templates.map((template) => (
                  <Button
                    key={template.name}
                    variant="outline"
                    size="sm"
                    onClick={() => applyWhatsAppTemplate(template)}
                    className="justify-start h-auto py-2 text-left"
                  >
                    <div>
                      <div className="font-medium text-xs">{template.label}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {template.template.substring(0, 50)}...
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {node.data?.label === "Ask Question" && (
              <Select value={selectedPreset} onValueChange={applyMetricPreset}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih metric preset..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily_checkin">Daily Check-in Metrics</SelectItem>
                  <SelectItem value="farm_registration">Farm Registration</SelectItem>
                </SelectContent>
              </Select>
            )}

            {node.data?.label === "Process Data" && (
              <div className="grid gap-2">
                {BROILER_NODE_CONFIGS["Process Data"].broilerCalculators.map((calculator) => (
                  <Button
                    key={calculator.name}
                    variant="outline"
                    size="sm"
                    onClick={() => applyCalculatorTemplate(calculator)}
                    className="justify-start h-auto py-2 text-left"
                  >
                    <div>
                      <div className="font-medium text-xs">{calculator.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {calculator.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

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
          <Label htmlFor="node-description">
            Configuration
            {node.data?.label === "Process Data" && (
              <Badge variant="secondary" className="ml-2 text-xs">
                Code
              </Badge>
            )}
          </Label>
          <Textarea
            id="node-description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={contextHint}
            rows={8}
            className="resize-none font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {node.data?.label === "Process Data" 
              ? "JavaScript code for data processing. Use 'input' for incoming data."
              : "Detailed configuration or content for this node"
            }
          </p>
        </div>

        {/* Additional Config for WhatsApp nodes */}
        {(node.data?.label === "WhatsApp Message" || node.data?.label === "WhatsApp Trigger") && (
          <div className="space-y-3">
            <Label>WhatsApp Configuration</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="recipient-type" className="text-xs">Recipient Type</Label>
                <Select 
                  value={nodeConfig.recipientType || (workflowMetadata?.showBroilerPresets ? "farmer" : "user")}
                  onValueChange={(value) => setNodeConfig({...nodeConfig, recipientType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workflowMetadata?.showBroilerPresets ? (
                      <>
                        <SelectItem value="farmer">Peternak</SelectItem>
                        <SelectItem value="ppl">PPL</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="both">Peternak + PPL</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message-type" className="text-xs">Message Type</Label>
                <Select 
                  value={nodeConfig.messageType || "notification"}
                  onValueChange={(value) => setNodeConfig({...nodeConfig, messageType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="confirmation">Confirmation</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Decision/Condition Configuration */}
        {(node.data?.label === "Decision" || node.data?.label === "Condition" || node.data?.label === "Switch (Route)") && (
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-sm font-semibold">Condition Configuration</Label>
            
            {/* Condition Type Selector */}
            <div className="space-y-2">
              <Label htmlFor="condition-type" className="text-xs">Condition Type</Label>
              <Select 
                value={nodeConfig.conditionType || "simple"}
                onValueChange={(value) => setNodeConfig({...nodeConfig, conditionType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple Comparison</SelectItem>
                  <SelectItem value="expression">Custom Expression</SelectItem>
                  <SelectItem value="multiple">Multiple Conditions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Simple Condition Builder */}
            {nodeConfig.conditionType === "simple" && (
              <div className="space-y-3 p-3 bg-muted/50 rounded-md">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <Label className="text-xs">Left Value</Label>
                    <Input 
                      placeholder="{{payload.value}}"
                      value={nodeConfig.leftOperand || ""}
                      onChange={(e) => setNodeConfig({...nodeConfig, leftOperand: e.target.value})}
                      className="text-xs"
                    />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-xs">Operator</Label>
                    <Select 
                      value={nodeConfig.operator || "equals"}
                      onValueChange={(value) => setNodeConfig({...nodeConfig, operator: value})}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">=</SelectItem>
                        <SelectItem value="not_equals">≠</SelectItem>
                        <SelectItem value="greater_than">&gt;</SelectItem>
                        <SelectItem value="less_than">&lt;</SelectItem>
                        <SelectItem value="greater_or_equal">≥</SelectItem>
                        <SelectItem value="less_or_equal">≤</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="starts_with">Starts With</SelectItem>
                        <SelectItem value="is_empty">Is Empty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Label className="text-xs">Right Value</Label>
                    <Input 
                      placeholder="30"
                      value={nodeConfig.rightOperand || ""}
                      onChange={(e) => setNodeConfig({...nodeConfig, rightOperand: e.target.value})}
                      className="text-xs"
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground bg-blue-500/10 p-2 rounded">
                  Preview: <code>{nodeConfig.leftOperand || "{{value}}"} {nodeConfig.operator || "equals"} {nodeConfig.rightOperand || "threshold"}</code>
                </div>
              </div>
            )}

            {/* Custom Expression */}
            {nodeConfig.conditionType === "expression" && (
              <div className="space-y-2">
                <Label className="text-xs">Custom Expression</Label>
                <Textarea 
                  placeholder="payload.temperature > 30 && payload.humidity < 60"
                  value={nodeConfig.expression || ""}
                  onChange={(e) => setNodeConfig({...nodeConfig, expression: e.target.value})}
                  className="font-mono text-xs"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Available variables: payload, memory, vars
                </p>
              </div>
            )}

            {/* Multiple Conditions */}
            {nodeConfig.conditionType === "multiple" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Conditions</Label>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const conditions = nodeConfig.conditions || [];
                      setNodeConfig({
                        ...nodeConfig, 
                        conditions: [...conditions, {leftOperand: "", operator: "equals", rightOperand: ""}]
                      });
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Condition
                  </Button>
                </div>
                
                {(nodeConfig.conditions || []).map((condition: any, index: number) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Condition {index + 1}</Label>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          const conditions = [...(nodeConfig.conditions || [])];
                          conditions.splice(index, 1);
                          setNodeConfig({...nodeConfig, conditions});
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input 
                        placeholder="{{value}}"
                        value={condition.leftOperand || ""}
                        onChange={(e) => {
                          const conditions = [...(nodeConfig.conditions || [])];
                          conditions[index].leftOperand = e.target.value;
                          setNodeConfig({...nodeConfig, conditions});
                        }}
                        className="text-xs"
                      />
                      <Select 
                        value={condition.operator || "equals"}
                        onValueChange={(value) => {
                          const conditions = [...(nodeConfig.conditions || [])];
                          conditions[index].operator = value;
                          setNodeConfig({...nodeConfig, conditions});
                        }}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">=</SelectItem>
                          <SelectItem value="not_equals">≠</SelectItem>
                          <SelectItem value="greater_than">&gt;</SelectItem>
                          <SelectItem value="less_than">&lt;</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input 
                        placeholder="threshold"
                        value={condition.rightOperand || ""}
                        onChange={(e) => {
                          const conditions = [...(nodeConfig.conditions || [])];
                          conditions[index].rightOperand = e.target.value;
                          setNodeConfig({...nodeConfig, conditions});
                        }}
                        className="text-xs"
                      />
                    </div>
                  </div>
                ))}
                
                {(nodeConfig.conditions || []).length > 1 && (
                  <div className="space-y-2">
                    <Label className="text-xs">Logic Gate</Label>
                    <Select 
                      value={nodeConfig.logicGate || "AND"}
                      onValueChange={(value) => setNodeConfig({...nodeConfig, logicGate: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">All conditions must match (AND)</SelectItem>
                        <SelectItem value="OR">Any condition can match (OR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* API Call / HTTP Request Configuration */}
        {(node.data?.label === "Fetch External Data" || node.data?.label === "HTTP Request" || node.data?.label === "API Call") && (
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-sm font-semibold">API Configuration</Label>
            
            {/* HTTP Method & URL */}
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-1">
                <Label className="text-xs">Method</Label>
                <Select 
                  value={nodeConfig.method || "GET"}
                  onValueChange={(value) => setNodeConfig({...nodeConfig, method: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Label className="text-xs">URL</Label>
                <Input 
                  placeholder="https://api.example.com/endpoint"
                  value={nodeConfig.url || ""}
                  onChange={(e) => setNodeConfig({...nodeConfig, url: e.target.value})}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            {/* Query Parameters */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <Label className="text-xs">Query Parameters</Label>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {(nodeConfig.queryParams || []).map((param: any, index: number) => (
                  <div key={index} className="grid grid-cols-2 gap-2">
                    <Input 
                      placeholder="key"
                      value={param.key || ""}
                      onChange={(e) => {
                        const params = [...(nodeConfig.queryParams || [])];
                        params[index].key = e.target.value;
                        setNodeConfig({...nodeConfig, queryParams: params});
                      }}
                      className="text-xs"
                    />
                    <div className="flex gap-1">
                      <Input 
                        placeholder="value"
                        value={param.value || ""}
                        onChange={(e) => {
                          const params = [...(nodeConfig.queryParams || [])];
                          params[index].value = e.target.value;
                          setNodeConfig({...nodeConfig, queryParams: params});
                        }}
                        className="text-xs flex-1"
                      />
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          const params = [...(nodeConfig.queryParams || [])];
                          params.splice(index, 1);
                          setNodeConfig({...nodeConfig, queryParams: params});
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const params = nodeConfig.queryParams || [];
                    setNodeConfig({
                      ...nodeConfig, 
                      queryParams: [...params, {key: "", value: ""}]
                    });
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Parameter
                </Button>
              </CollapsibleContent>
            </Collapsible>

            {/* Authentication */}
            <div className="space-y-2">
              <Label className="text-xs">Authentication</Label>
              <Select 
                value={nodeConfig.authType || "none"}
                onValueChange={(value) => setNodeConfig({...nodeConfig, authType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="apiKey">API Key</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                </SelectContent>
              </Select>
              
              {nodeConfig.authType && nodeConfig.authType !== "none" && (
                <Input 
                  type="password"
                  placeholder="Enter token or API key"
                  value={nodeConfig.authToken || ""}
                  onChange={(e) => setNodeConfig({...nodeConfig, authToken: e.target.value})}
                  className="text-xs font-mono"
                />
              )}
            </div>

            {/* Request Body (for POST/PUT/PATCH) */}
            {["POST", "PUT", "PATCH"].includes(nodeConfig.method || "") && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Request Body</Label>
                  <Select 
                    value={nodeConfig.bodyType || "json"}
                    onValueChange={(value) => setNodeConfig({...nodeConfig, bodyType: value})}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="form">Form Data</SelectItem>
                      <SelectItem value="text">Plain Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea 
                  placeholder='{"key": "{{payload.value}}"}'
                  value={nodeConfig.body || ""}
                  onChange={(e) => setNodeConfig({...nodeConfig, body: e.target.value})}
                  className="font-mono text-xs"
                  rows={4}
                />
              </div>
            )}

            {/* Headers */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <Label className="text-xs">Custom Headers</Label>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {(nodeConfig.headers || []).map((header: any, index: number) => (
                  <div key={index} className="grid grid-cols-2 gap-2">
                    <Input 
                      placeholder="Header-Name"
                      value={header.key || ""}
                      onChange={(e) => {
                        const headers = [...(nodeConfig.headers || [])];
                        headers[index].key = e.target.value;
                        setNodeConfig({...nodeConfig, headers});
                      }}
                      className="text-xs"
                    />
                    <div className="flex gap-1">
                      <Input 
                        placeholder="value"
                        value={header.value || ""}
                        onChange={(e) => {
                          const headers = [...(nodeConfig.headers || [])];
                          headers[index].value = e.target.value;
                          setNodeConfig({...nodeConfig, headers});
                        }}
                        className="text-xs flex-1"
                      />
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          const headers = [...(nodeConfig.headers || [])];
                          headers.splice(index, 1);
                          setNodeConfig({...nodeConfig, headers});
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const headers = nodeConfig.headers || [];
                    setNodeConfig({
                      ...nodeConfig, 
                      headers: [...headers, {key: "", value: ""}]
                    });
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Header
                </Button>
              </CollapsibleContent>
            </Collapsible>

            {/* Advanced Options */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <Label className="text-xs">Advanced Options</Label>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs">Timeout (ms)</Label>
                  <Input 
                    type="number"
                    value={nodeConfig.timeout || 30000}
                    onChange={(e) => setNodeConfig({...nodeConfig, timeout: parseInt(e.target.value)})}
                    className="text-xs"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={nodeConfig.retryOnFailure || false}
                    onCheckedChange={(checked) => setNodeConfig({...nodeConfig, retryOnFailure: checked})}
                  />
                  <Label className="text-xs">Retry on failure</Label>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Store Records / Database Configuration */}
        {(node.data?.label === "Store Records" || node.data?.label === "Save Data" || node.data?.label === "Database") && (
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-sm font-semibold">Storage Configuration</Label>
            
            {/* Storage Destination */}
            <div className="space-y-2">
              <Label className="text-xs">Destination</Label>
              <Select 
                value={nodeConfig.destination || "google_sheets"}
                onValueChange={(value) => setNodeConfig({...nodeConfig, destination: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google_sheets">Google Sheets</SelectItem>
                  <SelectItem value="supabase">Supabase Database</SelectItem>
                  <SelectItem value="local_storage">Local Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Google Sheets Configuration */}
            {nodeConfig.destination === "google_sheets" && (
              <div className="space-y-3 p-3 bg-muted/50 rounded-md">
                <div className="space-y-2">
                  <Label className="text-xs">Sheet ID</Label>
                  <Input 
                    placeholder="1a2b3c4d5e6f..."
                    value={nodeConfig.sheetId || ""}
                    onChange={(e) => setNodeConfig({...nodeConfig, sheetId: e.target.value})}
                    className="text-xs font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Find in URL: docs.google.com/spreadsheets/d/<strong>[SHEET_ID]</strong>/edit
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Tab Name</Label>
                  <Input 
                    placeholder="Sheet1"
                    value={nodeConfig.sheetName || ""}
                    onChange={(e) => setNodeConfig({...nodeConfig, sheetName: e.target.value})}
                    className="text-xs"
                  />
                </div>
              </div>
            )}

            {/* Supabase Configuration */}
            {nodeConfig.destination === "supabase" && (
              <div className="space-y-3 p-3 bg-muted/50 rounded-md">
                <div className="space-y-2">
                  <Label className="text-xs">Table Name</Label>
                  <Input 
                    placeholder="records"
                    value={nodeConfig.sheetId || ""}
                    onChange={(e) => setNodeConfig({...nodeConfig, sheetId: e.target.value})}
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Write Mode */}
            <div className="space-y-2">
              <Label className="text-xs">Write Mode</Label>
              <Select 
                value={nodeConfig.writeMode || "append"}
                onValueChange={(value) => setNodeConfig({...nodeConfig, writeMode: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="append">Append (Add new rows)</SelectItem>
                  <SelectItem value="overwrite">Overwrite (Replace all data)</SelectItem>
                  <SelectItem value="update">Update (Match & update)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Primary Key for Update Mode */}
            {nodeConfig.writeMode === "update" && (
              <div className="space-y-2">
                <Label className="text-xs">Primary Key Field</Label>
                <Input 
                  placeholder="id or email"
                  value={nodeConfig.primaryKey || ""}
                  onChange={(e) => setNodeConfig({...nodeConfig, primaryKey: e.target.value})}
                  className="text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Field to match records for updating
                </p>
              </div>
            )}

            {/* Field Mapping */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Field Mapping</Label>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const mapping = nodeConfig.fieldMapping || [];
                    setNodeConfig({
                      ...nodeConfig, 
                      fieldMapping: [...mapping, {source: "", target: "", transform: "none"}]
                    });
                  }}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Field
                </Button>
              </div>
              
              {(nodeConfig.fieldMapping || []).map((field: any, index: number) => (
                <div key={index} className="grid grid-cols-3 gap-2 p-2 bg-muted/30 rounded">
                  <div>
                    <Label className="text-xs">From</Label>
                    <Input 
                      placeholder="{{payload.name}}"
                      value={field.source || ""}
                      onChange={(e) => {
                        const mapping = [...(nodeConfig.fieldMapping || [])];
                        mapping[index].source = e.target.value;
                        setNodeConfig({...nodeConfig, fieldMapping: mapping});
                      }}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">To Column</Label>
                    <Input 
                      placeholder="customer_name"
                      value={field.target || ""}
                      onChange={(e) => {
                        const mapping = [...(nodeConfig.fieldMapping || [])];
                        mapping[index].target = e.target.value;
                        setNodeConfig({...nodeConfig, fieldMapping: mapping});
                      }}
                      className="text-xs"
                    />
                  </div>
                  <div className="flex items-end gap-1">
                    <div className="flex-1">
                      <Label className="text-xs">Transform</Label>
                      <Select 
                        value={field.transform || "none"}
                        onValueChange={(value) => {
                          const mapping = [...(nodeConfig.fieldMapping || [])];
                          mapping[index].transform = value;
                          setNodeConfig({...nodeConfig, fieldMapping: mapping});
                        }}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="uppercase">UPPERCASE</SelectItem>
                          <SelectItem value="lowercase">lowercase</SelectItem>
                          <SelectItem value="date">Date Format</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        const mapping = [...(nodeConfig.fieldMapping || [])];
                        mapping.splice(index, 1);
                        setNodeConfig({...nodeConfig, fieldMapping: mapping});
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {(!nodeConfig.fieldMapping || nodeConfig.fieldMapping.length === 0) && (
                <div className="text-xs text-muted-foreground bg-yellow-500/10 p-3 rounded">
                  ⚠️ No field mapping defined. All payload fields will be saved as-is.
                </div>
              )}
            </div>

            {/* Additional Options */}
            <div className="space-y-3 p-3 bg-muted/50 rounded-md">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={nodeConfig.includeTimestamp !== false}
                  onCheckedChange={(checked) => setNodeConfig({...nodeConfig, includeTimestamp: checked})}
                />
                <Label className="text-xs">Include timestamp column</Label>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">On Conflict</Label>
                <Select 
                  value={nodeConfig.onConflict || "ignore"}
                  onValueChange={(value) => setNodeConfig({...nodeConfig, onConflict: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ignore">Ignore (Skip duplicates)</SelectItem>
                    <SelectItem value="overwrite">Overwrite (Replace)</SelectItem>
                    <SelectItem value="fail">Fail (Show error)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Configuration (for Ask Question nodes) */}
        {node.data?.label === "Ask Question" && (
          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <Label>Data Fields</Label>
              <Button variant="outline" size="sm" onClick={addMetric}>
                <Plus className="w-4 h-4 mr-1" />
                Add Field
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
                      <span className="text-sm font-medium">Field {index + 1}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeMetric(index)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor={`metric-name-${index}`} className="text-xs">
                          Field ID
                        </Label>
                        <Input
                          id={`metric-name-${index}`}
                          value={metric.name}
                          onChange={e => updateMetric(index, "name", e.target.value)}
                          placeholder="e.g., mortality"
                          className="text-xs font-mono"
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
                          placeholder="e.g., Jumlah Mati"
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`metric-description-${index}`} className="text-xs">
                        Description & Instructions
                      </Label>
                      <Textarea
                        id={`metric-description-${index}`}
                        value={metric.description}
                        onChange={e => updateMetric(index, "description", e.target.value)}
                        placeholder="Explain what this field measures and how to fill it"
                        rows={2}
                        className="text-xs resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor={`metric-type-${index}`} className="text-xs">
                          Data Type
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
                          <option value="select">Select Options</option>
                          <option value="boolean">Yes/No</option>
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
                            Field wajib diisi
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

                    {/* Options for select type */}
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
                          placeholder="e.g., Baik, Sedang, Buruk"
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
                No fields defined. Click "Add Field" or select a preset above.
              </div>
            )}
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
