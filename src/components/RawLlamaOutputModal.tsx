import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface RawLlamaOutputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rawOutput: string;
  parsedOutput: any;
  timestamp: string;
  model?: string;
  onUseWorkflow: (parsed: any) => void;
}

export function RawLlamaOutputModal({
  open,
  onOpenChange,
  rawOutput,
  parsedOutput,
  timestamp,
  model,
  onUseWorkflow,
}: RawLlamaOutputModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'raw' | 'parsed'>('raw');

  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(rawOutput);
      setCopied(true);
      toast.success('Raw output copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleUseWorkflow = () => {
    if (parsedOutput && parsedOutput.nodes && parsedOutput.edges) {
      onUseWorkflow(parsedOutput);
      onOpenChange(false);
      toast.success('Workflow applied to canvas');
    } else {
      toast.error('Invalid workflow format');
    }
  };

  const isValidWorkflow = parsedOutput && parsedOutput.nodes && parsedOutput.edges;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Raw LLaMA Output (proof)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {timestamp}
            </div>
            {model && (
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Model: {model}
              </div>
            )}
          </div>

          {/* Parse Status */}
          <Alert className={isValidWorkflow ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
            <div className="flex items-center gap-2">
              {isValidWorkflow ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-orange-600" />
              )}
              <AlertDescription className={isValidWorkflow ? 'text-green-800' : 'text-orange-800'}>
                {isValidWorkflow 
                  ? `Successfully parsed workflow with ${parsedOutput.nodes.length} nodes and ${parsedOutput.edges.length} edges`
                  : 'LLaMA returned unparseable output. Try editing the prompt or use raw output.'
                }
              </AlertDescription>
            </div>
          </Alert>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'raw' | 'parsed')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="raw">Raw Output</TabsTrigger>
              <TabsTrigger value="parsed">Parsed Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="raw" className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  This is direct raw output from LLaMA — used to generate the canvas.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyRaw}
                  className="flex items-center gap-2"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Raw'}
                </Button>
              </div>
              <ScrollArea className="h-96 w-full rounded-md border bg-muted p-4">
                <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                  {rawOutput}
                </pre>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="parsed" className="space-y-2">
              {isValidWorkflow ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Nodes ({parsedOutput.nodes.length})</h4>
                      <ScrollArea className="h-48 w-full rounded-md border bg-muted p-3">
                        <div className="space-y-2">
                          {parsedOutput.nodes.map((node: any, index: number) => (
                            <div key={index} className="text-sm bg-white p-2 rounded border">
                              <div className="font-medium">{node.data?.label || node.id}</div>
                              <div className="text-muted-foreground text-xs">
                                Type: {node.type} | Position: ({node.position?.x}, {node.position?.y})
                              </div>
                              {node.data?.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {node.data.description}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Edges ({parsedOutput.edges.length})</h4>
                      <ScrollArea className="h-48 w-full rounded-md border bg-muted p-3">
                        <div className="space-y-2">
                          {parsedOutput.edges.map((edge: any, index: number) => (
                            <div key={index} className="text-sm bg-white p-2 rounded border">
                              <div className="font-medium">
                                {edge.source} → {edge.target}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                ID: {edge.id}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <XCircle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                  <p>No valid workflow structure found in the output.</p>
                  <p className="text-sm mt-2">Check the Raw Output tab for the actual response.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Generated at {timestamp}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {isValidWorkflow && (
              <Button onClick={handleUseWorkflow} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Use as Workflow
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
