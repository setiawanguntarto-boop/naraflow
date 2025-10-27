export const softLogicFlowColors = {
  // Node Categories - Soft, muted backgrounds
  input: {
    bg: '#E0F2FE',      // Light blue-gray (trustworthy)
    border: '#38BDF8',  // Cyan blue
    text: '#0369A1',    // Dark blue
    icon: '#0284C7'     // Medium blue
  },
  processing: {
    bg: '#EDE9FE',      // Light violet (intellectual)
    border: '#A78BFA',  // Purple
    text: '#4C1D95',   // Dark purple
    icon: '#7C3AED'     // Medium purple
  },
  logic: {
    bg: '#FEF3C7',      // Warm amber (decision point)
    border: '#F59E0B',  // Amber
    text: '#92400E',    // Dark amber
    icon: '#D97706'     // Medium amber
  },
  output: {
    bg: '#E9D5FF',      // Light purple (resolution)
    border: '#C084FC',  // Light purple
    text: '#5B21B6',    // Dark purple
    icon: '#8B5CF6'     // Medium purple
  },
  meta: {
    bg: '#F8FAFC',      // Very light gray
    border: '#CBD5E1',  // Neutral gray
    text: '#475569',    // Dark gray
    icon: '#64748B'     // Medium gray
  },
  
  // System Nodes
  start: {
    bg: '#BBF7D0',      // Light green
    border: '#34D399',  // Green
    text: '#064E3B',    // Dark green
    icon: '#059669'     // Medium green
  },
  end: {
    bg: '#E9D5FF',      // Light purple
    border: '#C084FC',  // Purple
    text: '#581C87',    // Dark purple
    icon: '#7C3AED'     // Medium purple
  },
  
  // Edge Colors - Subtle and supportive
  edge: {
    default: '#CBD5E1',  // Neutral gray-blue
    active: '#38BDF8',   // Cyan for highlight
    success: '#0D9488',  // Teal for Yes/positive
    warning: '#F59E0B',  // Amber for No/conditional
    error: '#FCA5A5',    // Calm red-orange for escalation
    dashed: '5,5'        // Dashed pattern for special paths
  },
  
  // UI Elements
  labelPill: 'rgba(255,255,255,0.85)',  // Semi-transparent white
  gridBackground: '#F8FAFC',            // Very light background
  shadow: '0 1px 3px rgba(0,0,0,0.1)'   // Subtle shadow
};

export type SoftLogicFlowColorKey = keyof typeof softLogicFlowColors;
