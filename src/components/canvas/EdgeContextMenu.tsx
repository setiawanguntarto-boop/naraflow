import { useCallback } from 'react';
import { Edge } from '@xyflow/react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Trash2, Info, Waves, Minus, Square, Move, Zap, Tag, CheckCircle, XCircle, AlertTriangle, GitBranch } from 'lucide-react';
import { toast } from 'sonner';
import { EdgeConditionType } from '@/types/workflow';

interface EdgeContextMenuProps {
  edge: Edge;
  onDeleteEdge: (edgeId: string) => void;
  onUpdateEdge: (edgeId: string, updates: Partial<Edge>) => void;
  children: React.ReactNode;
}

export const EdgeContextMenu = ({ edge, onDeleteEdge, onUpdateEdge, children }: EdgeContextMenuProps) => {
  const isAnimated = edge.animated ?? false;
  const currentType = edge.type || 'smoothstep';
  const currentStyle = edge.data?.lineStyle || 'solid';

  const handleAddLabel = useCallback(() => {
    const label = prompt('Enter edge label:', (edge.data?.label as string) || '');
    if (label !== null) {
      onUpdateEdge(edge.id, {
        data: {
          ...edge.data,
          label,
        },
      });
      toast.success('Label updated');
    }
  }, [edge, onUpdateEdge]);
  
  const handleConditionChange = useCallback((conditionType: EdgeConditionType) => {
    const getConditionColor = (type: EdgeConditionType): string => {
      switch (type) {
        case 'success': return '#22c55e';
        case 'error': return '#ef4444';
        case 'warning': return '#eab308';
        case 'conditional': return '#3b82f6';
        default: return 'hsl(var(--brand-primary))';
      }
    };
    
    onUpdateEdge(edge.id, {
      style: {
        ...edge.style,
        stroke: getConditionColor(conditionType),
      },
      data: {
        ...edge.data,
        conditionType,
      },
    });
    toast.success('Condition type updated', {
      description: `Changed to ${conditionType}`,
    });
  }, [edge, onUpdateEdge]);

  const handleDelete = useCallback(() => {
    onDeleteEdge(edge.id);
    toast.success('Connection deleted', {
      description: `Removed connection between nodes`,
    });
  }, [edge.id, onDeleteEdge]);

  const handleEdgeTypeChange = useCallback((type: string) => {
    onUpdateEdge(edge.id, { type: type as any });
    toast.success('Edge type updated', {
      description: `Changed to ${type}`,
    });
  }, [edge.id, onUpdateEdge]);

  const handleLineStyleChange = useCallback((style: string) => {
    let strokeDasharray = undefined;
    if (style === 'dashed') {
      strokeDasharray = '5, 5';
    } else if (style === 'dotted') {
      strokeDasharray = '2, 4';
    }

    onUpdateEdge(edge.id, {
      style: {
        ...edge.style,
        strokeDasharray,
      },
      data: {
        ...edge.data,
        lineStyle: style,
      },
    });
    toast.success('Line style updated', {
      description: `Changed to ${style}`,
    });
  }, [edge, onUpdateEdge]);

  const handleToggleAnimation = useCallback(() => {
    onUpdateEdge(edge.id, { animated: !isAnimated });
    toast.success(isAnimated ? 'Animation disabled' : 'Animation enabled');
  }, [edge.id, isAnimated, onUpdateEdge]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-white border border-gray-200 shadow-lg">
        <ContextMenuItem onClick={handleAddLabel}>
          <Tag className="w-4 h-4 mr-2" />
          {edge.data?.label ? 'Edit Label' : 'Add Label'}
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <GitBranch className="w-4 h-4 mr-2" />
            Condition Type
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-white border border-gray-200 shadow-lg">
            <ContextMenuItem onClick={() => handleConditionChange('default')}>
              <div className="w-4 h-0.5 bg-gray-500 mr-2" />
              Default Flow
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleConditionChange('success')}>
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Success Path
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleConditionChange('error')}>
              <XCircle className="w-4 h-4 mr-2 text-red-500" />
              Error Path
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleConditionChange('warning')}>
              <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
              Warning Path
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleConditionChange('conditional')}>
              <GitBranch className="w-4 h-4 mr-2 text-blue-500" />
              Conditional
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            Edge Type
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-white border border-gray-200 shadow-lg">
            <ContextMenuItem 
              onClick={() => handleEdgeTypeChange('smoothstep')}
              className={currentType === 'smoothstep' ? 'bg-brand-primary/10' : ''}
            >
              <Waves className="w-4 h-4 mr-2" />
              Smooth Step
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={() => handleEdgeTypeChange('straight')}
              className={currentType === 'straight' ? 'bg-brand-primary/10' : ''}
            >
              <Minus className="w-4 h-4 mr-2" />
              Straight
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={() => handleEdgeTypeChange('step')}
              className={currentType === 'step' ? 'bg-brand-primary/10' : ''}
            >
              <Square className="w-4 h-4 mr-2" />
              Step
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={() => handleEdgeTypeChange('default')}
              className={currentType === 'default' ? 'bg-brand-primary/10' : ''}
            >
              <Move className="w-4 h-4 mr-2" />
              Bezier
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            Line Style
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-white border border-gray-200 shadow-lg">
            <ContextMenuItem 
              onClick={() => handleLineStyleChange('solid')}
              className={currentStyle === 'solid' ? 'bg-brand-primary/10' : ''}
            >
              ━━━ Solid
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={() => handleLineStyleChange('dashed')}
              className={currentStyle === 'dashed' ? 'bg-brand-primary/10' : ''}
            >
              ┈┈┈ Dashed
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={() => handleLineStyleChange('dotted')}
              className={currentStyle === 'dotted' ? 'bg-brand-primary/10' : ''}
            >
              ⋯⋯⋯ Dotted
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={handleToggleAnimation}>
          <Zap className="w-4 h-4 mr-2" />
          {isAnimated ? 'Disable' : 'Enable'} Animation
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem 
          onClick={handleDelete}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Connection
        </ContextMenuItem>
        
        <ContextMenuItem className="cursor-default opacity-60">
          <Info className="w-4 h-4 mr-2" />
          Edge ID: {edge.id.slice(0, 8)}...
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};