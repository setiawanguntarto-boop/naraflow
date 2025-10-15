import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { HelpCircle } from 'lucide-react';

export const DecisionNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className="relative">
      <div
        className={`
          w-32 h-32 rotate-45 origin-center
          border-2 bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/10
          transition-all duration-200
          ${selected 
            ? 'border-brand-secondary shadow-glow scale-105' 
            : 'border-brand-secondary/40 hover:border-brand-secondary/60'
          }
        `}
      >
        <div className="absolute inset-0 -rotate-45 flex flex-col items-center justify-center p-2">
          <HelpCircle className="w-5 h-5 text-brand-secondary mb-1" />
          <p className="text-xs font-semibold text-center text-foreground leading-tight">
            {String(data.label || '')}
          </p>
        </div>
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-brand-secondary border-2 border-background !-left-1.5"
      />
      
      <Handle
        type="source"
        position={Position.Top}
        id="yes"
        className="w-3 h-3 !bg-brand-secondary border-2 border-background !-top-1.5"
      />
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        className="w-3 h-3 !bg-brand-secondary border-2 border-background !-bottom-1.5"
      />
    </div>
  );
});

DecisionNode.displayName = 'DecisionNode';
