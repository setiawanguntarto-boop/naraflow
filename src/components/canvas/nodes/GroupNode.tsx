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
        className="w-3 h-3 !bg-brand-primary border-2 border-background"
        style={{ top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-brand-primary border-2 border-background"
        style={{ top: '50%' }}
      />
      
      {/* Description */}
      {data.description && (
        <div className="absolute bottom-2 left-2 right-2 text-xs text-foreground-muted bg-card/50 p-2 rounded">
          {String(data.description)}
        </div>
      )}
    </div>
  );
});

GroupNode.displayName = 'GroupNode';
