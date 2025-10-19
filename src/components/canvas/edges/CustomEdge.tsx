import { BaseEdge, EdgeLabelRenderer, getBezierPath, getStraightPath, getSmoothStepPath, EdgeProps } from '@xyflow/react';
import { memo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Edit2, CheckCircle, XCircle, AlertTriangle, GitBranch } from 'lucide-react';
import { EdgeConditionType } from '@/types/workflow';

interface CustomEdgeProps extends EdgeProps {
  type?: string;
}

export const CustomEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  type = 'smoothstep',
}: CustomEdgeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState<string>((data?.label as string) || '');
  
  // Get the correct path based on edge type
  let edgePath, labelX, labelY;
  
  switch (type) {
    case 'straight':
      [edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
      });
      break;
    case 'step':
      [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: 0,
      });
      break;
    default:
      [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      });
  }
  
  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    if (data?.onUpdateLabel && typeof data.onUpdateLabel === 'function') {
      data.onUpdateLabel(id, newLabel);
    }
  };
  
  // Determine stroke color based on condition type
  const getConditionColor = () => {
    switch (data?.conditionType as EdgeConditionType) {
      case 'success':
        return '#22c55e'; // green-500
      case 'error':
        return '#ef4444'; // red-500
      case 'warning':
        return '#eab308'; // yellow-500
      case 'conditional':
        return '#3b82f6'; // blue-500
      default:
        return style?.stroke || 'hsl(var(--brand-primary))';
    }
  };
  
  const edgeStyle = {
    ...style,
    stroke: getConditionColor(),
  };
  
  // Get condition icon
  const getConditionIcon = () => {
    const conditionType = data?.conditionType as EdgeConditionType;
    switch (conditionType) {
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
      case 'conditional':
        return <GitBranch className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };
  
  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan flex flex-col items-center gap-1"
        >
          {/* Condition icon */}
          {data?.conditionType && data.conditionType !== 'default' && getConditionIcon()}
          
          {/* Label */}
          {isEditing ? (
            <Input
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditing(false);
                if (e.key === 'Escape') {
                  setLabel((data?.label as string) || '');
                  setIsEditing(false);
                }
              }}
              className="w-32 h-7 text-xs bg-card border-brand-primary"
              autoFocus
              placeholder="Add label..."
            />
          ) : (
            <div
              className="group flex items-center gap-1 px-2 py-1 bg-card/90 backdrop-blur-sm border border-border rounded-md text-xs font-medium text-foreground shadow-sm cursor-pointer hover:bg-card hover:border-brand-primary/50 transition-all"
              onClick={() => setIsEditing(true)}
            >
              {label ? (
                <span>{label}</span>
              ) : (
                <span className="text-foreground-muted flex items-center gap-1">
                  <Edit2 className="w-3 h-3" />
                  Add label
                </span>
              )}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';
