import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2 } from 'lucide-react';

export interface WorkflowPreset {
  id: string;
  emoji: string;
  title: string;
  description: string;
  prompt: string;
}

const presets: WorkflowPreset[] = [
  {
    id: 'broiler',
    emoji: '🐔',
    title: 'Budidaya Broiler',
    description: 'Workflow peternakan ayam modern',
    prompt: 'Workflow untuk budidaya broiler',
  },
  {
    id: 'udang',
    emoji: '🦐',
    title: 'Budidaya Udang',
    description: 'Proses budidaya udang berkelanjutan',
    prompt: 'Workflow untuk budidaya udang',
  },
  {
    id: 'singkong',
    emoji: '🌿',
    title: 'Trading Singkong',
    description: 'Alur verifikasi dan pencatatan',
    prompt: 'Workflow untuk trading singkong',
  },
  {
    id: 'sales',
    emoji: '📊',
    title: 'Sales Canvasser',
    description: 'Kunjungan dan validasi prospek',
    prompt: 'Workflow untuk sales canvasser',
  },
  {
    id: 'hotel',
    emoji: '🏨',
    title: 'Manajemen Hotel',
    description: 'Housekeeping dan reservasi',
    prompt: 'Workflow untuk manajemen hotel',
  },
  {
    id: 'sampah',
    emoji: '♻️',
    title: 'Bank Sampah',
    description: 'Transaksi dan penimbangan',
    prompt: 'Workflow untuk bank sampah',
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
          <p className="text-xs text-foreground-muted">
            Pilih use-case untuk mulai
          </p>
        </div>

        {/* Scrollable Preset List */}
        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-2">
            {presets.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              
              return (
                <Card
                  key={preset.id}
                  className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                    isSelected
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-transparent hover:border-border'
                  }`}
                  onClick={() => onSelect(preset)}
                >
                  <div className="p-3">
                    <div className="flex items-start gap-2 mb-1">
                      <span className="text-lg">{preset.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">
                          {preset.title}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {preset.description}
                    </p>
                    {isSelected && (
                      <div className="mt-2 text-xs text-brand-primary font-medium">
                        ✓ Selected
                      </div>
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

