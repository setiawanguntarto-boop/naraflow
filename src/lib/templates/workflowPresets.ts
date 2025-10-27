export interface WorkflowPreset {
  id: string;
  label: string;
  description: string;
  prompt: string;
  icon: string;
  category: string;
}

export const workflowPresets: WorkflowPreset[] = [
  {
    id: "broilerEnd2End",
    label: "Budidaya Broiler - End-to-End",
    description: "Workflow lengkap manajemen siklus broiler: registrasi farm, daily check-in, monitoring performance, harvest & reporting",
    prompt: "Buat workflow budidaya broiler: registrasi farm dengan data peternak dan kapasitas kandang, QR code generation per kandang, input harian (mortalitas, pakan, berat, suhu), QR validation, mortality alert jika >2%, hitung FCR/ADG/mortality%, simpan ke sheet, proses panen, generate laporan PDF, kirim via WhatsApp",
    icon: "🐔",
    category: "Business Process",
  },
  {
    id: "supportWorkflow",
    label: "Customer Support Workflow",
    description: "Workflow dukungan pelanggan dengan AI dan Human routing",
    prompt: "Start → Support Greeting → Issue Description → [AI Support | Human Support] → End",
    icon: "🎧",
    category: "Customer Service",
  },
  {
    id: "approvalWorkflow", 
    label: "Approval Process",
    description: "Proses persetujuan dengan multiple decision points",
    prompt: "Start → Submit Request → [Manager Approval | Auto Approve] → Notification → End",
    icon: "✅",
    category: "Business Process",
  },
  {
    id: "dataProcessing",
    label: "Data Processing Pipeline",
    description: "Pipeline pemrosesan data dengan validation steps",
    prompt: "Start → Data Input → [Validate | Transform] → Store → Report → End",
    icon: "📊",
    category: "Data Processing",
  },
  {
    id: "orderTracking",
    label: "Order Tracking Flow",
    description: "Workflow tracking pesanan dengan status updates",
    prompt: "Start → Order Received → [Payment Success | Payment Failed] → [Ship | Refund] → End",
    icon: "🛒",
    category: "E-commerce",
  },
  {
    id: "surveyFlow",
    label: "Survey Collection Process",
    description: "Proses pengumpulan survey dengan multiple question types",
    prompt: "Start → Survey Start → [Question Type] → [Response Collection] → [Analysis | Report] → End",
    icon: "📝",
    category: "Content Management",
  }
];
