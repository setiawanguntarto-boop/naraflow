import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Loader2, Trash2, Navigation, Wrench, CheckCircle2, AlertCircle, AlertTriangle, Info, Rocket } from "lucide-react";
import { useGenerationStore } from "@/store/generationStore";
import { useState } from "react";
import { useWorkflowState } from "@/hooks/useWorkflowState";
import { WorkflowValidator } from "@/utils/workflowValidation";
import { useReactFlow } from "@xyflow/react";
import { globalCanvasEventBus } from "@/hooks/useCanvasEventBus";
import { useEffect } from "react";

export const WorkflowAssistant = () => {
  const [input, setInput] = useState("");
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
  const [filters, setFilters] = useState<Record<number, "all" | "errors" | "warnings">>({});
  const [chatContext, setChatContext] = useState<"idle" | "validation_offered" | "validation_done" | "detail_offered" | "fix_offered">("idle");
  const { messages, pushMessage, isGenerating, reset } = useGenerationStore();
  const store = useWorkflowState() as any;
  const rf = useReactFlow() as any;

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;

    const message = input;
    setInput("");
    pushMessage({
      role: "user",
      text: message,
    });

    routeIntent(message);
  };

  const routeIntent = (message: string) => {
    const lower = message.trim().toLowerCase();
    
    // Natural responses to validation offer
    if (chatContext === "validation_offered" && (lower === "yes" || lower === "ok" || lower === "sure" || lower === "please" || lower === "go ahead")) {
      return runValidation();
    }
    
    // Commands
    if (lower === "/help") return showHelp();
    if (lower === "/validate" || lower.includes("validate workflow")) return runValidation();
    if (lower === "/fix") return autoFix();
    if (lower.startsWith("/explain")) return explainSelected();
    if (lower.startsWith("/deploy")) return showDeploymentChecklist();

    // Natural language triggers
    if (lower.includes("why") && lower.includes("error")) return runValidation();
    if (lower.includes("how do i deploy") || lower.includes("deploy agent")) return showDeploymentChecklist();
    if (lower.includes("fix") && (lower.includes("auto") || lower.includes("issue"))) return autoFix();

    // Default response
    pushMessage({ role: "assistant", text: "I'm here to help. Try typing /validate to check your workflow, or /help to see all commands." });
  };

  const runValidation = () => {
    const state = useWorkflowState.getState();
    state.validateWorkflow?.();
    // Pull latest validation errors from store
    const errors = (state.validationErrors || []) as any[];
    const errorCount = errors.filter(e => e.type === "error").length;
    const warningCount = errors.filter(e => e.type === "warning").length;
    const summary = `Found ${errorCount} error${errorCount !== 1 ? "s" : ""} and ${warningCount} warning${warningCount !== 1 ? "s" : ""} in your workflow.`;

    pushMessage({
      role: "assistant",
      text: summary,
      validationResults: {
        summary,
        errors: errors as any,
      },
    });

    // Offer to show details if there are errors
    if (errorCount > 0) {
      pushMessage({
        role: "assistant",
        text: "Would you like to see details about these errors? Click 'Details' or ask me for more info.",
      });
      setChatContext("validation_done");
    } else {
      setChatContext("idle");
    }
  };

  const autoFix = () => {
    const state = useWorkflowState.getState();
    const before = (state.validationErrors || []) as any[];
    const beforeErr = before.filter(e => e.type === "error").length;
    const beforeWarn = before.filter(e => e.type === "warning").length;

    pushMessage({
      role: "assistant",
      text: "Applying auto-fix to common issues...",
    });

    const nodes = Object.values(state.nodes);
    const edges = Object.values(state.edges);
    const { nodes: fixedNodes, edges: fixedEdges, changes } = WorkflowValidator.autoFixWorkflow(nodes as any[], edges as any[]);
    const patchNodes: Record<string, any> = {};
    fixedNodes.forEach(n => (patchNodes[n.id] = n as any));
    const patchEdges: Record<string, any> = {};
    fixedEdges.forEach(e => (patchEdges[e.id as any] = e as any));
    state.actions.batchUpdate({ nodes: patchNodes, edges: patchEdges });

    // Revalidate and report
    setTimeout(() => {
      state.validateWorkflow?.();
      const after = (useWorkflowState.getState().validationErrors || []) as any[];
      const afterErr = after.filter(e => e.type === "error").length;
      const afterWarn = after.filter(e => e.type === "warning").length;
      
      // Show what was fixed
      const fixes = changes.slice(0, 3).map(c => `• ${c.description}`).join("\n");
      const more = changes.length > 3 ? `\n…and ${changes.length - 3} more` : "";
      const summary = `Auto-fix complete! Errors: ${beforeErr} → ${afterErr}, warnings: ${beforeWarn} → ${afterWarn}.\n\n${fixes}${more}`;

      pushMessage({
        role: "assistant",
        text: summary,
        validationResults: { summary, errors: after as any },
      });
      setChatContext("idle");
    }, 100);
  };

  const focusNode = (nodeId?: string) => {
    if (!nodeId) return;
    const fitView = rf.fitView?.bind(rf) || (() => {});
    const selectNodes = rf.selectNodes?.bind(rf) || (() => {});
    selectNodes([{ id: nodeId }]);
    fitView({ nodes: [{ id: nodeId }], duration: 500, padding: 0.2 });
    store.actions?.selectNode(nodeId);
  };

  const openNodeConfig = (nodeId?: string) => {
    if (!nodeId) return;
    globalCanvasEventBus.emit({ type: "node:config-request", payload: { nodeId } });
  };

  const getFixSuggestion = (message: string): string => {
    const m = message.toLowerCase();
    if (m.includes("start node")) return "Add a Start node from the Node Library to begin your workflow.";
    if (m.includes("end node")) return "Add an End node from the Node Library to complete your workflow.";
    if (m.includes("orphaned") || m.includes("not connected")) return "Connect this node to other nodes by dragging from its output port.";
    if (m.includes("no outgoing connection")) return "Add at least one outgoing connection to another node.";
    if (m.includes("no incoming connection")) return "Connect this node from the previous node in your workflow.";
    if (m.includes("label is required")) return "Open the node and add a descriptive label.";
    if (m.includes("duplicate label")) return "Rename nodes so labels are unique.";
    if (m.includes("decision") && m.includes("yes")) return 'Add a connection from the "yes" output port.';
    if (m.includes("decision") && m.includes("no")) return 'Add a connection from the "no" output port.';
    if (m.includes("does not lead to an end")) return "Connect this path to an End node.";
    return "Review this node's configuration and connections to resolve the issue.";
  };

  // Stage 1: Natural greeting and context-aware start
  useEffect(() => {
    if (messages.length > 0) return;
    const state = useWorkflowState.getState() as any;
    const nodeCount = Object.keys(state.nodes || {}).length;
    const edgeCount = (state.edges || []).length;
    const llamaConnected = !!state.llamaConfig?.connected;
    
    pushMessage({ 
      role: "assistant", 
      text: `Hi there, I'm trying to help. Would you like me to validate your current workflow? Type /validate to check your workflow or /help to see all commands.` 
    });
    
    setChatContext("validation_offered");
  }, []);

  const explainSelected = () => {
    const state = useWorkflowState.getState() as any;
    const selectedId = state.uiState?.selectedNodeId || state.selectedNodeId || null;
    if (!selectedId) {
      pushMessage({ role: "assistant", text: "No node selected. Click a node and try /explain again." });
      return;
    }
    const node = state.nodes?.[selectedId];
    if (!node) {
      pushMessage({ role: "assistant", text: "Couldn't find the selected node in state." });
      return;
    }
    const title = node.data?.title || node.data?.label || node.type || "Node";
    const desc = node.data?.description || "This node is part of your workflow.";
    const hasOutgoing = (state.edges || []).some((e: any) => e.source === node.id);
    const hasIncoming = (state.edges || []).some((e: any) => e.target === node.id);
    const tips: string[] = [];
    if (!hasIncoming) tips.push("Consider connecting an incoming edge to this node.");
    if (!hasOutgoing) tips.push("Consider connecting an outgoing edge to continue flow.");
    if (!node.data?.title) tips.push("Add a descriptive title to improve clarity.");

    pushMessage({
      role: "assistant",
      text: `📘 ${title}\n\n${desc}` + (tips.length ? `\n\nTips:\n- ${tips.join("\n- ")}` : ""),
    });
  };

  const showHelp = () => {
    pushMessage({
      role: "assistant",
      text:
        "Common actions:\n" +
        "- /validate — check your workflow for issues\n" +
        "- /fix — auto-fix common issues\n" +
        "- /explain — explain the selected node\n" +
        "- /deploy — deployment checklist",
    });
  };

  const showDeploymentChecklist = () => {
    const state = useWorkflowState.getState() as any;
    const nodesCount = Object.keys(state.nodes || {}).length;
    const edgesCount = (state.edges || []).length;
    const llamaConnected = !!state.llamaConfig?.connected;
    const steps = [
      `${llamaConnected ? "✅" : "⚠️"} Connect LLaMA or set cloud endpoint`,
      `${nodesCount > 0 ? "✅" : "⚠️"} Ensure workflow has nodes and paths to End`,
      "✅ Validate and fix errors (use /validate)",
      "✅ Configure node metrics and secrets",
      "✅ Choose deployment target and publish",
    ];
    pushMessage({
      role: "assistant",
      text: `🚀 Deployment checklist:\n- ${steps.join("\n- ")}`,
    });
  };

  return (
    <div className="flex-1 overflow-auto flex flex-col bg-white">
      {/* Header with Clear Button */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-end bg-gray-50">
        <Button
          onClick={() => reset()}
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-900"
          title="Clear chat"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 ? (
          <div className="text-gray-400 text-sm italic">
            Hi! I can help you design workflows. Describe what you want to build and I'll generate
            it for you.
          </div>
        ) : (
          messages.map((message, i) => (
            <div key={i} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] p-3 rounded-lg text-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                <div className="whitespace-pre-wrap">{message.text}</div>
                {message.validationResults && message.validationResults.errors.length > 0 && (
                  <div className="mt-2 p-2 bg-white/50 rounded border border-gray-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold">Issues Found:</span>
                      <div className="flex gap-1">
                        <Button size="xs" variant="ghost" onClick={() => setExpandedCards(s => ({ ...s, [i]: !s[i] }))}>
                          {expandedCards[i] ? "Hide" : "Details"}
                        </Button>
                      </div>
                    </div>
                    {expandedCards[i] && (
                      <div className="space-y-1">
                        {message.validationResults.errors.map((e, idx) => (
                          <div key={idx} className="text-xs py-1">
                            {e.type === "error" ? "❌" : "⚠️"} <span className="font-medium">{e.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground p-3 rounded-lg flex items-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating workflow...
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <Input
            placeholder="Describe your workflow or ask for help..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isGenerating}
            className="flex-1"
          />
          <Button onClick={handleSend} size="sm" disabled={isGenerating || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

