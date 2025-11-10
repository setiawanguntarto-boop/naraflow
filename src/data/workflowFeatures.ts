/**
 * Comprehensive Workflow Features Knowledge Base
 * Knowledge base untuk Workflow Assistant dengan detail lengkap
 */

export interface StepDetail {
  step: number;
  title: string;
  instructions: string[];
  tips?: string[];
}

export interface FeatureData {
  title: string;
  description: string;
  icon: string;
  category?: "fundamental" | "ai" | "quality" | "deployment" | "advanced";
  
  // Step-by-step instructions yang sangat detail
  stepByStep?: StepDetail[];
  
  // Best practices dan common mistakes
  bestPractices?: string[];
  commonMistakes?: string[];
  
  // Use cases dan examples
  useCases?: Record<string, string[]>;
  
  // Additional optional fields
  usage?: string;
  tips?: string[];
  categories?: Record<string, string>;
  features?: string[];
  checks?: string[];
  validationRules?: Record<string, string[]>;
  keyboardShortcuts?: Record<string, Record<string, string>>;
  
  // Related features
  relatedFeatures: string[];
}

export const workflowFeatures = {
  "describe-workflow": {
    title: "Describe Workflow",
    description: "Gunakan bahasa natural untuk mendeskripsikan workflow Anda. Sistem AI akan menginterpretasi dan menghasilkan node-node yang sesuai.",
    usage: "Contoh: 'Buat workflow untuk customer service WhatsApp yang merespons pertanyaan, mencatat data, dan mengirim follow-up'",
    tips: [
      "Gunakan @mention untuk template spesifik",
      "Jelaskan langkah-langkah secara berurutan",
      "Sebutkan jenis node yang diinginkan",
      "Gunakan kata kunci seperti 'trigger', 'condition', 'loop' untuk kontrol alur"
    ],
    icon: "💬",
    relatedFeatures: ["node-library", "workflow-canvas"]
  },

  "node-library": {
    title: "Node Library",
    description: "Kumpulan semua node yang tersedia untuk membangun workflow. Drag and drop node ke canvas untuk mulai membangun.",
    categories: {
      "input": "Node input seperti trigger pesan, webhook, schedule",
      "processing": "Node pemrosesan data, AI analysis, calculations",
      "output": "Node output seperti kirim pesan, store data",
      "logic": "Node kondisi, decision, switch untuk kontrol alur",
      "utility": "Node utility seperti delay, memory, validation"
    },
    features: [
      "Drag and drop ke canvas",
      "Kategori yang terorganisir",
      "Size badge untuk awareness bundle",
      "Search functionality"
    ],
    icon: "📚",
    relatedFeatures: ["workflow-canvas", "node-configuration"]
  },

  "workflow-canvas": {
    title: "Workflow Canvas",
    description: "Area kerja utama tempat Anda membangun dan menyusun workflow. Hubungkan node dengan edges untuk membuat alur logika.",
    features: [
      "Drag and drop nodes",
      "Koneksi antar node dengan edge",
      "Zoom dan pan untuk navigasi",
      "Multi-select dan group operations",
      "Viewport optimization untuk workflow besar",
      "Auto-layout dengan berbagai preset"
    ],
    tips: [
      "Gunakan Ctrl+L untuk auto-layout",
      "Shift+drag untuk multi-select",
      "Scroll untuk zoom in/out",
      "Right-click untuk context menu"
    ],
    icon: "🎨",
    relatedFeatures: ["node-library", "validation"]
  },

  "validation": {
    title: "Validation System",
    description: "Sistem yang memvalidasi workflow untuk memastikan tidak ada error dan semua node terkonfigurasi dengan benar.",
    checks: [
      "Node yang tidak terhubung",
      "Konfigurasi yang kurang lengkap",
      "Siklus yang tidak valid",
      "Parameter yang required tapi kosong",
      "Type mismatch antar koneksi"
    ],
    tips: [
      "Klik tombol 'Validate' untuk cek workflow",
      "Panel validation akan muncul otomatis jika ada error",
      "Node dengan error akan ditandai dengan badge merah",
      "Perbaiki error sebelum menjalankan workflow"
    ],
    icon: "✅",
    relatedFeatures: ["workflow-canvas", "execution-system"]
  },

  "llama-integration": {
    title: "LLaMA Integration",
    description: "Koneksi dengan model AI LLaMA lokal atau cloud untuk menambahkan kecerdasan AI ke workflow Anda.",
    usage: "Klik 'Connect to LLaMA' button → Pilih konfigurasi → Test connection",
    tips: [
      "Deteksi otomatis local LLaMA pada startup",
      "Support untuk remote LLaMA API",
      "Configuration panel untuk custom models",
      "Status indicator menunjukkan connection state"
    ],
    icon: "🦙",
    relatedFeatures: ["ai-node", "execution-system"]
  },

  // --- V3 Nodes: LLaMA Chat Model ---
  "chat-model": {
    title: "Chat Model (LLaMA)",
    description: "Panggil model LLaMA dengan system prompt dan prompt template. Sudah dibatasi ke model LLaMA saja dengan dropdown.",
    usage: "Pilih model LLaMA → isi systemPrompt & promptTemplate → set temperature & maxTokens",
    tips: [
      "Gunakan {{variables}} untuk inject nilai dari payload/vars",
      "Simpan tools di Advanced bila perlu function-calling",
      "Gunakan AI Analysis jika perlu pemetaan hasil ke field terstruktur"
    ],
    icon: "🧠",
    relatedFeatures: ["ai-analysis", "llama-integration"]
  },

  // --- V3 Nodes: AI Analysis ---
  "ai-analysis": {
    title: "AI Analysis",
    description: "Analisa input menggunakan LLaMA dengan pemetaan hasil JSON ke field terstruktur.",
    usage: "Isi systemPrompt & promptTemplate → definisikan responseMapping (field, path)",
    tips: [
      "Pastikan LLaMA terkoneksi",
      "Gunakan responseMapping untuk mengambil nilai dari JSON hasil",
      "Turunkan temperature (0.1–0.3) untuk hasil lebih stabil"
    ],
    icon: "🧩",
    relatedFeatures: ["chat-model", "validation"]
  },

  // --- V3 Nodes: Sensor Data ---
  "sensor-data": {
    title: "Sensor Data",
    description: "Terima data sensor via Webhook/MQTT/HTTP poll dengan konfigurasi metrics dan validasi range.",
    usage: "Pilih sourceType → isi endpoints → tambahkan metrics (id, path, min/max, unit)",
    tips: [
      "Aktifkan Advanced untuk timestampPath, smoothing, out-of-range policy",
      "Gunakan Decision untuk route alert berdasarkan metrics"
    ],
    icon: "🌡️",
    relatedFeatures: ["decision", "store-records"]
  },

  // --- V3 Nodes: Fetch External Data ---
  "fetch-external": {
    title: "Fetch External Data",
    description: "Ambil data dari HTTP API dengan auth, templating, retry, caching, dan response mapping.",
    usage: "Pilih method & url → headers/body opsional → set responseMapping",
    tips: [
      "Gunakan {{var}} untuk templating URL/body",
      "Aktifkan cacheTtlSec untuk respons yang jarang berubah"
    ],
    icon: "🌐",
    relatedFeatures: ["ai-analysis", "store-records"]
  },

  // --- V3 Nodes: Calculate ---
  "calculate": {
    title: "Calculate",
    description: "Hitung satu atau lebih ekspresi matematika dari variables dan constants.",
    usage: "Tambah variables (name, path) → constants (opsional) → expressions (field, expr)",
    tips: [
      "Gunakan Math.* di expr (mis: Math.max, Math.min)",
      "Gunakan clampMin/clampMax & precision untuk normalisasi"
    ],
    icon: "🧮",
    relatedFeatures: ["store-records", "decision"]
  },

  // --- V3 Nodes: Decision ---
  "decision": {
    title: "Decision",
    description: "Route workflow berdasarkan daftar kondisi (==, >=, includes, regex).",
    usage: "Tambah conditions: leftPath, operator, rightValue, route",
    tips: [
      "Gunakan mode=any dan stopOnFirst=true untuk cepat branching",
      "Set defaultRoute untuk fallback"
    ],
    icon: "🔀",
    relatedFeatures: ["sensor-data", "send-message"]
  },

  // --- V3 Nodes: Send Message ---
  "send-message": {
    title: "Send Message",
    description: "Kirim pesan via WhatsApp/SMS/Email dengan template dan attachments.",
    usage: "Pilih channel → isi to & template → opsional attachments",
    tips: [
      "Gunakan {{variables}} untuk inject data",
      "Aktifkan validateRecipient di Advanced",
      "Simpan riwayat pengiriman via saveToHistory"
    ],
    icon: "✉️",
    relatedFeatures: ["decision", "store-records"]
  },

  // --- V3 Nodes: Store Records ---
  "store-records": {
    title: "Store Records",
    description: "Simpan records ke storage lokal atau HTTP API dengan mode append/upsert.",
    usage: "Set destination → recordsPath → fieldMapping → mode (append/upsert)",
    tips: [
      "Tambahkan timestamp otomatis via Advanced",
      "Gunakan batchSize untuk kirim HTTP dalam beberapa chunk"
    ],
    icon: "🗄️",
    relatedFeatures: ["fetch-external", "calculate"]
  },

  "node-configuration": {
    title: "Node Configuration",
    description: "Konfigurasi node individual dengan settings spesifik. Double-click node atau gunakan context menu.",
    features: [
      "Title dan description",
      "Parameter customization",
      "Metrics configuration (untuk 'Ask Question' node)",
      "Validation rules"
    ],
    tips: [
      "Double-click node untuk open config panel",
      "Right-click untuk context menu",
      "Config tersimpan otomatis",
      "Bisa preview perubahan sebelum save"
    ],
    icon: "⚙️",
    relatedFeatures: ["node-library", "validation"]
  },

  "execution-system": {
    title: "Execution System",
    description: "Sistem eksekusi untuk menjalankan node individual atau seluruh workflow untuk testing.",
    features: [
      "Execute single node",
      "Execute full workflow",
      "View execution result dan logs",
      "Error handling dan debugging",
      "Performance metrics"
    ],
    tips: [
      "Klik 'Run' di node untuk execute",
      "Lihat result di Execution Panel",
      "Check logs untuk debug",
      "Execution bersifat real-time"
    ],
    icon: "▶️",
    relatedFeatures: ["validation", "workflow-canvas"]
  },

  "export-import": {
    title: "Export/Import",
    description: "Ekspor dan impor workflow dalam format JSON untuk sharing, backup, atau versioning.",
    usage: "Klik 'Export' → Save JSON file / Klik 'Import' → Pilih JSON file",
    tips: [
      "Export menyimpan seluruh state workflow",
      "Import akan merge dengan workflow existing",
      "Format JSON human-readable",
      "Bisa share workflow dengan tim"
    ],
    icon: "💾",
    relatedFeatures: ["workflow-canvas", "templates"]
  },

  "responsible-ai": {
    title: "Responsible AI Panel",
    description: "Panel untuk memastikan implementasi AI yang etis dan bertanggung jawab. Check bias, fairness, dan compliance.",
    features: [
      "Bias detection",
      "Fairness metrics",
      "Privacy compliance",
      "Transparency reporting"
    ],
    icon: "🛡️",
    relatedFeatures: ["ai-node", "llama-integration"]
  },

  "deployment": {
    title: "Deployment",
    description: "Deploy agent sebagai WhatsApp bot yang bisa dipasang di lingkungan production.",
    features: [
      "WhatsApp integration",
      "Production-ready configuration",
      "Monitoring dan analytics",
      "Environment management"
    ],
    usage: "Klik 'Deploy Agent' → Configure settings → Deploy to production",
    tips: [
      "Validasi workflow sebelum deploy",
      "Test di sandbox environment dulu",
      "Setup monitoring dan alerts",
      "Keep backup sebelum deploy"
    ],
    icon: "🚀",
    relatedFeatures: ["validation", "export-import"]
  },

  "simulation": {
    title: "WhatsApp Simulation",
    description: "Simulator untuk test workflow dalam konteks WhatsApp conversation tanpa deploy.",
    features: [
      "Real-time simulation",
      "WhatsApp-like UI",
      "Multi-scenario testing",
      "History dan logging"
    ],
    tips: [
      "Test berbagai skenario",
      "Check response time",
      "Validate user experience",
      "Debug sebelum production"
    ],
    icon: "💬",
    relatedFeatures: ["execution-system", "deployment"]
  },

  "templates": {
    title: "Workflow Templates",
    description: "Template workflow siap pakai untuk berbagai use case. Pilih template dan customize sesuai kebutuhan.",
    usage: "Gunakan @mention atau klik template dari sidebar",
    tips: [
      "Template membantu mulai cepat",
      "Bisa customize sepenuhnya",
      "Save template custom Anda",
      "Share template dengan team"
    ],
    icon: "🧩",
    relatedFeatures: ["describe-workflow", "export-import"]
  },

  "auto-layout": {
    title: "Auto Layout",
    description: "Automatis layout workflow dengan berbagai preset untuk visualisasi yang optimal.",
    features: [
      "Horizontal layout",
      "Vertical layout", 
      "Compact layout",
      "Spacious layout",
      "Complex workflow layout"
    ],
    usage: "Ctrl+L atau klik FAB di canvas → Pilih preset",
    tips: [
      "Gunakan shortcut Ctrl+L",
      "Preset bisa di-customize",
      "Restore layout sebelumnya dengan Shift+L",
      "Layout animation untuk UX yang smooth"
    ],
    icon: "📐",
    relatedFeatures: ["workflow-canvas"]
  },

  "metrics-tracking": {
    title: "Metrics & Analytics",
    description: "Track performance metrics dan analytics untuk monitoring workflow.",
    features: [
      "Real-time metrics",
      "Performance monitoring",
      "Usage statistics",
      "Error tracking"
    ],
    icon: "📊",
    relatedFeatures: ["execution-system", "deployment"]
  },

  "optimization": {
    title: "Performance Optimization",
    description: "Optimisasi otomatis untuk workflow besar dengan viewport rendering, lazy loading, dan intelligent preloading.",
    features: [
      "Viewport-based rendering",
      "Dynamic node loading",
      "Bundle size awareness",
      "Intelligent preloading"
    ],
    tips: [
      "Otomatis aktif untuk workflow 50+ nodes",
      "Badge optimasi menunjukkan status",
      "Memory usage reduced hingga 67%",
      "FPS improvement hingga 360%"
    ],
    icon: "⚡",
    relatedFeatures: ["workflow-canvas"]
  }
} as const satisfies Record<string, FeatureData>;

