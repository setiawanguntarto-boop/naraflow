import { X, Lightbulb, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ActivityItem {
  ts: string;
  text: string;
}

export interface SuggestionItem {
  id: string;
  text: string;
  action?: () => void;
}

interface LiveAssistantPanelProps {
  open: boolean;
  onClose: () => void;
  activity: ActivityItem[];
  suggestions: SuggestionItem[];
  messages?: { role: "user" | "assistant"; content: string }[];
  onSend?: (text: string) => void;
  isThinking?: boolean;
}

export function LiveAssistantPanel({ open, onClose, activity, suggestions, messages = [], onSend, isThinking = false }: LiveAssistantPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold">Live Assistance</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Suggestions */}
      <div className="p-4 border-b border-border space-y-2">
        <h4 className="text-sm font-medium">Suggestions</h4>
        {suggestions.length === 0 && (
          <p className="text-xs text-muted-foreground">No suggestions right now. Keep building!</p>
        )}
        <div className="space-y-2">
          {suggestions.map(s => (
            <div key={s.id} className="p-2 rounded-md border border-border bg-muted/30 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-600" />
              <div className="text-xs flex-1">{s.text}</div>
              {s.action && (
                <Button size="sm" variant="secondary" onClick={s.action}>Apply</Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="p-4 flex-1 overflow-y-auto">
        <h4 className="text-sm font-medium mb-2">Activity</h4>
        <div className="space-y-2">
          {activity.map((a, idx) => (
            <div key={idx} className="text-xs text-foreground flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{new Date(a.ts).toLocaleTimeString()}</span>
              <span>•</span>
              <span>{a.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="p-4 border-t border-border space-y-2">
        <h4 className="text-sm font-medium">Ask Assistant</h4>
        <div className="max-h-40 overflow-y-auto space-y-2">
          {messages.map((m, i) => (
            <div key={i} className={`text-xs p-2 rounded-md ${m.role === "user" ? "bg-primary/10 text-primary" : "bg-muted/40"}`}>
              {m.content}
            </div>
          ))}
          {isThinking && <div className="text-xs text-muted-foreground">Assistant is typing…</div>}
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Tanyakan tentang canvas, node, atau konfigurasi…" onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = (e.target as HTMLInputElement).value.trim();
              if (val && onSend) { onSend(val); (e.target as HTMLInputElement).value = ''; }
            }
          }} />
          <Button size="sm" onClick={() => {
            const el = document.querySelector<HTMLInputElement>("#live-assist-input");
          }}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LiveAssistantPanel;


