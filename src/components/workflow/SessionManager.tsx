import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  FolderOpen,
  Copy,
  Trash2,
  Download,
  Upload,
  Clock,
  Users,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import { useWorkflowState } from "@/hooks/useWorkflowState";
import { SessionMetadata } from "@/lib/sessionManager";
import { toast } from "sonner";

interface SessionManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SessionManager = ({ open, onOpenChange }: SessionManagerProps) => {
  const { currentSessionId, sessionManager, actions } = useWorkflowState();

  const [sessions, setSessions] = useState<SessionMetadata[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [newSessionName, setNewSessionName] = useState("");
  const [newSessionDescription, setNewSessionDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionMetadata | null>(null);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const sessionList = await sessionManager.listSessions();
      setSessions(sessionList);

      // Get session stats from sessionManager
      const sessionStats = {
        totalSessions: sessionList.length,
        activeSessions: sessionList.filter(s => s.isActive).length,
        totalStorageUsed: sessionList.reduce(
          (total, s) => total + (s.nodeCount + s.edgeCount) * 0.1,
          0
        ), // Rough estimate
      };
      setStats(sessionStats);
    } catch (error) {
      toast.error("Failed to load sessions");
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSessions();
    }
  }, [open]);

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) {
      toast.error("Session name cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      await actions.createSession(newSessionName, newSessionDescription);
      toast.success(`Session "${newSessionName}" created successfully!`);
      setNewSessionName("");
      setNewSessionDescription("");
      fetchSessions();
    } catch (error) {
      toast.error(
        `Failed to create session: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      await actions.loadSession(sessionId);
      toast.success("Session loaded successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        `Failed to load session: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSession = async () => {
    if (!currentSessionId) {
      toast.error("No active session to save");
      return;
    }

    try {
      setIsLoading(true);
      await actions.saveSession();
      toast.success("Session saved successfully!");
      fetchSessions();
    } catch (error) {
      toast.error(
        `Failed to save session: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      return;
    }

    try {
      setIsLoading(true);
      await actions.deleteSession(sessionId);
      toast.success("Session deleted successfully!");
      fetchSessions();
    } catch (error) {
      toast.error(
        `Failed to delete session: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      await sessionManager.duplicateSession(sessionId);
      toast.success("Session duplicated successfully!");
      fetchSessions();
    } catch (error) {
      toast.error(
        `Failed to duplicate session: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const jsonString = await sessionManager.exportSession(sessionId);

      // Create download
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `session_${sessionId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Session exported successfully!");
    } catch (error) {
      toast.error(
        `Failed to export session: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportSession = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const jsonString = await file.text();
      await sessionManager.importSession(jsonString);
      toast.success("Session imported successfully!");
      fetchSessions();
    } catch (error) {
      toast.error(
        `Failed to import session: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
      event.target.value = ""; // Clear the input
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStorageSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-primary" />
            Session Manager
          </DialogTitle>
          <DialogDescription>
            Manage your workflow sessions. Each session is isolated and can be saved independently.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Stats Overview */}
          {stats && (
            <div className="mb-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-primary">{stats.totalSessions}</div>
                  <div className="text-sm text-muted-foreground">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.activeSessions}</div>
                  <div className="text-sm text-muted-foreground">Active Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatStorageSize(stats.totalStorageUsed)}
                  </div>
                  <div className="text-sm text-muted-foreground">Storage Used</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {currentSessionId ? "1" : "0"}
                  </div>
                  <div className="text-sm text-muted-foreground">Current Session</div>
                </div>
              </div>
            </div>
          )}

          {/* Create New Session */}
          <div className="mb-4 p-4 border rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New Session
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Session name"
                value={newSessionName}
                onChange={e => setNewSessionName(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Description (optional)"
                value={newSessionDescription}
                onChange={e => setNewSessionDescription(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleCreateSession} disabled={isLoading || !newSessionName.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </div>
          </div>

          {/* Import Session */}
          <div className="mb-4 flex items-center gap-2">
            <Input
              type="file"
              accept=".json"
              onChange={handleImportSession}
              className="hidden"
              id="import-session-file"
            />
            <Button asChild variant="outline" disabled={isLoading}>
              <label htmlFor="import-session-file" className="cursor-pointer flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Import Session
              </label>
            </Button>

            {currentSessionId && (
              <Button onClick={handleSaveSession} disabled={isLoading}>
                <HardDrive className="w-4 h-4 mr-2" />
                Save Current Session
              </Button>
            )}
          </div>

          <Separator className="mb-4" />

          {/* Sessions List */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading sessions...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No sessions found. Create your first session!
                  </p>
                </div>
              ) : (
                sessions.map(session => (
                  <div
                    key={session.id}
                    className={`border rounded-lg p-4 shadow-sm transition-colors ${
                      currentSessionId === session.id
                        ? "border-brand-primary bg-brand-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{session.name}</h4>
                          {currentSessionId === session.id && (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Current
                            </Badge>
                          )}
                          {session.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Active
                            </Badge>
                          )}
                        </div>

                        {session.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {session.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Created: {formatDate(session.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Updated: {formatDate(session.updatedAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last accessed: {formatDate(session.lastAccessedAt)}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span>{session.nodeCount} nodes</span>
                          <span>{session.edgeCount} edges</span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoadSession(session.id)}
                          disabled={isLoading || currentSessionId === session.id}
                        >
                          <FolderOpen className="w-4 h-4 mr-1" />
                          Load
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicateSession(session.id)}
                          disabled={isLoading}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Duplicate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportSession(session.id)}
                          disabled={isLoading}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSession(session.id)}
                          disabled={isLoading || currentSessionId === session.id}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
