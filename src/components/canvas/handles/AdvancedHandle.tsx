import React from "react";
import { Handle, Position, HandleType } from "@xyflow/react";

interface AdvancedHandleProps {
  type: HandleType;
  position: Position;
  id: string;
  percentage?: number;
  className?: string;
  isOutput?: boolean;
  label?: string;
}

/**
 * Advanced handle component with smart positioning and color coding
 * - Green for inputs (target)
 * - Red/Purple for outputs (source)
 * - Smart percentage-based positioning (30% for inputs, 70% for outputs)
 */
export const AdvancedHandle: React.FC<AdvancedHandleProps> = ({
  type,
  position,
  id,
  percentage = 50,
  className = "",
  isOutput = false,
  label,
}) => {
  // Calculate position based on handle direction and percentage
  const getHandleStyle = (): React.CSSProperties => {
    const offset = `${percentage}%`;
    
    switch (position) {
      case Position.Top:
        return { top: 0, left: offset, transform: "translate(-50%, -50%)" };
      case Position.Bottom:
        return { bottom: 0, left: offset, transform: "translate(-50%, 50%)" };
      case Position.Left:
        return { left: 0, top: offset, transform: "translate(-50%, -50%)" };
      case Position.Right:
        return { right: 0, top: offset, transform: "translate(50%, -50%)" };
      default:
        return {};
    }
  };

  // Determine handle color based on type
  const getHandleColor = () => {
    return isOutput 
      ? "!bg-red-500 hover:!bg-red-600" 
      : "!bg-green-500 hover:!bg-green-600";
  };

  // Determine label position class
  const getLabelPositionClass = () => {
    switch (position) {
      case Position.Top:
        return "handle-label top";
      case Position.Bottom:
        return "handle-label bottom";
      case Position.Left:
        return "handle-label left";
      case Position.Right:
        return "handle-label right";
      default:
        return "handle-label";
    }
  };

  return (
    <Handle
      type={type}
      position={position}
      id={id}
      className={`advanced-handle ${getHandleColor()} border-2 border-white dark:border-gray-800 cursor-pointer ${className}`}
      style={{
        width: "16px",
        height: "16px",
        ...getHandleStyle(),
      }}
    >
      {label && (
        <div className={getLabelPositionClass()}>
          {label}
        </div>
      )}
    </Handle>
  );
};
