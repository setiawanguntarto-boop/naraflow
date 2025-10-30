import { memo } from "react";
import { Position, NodeProps, Node } from "@xyflow/react";
import { AlertCircle } from "lucide-react";
import { useWorkflowState } from "@/hooks/useWorkflowState";
import { getCategoryForNode, CATEGORY_COLORS } from "@/data/nodeCategories";
import { getIconForLabel } from "@/data/nodeIcons";
import { AdvancedHandle } from "../handles/AdvancedHandle";
import { useAdvancedResize } from "@/hooks/useAdvancedResize";
import { ResizeHandle } from "../ResizeHandle";

interface DefaultNodeProps extends NodeProps {
  onContextMenu?: (event: React.MouseEvent, node: Node) => void;
}

// Helper to get hex color from Tailwind class
const getColorFromCategory = (category: string | null): string => {
  if (!category) return "#3B82F6"; // Default blue

  const colorMap: Record<string, string> = {
    Input: "#3B82F6", // Blue
    Processing: "#8B5CF6", // Purple
    Logic: "#F59E0B", // Amber
    Output: "#EC4899", // Pink
    Meta: "#94A3B8", // Gray
  };

  return colorMap[category] || "#3B82F6";
};

export const DefaultNode = memo(({ id, data, selected, onContextMenu }: DefaultNodeProps) => {
  const { actions } = useWorkflowState();
  const Icon = getIconForLabel(String(data.label || ""));
  const metricsCount = (data.metrics as string[] | undefined)?.length || 0;
  const errors = actions.getNodeErrors(id);
  const hasErrors = errors.filter(e => e.type === "error").length > 0;
  const hasWarnings = errors.filter(e => e.type === "warning").length > 0;

  // Get category-based coloring
  const category = getCategoryForNode(String(data.label || ""));
  const categoryColors = category ? CATEGORY_COLORS[category] : null;

  // Get handle color based on category
  const handleColor = getColorFromCategory(category);

  // Advanced resize system
  const { dimensions, isResizing, handleResizeStart } = useAdvancedResize({
    nodeId: id,
    initialWidth: (data.width as number) || 280,
    initialHeight: (data.height as number) || 120,
    constraints: {
      minWidth: 160,
      minHeight: 80,
      maxWidth: 500,
      maxHeight: 400,
    },
  });

  return (
    <div
      onContextMenu={e => onContextMenu?.(e, { id, data, selected } as Node)}
      className={`
        relative px-4 py-3 rounded-xl border-2 shadow-soft
        transition-all duration-200
        ${categoryColors?.bg || "bg-card"}
        ${isResizing ? "node-resizing" : ""}
        ${
          hasErrors
            ? "border-red-500 border-2"
            : hasWarnings
              ? "border-yellow-500 border-2"
              : selected
                ? `${categoryColors?.border || "border-brand-primary"} shadow-glow scale-105`
                : `${categoryColors?.border || "border-brand-primary/30"} hover:border-brand-primary/50`
        }
      `}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      }}
    >
      {/* Error/Warning indicator */}
      {(hasErrors || hasWarnings) && (
        <div
          className={`absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center ${hasErrors ? "bg-red-500" : "bg-yellow-500"}`}
        >
          <AlertCircle className="w-3 h-3 text-white" />
        </div>
      )}

      {metricsCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-brand-secondary text-white text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center shadow-soft">
          {metricsCount}
        </div>
      )}
      {/* Input Handles - Using Advanced Handle System */}
      {data.connectors &&
      Array.isArray(data.connectors) &&
      data.connectors.filter((c: any) => c.type === "target").length > 0 ? (
        (data.connectors as any[])
          .filter((c: any) => c.type === "target")
          .map((connector: any, idx: number, arr: any[]) => {
            const percentage = arr.length > 1
              ? ((idx + 1) / (arr.length + 1)) * 100
              : 50;
            return (
              <AdvancedHandle
                key={connector.id}
                type="target"
                position={connector.position || Position.Left}
                id={connector.id}
                percentage={percentage}
                isOutput={false}
                label={connector.label}
              />
            );
          })
      ) : (
        <AdvancedHandle
          type="target"
          position={Position.Left}
          id="input-default"
          percentage={50}
          isOutput={false}
        />
      )}

      <div className="flex items-center gap-2">
        {Icon && (
          <Icon
            className={`w-4 h-4 flex-shrink-0 ${categoryColors?.icon || "text-brand-primary"}`}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold truncate ${categoryColors?.text || "text-foreground"}`}>
            {String(data.title || data.label || "")}
          </p>
          {data.description && (
            <p
              className={`text-xs font-medium truncate ${categoryColors?.text || "text-foreground"}`}
            >
              {String(data.description)}
            </p>
          )}
        </div>
      </div>

      {/* Output Handles - Using Advanced Handle System */}
      {data.connectors &&
      Array.isArray(data.connectors) &&
      data.connectors.filter((c: any) => c.type === "source").length > 0 ? (
        (data.connectors as any[])
          .filter((c: any) => c.type === "source")
          .map((connector: any, idx: number, arr: any[]) => {
            const percentage = arr.length > 1
              ? ((idx + 1) / (arr.length + 1)) * 100
              : 50;
            return (
              <AdvancedHandle
                key={connector.id}
                type="source"
                position={connector.position || Position.Right}
                id={connector.id}
                percentage={percentage}
                isOutput={true}
                label={connector.label}
              />
            );
          })
      ) : (
        <AdvancedHandle
          type="source"
          position={Position.Right}
          id="output-default"
          percentage={50}
          isOutput={true}
        />
      )}

      {/* Resize Handle - shown when selected */}
      {selected && (
        <ResizeHandle
          onResizeStart={handleResizeStart}
          isResizing={isResizing}
        />
      )}
    </div>
  );
});

DefaultNode.displayName = "DefaultNode";
