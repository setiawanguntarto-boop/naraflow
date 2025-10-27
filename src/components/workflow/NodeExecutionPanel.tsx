import { X, Play, Loader2, CheckCircle2, AlertCircle, Download, Search, Filter } from 'lucide-react';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExecutionResult } from '@/types/workflow';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { useState, useMemo } from 'react';

interface NodeExecutionPanelProps {
  node: Node;
  result: ExecutionResult | null;
  isExecuting: boolean;
  onClose: () => void;
  onExecute: () => void;
}

export const NodeExecutionPanel = ({ 
  node, 
  result, 
  isExecuting, 
  onClose, 
  onExecute 
}: NodeExecutionPanelProps) => {
  const { llamaLogs } = useWorkflowState();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState('all');

  // Filter logs based on search and node selection
  const filteredLogs = useMemo(() => {
    return llamaLogs.filter(log => {
      const matchesSearch = log.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.rawPreview.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesNode = selectedNodeId === 'all' || log.nodeId === selectedNodeId;
      return matchesSearch && matchesNode;
    });
  }, [llamaLogs, searchTerm, selectedNodeId]);

  // Get unique node IDs for filter
  const nodeIds = useMemo(() => {
    const uniqueIds = [...new Set(llamaLogs.map(log => log.nodeId))];
    return uniqueIds;
  }, [llamaLogs]);

  // Export logs function
  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `llama-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-lg z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-semibold text-foreground">Node Execution</h3>
          <p className="text-sm text-muted-foreground">{String(node.data?.label || '')}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Execute Button */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={onExecute}
          disabled={isExecuting}
          className="w-full"
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Node
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <Tabs defaultValue="logs" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="logs" className="flex-1">Chat Activity</TabsTrigger>
            <TabsTrigger value="outputs" className="flex-1">Sent Messages</TabsTrigger>
            <TabsTrigger value="llama-logs" className="flex-1">LLaMA Logs</TabsTrigger>
            <TabsTrigger value="info" className="flex-1">Run Info</TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="flex-1 p-4 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {result.logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg text-sm ${
                      log.level === 'error'
                        ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                        : log.level === 'warn'
                        ? 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400'
                        : 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {log.level === 'error' ? (
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{log.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {log.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="outputs" className="flex-1 p-4 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                {Object.entries(result.outputs).map(([key, value]) => (
                  <div key={key} className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {key}
                    </p>
                    <p className="text-sm font-mono break-all">
                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="llama-logs" className="flex-1 p-4 overflow-hidden">
            <div className="space-y-4">
              {/* Filters */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={selectedNodeId} onValueChange={setSelectedNodeId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Filter by node" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Nodes</SelectItem>
                      {nodeIds.map(nodeId => (
                        <SelectItem key={nodeId} value={nodeId}>
                          {nodeId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportLogs}
                    disabled={filteredLogs.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Logs List */}
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No LLaMA logs found</p>
                    </div>
                  ) : (
                    filteredLogs.map((log) => (
                      <div key={log.id} className="bg-muted/50 p-3 rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {log.nodeId}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {log.model}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {log.mode}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Prompt:</p>
                            <p className="text-sm bg-background p-2 rounded border font-mono text-wrap break-words">
                              {log.prompt}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Raw Preview:</p>
                            <p className="text-sm bg-background p-2 rounded border font-mono text-wrap break-words max-h-32 overflow-y-auto">
                              {log.rawPreview}
                              {log.rawPreview.length >= 1000 && (
                                <span className="text-muted-foreground">... (truncated)</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="info" className="flex-1 p-4 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Node ID</p>
                  <p className="text-sm font-mono mt-1">{node.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Node Type</p>
                  <Badge variant="secondary" className="mt-1">{String(node.data?.label || '')}</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <Badge
                    variant={result.error ? 'destructive' : 'default'}
                    className="mt-1"
                  >
                    {result.error ? 'Failed' : 'Success'}
                  </Badge>
                </div>
                {result.error && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Error</p>
                    <p className="text-sm text-destructive mt-1">{result.error}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}

      {!result && !isExecuting && (
        <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground">
          <div>
            <Play className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Click "Run Node" to execute</p>
          </div>
        </div>
      )}
    </div>
  );
};
