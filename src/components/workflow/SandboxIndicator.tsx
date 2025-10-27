import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Clock,
  HardDrive,
  Users,
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
} from "lucide-react";
import { useWorkflowState } from "@/hooks/useWorkflowState";
import { SessionMetadata } from "@/lib/sessionManager";
import { SandboxEngine } from "@/lib/sandboxEngine";
import { toast } from "sonner";

interface SandboxIndicatorProps {
  className?: string;
}

export const SandboxIndicator = ({ className = "" }: SandboxIndicatorProps) => {
  const { currentSessionId, nodes, edges, actions, sessionManager } = useWorkflowState();

  const [currentSession, setCurrentSession] = useState<SessionMetadata | null>(null);
  const [sandboxStats, setSandboxStats] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [sandboxEngine] = useState(() => new SandboxEngine());

  const loadCurrentSession = useCallback(async () => {
    if (!currentSessionId) return;
    try {
      const sessions = await sessionManager.listSessions();
      const session = sessions.find(s => s.id === currentSessionId);
      setCurrentSession(session || null);
    } catch (error) {
      console.warn("Failed to load current session:", error);
    }
  }, [currentSessionId, sessionManager]);

  const loadSandboxStats = useCallback(async () => {
    if (!currentSessionId) return;
    try {
      const stats = sandboxEngine.getSessionStats(currentSessionId);
      setSandboxStats(stats);
    } catch (error) {
      console.warn("Sandbox stats unavailable:", error);
    }
  }, [currentSessionId, sandboxEngine]);

  useEffect(() => {
    if (currentSessionId) {
      // Load current session metadata
      loadCurrentSession();
      loadSandboxStats();
    } else {
      setCurrentSession(null);
      setSandboxStats(null);
    }
  }, [currentSessionId, loadCurrentSession, loadSandboxStats]);

  // Cleanup SandboxEngine on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      sandboxEngine.destroy();
    };
  }, [sandboxEngine]);

  const handleExportToTemplate = async () => {
    if (!currentSessionId || !currentSession) {
      toast.error("No active session to export");
      return;
    }

    try {
      await actions.saveAsTemplate(
        `${currentSession.name} Template`,
        `Exported from session: ${currentSession.description || "No description"}`,
        "general",
        ["exported", "session"]
      );
      toast.success("Session exported as template successfully!");
    } catch (error) {
      toast.error(
        `Failed to export session: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleExportSession = async () => {
    if (!currentSessionId) {
      toast.error("No active session to export");
      return;
    }

    try {
      const jsonString = await sessionManager.exportSession(currentSessionId);

      // Create download
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `session_${currentSessionId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Session exported successfully!");
    } catch (error) {
      toast.error(
        `Failed to export session: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const formatDuration = (milliseconds?: number) => {
    if (!milliseconds) return "–";
    if (milliseconds < 1000) return `${milliseconds}ms`;
    if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;
    return `${(milliseconds / 60000).toFixed(1)}m`;
  };

  const getResourceStatus = () => {
    if (!sandboxStats) return { status: "unknown", message: "No execution data" };

    const { totalExecutions, successfulExecutions, failedExecutions, resourceLimitViolations } =
      sandboxStats;

    if (failedExecutions > 0) {
      return {
        status: "error",
        message: `${failedExecutions} failed executions`,
      };
    }

    if (resourceLimitViolations > 0) {
      return {
        status: "warning",
        message: `${resourceLimitViolations} resource limit violations`,
      };
    }

    if (successfulExecutions > 0) {
      return {
        status: "success",
        message: `${successfulExecutions} successful executions`,
      };
    }

    return { status: "info", message: "No executions yet" };
  };

  const resourceStatus = getResourceStatus();

  if (!currentSessionId || !currentSession) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 ${className}`}
          aria-label="Sandbox session indicator"
        >
          <Shield className="w-4 h-4 text-brand-primary" />
          <span className="hidden sm:inline">Sandbox</span>
          <Badge
            variant={
              resourceStatus.status === "success"
                ? "default"
                : resourceStatus.status === "warning"
                  ? "secondary"
                  : resourceStatus.status === "error"
                    ? "destructive"
                    : "secondary"
            }
            className="text-xs"
            title={currentSession.name}
          >
            {currentSession.name}
          </Badge>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72 sm:w-80 max-w-[90vw]" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-primary" />
            <h3 className="font-semibold">Sandbox Session</h3>
            <Badge variant="outline" className="ml-auto">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>

          <Separator />

          {/* Session Info */}
          <div className="space-y-2">
            <div>
              <h4 className="font-medium text-sm">{currentSession.name}</h4>
              {currentSession.description && (
                <p className="text-xs text-muted-foreground">{currentSession.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Created: {formatDate(currentSession.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated: {formatDate(currentSession.updatedAt)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Workflow Stats */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Workflow Stats
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Nodes:</span>
                <span className="font-medium">{Object.keys(nodes).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Edges:</span>
                <span className="font-medium">{Object.keys(edges).length}</span>
              </div>
            </div>
          </div>

          {/* Execution Stats */}
          {sandboxStats && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium text-sm flex items-center gap-2">Execution Stats</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Total Executions:</span>
                    <span className="font-medium">{sandboxStats.totalExecutions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Successful:</span>
                    <span className="font-medium text-green-600">
                      {sandboxStats.successfulExecutions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed:</span>
                    <span className="font-medium text-red-600">
                      {sandboxStats.failedExecutions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Time:</span>
                    <span className="font-medium">
                      {formatDuration(sandboxStats.averageExecutionTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resource Violations:</span>
                    <span className="font-medium text-orange-600">
                      {sandboxStats.resourceLimitViolations}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Resource Status */}
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              {resourceStatus.status === "success" ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : resourceStatus.status === "warning" ? (
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              ) : resourceStatus.status === "error" ? (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              ) : (
                <Info className="w-4 h-4 text-blue-600" />
              )}
              Resource Status
            </h4>
            <p className="text-xs text-muted-foreground">{resourceStatus.message}</p>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Actions</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportToTemplate}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-1" />
                Export as Template
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportSession} className="flex-1">
                <Download className="w-4 h-4 mr-1" />
                Export Session
              </Button>
              s
            </div>
          </div>

          {/* Session ID */}
          <div className="text-xs text-muted-foreground text-center">
            Session ID: {currentSessionId.substring(0, 8)}...
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
