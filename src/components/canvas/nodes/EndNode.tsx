import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CheckCircle } from 'lucide-react';

export const EndNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`
        px-5 py-3 rounded-full border-2 
        bg-gradient-to-r from-brand-primary to-brand-primary-light
        text-white shadow-soft
        transition-all duration-200
        ${selected ? 'shadow-glow scale-105' : 'hover:scale-102'}
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-white border-2 border-brand-primary"
      />
      
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm font-semibold">{String(data.label || 'Selesai')}</span>
      </div>
    </div>
  );
});

EndNode.displayName = 'EndNode';
