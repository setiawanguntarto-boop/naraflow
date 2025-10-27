import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Sparkles } from "lucide-react";

interface LlamaNodeProps {
  data: {
    label: string;
    description?: string;
    lastOutput?: string;
  };
  selected: boolean;
}

export function LlamaNode({ data, selected }: LlamaNodeProps) {
  const { label, description, lastOutput } = data;

  // Truncate last output for display
  const truncatedOutput = lastOutput
    ? lastOutput.length > 50
      ? lastOutput.substring(0, 50) + "..."
      : lastOutput
    : "No output yet";

  return (
    <div
      className={`
        relative min-w-[200px] min-h-[120px] rounded-xl shadow-lg border-2
        bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20
        border-purple-300 dark:border-purple-700
        ${selected ? "ring-2 ring-purple-400 dark:ring-purple-600" : ""}
        transition-all duration-200 hover:shadow-xl
      `}
    >
      {/* LLaMA Icon - Top Left */}
      <div className="absolute top-2 left-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
        🦙
      </div>

      {/* Node Content */}
      <div className="p-4 pt-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-700" />
          <span className="font-bold text-purple-900 dark:text-purple-100">{label}</span>
        </div>

        {/* Description/Prompt */}
        <div className="text-sm text-purple-900 dark:text-purple-100 mb-3 font-semibold">
          {description || "Configure prompt in node settings"}
        </div>

        {/* Last Output Badge */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg px-2 py-1 text-xs text-purple-700 dark:text-purple-300">
            <span className="font-medium">Last:</span> {truncatedOutput}
          </div>
        </div>
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-5 h-5 bg-purple-600 border-2 border-white dark:border-gray-800 cursor-pointer"
        style={{ top: "50%", width: "16px", height: "16px" }}
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-5 h-5 bg-purple-600 border-2 border-white dark:border-gray-800 cursor-pointer"
        style={{ top: "50%", width: "16px", height: "16px" }}
      />
    </div>
  );
}
