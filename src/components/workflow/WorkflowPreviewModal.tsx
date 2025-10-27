/**
 * Workflow Preview Modal
 * Displays generated workflow with validation warnings and export options
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { WorkflowOutput } from '@/lib/promptInterpreter/types';
import { ValidationResult } from '@/lib/promptInterpreter/validationService';

interface WorkflowPreviewModalProps {
  open: boolean;
  onClose: () => void;
  workflow: WorkflowOutput | null;
  validation?: ValidationResult;
  onApply: () => void;
  onExport: () => void;
}

export function WorkflowPreviewModal({
  open,
  onClose,
  workflow,
  validation,
  onApply,
  onExport
}: WorkflowPreviewModalProps) {
  if (!workflow) return null;
  
  const hasWarnings = (validation?.warnings.length || 0) > 0;
  const hasErrors = (validation?.errors.length || 0) > 0;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Workflow Preview
          </DialogTitle>
          <DialogDescription>
            Review the generated workflow before applying to canvas
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Metadata */}
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              {workflow.nodes.length} Nodes
            </Badge>
            <Badge variant="secondary">
              {workflow.edges.length} Edges
            </Badge>
            <Badge variant="outline">
              {workflow.metadata.generated_by}
            </Badge>
          </div>
          
          {/* Title */}
          <div>
            <h4 className="font-semibold text-sm mb-1">Title</h4>
            <p className="text-sm text-muted-foreground">{workflow.metadata.title}</p>
          </div>
          
          {/* Description */}
          <div>
            <h4 className="font-semibold text-sm mb-1">Description</h4>
            <p className="text-sm text-muted-foreground">{workflow.metadata.description}</p>
          </div>
          
          {/* Timestamp */}
          <div>
            <h4 className="font-semibold text-sm mb-1">Generated At</h4>
            <p className="text-sm text-muted-foreground">
              {new Date(workflow.metadata.timestamp).toLocaleString()}
            </p>
          </div>
          
          {/* Validation Status */}
          {validation && (
            <div className="space-y-2">
              {hasErrors && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Validation Errors:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {validation.errors.map((error, i) => (
                        <li key={i} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {hasWarnings && !hasErrors && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warnings:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {validation.warnings.map((warning, i) => (
                        <li key={i} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {!hasErrors && workflow.warnings.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Additional Warnings:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {workflow.warnings.map((warning, i) => (
                        <li key={i} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          {/* Node List */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Nodes</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {workflow.nodes.map((node) => (
                <div key={node.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span className="font-mono text-xs">{node.id}</span>
                  <span className="text-muted-foreground">→ {node.type}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* JSON Preview */}
          <div>
            <h4 className="font-semibold text-sm mb-2">JSON Preview</h4>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-48 overflow-y-auto">
              {JSON.stringify(workflow, null, 2)}
            </pre>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={onApply} disabled={hasErrors}>
            Apply to Canvas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
