import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { pingLlama, detectLocalLlama } from '@/lib/llamaClient';

interface LlamaConnectionPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LlamaConnectionPanel({ open, onOpenChange }: LlamaConnectionPanelProps) {
  const { llamaConfig, setLlamaConfig, toggleLocalLlama } = useWorkflowState();
  const [mode, setMode] = useState<'local' | 'cloud'>(llamaConfig.mode);
  const [endpoint, setEndpoint] = useState(llamaConfig.endpoint);
  const [apiKey, setApiKey] = useState(llamaConfig.apiKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    model?: string;
  } | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await pingLlama(endpoint, apiKey || undefined, mode);
      
      if (result.ok) {
        setTestResult({
          success: true,
          message: `Connected: LLaMA model: ${result.model}`,
          model: result.model,
        });
        
        // Update the workflow state with successful connection
        setLlamaConfig({
          mode,
          endpoint,
          apiKey: apiKey || undefined,
          connected: true,
          lastModel: result.model,
        });
      } else {
        setTestResult({
          success: false,
          message: `Connection failed: ${result.error} — check endpoint & key.`,
        });
        
        // Update state to disconnected
        setLlamaConfig({
          mode,
          endpoint,
          apiKey: apiKey || undefined,
          connected: false,
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Connection failed: ${error} — check endpoint & key.`,
      });
      
      setLlamaConfig({
        mode,
        endpoint,
        apiKey: apiKey || undefined,
        connected: false,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleModeChange = (newMode: 'local' | 'cloud') => {
    setMode(newMode);
    setTestResult(null);
    
    // Update endpoint based on mode
    if (newMode === 'local') {
      setEndpoint('http://localhost:11434');
    } else {
      setEndpoint('');
    }
  };

  const handleToggleLocalLlama = async () => {
    toggleLocalLlama();
    
    // Re-test connection after toggle
    if (llamaConfig.mode === 'local') {
      // Switching to local - test local endpoint
      setIsTesting(true);
      setTestResult(null);
      
      try {
        const isLocalAvailable = await detectLocalLlama('http://localhost:11434');
        
        if (isLocalAvailable) {
          setTestResult({
            success: true,
            message: 'Local LLaMA detected and connected',
          });
          setLlamaConfig({
            mode: 'local',
            endpoint: 'http://localhost:11434',
            connected: true,
            llamaStatus: 'connected',
          });
        } else {
          setTestResult({
            success: false,
            message: 'Local LLaMA not available - please start Ollama',
          });
          setLlamaConfig({
            mode: 'local',
            endpoint: 'http://localhost:11434',
            connected: false,
            llamaStatus: 'disconnected',
          });
        }
      } catch (error) {
        setTestResult({
          success: false,
          message: `Failed to connect to local LLaMA: ${error}`,
        });
        setLlamaConfig({
          mode: 'local',
          endpoint: 'http://localhost:11434',
          connected: false,
          llamaStatus: 'disconnected',
        });
      } finally {
        setIsTesting(false);
      }
    } else {
      // Switching to cloud - clear local connection
      setLlamaConfig({
        mode: 'cloud',
        endpoint: '',
        connected: false,
        llamaStatus: 'disconnected',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Connect to LLaMA</span>
            {llamaConfig.connected && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Toggle */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Toggle</Label>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">
                Prefer Local LLaMA
              </span>
              <button
                onClick={handleToggleLocalLlama}
                disabled={isTesting}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  llamaConfig.useLocalLlama
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${isTesting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isTesting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : llamaConfig.useLocalLlama ? (
                  <ToggleRight className="w-3 h-3" />
                ) : (
                  <ToggleLeft className="w-3 h-3" />
                )}
                {llamaConfig.useLocalLlama ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Connection Mode</Label>
            <RadioGroup value={mode} onValueChange={handleModeChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="local" id="local" />
                <Label htmlFor="local">Local (Ollama)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cloud" id="cloud" />
                <Label htmlFor="cloud">Cloud (Meta API)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Endpoint Input */}
          <div className="space-y-2">
            <Label htmlFor="endpoint">Endpoint URL</Label>
            <Input
              id="endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder={mode === 'local' ? 'http://localhost:11434' : 'https://api.meta.com'}
              disabled={isTesting}
            />
          </div>

          {/* API Key Input (for Cloud mode) */}
          {mode === 'cloud' && (
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                disabled={isTesting}
              />
              <p className="text-xs text-muted-foreground">
                ⚠️ Key not persisted to disk for demo.
              </p>
            </div>
          )}

          {/* Test Connection Button */}
          <Button 
            onClick={handleTestConnection} 
            disabled={isTesting || !endpoint || (mode === 'cloud' && !apiKey)}
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing connection...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>

          {/* Test Result */}
          {testResult && (
            <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600" />
                )}
                <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                  {testResult.message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Current Status */}
          {llamaConfig.connected && (
            <Alert className="border-blue-200 bg-blue-50">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Currently connected to: {llamaConfig.lastModel || 'Unknown model'}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
