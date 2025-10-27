export const NODE_CATEGORIES = {
  Input: [
    'Ask Question',
    'Sensor Data', 
    'Fetch External Data'
  ],
  Processing: [
    'AI Analysis',
    'Calculate'
  ],
  Logic: [
    'Decision'
  ],
  Output: [
    'Send Message',
    'Store Records'
  ],
  Meta: [
    'Start Workflow',
    'End Workflow'
  ],
} as const;

export type NodeCategory = keyof typeof NODE_CATEGORIES;
export type NodeLabel = typeof NODE_CATEGORIES[NodeCategory][number];

export const getCategoryForNode = (nodeLabel: string): NodeCategory | null => {
  for (const [category, nodes] of Object.entries(NODE_CATEGORIES)) {
    if ((nodes as readonly string[]).includes(nodeLabel)) {
      return category as NodeCategory;
    }
  }
  return null;
};

export const CATEGORY_COLORS = {
  Input: {
    bg: 'bg-[#E8F4FD]', // Pastel blue
    border: 'border-[#60A5FA]', // Soft blue border
    text: 'text-[#2563EB]', // Medium blue text
    icon: 'text-[#3B82F6]', // Blue icon
  },
  Processing: {
    bg: 'bg-[#F3E8FF]', // Pastel purple
    border: 'border-[#A78BFA]', // Soft purple border
    text: 'text-[#7C3AED]', // Medium purple text
    icon: 'text-[#8B5CF6]', // Purple icon
  },
  Logic: {
    bg: 'bg-[#FEF3C7]', // Pastel amber
    border: 'border-[#FCD34D]', // Soft amber border
    text: 'text-[#D97706]', // Medium amber text
    icon: 'text-[#F59E0B]', // Amber icon
  },
  Output: {
    bg: 'bg-[#FCE7F3]', // Pastel pink
    border: 'border-[#F0A9C4]', // Soft pink border
    text: 'text-[#DB2777]', // Medium pink text
    icon: 'text-[#EC4899]', // Pink icon
  },
  Meta: {
    bg: 'bg-[#F1F5F9]', // Pastel gray
    border: 'border-[#CBD5E1]', // Soft gray border
    text: 'text-[#64748B]', // Medium gray text
    icon: 'text-[#94A3B8]', // Gray icon
  },
  default: '#9CA3AF', // Fallback color for edges without labels
} as const;
