import { MapPin, Database, Wifi, CheckSquare, FileText, Send, HelpCircle } from 'lucide-react';
import { Node } from '@xyflow/react';

const toolboxItems = [
  { label: 'Pilih Lokasi', icon: 'map-pin', IconComponent: MapPin, type: 'default' },
  { label: 'Input Data', icon: 'database', IconComponent: Database, type: 'default' },
  { label: 'Timbang (IoT)', icon: 'wifi', IconComponent: Wifi, type: 'default' },
  { label: 'Validasi Data', icon: 'check-square', IconComponent: CheckSquare, type: 'default' },
  { label: 'Buat PDF', icon: 'file-text', IconComponent: FileText, type: 'default' },
  { label: 'Notifikasi', icon: 'send', IconComponent: Send, type: 'default' },
  { label: 'Keputusan', icon: 'help-circle', IconComponent: HelpCircle, type: 'decision' },
];

export const ToolboxPanel = () => {
  const handleDragStart = (event: React.DragEvent, nodeData: any) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    
    // Add visual feedback
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (event: React.DragEvent) => {
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.style.opacity = '1';
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 text-sm font-medium">
      {toolboxItems.map((item, idx) => {
        const Icon = item.IconComponent;
        return (
          <div
            key={idx}
            draggable
            onDragStart={(e) => handleDragStart(e, {
              label: item.label,
              icon: item.icon,
              type: item.type,
            })}
            onDragEnd={handleDragEnd}
            className={`
              flex items-center gap-2 p-2.5 rounded-lg 
              cursor-grab active:cursor-grabbing transition-all
              ${item.type === 'decision' 
                ? 'bg-brand-secondary/10 hover:bg-brand-secondary/20 text-brand-secondary' 
                : 'bg-surface-muted hover:bg-surface-muted/80 text-foreground'
              }
            `}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};