export type FeatureId = keyof typeof workflowFeatures;

/**
 * Get feature by ID
 */
export function getFeature(featureId: FeatureId): FeatureData | undefined {
  return workflowFeatures[featureId];
}

/**
 * Search features
 */
export function searchFeatures(query: string): Array<{ id: FeatureId; data: FeatureData }> {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) {
    return (Object.entries(workflowFeatures) as Array<[FeatureId, FeatureData]>).map(([id, data]) => ({ id, data }));
  }

  return (Object.entries(workflowFeatures) as Array<[FeatureId, FeatureData]>)
    .filter(([id, feature]) => {
      const titleMatch = feature.title.toLowerCase().includes(normalizedQuery);
      const descMatch = feature.description.toLowerCase().includes(normalizedQuery);
      const idMatch = id.toLowerCase().includes(normalizedQuery);
      const usageMatch = feature.usage?.toLowerCase().includes(normalizedQuery) ?? false;
      const tipsMatch = feature.tips?.some(tip => tip.toLowerCase().includes(normalizedQuery)) ?? false;
      const featuresMatch = feature.features?.some(f => f.toLowerCase().includes(normalizedQuery)) ?? false;
      const checksMatch = feature.checks?.some(c => c.toLowerCase().includes(normalizedQuery)) ?? false;
      const bestMatch = feature.bestPractices?.some(b => b.toLowerCase().includes(normalizedQuery)) ?? false;
      const mistakesMatch = feature.commonMistakes?.some(m => m.toLowerCase().includes(normalizedQuery)) ?? false;
      const categoryText = feature.categories ? Object.values(feature.categories).join(" ") : "";
      const categoriesMatch = categoryText.toLowerCase().includes(normalizedQuery);
      return (
        titleMatch || descMatch || idMatch || usageMatch || tipsMatch ||
        featuresMatch || checksMatch || bestMatch || mistakesMatch || categoriesMatch
      );
    })
    .map(([id, data]) => ({ id, data }));
}

