import {
  MessageCircle,
  Database,
  Wifi,
  CheckSquare,
  FileText,
  Send,
  Filter,
  GitBranch,
  Repeat,
  Inbox,
  Bell,
  Mail,
  ArrowRight,
  PlayCircle,
  Thermometer,
  Brain,
  Calculator,
  Globe,
  StopCircle,
  type LucideIcon,
} from 'lucide-react';

export const NODE_ICONS: Record<string, LucideIcon> = {
  // Input nodes
  'WhatsApp Trigger': MessageCircle,
  'Ask Question': MessageCircle,
  'Sensor Data': Thermometer,
  'Fetch External Data': Globe,
  // Processing nodes
  'AI Analysis': Brain,
  'Calculate': Calculator,
  // Logic nodes
  'Decision': GitBranch,
  // Output nodes
  'Send Message': Send,
  'Store Records': Database,
  // Meta nodes
  'Start Workflow': PlayCircle,
  'End Workflow': StopCircle,
  // Legacy mappings for backward compatibility
  'Ask Input': Inbox,
  'Sensor (IoT)': Wifi,
  'Receive Update': ArrowRight,
  'Process Data': Database,
  'Filter Data': Filter,
  'Transform': GitBranch,
  'Condition': CheckSquare,
  'Loop': Repeat,
  'Switch': GitBranch,
  'WhatsApp Message': MessageCircle,
  'Notification': Bell,
  'Report (PDF)': FileText,
  'Email': Mail,
};

export const getIconForLabel = (label: string): LucideIcon => {
  return NODE_ICONS[label] || Database;
};
