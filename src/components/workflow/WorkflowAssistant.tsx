import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Loader2, Trash2 } from 'lucide-react';
import { useGenerationStore } from '@/store/generationStore';
import { useState } from 'react';

export const WorkflowAssistant = () => {
  const [input, setInput] = useState('');
  const {
    messages,
    pushMessage,
    isGenerating,
    reset
  } = useGenerationStore();
  
  const handleSend = () => {
    if (!input.trim() || isGenerating) return;
    
    const message = input;
    setInput('');
    pushMessage({
      role: 'user',
      text: message
    });
    
    // Simple assistant response (can be enhanced with actual AI later)
    pushMessage({
      role: 'assistant',
      text: 'I received your message. In the future, I can help refine workflows!'
    });
  };
  
  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-white">
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
            Hi! I can help you design workflows. Describe what you want to build and I'll generate it for you.
          </div>
        ) : (
          messages.map((message, i) => (
            <div key={i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] p-3 rounded-lg whitespace-pre-wrap text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {message.text}
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
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isGenerating}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            size="sm"
            disabled={isGenerating || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};