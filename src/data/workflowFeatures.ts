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
  icon?: string;
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

export const workflowFeatures: Record<string, FeatureData> = {
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
    relatedFeatures: ["ai-node", "execution-system"]
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
};

/**
 * Get feature by ID
 */
export function getFeature(featureId: string): FeatureData | undefined {
  return workflowFeatures[featureId];
}

/**
 * Search features
 */
export function searchFeatures(query: string): Array<{ id: string; data: FeatureData }> {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) {
    return Object.entries(workflowFeatures).map(([id, data]) => ({ id, data }));
  }

  return Object.entries(workflowFeatures)
    .filter(([id, feature]) => 
      feature.title.toLowerCase().includes(normalizedQuery) ||
      feature.description.toLowerCase().includes(normalizedQuery) ||
      id.toLowerCase().includes(normalizedQuery) ||
      feature.usage?.toLowerCase().includes(normalizedQuery) ||
      feature.tips?.some(tip => tip.toLowerCase().includes(normalizedQuery))
    )
    .map(([id, data]) => ({ id, data }));
}

/**
 * Get related features
 */
export function getRelatedFeatures(featureId: string): FeatureData[] {
  const feature = workflowFeatures[featureId];
  if (!feature?.relatedFeatures) return [];
  
  return feature.relatedFeatures
    .map(id => workflowFeatures[id])
    .filter(Boolean);
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
    ],
    "ai": [
      workflowFeatures["llama-integration"],
      workflowFeatures["responsible-ai"]
    ],
    "development": [
      workflowFeatures["node-configuration"],
      workflowFeatures["validation"],
      workflowFeatures["execution-system"]
    ],
    "deployment": [
      workflowFeatures["deployment"],
      workflowFeatures["simulation"],
      workflowFeatures["export-import"]
    ],
    "optimization": [
      workflowFeatures["auto-layout"],
      workflowFeatures["optimization"],
      workflowFeatures["metrics-tracking"]
    ]
  };
  
  return categories;
}

