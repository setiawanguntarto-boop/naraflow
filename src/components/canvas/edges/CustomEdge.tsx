/**
 * Naraflow - CustomEdge Hybrid Fix
 * Tujuan:
 *  - Membuat edge otomatis berubah warna sesuai connection label (tanpa reload canvas)
 *  - Menjaga struktur modular: BaseEdge + ConnectionLabelRenderer
 *  - Menambahkan transisi halus (stroke color)
 *
 * Kompatibel dengan React Flow 11+
 */

import React, { useEffect, useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getStraightPath,
  getSmoothStepPath,
  EdgeProps,
} from "@xyflow/react";
import { CheckCircle, XCircle, AlertTriangle, GitBranch } from "lucide-react";
import { EdgeConditionType } from "@/types/workflow";
import { ConnectionLabelRenderer } from "../ConnectionLabelRenderer";
import { ConnectionMenu, ConnectionOption } from "../ConnectionMenu";
import { ConnectionLabel } from "@/types/connectionLabel.types";
import { useWorkflowState } from "@/hooks/useWorkflowState";
import { CATEGORY_COLORS } from "@/data/nodeCategories";

interface CustomEdgeProps extends EdgeProps {
  type?: string;
}

/**
 * CustomEdge Hybrid Version:
 * Menggunakan BaseEdge bawaan React Flow untuk performa,
 * dan renderer label terpisah untuk konsistensi visual.
 *
 * Namun, sekarang stroke color sepenuhnya reaktif terhadap connection label color.
 */
export const CustomEdge = React.memo(
  ({
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
    type = "smoothstep",
    selected = false,
  }: CustomEdgeProps) => {
    const [isConnectionMenuOpen, setIsConnectionMenuOpen] = useState(false);
    const [connectionMenuPosition, setConnectionMenuPosition] = useState({ x: 0, y: 0 });

    // 1️⃣ Ambil label info (termasuk warna) dari global workflow state
    const connectionLabel = useWorkflowState(state => {
      const edge = state.edges[id];
      return (edge?.data?.label as ConnectionLabel) || null;
    });

    // 2️⃣ Inisialisasi state lokal untuk warna edge (dengan fallback default)
    const [strokeColor, setStrokeColor] = useState<string>(connectionLabel?.color ?? "#9CA3AF");

    // 3️⃣ Update warna edge secara reaktif setiap kali label color berubah
    useEffect(() => {
      if (connectionLabel?.color) {
        setStrokeColor(connectionLabel.color);
      } else {
        setStrokeColor("#9CA3AF");
      }
    }, [connectionLabel?.color]);

    // Check if this edge has embedded connection menu
    const hasConnectionMenu = data?.connectionMenu === true;
    const connectionOptions: ConnectionOption[] =
      (data?.connectionOptions as ConnectionOption[]) || [];

    // Calculate connection point position (middle of the edge)
    const connectionPointX = (sourceX + targetX) / 2;
    const connectionPointY = (sourceY + targetY) / 2;

    // Handle connection point click
    const handleConnectionPointClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      const rect = (event.target as Element).getBoundingClientRect();
      setConnectionMenuPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      setIsConnectionMenuOpen(true);
    };

    // Handle connection option selection
    const handleConnectionOptionSelect = (option: ConnectionOption) => {
      // Update edge data with selected option
      if (data?.onConnectionSelect && typeof data.onConnectionSelect === "function") {
        data.onConnectionSelect(id, option);
      }
      setIsConnectionMenuOpen(false);
    };

    // 4️⃣ Gunakan React Flow helper untuk menghasilkan path Bezier halus
    let edgePath, labelX, labelY;

    switch (type) {
      case "straight":
        [edgePath, labelX, labelY] = getStraightPath({
          sourceX,
          sourceY,
          targetX,
          targetY,
        });
        break;
      case "step":
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

    // 5️⃣ Tentukan warna highlight jika edge sedang dipilih
    const highlightColor = selected ? "#2563EB" : strokeColor;

    const edgeStyle = {
      ...style,
      stroke: highlightColor,
      strokeWidth: selected ? 2.8 : 2,
      transition: "stroke 0.25s ease-in-out, stroke-width 0.25s ease-in-out",
      opacity: 0.95,
    };

    // Get condition icon
    const getConditionIcon = () => {
      const conditionType = data?.conditionType as EdgeConditionType;
      switch (conditionType) {
        case "success":
          return <CheckCircle className="w-3 h-3 text-green-500" />;
        case "error":
          return <XCircle className="w-3 h-3 text-red-500" />;
        case "warning":
          return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
        case "conditional":
          return <GitBranch className="w-3 h-3 text-blue-500" />;
        default:
          return null;
      }
    };

    return (
      <>
        {/* ====== EDGE GARIS ====== */}
        <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={edgeStyle} />

        {/* Embedded Connection Point */}
        {hasConnectionMenu && connectionOptions.length > 0 && (
          <g>
            <circle
              cx={connectionPointX}
              cy={connectionPointY}
              r="10"
              fill="white"
              stroke="#3b82f6"
              strokeWidth="2"
              className="cursor-pointer hover:fill-blue-50 hover:stroke-blue-600 transition-colors"
              onClick={handleConnectionPointClick}
            />
          </g>
        )}

        {/* ====== EDGE LABEL (separate renderer) ====== */}
        {connectionLabel && (
          <ConnectionLabelRenderer
            edge={{ id, sourceX, sourceY, targetX, targetY } as any}
            label={connectionLabel}
            labelX={labelX}
            labelY={labelY}
            color={strokeColor}
          />
        )}

        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan flex flex-col items-center gap-1"
          >
            {/* Condition icon */}
            {data?.conditionType && data.conditionType !== "default" && getConditionIcon()}
          </div>
        </EdgeLabelRenderer>

        {/* Connection Menu */}
        {isConnectionMenuOpen && (
          <ConnectionMenu
            position={connectionMenuPosition}
            options={connectionOptions}
            onSelect={handleConnectionOptionSelect}
            onClose={() => setIsConnectionMenuOpen(false)}
            title="Connection Options"
            description="Choose how this connection should behave"
          />
        )}
      </>
    );
  }
);

CustomEdge.displayName = "CustomEdge";
