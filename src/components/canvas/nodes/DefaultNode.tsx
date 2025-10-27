import { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { AlertCircle } from 'lucide-react';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { getCategoryForNode, CATEGORY_COLORS } from '@/data/nodeCategories';
import { getIconForLabel } from '@/data/nodeIcons';

interface DefaultNodeProps extends NodeProps {
  onContextMenu?: (event: React.MouseEvent, node: Node) => void;
}

// Helper to get hex color from Tailwind class
const getColorFromCategory = (category: string | null): string => {
  if (!category) return '#3B82F6'; // Default blue
  
  const colorMap: Record<string, string> = {
    'Input': '#3B82F6',      // Blue
    'Processing': '#8B5CF6',  // Purple
    'Logic': '#F59E0B',       // Amber
    'Output': '#EC4899',      // Pink
    'Meta': '#94A3B8'         // Gray
  };
  
  return colorMap[category] || '#3B82F6';
};

export const DefaultNode = memo(({ id, data, selected, onContextMenu }: DefaultNodeProps) => {
  const { actions } = useWorkflowState();
  const Icon = getIconForLabel(String(data.label || ''));
  const metricsCount = (data.metrics as string[] | undefined)?.length || 0;
  const errors = actions.getNodeErrors(id);
  const hasErrors = errors.filter(e => e.type === 'error').length > 0;
  const hasWarnings = errors.filter(e => e.type === 'warning').length > 0;
  
  // Get category-based coloring
  const category = getCategoryForNode(String(data.label || ''));
  const categoryColors = category ? CATEGORY_COLORS[category] : null;
  
  // Get handle color based on category
  const handleColor = getColorFromCategory(category);
  
  return (
    <div
      onContextMenu={(e) => onContextMenu?.(e, { id, data, selected } as Node)}
      className={`
        relative px-4 py-3 rounded-xl border-2 shadow-soft
        transition-all duration-200
        min-w-[160px] max-w-[280px]
        ${categoryColors?.bg || 'bg-card'}
        ${hasErrors 
          ? 'border-red-500 border-2' 
          : hasWarnings 
          ? 'border-yellow-500 border-2'
          : selected 
          ? `${categoryColors?.border || 'border-brand-primary'} shadow-glow scale-105`
          : `${categoryColors?.border || 'border-brand-primary/30'} hover:border-brand-primary/50`
        }
      `}
    >
      {/* Error/Warning indicator */}
      {(hasErrors || hasWarnings) && (
        <div className={`absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center ${hasErrors ? 'bg-red-500' : 'bg-yellow-500'}`}>
          <AlertCircle className="w-3 h-3 text-white" />
        </div>
      )}
      
      {metricsCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-brand-secondary text-white text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center shadow-soft">
          {metricsCount}
        </div>
      )}
      {/* Multiple Input Handles */}
      {data.connectors && Array.isArray(data.connectors) && data.connectors.filter((c: any) => c.type === 'target').length > 0 ? (
        (data.connectors as any[]).filter((c: any) => c.type === 'target').map((connector: any, idx: number) => (
          <Handle
            key={connector.id}
            type="target"
            position={connector.position || Position.Left}
            id={connector.id}
            className="w-5 h-5 border-2 border-background cursor-pointer"
            style={{ 
              width: '16px', 
              height: '16px',
              top: connector.top || `${30 + idx * 20}%`,
              backgroundColor: connector.color || handleColor
            }}
          />
        ))
      ) : (
        <Handle
          type="target"
          position={Position.Left}
          className="w-5 h-5 border-2 border-background cursor-pointer"
          style={{ 
            width: '16px', 
            height: '16px',
            backgroundColor: handleColor
          }}
        />
      )}
      
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${categoryColors?.icon || 'text-brand-primary'}`} />}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold truncate ${categoryColors?.text || 'text-foreground'}`}>
            {String(data.title || data.label || '')}
          </p>
          {data.description && (
            <p className={`text-xs font-medium truncate ${categoryColors?.text || 'text-foreground'}`}>
              {String(data.description)}
            </p>
          )}
        </div>
      </div>
      
      {/* Multiple Output Handles */}
      {data.connectors && Array.isArray(data.connectors) && data.connectors.filter((c: any) => c.type === 'source').length > 0 ? (
        (data.connectors as any[]).filter((c: any) => c.type === 'source').map((connector: any, idx: number) => (
          <Handle
            key={connector.id}
            type="source"
            position={connector.position || Position.Right}
            id={connector.id}
            className="w-5 h-5 border-2 border-background cursor-pointer"
            style={{ 
              width: '16px', 
              height: '16px',
              top: connector.top || `${30 + idx * 20}%`,
              backgroundColor: connector.color || handleColor
            }}
          />
        ))
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          className="w-5 h-5 border-2 border-background cursor-pointer"
          style={{ 
            width: '16px', 
            height: '16px',
            backgroundColor: handleColor
          }}
        />
      )}
    </div>
  );
});

DefaultNode.displayName = 'DefaultNode';
