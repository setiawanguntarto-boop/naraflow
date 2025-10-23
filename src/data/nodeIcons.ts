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
  type LucideIcon,
} from 'lucide-react';

export const NODE_ICONS: Record<string, LucideIcon> = {
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
