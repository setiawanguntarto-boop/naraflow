export const NODE_CATEGORIES = {
  Input: [
    'Ask Input',
    'Sensor (IoT)', 
    'Receive Update'
  ],
  Processing: [
    'Process Data',
    'Filter Data',
    'Transform'
  ],
  Logic: [
    'Condition',
    'Loop',
    'Switch'
  ],
  Output: [
    'WhatsApp Message',
    'Report (PDF)',
    'Notification',
    'Email'
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
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-300 dark:border-blue-700',
    text: 'text-blue-600 dark:text-blue-400',
    icon: 'text-blue-500',
  },
  Processing: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-300 dark:border-purple-700',
    text: 'text-purple-600 dark:text-purple-400',
    icon: 'text-purple-500',
  },
  Logic: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    border: 'border-yellow-300 dark:border-yellow-700',
    text: 'text-yellow-600 dark:text-yellow-400',
    icon: 'text-yellow-500',
  },
  Output: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-300 dark:border-green-700',
    text: 'text-green-600 dark:text-green-400',
    icon: 'text-green-500',
  },
} as const;
