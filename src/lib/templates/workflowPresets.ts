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
