import { memo } from "react";
import { Position, NodeProps } from "@xyflow/react";
import { HelpCircle, AlertCircle } from "lucide-react";
import { useWorkflowState } from "@/hooks/useWorkflowState";
import { AdvancedHandle } from "../handles/AdvancedHandle";

export const DecisionNode = memo(({ id, data, selected }: NodeProps) => {
  const { actions } = useWorkflowState();
  const errors = actions.getNodeErrors(id);
  const hasErrors = errors.filter(e => e.type === "error").length > 0;
  const hasWarnings = errors.filter(e => e.type === "warning").length > 0;

  return (
    <div className="relative">
      {/* Error/Warning indicator */}
      {(hasErrors || hasWarnings) && (
        <div
          className={`absolute -top-4 -left-4 w-5 h-5 rounded-full flex items-center justify-center z-10 ${hasErrors ? "bg-red-500" : "bg-yellow-500"}`}
        >
          <AlertCircle className="w-3 h-3 text-white" />
        </div>
      )}
      <div
        className={`
          w-32 h-32 rotate-45 origin-center
          border-2 bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/10
          transition-all duration-200
          ${
            hasErrors
              ? "border-red-500"
              : hasWarnings
                ? "border-yellow-500"
                : selected
                  ? "border-brand-secondary shadow-glow scale-105"
                  : "border-brand-secondary/40 hover:border-brand-secondary/60"
          }
        `}
      >
        <div className="absolute inset-0 -rotate-45 flex flex-col items-center justify-center p-2">
          <HelpCircle className="w-5 h-5 text-brand-secondary mb-1" />
          <p className="text-xs font-semibold text-center text-foreground leading-tight">
            {String(data.label || "")}
          </p>
        </div>
      </div>

      {/* Input Handle */}
      <AdvancedHandle
        type="target"
        position={Position.Left}
        id="input-1"
        percentage={50}
        isOutput={false}
      />

      {/* Yes Output Handle */}
      <AdvancedHandle
        type="source"
        position={Position.Top}
        id="yes"
        percentage={50}
        label="Yes"
        isOutput={true}
      />

      {/* No Output Handle */}
      <AdvancedHandle
        type="source"
        position={Position.Bottom}
        id="no"
        percentage={50}
        label="No"
        isOutput={true}
      />
    </div>
  );
});

DecisionNode.displayName = "DecisionNode";
