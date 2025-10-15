import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';

export const StartNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`
        px-5 py-3 rounded-full border-2 
        bg-gradient-to-r from-brand-secondary to-brand-secondary-light
        text-white shadow-soft
        transition-all duration-200
        ${selected ? 'shadow-glow scale-105' : 'hover:scale-102'}
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
  );
});

StartNode.displayName = 'StartNode';
