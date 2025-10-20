import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileJson, Image as ImageIcon, X } from 'lucide-react';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';

export const ExportImportPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { exportWorkflowJSON, importWorkflowJSON } = useWorkflowState();
  
  const handleExportJSON = () => {
    try {
      const json = exportWorkflowJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `workflow-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Workflow exported as JSON');
    } catch (error) {
      toast.error('Failed to export workflow');
      console.error(error);
    }
  };
  
  const handleExportPNG = async () => {
    try {
      const canvas = document.querySelector('.react-flow__viewport') as HTMLElement;
      if (!canvas) {
        throw new Error('Canvas not found');
      }
      
      toast.info('Generating image...', { duration: 2000 });
      
      const dataUrl = await toPng(canvas, {
        quality: 1,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });
      
      const link = document.createElement('a');
      link.download = `workflow-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success('Workflow exported as PNG');
    } catch (error) {
      toast.error('Failed to export image');
      console.error(error);
    }
  };
  
  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        importWorkflowJSON(json);
        toast.success('Workflow imported successfully');
        setIsOpen(false);
      } catch (error) {
        toast.error('Failed to import workflow');
        console.error(error);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <Download className="w-4 h-4 mr-1" />
        Export/Import
      </Button>
    );
  }
  
  return (
    <div className="absolute top-4 left-4 bg-card border border-border rounded-xl shadow-lg p-4 z-10 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Export / Import</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <Button
          onClick={handleExportJSON}
          variant="outline"
          className="w-full justify-start"
        >
          <FileJson className="w-4 h-4 mr-2" />
          Export as JSON
        </Button>
        
        <Button
          onClick={handleExportPNG}
          variant="outline"
          className="w-full justify-start"
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Export as PNG
        </Button>
        
        <div className="border-t border-border my-2" />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="w-full justify-start"
        >
          <Upload className="w-4 h-4 mr-2" />
          Import JSON
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportJSON}
          className="hidden"
        />
      </div>
      
      <div className="mt-4 p-3 bg-background rounded-lg text-xs text-foreground-muted">
        <p>💡 <strong>Tip:</strong> Save your workflows as JSON to preserve all data, or export as PNG for sharing visual previews.</p>
      </div>
    </div>
  );
};
