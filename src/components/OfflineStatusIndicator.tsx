import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  Wifi,
  WifiOff,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  Database,
  X,
} from "lucide-react";
import { OfflineQueue, OfflineQueueStats } from "@/lib/offlineQueue";
import { toast } from "sonner";

interface OfflineStatusIndicatorProps {
  className?: string;
}

export const OfflineStatusIndicator = ({ className = "" }: OfflineStatusIndicatorProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOpen, setIsOpen] = useState(false);
  const [queueStats, setQueueStats] = useState<OfflineQueueStats | null>(null);
  const [offlineQueue] = useState(() => new OfflineQueue());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection restored");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You are now offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Load initial stats
    loadQueueStats();

    // Set up periodic stats updates
    const interval = setInterval(loadQueueStats, 5000);

    // Set up sync callback
    const removeSyncCallback = offlineQueue.onSync(() => {
      loadQueueStats();
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
      removeSyncCallback();
    };
  }, [offlineQueue]);

  const loadQueueStats = async () => {
    try {
      const stats = await offlineQueue.getStats();
      setQueueStats(stats);
    } catch (error) {
      console.error("Failed to load queue stats:", error);
    }
  };

  const handleSyncNow = async () => {
    if (!isOnline) {
      toast.error("Cannot sync while offline");
      return;
    }

    try {
      setIsLoading(true);
      await offlineQueue.syncPendingItems();
      await loadQueueStats();
      toast.success("Sync completed");
    } catch (error) {
      toast.error("Sync failed");
      console.error("Sync error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCompleted = async () => {
    try {
      await offlineQueue.clearCompletedItems();
      await loadQueueStats();
      toast.success("Completed items cleared");
    } catch (error) {
      toast.error("Failed to clear completed items");
      console.error("Clear error:", error);
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return "text-red-600";
    if (queueStats?.queueSize && queueStats.queueSize > 0) return "text-orange-600";
    return "text-green-600";
  };

  const getStatusIcon = () => {
    if (!isOnline) return WifiOff;
    if (queueStats?.queueSize && queueStats.queueSize > 0) return Clock;
    return CheckCircle;
  };

  const getStatusText = () => {
    if (!isOnline) return "Offline";
    if (queueStats?.queueSize && queueStats.queueSize > 0) return `${queueStats.queueSize} pending`;
    return "Online";
  };

  const StatusIcon = getStatusIcon();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={`flex items-center gap-2 ${className}`}>
          <StatusIcon className={`w-4 h-4 ${getStatusColor()}`} />
          <span className="hidden sm:inline">{getStatusText()}</span>
          {queueStats?.queueSize && queueStats.queueSize > 0 && (
            <Badge variant="secondary" className="text-xs">
              {queueStats.queueSize}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-5 h-5 ${getStatusColor()}`} />
            <h3 className="font-semibold">Connection Status</h3>
            <Badge variant={isOnline ? "default" : "destructive"} className="ml-auto">
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>

          {/* Connection Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className={getStatusColor()}>{isOnline ? "Connected" : "Disconnected"}</span>
            </div>

            {!isOnline && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <p className="text-sm text-orange-800">
                    You're offline. Changes will be synced when connection is restored.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Queue Stats */}
          {queueStats && (
            <>
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Offline Queue
                </h4>

                <div className="space-y-3">
                  {/* Executions */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Workflow Executions:</span>
                      <span className="font-medium">{queueStats.totalExecutions}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-orange-600">
                          {queueStats.pendingExecutions}
                        </div>
                        <div className="text-muted-foreground">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">
                          {queueStats.completedExecutions}
                        </div>
                        <div className="text-muted-foreground">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-red-600">
                          {queueStats.failedExecutions}
                        </div>
                        <div className="text-muted-foreground">Failed</div>
                      </div>
                    </div>
                  </div>

                  {/* Template Operations */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Template Operations:</span>
                      <span className="font-medium">{queueStats.totalTemplateOperations}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-orange-600">
                          {queueStats.pendingTemplateOperations}
                        </div>
                        <div className="text-muted-foreground">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">
                          {queueStats.completedTemplateOperations}
                        </div>
                        <div className="text-muted-foreground">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-red-600">
                          {queueStats.failedTemplateOperations}
                        </div>
                        <div className="text-muted-foreground">Failed</div>
                      </div>
                    </div>
                  </div>

                  {/* Queue Size Progress */}
                  {queueStats.queueSize > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Queue Size:</span>
                        <span className="font-medium">{queueStats.queueSize} items</span>
                      </div>
                      <Progress
                        value={(queueStats.queueSize / Math.max(queueStats.queueSize, 10)) * 100}
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Oldest Pending Item */}
                  {queueStats.oldestPendingItem && (
                    <div className="text-xs text-muted-foreground">
                      Oldest pending: {queueStats.oldestPendingItem.substring(0, 8)}...
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex gap-2">
              {isOnline && queueStats && queueStats.queueSize > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncNow}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Sync Now
                </Button>
              )}

              {queueStats &&
                (queueStats.completedExecutions > 0 ||
                  queueStats.completedTemplateOperations > 0) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCompleted}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Completed
                  </Button>
                )}
            </div>

            {!isOnline && (
              <div className="text-xs text-muted-foreground text-center">
                Automatic sync will resume when connection is restored
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
