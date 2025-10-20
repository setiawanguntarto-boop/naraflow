import { AlertCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { ValidationError } from '@/utils/workflowValidation';

export const ValidationPanel = () => {
  const { validationErrors, showValidation, toggleValidation, validateWorkflow } = useWorkflowState();
  
  if (!showValidation) return null;
  
  const errorCount = validationErrors.filter(e => e.type === 'error').length;
  const warningCount = validationErrors.filter(e => e.type === 'warning').length;
  const isValid = errorCount === 0;
  
  return (
    <div className="absolute top-4 right-4 w-80 bg-card border border-border rounded-xl shadow-lg z-10">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <h3 className="font-semibold text-foreground">
            Workflow Validation
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleValidation}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          {errorCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              {errorCount} Error{errorCount !== 1 ? 's' : ''}
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="secondary" className="gap-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
              <AlertTriangle className="w-3 h-3" />
              {warningCount} Warning{warningCount !== 1 ? 's' : ''}
            </Badge>
          )}
          {isValid && (
            <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
              <CheckCircle2 className="w-3 h-3" />
              All checks passed
            </Badge>
          )}
        </div>
        
        <Button
          onClick={validateWorkflow}
          variant="outline"
          size="sm"
          className="w-full mb-4"
        >
          Revalidate Workflow
        </Button>
        
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {validationErrors.length === 0 ? (
              <div className="text-center py-8 text-foreground-muted text-sm">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>Your workflow is valid!</p>
              </div>
            ) : (
              validationErrors.map((error) => (
                <ValidationErrorItem key={error.id} error={error} />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

const ValidationErrorItem = ({ error }: { error: ValidationError }) => {
  const Icon = error.type === 'error' ? AlertCircle : AlertTriangle;
  const colorClass = error.type === 'error' ? 'text-red-500' : 'text-yellow-500';
  const bgClass = error.type === 'error' ? 'bg-red-500/10' : 'bg-yellow-500/10';
  
  return (
    <div className={`p-3 rounded-lg border ${bgClass} ${error.type === 'error' ? 'border-red-500/20' : 'border-yellow-500/20'}`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colorClass}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {error.message}
          </p>
          {error.nodeId && (
            <p className="text-xs text-foreground-muted mt-1">
              Node ID: {error.nodeId}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
