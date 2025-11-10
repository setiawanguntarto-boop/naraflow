import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Node } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nodeTypeRegistry } from "@/lib/nodeTypeRegistry";
import { SmartMetricsPanel } from "./SmartMetricsPanel";

interface MetricsInputPanelProps {
  node: Node | null;
  onClose: () => void;
  onUpdateMetrics: (nodeId: string, metrics: string[]) => void;
}

export const MetricsInputPanel = ({ node, onClose, onUpdateMetrics }: MetricsInputPanelProps) => {
  // Check if node has v3 metrics definition
  const nodeType = node ? nodeTypeRegistry.getNodeType(node.type || "") : null;
  const hasV3Metrics = nodeType?.metrics?.enabled;

  // If node has v3 metrics, use SmartMetricsPanel
  if (hasV3Metrics) {
    return <SmartMetricsPanel node={node} onClose={onClose} onUpdateMetrics={onUpdateMetrics} />;
  }

  // Otherwise, use legacy metrics input panel
  const [metrics, setMetrics] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; type: "bot" | "user" }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (node) {
      const existingMetrics = (node.data.metrics as string[]) || [];
      setMetrics(existingMetrics);
      setMessages([
        {
          text: "Halo! Sebutkan metrik apa saja yang ingin kamu ukur? Contoh: Berat Pakan, Jumlah Kematian, Suhu Kandang.",
          type: "bot",
        },
      ]);
    }
  }, [node]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputValue.trim() === "") {
      if (metrics.length > 0) {
        setMessages(prev => [
          ...prev,
          {
            text: `Terima kasih! Berikut metrik yang akan diukur: ${metrics.join(", ")}.`,
            type: "bot",
          },
          { text: "Metrik berhasil disimpan! Kamu bisa menutup panel ini.", type: "bot" },
        ]);
        if (node) {
          onUpdateMetrics(node.id, metrics);
        }
      } else {
        setMessages(prev => [...prev, { text: "Tidak ada metrik yang dimasukkan.", type: "bot" }]);
      }
      return;
    }

    const newMetric = inputValue.trim();
    setMessages(prev => [
      ...prev,
      { text: newMetric, type: "user" },
      {
        text: `Baik, saya akan mencatat metrik '${newMetric}'. Ada lagi? (Tekan Enter kosong jika sudah selesai)`,
        type: "bot",
      },
    ]);

    const updatedMetrics = [...metrics, newMetric];
    setMetrics(updatedMetrics);

    // Update node label immediately
    if (node) {
      onUpdateMetrics(node.id, updatedMetrics);
    }

    setInputValue("");
  };

  if (!node) return null;

  return (
    <div className="fixed bottom-6 right-6 w-[360px] bg-card border border-border rounded-2xl shadow-strong flex flex-col overflow-hidden z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background-soft">
        <div>
          <h3 className="font-semibold text-foreground">Input Metrik</h3>
          <p className="text-xs text-foreground-muted">{String(node.data.label || "Node")}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 p-4 max-h-[400px] overflow-y-auto bg-background-soft space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`px-3 py-2 rounded-xl max-w-[85%] text-sm ${
              msg.type === "bot"
                ? "bg-brand-primary/10 text-foreground self-start"
                : "bg-brand-secondary/10 text-foreground self-end ml-auto"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border p-3 bg-card">
        <Input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Ketik metrik... (Enter untuk kirim)"
          className="w-full"
          autoFocus
        />
      </form>
    </div>
  );
};
