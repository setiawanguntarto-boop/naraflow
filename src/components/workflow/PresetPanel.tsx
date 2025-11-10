import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

export type PresetType = WorkflowPreset['id'];

export interface WorkflowPreset {
  id: string;
  emoji: string;
  title: string;
  description: string;
  prompt: string;
  color: string;
}

const presets: WorkflowPreset[] = [
  {
    id: "broiler",
    emoji: "🐔",
    title: "Budidaya Broiler",
    description: "Workflow peternakan ayam modern",
    prompt: "Workflow untuk budidaya broiler",
    color: "#BBF7D0", // pastel green (green-200)
  },
  {
    id: "udang",
    emoji: "🦐",
    title: "Budidaya Udang",
    description: "Proses budidaya udang berkelanjutan",
    prompt: "Workflow untuk budidaya udang",
    color: "#93C5FD", // pastel blue (blue-300)
  },
  {
    id: "singkong",
    emoji: "🌿",
    title: "Trading Singkong",
    description: "Alur verifikasi dan pencatatan",
    prompt: "Workflow untuk trading singkong",
    color: "#86EFAC", // pastel green variant (green-300)
  },
  {
    id: "sales",
    emoji: "📊",
    title: "Sales Canvasser",
    description: "Kunjungan dan validasi prospek",
    prompt: "Workflow untuk sales canvasser",
    color: "#FDBA74", // pastel orange (orange-300)
  },
  {
    id: "hotel",
    emoji: "🏨",
    title: "Manajemen Hotel",
    description: "Housekeeping dan reservasi",
    prompt: "Workflow untuk manajemen hotel",
    color: "#FCA5A5", // pastel red (red-300)
  },
  {
    id: "sampah",
    emoji: "♻️",
    title: "Bank Sampah",
    description: "Transaksi dan penimbangan",
    prompt: "Workflow untuk bank sampah",
    color: "#A7F3D0", // pastel emerald (emerald-200)
  },
];

interface PresetPanelProps {
  onSelect: (preset: WorkflowPreset) => void;
  selectedPresetId?: string | null;
}

export function PresetPanel({ onSelect, selectedPresetId }: PresetPanelProps) {
  return (
    <div className="w-full md:w-80 flex-shrink-0">
      <div className="bg-card rounded-2xl border border-border-light shadow-soft p-4 h-[420px] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm mb-1">
            <Building2 className="w-4 h-4 text-brand-primary" />
            Quick Templates
          </h3>
          <p className="text-xs text-foreground-muted">Pilih use-case untuk mulai</p>
        </div>

        {/* Scrollable Preset List */}
        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-2">
            {presets.map(preset => {
              const isSelected = selectedPresetId === preset.id;
              
              // Warna section box: hijau pastel untuk broiler, abu-abu pastel untuk lainnya (in progress)
              const sectionBgColor = preset.id === "broiler" 
                ? "bg-green-50 border-green-100" 
                : "bg-gray-50 border-gray-100";

              return (
                <Card
                  key={preset.id}
                  className={`cursor-pointer transition-all hover:shadow-md border-2 ${sectionBgColor} ${
                    isSelected
                      ? "ring-2 ring-brand-primary ring-offset-2"
                      : "hover:shadow-lg"
                  }`}
                  onClick={() => onSelect(preset)}
                >
                  <div className="p-3">
                    <div className="flex items-start gap-2 mb-1">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: preset.color }}
                      >
                        <span className="text-sm text-white">{preset.emoji}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-foreground">{preset.title}</p>
                          {preset.id !== "broiler" && (
                            <Badge variant="secondary" className="text-xs">Beta</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {preset.description}
                    </p>
                    {isSelected && (
                      <div className="mt-2 text-xs text-brand-primary font-medium">✓ Selected</div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
