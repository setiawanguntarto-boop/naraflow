import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NodeConfigPanelProps {
  node: Node;
  onClose: () => void;
  onSave: (nodeId: string, title: string, description: string) => void;
}

const getContextHint = (nodeLabel: string): string => {
  const hints: Record<string, string> = {
    'WhatsApp Message': 'Write the message that will be sent via WhatsApp. You can use {{name}} placeholders for dynamic content.',
    'Ask Input': 'Define the question or prompt that will be sent to the user. Be clear and concise.',
    'Receive Update': 'Describe what automatic updates this node will receive (e.g., sensor readings, webhook data).',
    'Process Data': 'Explain how this node will process or transform incoming data.',
    'Filter Data': 'Define the filtering criteria or conditions that will be applied.',
    'Transform': 'Describe the data transformation that will occur (e.g., format change, calculation).',
    'Condition': 'Specify the condition or rule that determines the flow path.',
    'Loop': 'Define the loop criteria: what to iterate over and when to stop.',
    'Switch': 'List the cases/conditions that determine which branch to follow.',
    'Notification': 'Specify the notification message and who should receive it.',
    'Report (PDF)': 'Describe what data will be included in the PDF report.',
    'Email': 'Compose the email subject and body. You can use placeholders like {{name}}.',
  };

  return hints[nodeLabel] || 'Provide a short description or configuration details for this node.';
};

const getNodeTypeInfo = (nodeLabel: string): { icon: string; color: string } => {
  if (nodeLabel.includes('WhatsApp') || nodeLabel.includes('Message')) {
    return { icon: '💬', color: 'text-green-600' };
  }
  if (nodeLabel.includes('Input') || nodeLabel.includes('Ask')) {
    return { icon: '📥', color: 'text-blue-600' };
  }
  if (nodeLabel.includes('Process') || nodeLabel.includes('Transform')) {
    return { icon: '⚙️', color: 'text-purple-600' };
  }
  if (nodeLabel.includes('Condition') || nodeLabel.includes('Logic')) {
    return { icon: '🔀', color: 'text-yellow-600' };
  }
  return { icon: '📋', color: 'text-gray-600' };
};

export const NodeConfigPanel = ({ node, onClose, onSave }: NodeConfigPanelProps) => {
  const [title, setTitle] = useState(String(node.data?.title || node.data?.label || ''));
  const [description, setDescription] = useState(String(node.data?.description || ''));
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTitle(String(node.data?.title || node.data?.label || ''));
    setDescription(String(node.data?.description || ''));
    setHasChanges(false);
  }, [node.id]);

  useEffect(() => {
    const changed = 
      title !== String(node.data?.title || node.data?.label || '') ||
      description !== String(node.data?.description || '');
    setHasChanges(changed);
  }, [title, description, node]);

  const handleSave = () => {
    onSave(node.id, title, description);
    setHasChanges(false);
  };

  const contextHint = getContextHint(String(node.data?.label || ''));
  const typeInfo = getNodeTypeInfo(String(node.data?.label || ''));

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-lg z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{typeInfo.icon}</span>
          <div>
            <h3 className="font-semibold text-foreground">Configure Node</h3>
            <p className={`text-sm ${typeInfo.color}`}>{String(node.data?.label || '')}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Context Hint */}
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="text-sm">
            {contextHint}
          </AlertDescription>
        </Alert>

        {/* Title Input */}
        <div className="space-y-2">
          <Label htmlFor="node-title">Title</Label>
          <Input
            id="node-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`e.g., ${String(node.data?.label || '')}`}
          />
          <p className="text-xs text-muted-foreground">
            A short, descriptive name for this node
          </p>
        </div>

        {/* Description Textarea */}
        <div className="space-y-2">
          <Label htmlFor="node-description">Configuration</Label>
          <Textarea
            id="node-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={contextHint}
            rows={8}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Detailed configuration or content for this node
          </p>
        </div>

        {/* Quick Templates (for WhatsApp nodes) */}
        {node.data?.label === 'WhatsApp Message' && (
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDescription('Hello {{name}}! Welcome to our service.')}
              >
                Welcome
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDescription('Your order {{order_id}} has been confirmed.')}
              >
                Confirmation
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDescription('Thank you for your feedback!')}
              >
                Thank You
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDescription('We will contact you shortly at {{phone}}.')}
              >
                Follow-up
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border flex gap-2">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex-1"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};
