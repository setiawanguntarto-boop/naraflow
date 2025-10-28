/**
 * Custom hook for handling deployment with retry mechanism
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { deploymentClient, DeploymentData, DeploymentConfig } from '@/lib/deploymentClient';

export interface UseDeploymentReturn {
  isDeploying: boolean;
  error: string | null;
  deployWithRetry: (workflowData: DeploymentData, config: DeploymentConfig, retries?: number) => Promise<any>;
  clearError: () => void;
}

export const useDeployment = (): UseDeploymentReturn => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deployWithRetry = useCallback(async (
    workflowData: DeploymentData,
    config: DeploymentConfig,
    retries = 3
  ) => {
    setIsDeploying(true);
    setError(null);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Deployment attempt ${attempt} of ${retries}`);
        
        const result = await deploymentClient.deployWorkflow(workflowData, config);

        setIsDeploying(false);
        toast.success('Agent deployed successfully!', {
          description: `Deployed to ${config.environment}`,
          duration: 5000,
        });
        
        return result;

      } catch (err: any) {
        console.error(`Deployment attempt ${attempt} failed:`, err);
        
        if (attempt === retries) {
          // All retries exhausted
          const errorMessage = err.message || 'All deployment attempts failed';
          setError(errorMessage);
          
          toast.error('Deployment failed', {
            description: `Attempt ${attempt}/${retries} failed. ${errorMessage}`,
            duration: 5000,
          });
          
          setIsDeploying(false);
          throw new Error(errorMessage);
        } else {
          // Show retry notification
          toast.warning('Deployment retrying...', {
            description: `Attempt ${attempt}/${retries} failed. Retrying in a moment...`,
            duration: 3000,
          });
          
          // Exponential backoff: 1s, 2s, 4s, etc.
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
      }
    }

    setIsDeploying(false);
    throw new Error('All deployment attempts failed');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isDeploying,
    error,
    deployWithRetry,
    clearError,
  };
};

