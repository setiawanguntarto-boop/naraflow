import { memo } from 'react';
import { NodeProps, Handle, Position } from '@xyflow/react';
import { Folder } from 'lucide-react';

export const GroupNode = memo(({ id, data, selected }: NodeProps) => {
  return (
    <div
      className={`
        relative bg-card/50 backdrop-blur-sm border-2 border-dashed 
        rounded-xl transition-all
        ${selected ? 'border-brand-primary shadow-lg' : 'border-border'}
      `}
      style={{
        minWidth: '250px',
        minHeight: '200px',
        padding: '16px',
      }}
    >
      {/* Group header */}
      <div className="absolute top-2 left-2 flex items-center gap-2 px-3 py-1.5 bg-card/90 border border-border rounded-lg">
        <Folder className="w-4 h-4 text-brand-primary" />
        <span className="text-sm font-semibold text-foreground">
          {String(data.label || 'Group')}
        </span>
      </div>
      
      {/* Handles for group-level connections */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-5 h-5 !bg-brand-primary border-2 border-background cursor-pointer"
        style={{ top: '50%', width: '16px', height: '16px' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-5 h-5 !bg-brand-primary border-2 border-background cursor-pointer"
        style={{ top: '50%', width: '16px', height: '16px' }}
      />
      
      {/* Description */}
      {data.description && (
        <div className="absolute bottom-2 left-2 right-2 text-xs text-foreground bg-card/80 p-2 rounded border border-border">
          {String(data.description)}
        </div>
      )}
    </div>
  );
});

GroupNode.displayName = 'GroupNode';
