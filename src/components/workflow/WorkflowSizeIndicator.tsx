import { useMemo } from "react";
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Node } from "@xyflow/react";
import { useWorkflowSizeCalculator } from "@/hooks/useWorkflowSizeCalculator";
import { cn } from "@/lib/utils";

interface WorkflowSizeIndicatorProps {
  nodes: Record<string, Node>;
  className?: string;
}

export function WorkflowSizeIndicator({ nodes, className }: WorkflowSizeIndicatorProps) {
  const sizeInfo = useWorkflowSizeCalculator(nodes);

  // Determine status based on workflow size
  const status = useMemo(() => {
    const totalMB = sizeInfo.totalSize / (1024 * 1024);
    
    if (totalMB < 0.5) {
      return { color: "text-green-600", icon: CheckCircle2, label: "Lightweight" };
    } else if (totalMB < 1.5) {
      return { color: "text-yellow-600", icon: Activity, label: "Medium" };
    } else {
      return { color: "text-red-600", icon: AlertTriangle, label: "Heavy" };
    }
  }, [sizeInfo.totalSize]);

  const StatusIcon = status.icon;

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <StatusIcon className={cn("w-4 h-4", status.color)} />
      <span className="text-muted-foreground">
        Workflow: <span className={cn("font-medium", status.color)}>{sizeInfo.formattedSize}</span>
      </span>
      <span className="text-muted-foreground">•</span>
      <span className="text-muted-foreground">
        {sizeInfo.nodeCount} nodes{sizeInfo.heavyNodeCount > 0 && ` (${sizeInfo.heavyNodeCount} heavy)`}
      </span>
    </div>
  );
}

