import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Database, MapPin, Wifi, CheckSquare, FileText, Send, AlertCircle } from 'lucide-react';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { NODE_COLORS, NodeIconType } from '@/types/workflow';

const iconMap: Record<string, React.ElementType> = {
  database: Database,
  'map-pin': MapPin,
  wifi: Wifi,
  'check-square': CheckSquare,
  'file-text': FileText,
  send: Send,
};

export const DefaultNode = memo(({ id, data, selected }: NodeProps) => {
  const { getNodeErrors } = useWorkflowState();
  const Icon = data.icon && iconMap[data.icon as string] ? iconMap[data.icon as string] : Database;
  const nodeColors = NODE_COLORS[data.icon as NodeIconType];
  const metricsCount = (data.metrics as string[] | undefined)?.length || 0;
  const errors = getNodeErrors(id);
  const hasErrors = errors.filter(e => e.type === 'error').length > 0;
  const hasWarnings = errors.filter(e => e.type === 'warning').length > 0;
  
  return (
    <div
      className={`
        relative px-4 py-3 rounded-xl border-2 shadow-soft
        transition-all duration-200
        min-w-[160px] max-w-[280px]
        ${nodeColors?.bg || 'bg-card'}
        ${hasErrors 
          ? 'border-red-500 border-2' 
          : hasWarnings 
          ? 'border-yellow-500 border-2'
          : selected 
          ? `${nodeColors?.border || 'border-brand-primary'} shadow-glow scale-105`
          : `${nodeColors?.border || 'border-brand-primary/30'} ${nodeColors?.borderHover || 'hover:border-brand-primary/50'}`
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
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 border-2 border-background ${nodeColors?.handleBg || '!bg-brand-primary'}`}
      />
      
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${nodeColors?.icon || 'text-brand-primary'}`} />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {String(data.label || '')}
          </p>
          {data.description && (
            <p className="text-xs text-foreground-muted truncate">
              {String(data.description)}
            </p>
          )}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 border-2 border-background ${nodeColors?.handleBg || '!bg-brand-primary'}`}
      />
    </div>
  );
});

DefaultNode.displayName = 'DefaultNode';
