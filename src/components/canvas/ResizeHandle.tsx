import React from 'react';
import { Maximize2 } from 'lucide-react';

interface ResizeHandleProps {
  onResizeStart: (e: React.MouseEvent) => void;
  isResizing: boolean;
  className?: string;
}

/**
 * Visual resize handle component for nodes
 * Appears in the bottom-right corner when node is selected
 */
export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  onResizeStart,
  isResizing,
  className = '',
}) => {
  return (
    <div
      className={`resize-handle ${isResizing ? 'resizing' : ''} ${className}`}
      onMouseDown={onResizeStart}
      onClick={(e) => e.stopPropagation()}
    >
      <Maximize2 className="resize-handle-icon" size={14} />
    </div>
  );
};