/**
 * Get related features
 */
export function getRelatedFeatures(featureId: FeatureId): FeatureData[] {
  const feature = workflowFeatures[featureId];
  if (!feature?.relatedFeatures) return [];
  
  const seen = new Set<string>();
  return feature.relatedFeatures
    .filter(id => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map(id => workflowFeatures[id as FeatureId])
    .filter((f) => f !== undefined) as FeatureData[];
}

/**
 * Get features by category
 */
export function getFeaturesByCategory(): Record<string, FeatureData[]> {
  // Simple categorization based on feature type
  const categories: Record<string, FeatureData[]> = {
    "core": [
      workflowFeatures["describe-workflow"],
      workflowFeatures["workflow-canvas"],
      workflowFeatures["node-library"]
    ] as FeatureData[],
    "ai": [
      workflowFeatures["llama-integration"],
      workflowFeatures["responsible-ai"],
      workflowFeatures["chat-model"],
      workflowFeatures["ai-analysis"]
    ] as FeatureData[],
    "development": [
      workflowFeatures["node-configuration"],
      workflowFeatures["validation"],
      workflowFeatures["execution-system"],
      workflowFeatures["calculate"],
      workflowFeatures["decision"]
    ] as FeatureData[],
    "deployment": [
      workflowFeatures["deployment"],
      workflowFeatures["simulation"],
      workflowFeatures["export-import"]
    ] as FeatureData[],
    "optimization": [
      workflowFeatures["auto-layout"],
      workflowFeatures["optimization"],
      workflowFeatures["metrics-tracking"]
    ] as FeatureData[],
    "data": [
      workflowFeatures["sensor-data"],
      workflowFeatures["fetch-external"],
      workflowFeatures["store-records"],
      workflowFeatures["send-message"]
    ] as FeatureData[]
  };
  
  return categories;
}

export function getAllFeatures(): Array<{ id: FeatureId; data: FeatureData }> {
  return (Object.entries(workflowFeatures) as Array<[FeatureId, FeatureData]>).map(([id, data]) => ({ id, data }));
}

export function hasFeature(featureId: FeatureId): boolean {
  return featureId in workflowFeatures;
}

