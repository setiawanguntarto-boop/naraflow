import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, RotateCcw, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { compileWorkflowToFSM, stepFSM } from "@/lib/fsm/compileWorkflowToFSM";

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: number;
}

interface WhatsAppSimulationPanelProps {
  nodes: any[];
  edges: any[];
  onSimulate?: () => void;
}

export function WhatsAppSimulationPanel({
  nodes,
  edges,
  onSimulate,
}: WhatsAppSimulationPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [vars, setVars] = useState<Record<string, any>>({});
  const [quickOptions, setQuickOptions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [fsm, setFsm] = useState<any | null>(null);
  const [fsmStateId, setFsmStateId] = useState<string | null>(null);
  // Derive agent header info
  const agentName =
    nodes.find(n => (n?.type || "").toLowerCase() === "start")?.data?.label ||
    nodes[0]?.data?.label ||
    "Rahayu";
  const agentIcon = "🐔"; // simple emoji avatar
  const agentSubtitle = "online";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Compile FSM whenever graph changes
  useEffect(() => {
    try {
      if (nodes && edges) {
        const compiled = compileWorkflowToFSM(nodes, edges);
        setFsm(compiled);
        setFsmStateId(compiled.startId);
      }
    } catch (e) {
      console.error("Failed to compile FSM", e);
    }
  }, [nodes, edges]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: inputMessage,
      sender: "user",
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    const incoming = inputMessage;
    setInputMessage("");

    // If FSM is waiting for input, store and continue traversal
    if (awaitingInput && currentNodeId) {
      const node = nodes.find(n => n.id === currentNodeId);

      // Parsing helper for key:value, comma-separated pairs
      const parseKeyValueLine = (text: string): Record<string, any> => {
        const result: Record<string, any> = {};
        text
          .split(",")
          .map(p => p.trim())
          .filter(Boolean)
          .forEach(p => {
            const [k, ...rest] = p.split(":");
            if (!k || rest.length === 0) return;
            const key = k.trim().toLowerCase().replace(/\s+/g, "_");
            const valueRaw = rest.join(":").trim();
            const num = Number(valueRaw);
            result[key] = isNaN(num) ? valueRaw : num;
          });
        return result;
      };

      // Decide how to store input
      const key = node?.data?.fieldKey || node?.data?.label || node?.data?.title || `input_${currentNodeId}`;
      let updates: Record<string, any> = {};
      if (node?.data?.parse === "kv" || /[:].*,/.test(incoming)) {
        updates = parseKeyValueLine(incoming);
      } else {
        updates[String(key).replace(/\s+/g, "_").toLowerCase()] = incoming;
      }

      setVars(prev => ({ ...prev, ...updates }));
      setAwaitingInput(false);
      setQuickOptions([]);
      // Step FSM using user input
      if (fsm) {
        const res = stepFSM(fsm, fsmStateId || currentNodeId, incoming, { ...vars, ...updates });
        for (const out of res.outputs) {
          pushMsg(out, "agent");
        }
        setAwaitingInput(res.awaitingInput);
        setFsmStateId(res.nextStateId);
        setVars(res.variables);
      }
    } else if (fsm) {
      // Not awaiting explicit input yet (user typed first). Feed message to FSM.
      const res = stepFSM(fsm, fsmStateId, incoming, vars);
      for (const out of res.outputs) {
        pushMsg(out, "agent");
      }
      setAwaitingInput(res.awaitingInput);
      setFsmStateId(res.nextStateId);
      setVars(res.variables);
    }
  };

  // Helpers to classify node types from various schemas
  const getKind = (node: any): "start" | "end" | "input" | "output" | "process" | "condition" | "unknown" => {
    const t = (node?.type || "").toString().toLowerCase();
    const label = (node?.data?.label || node?.data?.title || "").toString().toLowerCase();
    if (t === "start" || label.includes("start")) return "start";
    if (t === "end" || label.includes("end")) return "end";
    if (t.includes("ask") || t.includes("input") || t.includes("trigger") || label.includes("ask") || label.includes("input")) return "input";
    if (t.includes("send") || t.includes("output") || label.includes("send") || label.includes("whatsapp") || label.includes("message")) return "output";
    if (t.includes("condition") || t.includes("decision") || label.includes("condition") || label.includes("decision")) return "condition";
    if (t.includes("process") || t.includes("ai") || t.includes("calculate") || label.includes("process") || label.includes("calculate") || label.includes("analysis")) return "process";
    return "unknown";
  };

  const idToNode = new Map<string, any>();
  const outgoingOf = (id: string) => edges.filter(e => e.source === id);
  const incomingTargets = new Set(edges.map(e => e.target));

  const pushMsg = (text: string, sender: "user" | "agent" = "agent") =>
    setMessages(prev => [
      ...prev,
      { id: `msg-${Date.now()}-${Math.random()}`, text, sender, timestamp: Date.now() },
    ]);

  // Replace {{var_name}} with stored variables
  const formatText = (text: string) =>
    String(text).replace(/\{\{\s*([^}]+)\s*\}\}/g, (_m, p1) => {
      const k = String(p1).replace(/\s+/g, "_").toLowerCase();
      const v = (vars as any)[k];
      return v !== undefined && v !== null ? String(v) : "";
    });

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  // remove old continueFrom; now handled by FSM

  const handleRunSimulation = async () => {
    if (!nodes.length || !edges.length) {
      toast.error("Add nodes to the workflow first");
      return;
    }

    setIsSimulating(true);
    onSimulate?.();

    // Reset and start header message
    setMessages([
      {
        id: "sim-start",
        text: "🧪 Starting workflow simulation...",
        sender: "agent",
        timestamp: Date.now(),
      },
    ]);

    // Build graph helpers
    idToNode.clear();
    nodes.forEach(n => idToNode.set(n.id, n));

    // Find entry node (start | input | node without incoming edges)
    const entry =
      nodes.find(n => getKind(n) === "start") ||
      nodes.find(n => getKind(n) === "input") ||
      nodes.find(n => !incomingTargets.has(n.id)) ||
      nodes[0];

    setVars({});
    setCurrentNodeId(entry.id);
    if (fsm) {
      const res = stepFSM(fsm, entry.id, null, {});
      for (const out of res.outputs) {
        pushMsg(out, "agent");
      }
      setAwaitingInput(res.awaitingInput);
      setFsmStateId(res.nextStateId);
      setVars(res.variables);
      toast.success("Interactive simulation started. Reply to proceed.");
    } else {
      toast.error("Failed to compile workflow to FSM");
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="bg-card rounded-2xl border border-border-light shadow-soft flex flex-col overflow-hidden">
      {/* WhatsApp-like Header */}
      <div className="px-4 py-3 bg-[#075E54] text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 6.5l-6 6 6 6" />
          </svg>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">
              <span className="select-none">{agentIcon}</span>
            </div>
            <div className="leading-tight">
              <div className="font-semibold">{agentName}</div>
              <div className="text-[10px] opacity-90">{agentSubtitle}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRunSimulation} disabled={isSimulating} size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
            {isSimulating ? (
              "⏳"
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" /> Simulate
              </>
            )}
          </Button>
          <Button onClick={handleClearChat} size="sm" variant="ghost" className="text-white hover:bg-white/10">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea
        className="flex-1 p-4"
        style={{
          backgroundColor: "#E5DDD5",
          backgroundImage:
            "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARMAAAARCAYAAAA/I68vAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAAHVSURBVHja7dAxAQAACMCg2f9Pk4HwItgGSSGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCF8t3sB1eEk4/gAAAAASUVORK5CYII=')",
          backgroundRepeat: "repeat",
        }}
      >
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Start a conversation or run simulation</p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.sender === "user"
                      ? "bg-green-500 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyPress={e => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSimulating}
            className="bg-green-500 hover:bg-green-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Simulate WhatsApp conversations to test your workflow
        </p>
      </div>
    </div>
  );
}
