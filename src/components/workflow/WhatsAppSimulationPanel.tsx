import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, RotateCcw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: number;
}

interface WhatsAppSimulationPanelProps {
  nodes: any[];
  edges: any[];
  onSimulate?: () => void;
}

export function WhatsAppSimulationPanel({ nodes, edges, onSimulate }: WhatsAppSimulationPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: inputMessage,
      sender: 'user',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate agent response
    setIsSimulating(true);
    setTimeout(() => {
      const agentMessage: Message = {
        id: `msg-${Date.now()}`,
        text: 'Thank you for your message. How can I help you today?',
        sender: 'agent',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, agentMessage]);
      setIsSimulating(false);
    }, 1000);
  };

  const handleRunSimulation = async () => {
    if (!nodes.length || !edges.length) {
      toast.error('Add nodes to the workflow first');
      return;
    }

    setIsSimulating(true);
    onSimulate?.();

    // Clear previous messages and add simulation welcome
    setMessages([{
      id: 'sim-start',
      text: '🧪 Starting workflow simulation...',
      sender: 'agent',
      timestamp: Date.now(),
    }]);

    // Simulate workflow execution with node-by-node flow
    const startNode = nodes.find(n => n.type === 'start');
    if (startNode) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: 'node-start',
          text: `✓ Executed: ${startNode.data?.label || 'Start Node'}`,
          sender: 'agent',
          timestamp: Date.now(),
        }]);
      }, 500);
    }

    // Simulate a few workflow nodes
    for (let i = 0; i < Math.min(nodes.length, 3); i++) {
      const node = nodes[i];
      if (node.type === 'start' || !node.data?.label) continue;

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `node-${node.id}`,
          text: `→ Processing: ${node.data.label}`,
          sender: 'agent',
          timestamp: Date.now(),
        }]);
      }, 1000 + (i * 500));
    }

    // Complete simulation
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: 'sim-complete',
        text: '✅ Workflow simulation completed successfully!',
        sender: 'agent',
        timestamp: Date.now(),
      }]);
      setIsSimulating(false);
      toast.success('Simulation completed!');
    }, 2000 + (nodes.length * 500));
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="bg-card rounded-2xl border border-border-light shadow-soft flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-primary" />
          <h3 className="font-semibold text-foreground">
            4. WhatsApp Simulation
          </h3>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            size="sm"
            variant="outline"
          >
            {isSimulating ? '⏳' : <><Play className="w-4 h-4 mr-1" /> Simulate</>}
          </Button>
          <Button
            onClick={handleClearChat}
            size="sm"
            variant="ghost"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Start a conversation or run simulation</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.sender === 'user'
                      ? 'bg-green-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
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
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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

