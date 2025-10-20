import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Play, AlertCircle } from 'lucide-react';
import { useWorkflowState } from '@/hooks/useWorkflowState';

export const StartNode = memo(({ id, data, selected }: NodeProps) => {
  const { getNodeErrors } = useWorkflowState();
  const errors = getNodeErrors(id);
  const hasErrors = errors.filter(e => e.type === 'error').length > 0;
  const hasWarnings = errors.filter(e => e.type === 'warning').length > 0;
  
  return (
    <div className="relative">
      {/* Error/Warning indicator */}
      {(hasErrors || hasWarnings) && (
        <div className={`absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center z-10 ${hasErrors ? 'bg-red-500' : 'bg-yellow-500'}`}>
          <AlertCircle className="w-3 h-3 text-white" />
        </div>
      )}
      
      <div
        className={`
          px-5 py-3 rounded-full border-2 
          bg-gradient-to-r from-brand-secondary to-brand-secondary-light
          text-white shadow-soft
          transition-all duration-200
          ${hasErrors 
            ? 'border-red-500' 
            : hasWarnings 
            ? 'border-yellow-500'
            : selected 
            ? 'shadow-glow scale-105' 
            : 'hover:scale-102'
          }
        `}
      >
      <div className="flex items-center gap-2">
        <Play className="w-4 h-4 fill-white" />
        <span className="text-sm font-semibold">{String(data.label || 'Mulai')}</span>
      </div>
      
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-white border-2 border-brand-secondary"
        />
      </div>
    </div>
  );
});

StartNode.displayName = 'StartNode';
