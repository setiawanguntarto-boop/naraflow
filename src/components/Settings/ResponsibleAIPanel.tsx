import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, ExternalLink, Download } from "lucide-react";
import { useWorkflowState } from "@/hooks/useWorkflowState";

interface ResponsibleAIPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResponsibleAIPanel({ open, onOpenChange }: ResponsibleAIPanelProps) {
  const [dataConfirmationChecked, setDataConfirmationChecked] = useState(false);
  const { llamaLogs } = useWorkflowState();

  const handleExportLogs = () => {
    const logsData = {
      timestamp: new Date().toISOString(),
      totalLogs: llamaLogs.length,
      logs: llamaLogs,
    };

    const blob = new Blob([JSON.stringify(logsData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `llama-audit-trail-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Responsible AI Disclosure
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Data Usage Statements */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Data Handling & Privacy</h3>

            <div className="space-y-3 text-sm text-foreground-muted">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  <strong>Data Storage:</strong> No user data is stored unless explicitly persisted
                  per workflow. All data remains in your browser session.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  <strong>API Keys:</strong> API keys are kept in memory only and never stored
                  persistently for security.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  <strong>Audit Trail:</strong> All LLaMA interactions are logged and exportable for
                  compliance and transparency.
                </p>
              </div>
            </div>
          </div>

          {/* Data Confirmation Checkbox */}
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="data-confirmation"
                checked={dataConfirmationChecked}
                onCheckedChange={checked => setDataConfirmationChecked(checked as boolean)}
              />
              <label
                htmlFor="data-confirmation"
                className="text-sm text-foreground leading-relaxed"
              >
                I confirm that demonstration data does not contain personal information or sensitive
                data.
              </label>
            </div>
          </div>

          {/* External Link */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Best Practices</h3>
            <a
              href="https://ai.meta.com/llama/get-started/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              LLaMA Best Practices & Guidelines
            </a>
          </div>

          {/* Export Logs */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Audit Trail</h3>
            <Alert>
              <AlertDescription className="text-sm">
                Export your LLaMA interaction logs for compliance and transparency. Current session
                has {llamaLogs.length} logged interactions.
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportLogs}
              disabled={llamaLogs.length === 0}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Audit Trail ({llamaLogs.length} logs)
            </Button>
          </div>

          {/* Status Indicator */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground-muted">Status:</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
