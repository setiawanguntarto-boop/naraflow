import { useState, useEffect, useMemo } from "react";
import { X, Save, AlertCircle, Plus, Trash2, Zap } from "lucide-react";
import { Node } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Ajv from "ajv";
import { nodeTypeRegistry } from "@/lib/nodeTypeRegistry";

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
  "Sensor Data": {
    metricPresets: {
      environment_basic: [
        { id: "temp_c", label: "Suhu (°C)", path: "data.temperature", type: "number", unit: "°C", required: true, min: 15, max: 45, aggregation: "avg", windowSec: 300 },
        { id: "humidity_pct", label: "Kelembaban (%RH)", path: "data.humidity", type: "number", unit: "%RH", required: false, min: 20, max: 100, aggregation: "avg", windowSec: 300 },
        { id: "ammonia_ppm", label: "Amonia (ppm)", path: "data.ammonia", type: "number", unit: "ppm", required: false, min: 0, max: 50, aggregation: "max", windowSec: 300 }
      ],
      water_feed: [
        { id: "water_l", label: "Air (L)", path: "data.water", type: "number", unit: "L", required: false, min: 0, aggregation: "none", windowSec: 0 },
        { id: "feed_kg", label: "Pakan (kg)", path: "data.feed", type: "number", unit: "kg", required: false, min: 0, aggregation: "none", windowSec: 0 }
      ]
    }
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

const getContextHint = (nodeLabel: string): string => {
  const hints: Record<string, string> = {
    "WhatsApp Message":
      "Write the message that will be sent via WhatsApp. You can use {{name}} placeholders for dynamic content.",
    "WhatsApp Trigger": "Configure WhatsApp trigger. Choose a template or write a custom message using {{variable}} placeholders.",
    "Ask Input":
      "Define the question or prompt that will be sent to the user. Be clear and concise.",
    "Ask Question": "Definisikan pertanyaan dan field input untuk data entry broiler. Gunakan preset untuk field standar seperti mortalitas, pakan, berat.",
      "Fetch External Data": "Konfigurasi HTTP request (method, url, headers, body) dan mapping response. Gunakan templating {{var}} dari payload/vars.",
      "Sensor Data": "Konfigurasi sumber data sensor (Webhook/MQTT/HTTP Poll). Tambahkan daftar metrics (path payload, unit, min/max, agregasi).",
    "Receive Update":
      "Describe what automatic updates this node will receive (e.g., sensor readings, webhook data).",
    "Process Data": "Konfigurasi pemrosesan data broiler. Gunakan calculator preset untuk FCR, ADG, mortality % atau tulis kustom logic.",
      "AI Analysis": "Gunakan LLaMA untuk menganalisis input. Isi system prompt, prompt template, dan mapping field dari JSON hasil.",
      "Calculate": "Buat variabel dari payload, tambahkan constants, dan definisikan expressions. Contoh: FCR = feed_kg / (avg_weight_g * population / 1000).",
      "Decision": "Tambah daftar kondisi dengan operator (==, >=, includes, regex) dan tentukan route tujuan.",
      "Send Message": "Pilih channel (WhatsApp/SMS/Email), isi recipient dan template. Gunakan {{var}} untuk inject nilai dari payload/vars.",
      "Store Records": "Simpan records ke storage atau HTTP. Atur mapping field, mode append/upsert, dan path array records di payload.",
    "Filter Data": "Define the filtering criteria or conditions that will be applied.",
    Transform:
      "Describe the data transformation that will occur (e.g., format change, calculation).",
    Condition: "Setup kondisi untuk alur workflow (contoh: jika mortalitas > 2%, kirim alert).",
    Loop: "Define the loop criteria: what to iterate over and when to stop.",
    Switch: "List the cases/conditions that determine which branch to follow.",
    Notification: "Konfigurasi notifikasi untuk peternak, PPL, atau admin.",
    "Report (PDF)": "Generate laporan PDF untuk data harian atau panen.",
    "Data Storage": "Simpan data ke Google Sheets atau database.",
    "QR Generator": "Generate QR code untuk identifikasi kandang.",
    Email: "Compose the email subject and body. You can use placeholders like {{name}}.",
  };

  return hints[nodeLabel] || "Provide a short description or configuration details for this node.";
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
  const [title, setTitle] = useState(String(node.data?.title || node.data?.label || ""));
  const [description, setDescription] = useState(String(node.data?.description || ""));
  const [metrics, setMetrics] = useState<MetricDefinition[]>((node.data?.metrics as MetricDefinition[]) || []);
  const [nodeConfig, setNodeConfig] = useState<Record<string, any>>(node.data?.config as Record<string, any> || {});
  const [selectedPreset, setSelectedPreset] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [schemaErrors, setSchemaErrors] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Detect v3 node type definition (schema-driven panel)
  const nodeTypeId = String((node.data as any)?.type || "");
  const v3Def = useMemo(() => {
    try {
      // Primary: resolve by explicit type id
      const byId = nodeTypeId ? nodeTypeRegistry.getNodeType(nodeTypeId) : null;
      if (byId) return byId;

      // Fallback: resolve by label when legacy nodes don't carry 'type'
      const label = String(node.data?.label || "");
      if (!label) return null;
      const all = nodeTypeRegistry.getAllNodeTypes();
      return all.find(nt => nt.label === label) || null;
    } catch {
      return null;
    }
  }, [nodeTypeId, node.data]);

  const ajv = useMemo(() => new Ajv({ allErrors: true, strict: false }), []);

  // Build default config from JSON schema
  const buildDefaults = (schema: any): any => {
    if (!schema) return undefined;
    if (schema.default !== undefined) return schema.default;
    switch (schema.type) {
      case "object": {
        const result: Record<string, any> = {};
        const props = schema.properties || {};
        Object.keys(props).forEach(k => {
          const defVal = buildDefaults(props[k]);
          if (defVal !== undefined) result[k] = defVal;
        });
        return result;
      }
      case "array":
        return Array.isArray(schema.default) ? schema.default : [];
      case "string":
        return schema.default !== undefined ? schema.default : undefined;
      case "number":
      case "integer":
        return schema.default !== undefined ? schema.default : undefined;
      case "boolean":
        return schema.default !== undefined ? schema.default : false;
      default:
        return undefined;
    }
  };

  useEffect(() => {
    setTitle(String(node.data?.title || node.data?.label || ""));
    setDescription(String(node.data?.description || ""));
    setMetrics((node.data?.metrics as MetricDefinition[]) || []);
    // Seed config with schema defaults for v3 nodes, merge with existing
    const existing = (node.data?.config as Record<string, any>) || {};
    if (v3Def?.configSchema) {
      const defaults = buildDefaults(v3Def.configSchema);
      setNodeConfig({ ...(defaults || {}), ...existing });
    } else {
      setNodeConfig(existing);
    }
    setSchemaErrors([]);
    setHasChanges(false);
    // Initialize advanced collapse state for v3 nodes
    if (v3Def?.ui?.advanced?.collapsed === true) {
      setShowAdvanced(false);
    } else if (v3Def?.ui?.advanced?.collapsed === false) {
      setShowAdvanced(true);
    } else {
      setShowAdvanced(false);
    }
  }, [node.id, v3Def]);

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

  const applySensorMetricPreset = (presetKey: string) => {
    const presets = (BROILER_NODE_CONFIGS as any)["Sensor Data"].metricPresets;
    if (presets[presetKey as keyof typeof presets]) {
      setNodeConfig(prev => ({ ...prev, metrics: [...presets[presetKey as keyof typeof presets]] }));
      setSelectedPreset(presetKey);
      setHasChanges(true);
    }
  };

  const applyFetchPreset = (presetKey: string) => {
    if (presetKey === "get_json") {
      setNodeConfig(prev => ({
        ...prev,
        method: "GET",
        url: "https://api.example.com/data?farm={{farmId}}",
        headers: [{ key: "Accept", value: "application/json" }],
        responseMapping: [
          { field: "status", path: "status" },
          { field: "items", path: "data.items" },
        ],
      }));
    } else if (presetKey === "post_json") {
      setNodeConfig(prev => ({
        ...prev,
        method: "POST",
        url: "https://api.example.com/submit",
        headers: [{ key: "Content-Type", value: "application/json" }],
        bodyType: "json",
        body: '{"farm":"{{farmId}}","day":{{day}}}',
        responseMapping: [{ field: "ok", path: "ok" }],
      }));
    }
    setSelectedPreset(presetKey);
    setHasChanges(true);
  };

  const handleSave = () => {
    // Validate against schema for v3 nodes (if available)
    if (v3Def?.configSchema) {
      try {
        const validate = ajv.compile(v3Def.configSchema as any);
        const valid = validate(nodeConfig);
        if (!valid) {
          setSchemaErrors((validate.errors || []).map(e => `${e.instancePath || 'config'} ${e.message || ''}`));
          return;
        }
      } catch (e) {
        // If schema compile fails, proceed without blocking save
      }
    }
    onSave(node.id, title, description, metrics, nodeConfig);
    setHasChanges(false);
  };

  const contextHint = getContextHint(String(node.data?.label || ""));
  const typeInfo = getNodeTypeInfo(String(node.data?.label || ""));

  // --- Schema driven field renderer for v3 nodes ---
  const renderSchemaField = (key: string, schema: any, value: any, onChange: (v: any) => void) => {
    // enum → Select
    if (Array.isArray(schema?.enum)) {
      return (
        <div className="space-y-1" key={key}>
          <Label className="text-xs">{key}</Label>
          <Select value={value ?? ''} onValueChange={val => onChange(val)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${key}`} />
            </SelectTrigger>
            <SelectContent>
              {schema.enum.map((opt: string) => (
                <SelectItem key={opt} value={String(opt)}>{String(opt)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {schema.description && <p className="text-[11px] text-muted-foreground">{schema.description}</p>}
        </div>
      );
    }

    // Primitive types
    switch (schema?.type) {
      case "string":
        return (
          <div className="space-y-1" key={key}>
            <Label className="text-xs">{key}</Label>
            <Input
              value={value ?? ''}
              onChange={e => onChange(e.target.value)}
              placeholder={schema?.description || key}
            />
            {schema.description && <p className="text-[11px] text-muted-foreground">{schema.description}</p>}
          </div>
        );
      case "number":
      case "integer":
        return (
          <div className="space-y-1" key={key}>
            <Label className="text-xs">{key}</Label>
            <Input
              type="number"
              value={value ?? ''}
              onChange={e => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
              placeholder={schema?.description || key}
            />
            {schema.description && <p className="text-[11px] text-muted-foreground">{schema.description}</p>}
          </div>
        );
      case "boolean":
        return (
          <div className="flex items-center gap-2" key={key}>
            <input
              id={`bool-${key}`}
              type="checkbox"
              checked={Boolean(value)}
              onChange={e => onChange(e.target.checked)}
            />
            <Label htmlFor={`bool-${key}`} className="text-xs">{key}</Label>
          </div>
        );
      case "array": {
        // Support array of simple objects used by switch.cases and validation.rules
        const items = Array.isArray(value) ? value : [];
        const itemSchema = schema.items || {};
        return (
          <div className="space-y-2" key={key}>
            <div className="flex items-center justify-between">
              <Label>{key}</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChange([...(items || []), {}])}
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((it: any, idx: number) => (
                <div key={idx} className="border border-border rounded-lg p-2 space-y-2 bg-muted/30">
                  {Object.keys(itemSchema.properties || {}).map(propKey => (
                    <div className="space-y-1" key={propKey}>
                      <Label className="text-xs">{propKey}</Label>
                      <Input
                        value={it[propKey] ?? ''}
                        onChange={e => {
                          const clone = [...items];
                          clone[idx] = { ...clone[idx], [propKey]: e.target.value };
                          onChange(clone);
                        }}
                      />
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const clone = items.filter((_: any, i: number) => i !== idx);
                        onChange(clone);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      case "object": {
        // Render nested object fields (simple)
        const props = schema.properties || {};
        return (
          <div className="space-y-2" key={key}>
            <Label>{key}</Label>
            <div className="grid grid-cols-1 gap-3">
              {Object.keys(props).map((propKey: string) =>
                renderSchemaField(
                  propKey,
                  props[propKey],
                  (value || {})[propKey],
                  (v) => setNodeConfig(prev => ({ ...prev, [key]: { ...(prev[key] || {}), [propKey]: v } }))
                )
              )}
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const renderV3Config = () => {
    if (!v3Def?.configSchema) return null;
    const props = (v3Def.configSchema as any).properties || {};
    const order = (v3Def.ui?.fieldsOrder as string[]) || Object.keys(props);
    const advancedList = (v3Def.ui?.advanced?.fields as string[]) || [];
    const baseKeys = order.filter(k => props[k] && !advancedList.includes(k));
    const advancedKeys = advancedList.filter(k => props[k]);
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Configuration</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const defaults = buildDefaults(v3Def.configSchema);
              setNodeConfig(defaults || {});
              setSchemaErrors([]);
              setHasChanges(true);
            }}
          >
            Reset to defaults
          </Button>
        </div>
        {/* Base fields */}
        <div className="grid grid-cols-1 gap-3">
          {baseKeys.map(k =>
            renderSchemaField(
              k,
              props[k],
              (nodeConfig as any)[k],
              (v) => setNodeConfig(prev => ({ ...prev, [k]: v }))
            )
          )}
        </div>

        {/* Advanced toggle */}
        {advancedKeys.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(v => !v)}
              >
                {showAdvanced ? "Hide Advanced" : "Show Advanced"}
              </Button>
            </div>
            {showAdvanced && (
              <div className="grid grid-cols-1 gap-3">
                {advancedKeys.map(k =>
                  renderSchemaField(
                    k,
                    props[k],
                    (nodeConfig as any)[k],
                    (v) => setNodeConfig(prev => ({ ...prev, [k]: v }))
                  )
                )}
              </div>
            )}
          </div>
        )}
        {schemaErrors.length > 0 && (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              {schemaErrors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <div id="node-config-panel" className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-lg z-50 flex flex-col animate-in slide-in-from-right duration-300">
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

        {/* Broiler Quick Templates Section (only when broiler mode is active on the node) */}
        {node.data?.broiler === true && (
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

            {node.data?.label === "Sensor Data" && (
              <Select value={selectedPreset} onValueChange={applySensorMetricPreset}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih preset metrics sensor..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="environment_basic">Environment: Temp/Humidity/Ammonia</SelectItem>
                  <SelectItem value="water_feed">Consumption: Water/Feed</SelectItem>
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

            {node.data?.label === "Fetch External Data" && (
              <Select value={selectedPreset} onValueChange={applyFetchPreset}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih preset HTTP..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="get_json">GET JSON (templated URL)</SelectItem>
                  <SelectItem value="post_json">POST JSON (templated body)</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Title Input (keep for legacy/v2 and as display name) */}
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

        {/* V3 schema-driven configuration or legacy description */}
        {v3Def ? (
          renderV3Config()
        ) : (
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
        )}

        {/* Additional Config for WhatsApp nodes (only in broiler mode) */}
        {node.data?.broiler === true && (node.data?.label === "WhatsApp Message" || node.data?.label === "WhatsApp Trigger") && (
          <div className="space-y-3">
            <Label>WhatsApp Configuration</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="recipient-type" className="text-xs">Recipient Type</Label>
                <Select 
                  value={nodeConfig.recipientType || "farmer"}
                  onValueChange={(value) => setNodeConfig({...nodeConfig, recipientType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Peternak</SelectItem>
                    <SelectItem value="ppl">PPL</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="both">Peternak + PPL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message-type" className="text-xs">Message Type</Label>
                <Select 
                  value={nodeConfig.messageType || "reminder"}
                  onValueChange={(value) => setNodeConfig({...nodeConfig, messageType: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
