/**
 * Enhanced Error Display Component for Deployment Failures
 */

import { XCircle, RefreshCw, ExternalLink, Copy, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DeploymentErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryEnabled?: boolean;
}

export const DeploymentErrorDisplay = ({ 
  error, 
  onRetry, 
  onDismiss,
  retryEnabled = true 
}: DeploymentErrorDisplayProps) => {
  const copyErrorToClipboard = () => {
    navigator.clipboard.writeText(error);
    toast.success('Error details copied to clipboard');
  };

  const getErrorCategory = (errorMsg: string): {
    icon: typeof XCircle;
    title: string;
    suggestions: string[];
  } => {
    const msg = errorMsg.toLowerCase();
    
    if (msg.includes('timeout') || msg.includes('took too long')) {
      return {
        icon: XCircle,
        title: 'Deployment Timeout',
        suggestions: [
          'Check your network connection and try again',
          'The server might be experiencing high load',
          'Try again in a few minutes',
          'Contact support if the issue persists',
        ],
      };
    }
    
    if (msg.includes('network') || msg.includes('connection')) {
      return {
        icon: XCircle,
        title: 'Network Connection Error',
        suggestions: [
          'Check your internet connection',
          'Verify your firewall settings',
          'Try refreshing your network',
          'Contact your network administrator',
        ],
      };
    }
    
    if (msg.includes('json') || msg.includes('invalid')) {
      return {
        icon: AlertTriangle,
        title: 'Server Response Error',
        suggestions: [
          'The server returned invalid data',
          'This might be a temporary server issue',
          'Try again in a few moments',
          'Contact support if problem continues',
        ],
      };
    }
    
    if (msg.includes('validation') || msg.includes('workflow')) {
      return {
        icon: AlertTriangle,
        title: 'Workflow Validation Failed',
        suggestions: [
          'Review your workflow for errors',
          'Ensure all nodes are properly configured',
          'Check for missing required connections',
          'Validate all input parameters',
        ],
      };
    }
    
    return {
      icon: XCircle,
      title: 'Deployment Failed',
      suggestions: [
        'Check your internet connection',
        'Verify the API endpoint is accessible',
        'Ensure all required validations pass',
        'Try again in a few moments',
      ],
    };
  };

  const errorCategory = getErrorCategory(error);

  return (
    <div className="rounded-lg bg-white border-2 border-red-300 p-4 space-y-3 text-black">
      <div className="flex items-start gap-3">
        <errorCategory.icon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-black text-base mb-2">
            {errorCategory.title}
          </h4>
          
          <div className="p-3 bg-white rounded-lg border-2 border-red-300 shadow-sm">
            <p className="text-black text-sm font-semibold break-words">
              {error}
            </p>
          </div>
          
          <div className="mt-3 space-y-2">
            <p className="text-sm font-bold text-black">
              Suggested solutions:
            </p>
            <ul className="space-y-1.5 ml-4">
              {errorCategory.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-black flex items-start gap-2 font-medium">
                  <span className="text-red-600 mt-0.5 font-bold">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-red-200">
        {retryEnabled && onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="border-2 border-red-600 bg-white text-red-700 hover:bg-red-50 hover:border-red-700 font-medium"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry Deployment
          </Button>
        )}
        
        <Button
          onClick={copyErrorToClipboard}
          variant="outline"
          size="sm"
          className="border-2 border-red-600 bg-white text-red-700 hover:bg-red-50 hover:border-red-700 font-medium"
        >
          <Copy className="w-3 h-3 mr-1" />
          Copy Error
        </Button>
        
        {onDismiss && (
          <Button
            onClick={onDismiss}
            variant="ghost"
            size="sm"
            className="text-red-800 hover:bg-red-50 ml-auto font-medium"
          >
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
};

