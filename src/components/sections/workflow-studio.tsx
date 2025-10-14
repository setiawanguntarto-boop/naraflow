import { useState, useRef, useEffect } from 'react';
import { Sparkles, Trash2, MapPin, Database, Wifi, CheckSquare, FileText, Send, Workflow, Smartphone, Edit3, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface WorkflowNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

const NODE_WIDTH = 160;
const NODE_HEIGHT = 50;

const toolboxItems = [
  { label: 'Pilih Lokasi', icon: MapPin },
  { label: 'Input Data', icon: Database },
  { label: 'Timbang (IoT)', icon: Wifi },
  { label: 'Validasi Data', icon: CheckSquare },
  { label: 'Buat PDF', icon: FileText },
  { label: 'Notifikasi', icon: Send },
];

const scenarios = [
  { label: '🐔 Manajemen Unggas', prompt: 'Mulai → Pilih Kandang → Input Pakan → Catat Bobot → Validasi → Notifikasi SPV' },
  { label: '🦐 Manajemen Udang', prompt: 'Mulai → Pilih Tambak → Cek Air → Input Pakan → Catat Kematian → Buat Laporan' },
];

export const WorkflowStudio = () => {
  const [prompt, setPrompt] = useState('');
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{ content: string; type: 'agent' | 'user'; showTyping?: boolean }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const extractSteps = (text: string): string[] => {
    return text
      .split(/→|->|,/)
      .map(s => s.trim())
      .filter(Boolean);
  };

  const generateWorkflow = () => {
    const steps = extractSteps(prompt);
    if (steps.length === 0) return;

    const newNodes: WorkflowNode[] = steps.map((label, i) => ({
      id: `node_${i}_${Date.now()}`,
      label,
      x: 100 + i * (NODE_WIDTH + 50),
      y: 250,
    }));

    setNodes(newNodes);
    simulateChat(newNodes);
  };

  const clearCanvas = () => {
    setNodes([]);
    setPrompt('');
    setChatMessages([]);
  };

  const simulateChat = (workflowNodes: WorkflowNode[]) => {
    const messages: Array<{ content: string; type: 'agent' | 'user'; showTyping?: boolean; delay: number }> = [];
    let delay = 0;

    messages.push({
      content: 'Halo! Saya Agen Rahayu. Mari kita mulai alur kerjanya.',
      type: 'agent',
      delay,
    });
    delay += 1000;

    workflowNodes.forEach((node, i) => {
      messages.push({
        content: `Langkah ${i + 1}: ${node.label}`,
        type: 'agent',
        showTyping: true,
        delay,
      });
      delay += 1500;

      messages.push({
        content: `Siap, ${node.label} sudah selesai.`,
        type: 'user',
        delay,
      });
      delay += 1000;
    });

    setChatMessages([]);
    messages.forEach(msg => {
      setTimeout(() => {
        setChatMessages(prev => [...prev, msg]);
      }, msg.delay);
    });
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const target = e.target as SVGElement;
    const nodeGroup = target.closest('[data-node-id]');
    
    if (nodeGroup) {
      const nodeId = nodeGroup.getAttribute('data-node-id');
      const node = nodes.find(n => n.id === nodeId);
      
      if (node) {
        setIsDragging(true);
        setSelectedNode(node);
        
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setDragOffset({
          x: x - node.x,
          y: y - node.y,
        });
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging || !selectedNode || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    setNodes(prev =>
      prev.map(n =>
        n.id === selectedNode.id ? { ...n, x, y } : n
      )
    );
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setSelectedNode(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const label = e.dataTransfer.getData('text/plain');
    if (!label || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - NODE_WIDTH / 2;
    const y = e.clientY - rect.top - NODE_HEIGHT / 2;

    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      label,
      x,
      y,
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    setPrompt(updatedNodes.map(n => n.label).join(' → '));
  };

  return (
    <section className="py-20 px-4 bg-background-soft">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-brand-primary mb-4">
            Naraflow Studio
          </h2>
          <p className="text-lg text-foreground-muted">
            Prompt → Workflow → WhatsApp Agent
          </p>
        </div>

        {/* Top Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Describe Workflow */}
          <div className="bg-card rounded-2xl border border-border-light shadow-soft p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-brand-secondary" />
              1. Describe Workflow
            </h3>
            <p className="text-sm text-foreground-muted mt-1">
              Gunakan prompt atau skenario siap pakai.
            </p>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-4"
              rows={5}
              placeholder="Contoh: Mulai → Pilih Tambak → Cek Kualitas Air → Beri Pakan → Catat Kematian → Buat Laporan → Kirim Notifikasi"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {scenarios.map((scenario, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(scenario.prompt)}
                  className="bg-brand-secondary/10 text-brand-secondary hover:bg-brand-secondary/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  {scenario.label}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button
                onClick={generateWorkflow}
                className="flex-1 bg-brand-secondary hover:bg-brand-secondary-light text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate
              </Button>
              <Button
                onClick={clearCanvas}
                variant="outline"
                size="icon"
                title="Clear Canvas"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Toolbox */}
          <div className="bg-card rounded-2xl border border-border-light shadow-soft p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Box className="w-5 h-5 text-brand-primary" />
              2. Drag & Drop Toolbox
            </h3>
            <p className="text-sm text-foreground-muted mt-1">
              Seret langkah-langkah ini ke canvas.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-medium">
              {toolboxItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', item.label)}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-muted hover:bg-surface-muted/80 cursor-grab active:cursor-grabbing transition-colors"
                  >
                    <Icon className="w-4 h-4 text-foreground-muted" />
                    {item.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="bg-card rounded-2xl border border-border-light shadow-soft h-[600px] flex flex-col mb-6">
          <div className="border-b border-border px-4 py-3 font-semibold flex justify-between items-center text-foreground">
            <span>Workflow Canvas</span>
            <span className="text-xs text-foreground-light font-normal">
              Drag nodes to reposition
            </span>
          </div>
          <div
            className="relative flex-1 rounded-b-2xl overflow-hidden bg-background-soft"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <svg
              ref={svgRef}
              className="w-full h-full"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--foreground-light))" />
                </marker>
              </defs>

              {/* Draw connectors */}
              {nodes.map((node, i) => {
                if (i < nodes.length - 1) {
                  const nextNode = nodes[i + 1];
                  return (
                    <path
                      key={`connector-${i}`}
                      d={`M ${node.x + NODE_WIDTH} ${node.y + NODE_HEIGHT / 2} L ${nextNode.x} ${nextNode.y + NODE_HEIGHT / 2}`}
                      stroke="hsl(var(--foreground-light))"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrow)"
                    />
                  );
                }
                return null;
              })}

              {/* Draw nodes */}
              {nodes.map((node) => (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  data-node-id={node.id}
                  className="cursor-grab hover:opacity-90 transition-opacity"
                >
                  <rect
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx="12"
                    fill="hsl(var(--brand-secondary) / 0.1)"
                    stroke="hsl(var(--brand-secondary) / 0.3)"
                    strokeWidth="2"
                  />
                  <text
                    x={NODE_WIDTH / 2}
                    y={NODE_HEIGHT / 2}
                    dy="0.3em"
                    textAnchor="middle"
                    fill="hsl(var(--foreground))"
                    fontWeight="600"
                    fontSize="14"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.label.length > 20 ? node.label.substring(0, 18) + '...' : node.label}
                  </text>
                </g>
              ))}
            </svg>

            {nodes.length === 0 && (
              <div className="absolute inset-0 grid place-items-center text-center text-foreground-muted p-4">
                <div>
                  <Workflow className="w-16 h-16 mx-auto text-foreground-light" />
                  <p className="mt-2 font-medium">Canvas Kosong</p>
                  <p className="text-sm">Mulai dengan prompt atau seret node dari toolbox.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp Simulation */}
        <div className="flex justify-center">
          <div className="bg-card rounded-2xl border border-border-light p-5 shadow-soft w-full max-w-md">
            <h3 className="font-semibold flex items-center gap-2 text-foreground mb-4">
              <Smartphone className="w-5 h-5 text-foreground-muted" />
              Simulasi WhatsApp
            </h3>
            <div className="grid place-items-center">
              <div className="w-[320px] h-[640px] rounded-[40px] border-[10px] border-foreground bg-[#0b141a] shadow-strong relative overflow-hidden">
                {/* Phone notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[24px] bg-foreground rounded-b-2xl z-10" />
                
                {/* WhatsApp header */}
                <header className="absolute top-0 left-0 right-0 bg-[#1f2c34] text-[#e2e8f0] px-4 py-3 flex gap-3 items-center z-5">
                  <div className="w-10 h-10 rounded-full bg-brand-secondary text-white grid place-items-center font-bold">
                    R
                  </div>
                  <div>
                    <div className="text-base font-semibold">Agen Rahayu</div>
                    <div className="text-xs text-gray-400">online</div>
                  </div>
                </header>

                {/* Chat screen */}
                <div
                  ref={chatRef}
                  className="absolute inset-x-0 top-[64px] bottom-0 overflow-y-auto px-3 py-4 flex flex-col gap-1"
                  style={{
                    backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAA6RJREFUeJzt2LGPE1EUxfFNlRgRToD2bdu2bfv2d9u2bVvoaBwV6UBCS83O7k2e382Z3dpfDkREREREREREREREREREREREREREREREREREREREREREPg+APfF5/P5YAPfK+YPXAY+l+60FEOu1b7r/n/V6s+YAj7V+eF0AFmptnwM8vV77p8EBFr1e+8uDAyz1en034Cg/P4/p6T0+N23+vD/A0vrzA1hY/4IDLLX+J/85/PweLPDz+v8A7H1/P4Ad9M/3z/oHHLC+/gEL65/s/gC/vz/Byvp/PgBH6f/n/gAL6n/xAxys/x+wxv89wNCq/+kDrKP/xwGGrv5nLHC+//cF2GH/8QFGX/5/b/z9AVZa/m8DPL/+PwPYcf7/9fD7A+x4/n8A43/7S6/XB2Dl9fsCjP/tX6/XB2Dj9fsDDL/7A2zq9fvf2O0BsKnX7w8w/O4PsKnX739jtwfApdfvD/Du7g+w6fX7A2y5fg/v7v4Ai16/P8Ds6/cHWHL9Ht7d/QEWvX5/gNnX7w+w1Pv3+a+t3V+sv/6AD/n/9Qd48Pb7Axy4/gAHbn+A/Q8+wP4HH2D/Aw+w//cHWPL+Rx/gyfvf/gCb3//MAxx5/zMPMPh+Ax9g8P0GPgCLH2Dg/Qc+wIL7Dxzg/gdfYMH9Bw5w/4Mv8PH8/x3g4dNvL+Dxd//nB3j49NsLePzd//kBHr799gLe/sN/f4CHb7+9gLd/+O8PsA548PbbC3j79//jB1hPPPD22wt4+/f/4wesc/T22wt4+/t//AC1vX77Axx7/fYDHHv99gMce/32Axy8/QEG334/wCD3H2Dw7fczgIPuP8Ag9x9g8O33M4CD7j/AIPvL/P8J3H4DA/dfYPD9ZX4A4fcfYPD9B/yAD7D/gA/Y/wAH7D/wARbcf8AD1t/3ADsfeMCdDxzgzocecOf9D7DQ/Qc+YPgDjL7/wAcsv/+BBxy9/3/8/gAbX3/gAbfef+ABN19/gA2vv/AAm15/gA2uP8CG1x/gwesPME79hz/AOPUf/gDj1H/4A/S//QE+ev0Bfuz6A/zY9Qf4sevvD/Dn6w/wwesP8NXrD/DV6w/w1esP8NHrD/DR6w/w0esPsP/rD7D/6w/274s/QERERERERERERERERERERERERERERERERERERERERERE/oF/AE5iZJ4ACpAAAAAASUVORK5CYII=)',
                    backgroundColor: '#0b141a',
                    backgroundSize: 'cover',
                  }}
                >
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-2 rounded-xl max-w-[80%] text-sm opacity-0 animate-[fadeInUp_0.4s_ease_forwards] ${
                        msg.type === 'agent'
                          ? 'bg-[#e2e8f0] text-[#111827] self-start'
                          : 'bg-[#dcf8c6] text-[#111827] self-end'
                      }`}
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      {msg.content}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};