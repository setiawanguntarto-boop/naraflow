import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const KeyboardShortcutsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const shortcuts = [
    { keys: ['Ctrl', 'C'], action: 'Copy selected nodes' },
    { keys: ['Ctrl', 'V'], action: 'Paste nodes' },
    { keys: ['Ctrl', 'D'], action: 'Duplicate selection' },
    { keys: ['Ctrl', 'Z'], action: 'Undo' },
    { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo' },
    { keys: ['Ctrl', 'Y'], action: 'Redo (alternative)' },
    { keys: ['Delete'], action: 'Delete selected' },
    { keys: ['Shift', 'Click'], action: 'Multi-select nodes' },
    { keys: ['Drag'], action: 'Box selection' },
    { keys: ['1-4'], action: 'Change edge type (when edge selected)' },
    { keys: ['D'], action: 'Toggle dashed line (when edge selected)' },
    { keys: ['A'], action: 'Toggle animation (when edge selected)' },
  ];
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        title="Keyboard Shortcuts"
      >
        <Keyboard className="w-4 h-4" />
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full shadow-strong">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Keyboard Shortcuts</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {shortcuts.map((shortcut, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-foreground-muted">{shortcut.action}</span>
                  <div className="flex gap-1 items-center flex-shrink-0 ml-4">
                    {shortcut.keys.map((key, i) => (
                      <kbd 
                        key={i} 
                        className="px-2 py-1 bg-background-soft border border-border rounded text-xs font-mono text-foreground"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-foreground-muted">
                💡 Tip: Use Shift+Click or drag to select multiple nodes at once!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
