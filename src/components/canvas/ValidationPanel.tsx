import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X,
  Info,
  Navigation,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useWorkflowState } from "@/hooks/useWorkflowState";
import { ValidationError, WorkflowValidator } from "@/utils/workflowValidation";
import { useReactFlow } from "@xyflow/react";
import { globalCanvasEventBus } from "@/hooks/useCanvasEventBus";

export const ValidationPanel = () => {
  const store = useWorkflowState() as any;
  const validationErrors: ValidationError[] = store.validationErrors || [];
  const showValidation: boolean = store.showValidation ?? true;
  const toggleValidation = store.toggleValidation?.bind(store) || (() => {});
  const validateWorkflow = store.validateWorkflow?.bind(store) || (() => {});
  const rf = useReactFlow() as any;
  const fitView = rf.fitView?.bind(rf) || (() => {});
  const selectNodes = rf.selectNodes?.bind(rf) || (() => {});
  const actions = store.actions;

  if (!showValidation) return null;

  const errorCount = validationErrors.filter(e => e.type === "error").length;
  const warningCount = validationErrors.filter(e => e.type === "warning").length;
  const isValid = errorCount === 0;

  // Function to focus on a specific node
  const handleFocusNode = (nodeId: string) => {
    if (!nodeId) return;

    // Select the node
    selectNodes([{ id: nodeId }]);

    // Focus the view on the node
    fitView({
      nodes: [{ id: nodeId }],
      duration: 500,
      padding: 0.2,
    });

    // Emit event to select the node in the state
    if (actions) {
      actions.selectNode(nodeId);
    }
  };

  // Function to open node configuration
  const handleFixNode = (nodeId: string) => {
    if (!nodeId) return;

    // Emit event to open node config
    globalCanvasEventBus.emit({
      type: "node:config-request",
      payload: { nodeId },
    });
  };

  return (
    <div className="absolute top-4 right-4 w-[420px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl shadow-2xl z-[1000] overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <h3 className="font-semibold text-foreground">Workflow Validation</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={toggleValidation}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          {errorCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              {errorCount} Error{errorCount !== 1 ? "s" : ""}
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge
              variant="secondary"
              className="gap-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
            >
              <AlertTriangle className="w-3 h-3" />
              {warningCount} Warning{warningCount !== 1 ? "s" : ""}
            </Badge>
          )}
          {isValid && (
            <Badge
              variant="secondary"
              className="gap-1 bg-green-500/10 text-green-600 border-green-500/20"
            >
              <CheckCircle2 className="w-3 h-3" />
              All checks passed
            </Badge>
          )}
        </div>

        {/* Summary */}
        {!isValid && (
          <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              <strong>Summary:</strong> Your workflow has {errorCount} issue
              {errorCount !== 1 ? "s" : ""} that need{errorCount !== 1 ? "" : "s"} to be fixed
              before deployment.
              {errorCount > 0 && (
                <span className="block mt-1 text-xs">
                  Click on each error below to see detailed instructions on how to fix it.
                </span>
              )}
            </p>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <Button onClick={validateWorkflow} variant="outline" size="sm" className="flex-1">
            Revalidate Workflow
          </Button>
          <Button
            onClick={() => {
              const state = useWorkflowState.getState();
              const nodes = Object.values(state.nodes);
              const edges = Object.values(state.edges);
              const { nodes: fixedNodes, edges: fixedEdges } = WorkflowValidator.autoFixWorkflow(nodes as any[], edges as any[]);
              const patchNodes: Record<string, any> = {};
              fixedNodes.forEach(n => (patchNodes[n.id] = n as any));
              const patchEdges: Record<string, any> = {};
              fixedEdges.forEach(e => (patchEdges[e.id as any] = e as any));
              state.actions.batchUpdate({ nodes: patchNodes, edges: patchEdges });
            }}
            variant="default"
            size="sm"
            className="flex-1"
          >
            Auto-Fix
          </Button>
          <Button onClick={toggleValidation} variant="ghost" size="sm" className="flex-1">
            Close
          </Button>
        </div>

        <ScrollArea className="h-96 max-h-96">
          <div className="space-y-2">
            {validationErrors.length === 0 ? (
              <div className="text-center py-8 text-foreground-muted text-sm">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>Your workflow is valid!</p>
              </div>
            ) : (
              validationErrors.map(error => (
                <ValidationErrorItem
                  key={error.id}
                  error={error}
                  onFocusNode={handleFocusNode}
                  onFixNode={handleFixNode}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

// Get fix suggestion based on error
const getFixSuggestion = (error: ValidationError): string => {
  const message = error.message.toLowerCase();

  if (message.includes("start node")) {
    return "Add a Start node from the Node Library to begin your workflow.";
  }
  if (message.includes("end node")) {
    return "Add an End node from the Node Library to complete your workflow.";
  }
  if (message.includes("orphaned") || message.includes("not connected")) {
    return "Connect this node to other nodes in the workflow by dragging from its output port to another node's input port.";
  }
  if (message.includes("no outgoing connection")) {
    return "This node needs at least one outgoing connection. Drag from its output port to connect it to another node.";
  }
  if (message.includes("no incoming connection")) {
    return "This node needs an incoming connection. Connect it to the previous node in your workflow.";
  }
  if (message.includes("label is required")) {
    return "Double-click this node and add a descriptive label.";
  }
  if (message.includes("duplicate label")) {
    return "Consider renaming nodes to have unique labels for better workflow clarity.";
  }
  if (message.includes("decision") && message.includes("yes")) {
    return 'Add a connection from the "yes" output port of this decision node.';
  }
  if (message.includes("decision") && message.includes("no")) {
    return 'Add a connection from the "no" output port of this decision node.';
  }
  if (message.includes("does not lead to an end")) {
    return "This path needs to connect to an End node. Trace the path and add connections to complete the workflow.";
  }

  return "Review this node's configuration and connections to resolve the issue.";
};

interface ValidationErrorItemProps {
  error: ValidationError;
  onFocusNode?: (nodeId: string) => void;
  onFixNode?: (nodeId: string) => void;
}

const ValidationErrorItem = ({ error, onFocusNode, onFixNode }: ValidationErrorItemProps) => {
  const Icon = error.type === "error" ? AlertCircle : AlertTriangle;
  const colorClass = error.type === "error" ? "text-red-500" : "text-yellow-500";
  const bgClass = error.type === "error" ? "bg-red-500/10" : "bg-yellow-500/10";

  const severityColors: Record<string, string> = {
    critical: "text-red-600",
    high: "text-orange-500",
    medium: "text-yellow-500",
    low: "text-blue-500",
  };

  const fixSuggestion = getFixSuggestion(error);
  const hasNode = !!error.nodeId;
  const isFixable =
    error.nodeId &&
    (error.message.toLowerCase().includes("label") ||
      error.message.toLowerCase().includes("missing") ||
      error.message.toLowerCase().includes("configuration"));

  return (
    <div
      className={`p-3 rounded-lg border ${bgClass} ${error.type === "error" ? "border-red-500/20" : "border-yellow-500/20"}`}
    >
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colorClass}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-foreground">{error.message}</p>
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${severityColors[error.severity] || "text-gray-500"} bg-current/10`}
            >
              {error.severity}
            </span>
          </div>

          {/* Fix Suggestion */}
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <span className="font-semibold">How to fix:</span> {fixSuggestion}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {hasNode && (
            <div className="flex gap-2 mt-3">
              {onFocusNode && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-7"
                  onClick={() => error.nodeId && onFocusNode(error.nodeId)}
                >
                  <Navigation className="w-3 h-3 mr-1" />
                  Go to Node
                </Button>
              )}
              {onFixNode && isFixable && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 text-xs h-7"
                  onClick={() => error.nodeId && onFixNode(error.nodeId)}
                >
                  <Wrench className="w-3 h-3 mr-1" />
                  Fix
                </Button>
              )}
            </div>
          )}

          {error.nodeId && (
            <p className="text-xs text-foreground-muted mt-2 font-mono">
              Node ID: {error.nodeId.substring(0, 12)}...
            </p>
          )}
          {error.edgeId && (
            <p className="text-xs text-foreground-muted mt-1 font-mono">
              Edge ID: {error.edgeId.substring(0, 12)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
