import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Trash2, Smartphone, Edit3, Box, Settings2, Undo2, Redo2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Node, Edge, ReactFlowProvider } from '@xyflow/react';
import { WorkflowCanvas } from '@/components/canvas/WorkflowCanvas';
import { ToolboxPanel } from '@/components/canvas/ToolboxPanel';
import { MetricsInputPanel } from '@/components/canvas/MetricsInputPanel';
import { EdgeSettingsPanel } from '@/components/canvas/EdgeSettingsPanel';
import { KeyboardShortcutsPanel } from '@/components/canvas/KeyboardShortcutsPanel';
import { ValidationPanel } from '@/components/canvas/ValidationPanel';
import { ExportImportPanel } from '@/components/canvas/ExportImportPanel';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import '@xyflow/react/dist/style.css';
const scenarios = [
  {
    label: '🐔 Manajemen Unggas',
    prompt: 'Mulai → Pilih Kandang → Input Pakan → Catat Bobot → Validasi → Notifikasi SPV'
  },
  {
    label: '🦐 Manajemen Udang',
    prompt: 'Mulai → Pilih Tambak → Cek Air → Input Pakan → Catat Kematian → Buat Laporan'
  }
];

const getIconForLabel = (label: string): string => {
  const lowerLabel = label.toLowerCase();
  
  if (lowerLabel.includes('lokasi') || lowerLabel.includes('kandang') || lowerLabel.includes('tambak') || lowerLabel.includes('pilih')) {
    return 'map-pin';
  }
  if (lowerLabel.includes('input') || lowerLabel.includes('data') || lowerLabel.includes('catat')) {
    return 'database';
  }
  if (lowerLabel.includes('timbang') || lowerLabel.includes('iot') || lowerLabel.includes('sensor') || lowerLabel.includes('cek air') || lowerLabel.includes('kualitas')) {
    return 'wifi';
  }
  if (lowerLabel.includes('validasi') || lowerLabel.includes('cek') || lowerLabel.includes('verify')) {
    return 'check-square';
  }
  if (lowerLabel.includes('pdf') || lowerLabel.includes('laporan') || lowerLabel.includes('report') || lowerLabel.includes('buat')) {
    return 'file-text';
  }
  if (lowerLabel.includes('notif') || lowerLabel.includes('kirim') || lowerLabel.includes('send') || lowerLabel.includes('pakan') || lowerLabel.includes('kematian')) {
    return 'send';
  }
  
  return 'database'; // Default fallback
};
const WorkflowStudioContent = () => {
  const [prompt, setPrompt] = useState('');
  const [showEdgeSettings, setShowEdgeSettings] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    content: string;
    type: 'agent' | 'user';
    showTyping?: boolean;
  }>>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    clearCanvas: clearWorkflowCanvas,
    selectedNode,
    setSelectedNode,
    updateNodeMetrics,
    updateEdgeStyle,
    deleteEdge,
    copySelection,
    pasteSelection,
    duplicateSelection,
    undo,
    redo,
    canUndo,
    canRedo,
    showValidation,
    toggleValidation,
  } = useWorkflowState();
  const extractSteps = (text: string): string[] => {
    return text.split(/→|->|,/).map(s => s.trim()).filter(Boolean);
  };

  const generateWorkflow = useCallback(() => {
    const steps = extractSteps(prompt);
    if (steps.length === 0) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Add start node
    newNodes.push({
      id: 'start',
      type: 'start',
      position: { x: 100, y: 200 },
      data: { label: 'Mulai' },
    });

    // Add step nodes
    steps.forEach((label, i) => {
      const nodeId = `node_${i}`;
      newNodes.push({
        id: nodeId,
        type: 'default',
        position: { x: 300 + i * 250, y: 200 },
        data: { 
          label,
          icon: getIconForLabel(label),
        },
      });

      // Connect to previous node
      if (i === 0) {
        newEdges.push({
          id: `e-start-${nodeId}`,
          source: 'start',
          target: nodeId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'hsl(var(--brand-primary))', strokeWidth: 2 },
        });
      } else {
        newEdges.push({
          id: `e-node_${i - 1}-${nodeId}`,
          source: `node_${i - 1}`,
          target: nodeId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'hsl(var(--brand-primary))', strokeWidth: 2 },
        });
      }
    });

    // Add end node
    newNodes.push({
      id: 'end',
      type: 'end',
      position: { x: 300 + steps.length * 250, y: 200 },
      data: { label: 'Selesai' },
    });

    // Connect last step to end
    if (steps.length > 0) {
      newEdges.push({
        id: `e-node_${steps.length - 1}-end`,
        source: `node_${steps.length - 1}`,
        target: 'end',
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'hsl(var(--brand-primary))', strokeWidth: 2 },
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
    simulateChat(steps);
  }, [prompt, setNodes, setEdges]);

  const clearCanvas = useCallback(() => {
    clearWorkflowCanvas();
    setPrompt('');
    setChatMessages([]);
  }, [clearWorkflowCanvas]);
  const simulateChat = useCallback((steps: string[]) => {
    const messages: Array<{
      content: string;
      type: 'agent' | 'user';
      showTyping?: boolean;
      delay: number;
    }> = [];
    let delay = 0;

    messages.push({
      content: 'Halo! Saya Agen Rahayu. Mari kita mulai alur kerjanya.',
      type: 'agent',
      delay
    });
    delay += 1000;

    steps.forEach((label, i) => {
      messages.push({
        content: `Langkah ${i + 1}: ${label}`,
        type: 'agent',
        showTyping: true,
        delay
      });
      delay += 1500;
      messages.push({
        content: `Siap, ${label} sudah selesai.`,
        type: 'user',
        delay
      });
      delay += 1000;
    });

    setChatMessages([]);
    messages.forEach(msg => {
      setTimeout(() => {
        setChatMessages(prev => [...prev, msg]);
      }, msg.delay);
    });
  }, []);
  const handleCanvasDrop = useCallback((nodeData: any, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: nodeData.type || 'default',
      position,
      data: {
        label: nodeData.label,
        icon: nodeData.icon,
        ...(nodeData.label === 'Input Data' && { metrics: [] }),
      },
    };
    
    addNode(newNode);
  }, [addNode]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);
  return <section className="py-20 px-4 bg-background-soft">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-4xl md:text-5xl font-extrabold text-brand-primary">Workflow Studio</h2>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20">
              BETA
            </span>
          </div>
          <p className="text-lg text-foreground-muted">
            Ubah deskripsi kerja menjadi alur otomatis, dari ide ke WhatsApp agent.
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
            <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="mt-4" rows={5} placeholder="Contoh: Mulai → Pilih Tambak → Cek Kualitas Air → Beri Pakan → Catat Kematian → Buat Laporan → Kirim Notifikasi" />
            <div className="mt-3 flex flex-wrap gap-2">
              {scenarios.map((scenario, idx) => <button key={idx} onClick={() => setPrompt(scenario.prompt)} className="bg-brand-secondary/10 text-brand-secondary hover:bg-brand-secondary/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                  {scenario.label}
                </button>)}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button onClick={generateWorkflow} className="flex-1 bg-brand-secondary hover:bg-brand-secondary-light text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate
              </Button>
              <Button onClick={clearCanvas} variant="outline" size="icon" title="Clear Canvas">
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
            <div className="mt-4">
              <ToolboxPanel />
            </div>
          </div>
        </div>

        {/* Canvas with Edge Settings */}
        <div className="bg-card rounded-2xl border border-border-light shadow-soft h-[600px] flex mb-6">
          <div className="flex-1 flex flex-col">
            <div className="border-b border-border px-4 py-3 font-semibold flex justify-between items-center text-foreground">
              <span>Workflow Canvas</span>
              <div className="flex items-center gap-2">
                {/* Undo/Redo buttons */}
                <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={undo}
                    disabled={!canUndo()}
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={redo}
                    disabled={!canRedo()}
                    title="Redo (Ctrl+Shift+Z)"
                  >
                    <Redo2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <KeyboardShortcutsPanel />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleValidation}
                  className={showValidation ? 'bg-brand-primary/10' : ''}
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Validate
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEdgeSettings(!showEdgeSettings)}
                  className={showEdgeSettings ? 'bg-brand-primary/10' : ''}
                >
                  <Settings2 className="w-4 h-4 mr-1" />
                  Edge Settings
                </Button>
                <span className="text-xs text-foreground-light font-normal">
                  {nodes.length} node{nodes.length !== 1 ? 's' : ''} | {edges.length} edge{edges.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="relative flex-1 rounded-bl-2xl overflow-hidden">
              <WorkflowCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(node) => setSelectedNode(node)}
                onDrop={handleCanvasDrop}
                onDeleteEdge={deleteEdge}
                onUpdateEdge={updateEdgeStyle}
                onCopy={copySelection}
                onPaste={pasteSelection}
                onDuplicate={duplicateSelection}
                onUndo={undo}
                onRedo={redo}
                canUndo={canUndo}
                canRedo={canRedo}
              />
              
              {/* Validation Panel */}
              <ValidationPanel />
              
              {/* Export/Import Panel */}
              <ExportImportPanel />
            </div>
          </div>
          
          {/* Edge Settings Panel */}
          {showEdgeSettings && (
            <div className="w-80 flex-shrink-0">
              <EdgeSettingsPanel />
            </div>
          )}
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
                <div ref={chatRef} className="absolute inset-x-0 top-[64px] bottom-0 overflow-y-auto px-3 py-4 flex flex-col gap-1" style={{
                backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAA6RJREFUeJzt2LGPE1EUxfFNlRgRToD2bdu2bfv2d9u2bVvoaBwV6UBCS83O7k2e382Z3dpfDkREREREREREREREREREREREREREREREREREREREREREPg+APfF5/P5YAPfK+YPXAY+l+60FEOu1b7r/n/V6s+YAj7V+eF0AFmptnwM8vV77p8EBFr1e+8uDAyz1en034Cg/P4/p6T0+N23+vD/A0vrzA1hY/4IDLLX+J/85/PweLPDz+v8A7H1/P4Ad9M/3z/oHHLC+/gEL65/s/gC/vz/Byvp/PgBH6f/n/gAL6n/xAxys/x+wxv89wNCq/+kDrKP/xwGGrv5nLHC+//cF2GH/8QFGX/5/b/z9AVZa/m8DPL/+PwPYcf7/9fD7A+x4/n8A43/7S6/XB2Dl9fsCjP/tX6/XB2Dj9fsDDL/7A2zq9fvf2O0BsKnX7w8w/O4PsKnX739jtwfApdfvD/Du7g+w6fX7A2y5fg/v7v4Ai16/P8Ds6/cHWHL9Ht7d/QEWvX5/gNnX7w+w1Pv3+a+t3V+sv/6AD/n/9Qd48Pb7Axy4/gAHbn+A/Q8+wP4HH2D/Aw+w//cHWPL+Rx/gyfvf/gCb3//MAxx5/zMPMPh+Ax9g8P0GPgCLH2Dg/Qc+wIL7Dxzg/gdfYMH9Bw5w/4Mv8PH8/x3g4dNvL+Dxd//nB3j49NsLePzd//kBHr799gLe/sN/f4CHb7+9gLd/+O8PsA548PbbC3j79//jB1hPPPD22wt4+/f/4wesc/T22wt4+/t//AC1vX77Axx7/fYDHHv99gMce/32Axy8/QEG334/wCD3H2Dw7fczgIPuP8Ag9x9g8O33M4CD7j/AIPvL/P8J3H4DA/dfYPD9ZX4A4fcfYPD9B/yAD7D/gA/Y/wAH7D/wARbcf8AD1t/3ADsfeMCdDxzgzocecOf9D7DQ/Qc+YPgDjL7/wAcsv/+BBxy9/3/8/gAbX3/gAbfef+ABN19/gA2vv/AAm15/gA2uP8CG1x/gwesPME79hz/AOPUf/gDj1H/4A/S//QE+ev0Bfuz6A/zY9Qf4sevvD/Dn6w/wwesP8NXrD/DV6w/w1esP8NHrD/DR6w/w0esPsP/rD7D/6w/274s/QERERERERERERERERERERERERERERERERERERERERERE/oF/AE5iZJ4ACpAAAAAASUVORK5CYII=)',
                backgroundColor: '#0b141a',
                backgroundSize: 'cover'
              }}>
                  {chatMessages.map((msg, idx) => <div key={idx} className={`px-3 py-2 rounded-xl max-w-[80%] text-sm opacity-0 animate-[fadeInUp_0.4s_ease_forwards] ${msg.type === 'agent' ? 'bg-[#e2e8f0] text-[#111827] self-start' : 'bg-[#dcf8c6] text-[#111827] self-end'}`} style={{
                  animationDelay: `${idx * 0.1}s`
                }}>
                      {msg.content}
                    </div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MetricsInputPanel
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onUpdateMetrics={updateNodeMetrics}
      />
    </section>;
};

export const WorkflowStudio = () => {
  return (
    <ReactFlowProvider>
      <WorkflowStudioContent />
    </ReactFlowProvider>
  );
};