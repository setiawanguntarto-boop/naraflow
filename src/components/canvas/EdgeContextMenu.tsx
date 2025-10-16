import { useCallback } from 'react';
import { Edge } from '@xyflow/react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Trash2, Info } from 'lucide-react';
import { toast } from 'sonner';

interface EdgeContextMenuProps {
  edge: Edge;
  onDeleteEdge: (edgeId: string) => void;
  children: React.ReactNode;
}

export const EdgeContextMenu = ({ edge, onDeleteEdge, children }: EdgeContextMenuProps) => {
  const handleDelete = useCallback(() => {
    onDeleteEdge(edge.id);
    toast.success('Connection deleted', {
      description: `Removed connection between nodes`,
    });
  }, [edge.id, onDeleteEdge]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem 
          onClick={handleDelete}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
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
