import React from "react";
import { Edge } from "@xyflow/react";
import { ConnectionLabel } from "@/types/connectionLabel.types";

interface ConnectionLabelRendererProps {
  edge: Edge;
  label?: ConnectionLabel;
  labelX?: number;
  labelY?: number;
  color?: string; // Optional color override
}

export const ConnectionLabelRenderer: React.FC<ConnectionLabelRendererProps> = ({
  edge,
  label,
  labelX,
  labelY,
  color,
}) => {
  if (!label || !edge) return null;

  // Use provided label coordinates if available, otherwise calculate midpoint
  const getMidpoint = () => {
    // If labelX and labelY are provided, use them (they're calculated from actual edge path)
    if (labelX !== undefined && labelY !== undefined) {
      return { x: labelX, y: labelY };
    }

    // Fallback to calculated midpoint for backward compatibility
    const sourceX = edge.sourceX || 0;
    const sourceY = edge.sourceY || 0;
    const targetX = edge.targetX || 0;
    const targetY = edge.targetY || 0;

    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    // Add small offset based on edge direction for better visual alignment
    const deltaX = targetX - sourceX;
    const deltaY = targetY - sourceY;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Normalize and add perpendicular offset for curved edges
    if (length > 0) {
      const offsetX = (-deltaY / length) * 8; // Perpendicular offset
      const offsetY = (deltaX / length) * 8;

      return {
        x: midX + offsetX,
        y: midY + offsetY,
      };
    }

    return { x: midX, y: midY };
  };

  const midpoint = getMidpoint();
  const labelColor = color || label.color || "#9CA3AF";

  return (
    <foreignObject
      x={midpoint.x - 50}
      y={midpoint.y - 12}
      width="100"
      height="24"
      className="pointer-events-none"
    >
      <div
        className="flex items-center justify-center h-full"
        style={{
          backgroundColor: `${labelColor}20`, // Translucent background
          borderRadius: "999px", // Full pill shape
          border: `1px solid ${labelColor}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)", // Subtle shadow
          backdropFilter: "blur(4px)",
          padding: "2px 8px", // Better padding
          transition: "all 0.25s ease-in-out", // Smooth transitions
        }}
      >
        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: labelColor }} />
        <span className="text-xs font-medium truncate max-w-20" style={{ color: labelColor }}>
          {label.displayName}
        </span>
      </div>
    </foreignObject>
  );
};

interface ConnectionLabelTooltipProps {
  edge: Edge;
  label?: ConnectionLabel;
  visible: boolean;
}

export const ConnectionLabelTooltip: React.FC<ConnectionLabelTooltipProps> = ({
  edge,
  label,
  visible,
}) => {
  if (!label || !visible) return null;

  const getMidpoint = () => {
    const sourceX = edge.sourceX || 0;
    const sourceY = edge.sourceY || 0;
    const targetX = edge.targetX || 0;
    const targetY = edge.targetY || 0;

    // For better alignment, calculate the actual midpoint
    // and add slight offset to account for edge curvature
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    // Add small offset based on edge direction for better visual alignment
    const deltaX = targetX - sourceX;
    const deltaY = targetY - sourceY;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Normalize and add perpendicular offset for curved edges
    if (length > 0) {
      const offsetX = (-deltaY / length) * 8; // Perpendicular offset
      const offsetY = (deltaX / length) * 8;

      return {
        x: midX + offsetX,
        y: midY + offsetY,
      };
    }

    return { x: midX, y: midY };
  };

  const midpoint = getMidpoint();

  return (
    <foreignObject
      x={midpoint.x - 100}
      y={midpoint.y - 40}
      width="200"
      height="32"
      className="pointer-events-none"
    >
      <div
        className="flex items-center justify-center h-full"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderRadius: "6px",
          color: "white",
          fontSize: "11px",
          padding: "4px 8px",
          backdropFilter: "blur(4px)",
        }}
      >
        <div className="text-center">
          <div className="font-medium">{label.displayName}</div>
          <div className="text-gray-300 text-xs">{label.description}</div>
        </div>
      </div>
    </foreignObject>
  );
};
