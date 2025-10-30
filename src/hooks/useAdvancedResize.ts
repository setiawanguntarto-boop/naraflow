import { useState, useCallback, useRef, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';

export interface ResizeConstraints {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}

export interface UseAdvancedResizeOptions {
  nodeId: string;
  initialWidth?: number;
  initialHeight?: number;
  constraints?: Partial<ResizeConstraints>;
  onResize?: (width: number, height: number) => void;
  onResizeEnd?: (width: number, height: number) => void;
}

const DEFAULT_CONSTRAINTS: ResizeConstraints = {
  minWidth: 200,
  minHeight: 100,
  maxWidth: 800,
  maxHeight: 600,
};

export function useAdvancedResize({
  nodeId,
  initialWidth = 280,
  initialHeight = 200,
  constraints = {},
  onResize,
  onResizeEnd,
}: UseAdvancedResizeOptions) {
  const { updateNodeData } = useReactFlow();
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const finalConstraints = { ...DEFAULT_CONSTRAINTS, ...constraints };

  const clampDimensions = useCallback(
    (width: number, height: number) => ({
      width: Math.max(
        finalConstraints.minWidth,
        Math.min(finalConstraints.maxWidth, width)
      ),
      height: Math.max(
        finalConstraints.minHeight,
        Math.min(finalConstraints.maxHeight, height)
      ),
    }),
    [finalConstraints]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsResizing(true);
      startPosRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: dimensions.width,
        height: dimensions.height,
      };

      // Prevent node dragging during resize
      document.body.style.cursor = 'nwse-resize';
    },
    [dimensions]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;

      const newWidth = startPosRef.current.width + deltaX;
      const newHeight = startPosRef.current.height + deltaY;

      const clamped = clampDimensions(newWidth, newHeight);
      setDimensions(clamped);
      onResize?.(clamped.width, clamped.height);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      
      // Sync with ReactFlow state
      updateNodeData(nodeId, {
        width: dimensions.width,
        height: dimensions.height,
      });
      
      onResizeEnd?.(dimensions.width, dimensions.height);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, nodeId, dimensions, clampDimensions, onResize, onResizeEnd, updateNodeData]);

  return {
    dimensions,
    isResizing,
    handleResizeStart,
    resizeRef,
  };
}
