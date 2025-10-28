/**
 * Context-Aware Help System
 * Provides contextual help based on current workflow state
 */

import { useCallback, useMemo } from "react";
import { useUIState } from "./useWorkflowState";
import { useNodes, useEdges } from "./useWorkflowState";
import { workflowFeatures, type FeatureData } from "@/data/workflowFeatures";

export function useContextAwareHelp() {
  const uiState = useUIState();
  const nodes = useNodes();
  const edges = useEdges();

  const getContextualHelp = useCallback((): FeatureData | null => {
    // If validation panel is shown, show validation help
    if (uiState.showValidation) {
      return workflowFeatures.validation;
    }

    // If no nodes, suggest describe workflow
    if (Object.keys(nodes).length === 0) {
      return workflowFeatures["describe-workflow"];
    }

    // If validation errors exist
    const errorCount = Object.values(uiState.validationErrors || {}).length;
    if (errorCount > 0) {
      return workflowFeatures.validation;
    }

    // If config panel is likely open
    if (uiState.selectedNodeId) {
      return workflowFeatures["node-configuration"];
    }

    // If execution is in progress
    if (uiState.executionState?.isExecuting) {
      return workflowFeatures["execution-system"];
    }

    // Default to workflow canvas
    return workflowFeatures["workflow-canvas"];
  }, [uiState, nodes]);

  const getSuggestedFeatures = useCallback((): FeatureData[] => {
    const suggestions: FeatureData[] = [];

    // If empty workflow, suggest getting started
    if (Object.keys(nodes).length === 0) {
      suggestions.push(
        workflowFeatures["describe-workflow"],
        workflowFeatures["node-library"]
      );
      return suggestions;
    }

    // If workflow has nodes but no validation, suggest validation
    const edgeCount = Object.keys(edges).length;
    if (edgeCount === 0) {
      suggestions.push(workflowFeatures["workflow-canvas"]);
    }

    // If workflow is large, suggest optimization
    const nodeCount = Object.keys(nodes).length;
    if (nodeCount > 20) {
      suggestions.push(workflowFeatures.optimization);
    }

    // Always suggest validation before deployment
    suggestions.push(workflowFeatures.validation);

    // If workflow is complete, suggest deployment
    if (edgeCount > 0 && !uiState.validationErrors) {
      suggestions.push(workflowFeatures.deployment);
    }

    return suggestions;
  }, [nodes, edges, uiState]);

  const getFeatureById = useCallback((featureId: string): FeatureData | null => {
    return workflowFeatures[featureId] || null;
  }, []);

  const searchFeatures = useCallback((query: string): FeatureData[] => {
    if (!query.trim()) return [];
    
    const normalizedQuery = query.toLowerCase();
    return Object.values(workflowFeatures)
      .filter(feature => 
        feature.title.toLowerCase().includes(normalizedQuery) ||
        feature.description.toLowerCase().includes(normalizedQuery) ||
        feature.usage?.toLowerCase().includes(normalizedQuery) ||
        feature.tips?.some(tip => tip.toLowerCase().includes(normalizedQuery))
      );
  }, []);

  const helpContext = useMemo(() => {
    return {
      nodeCount: Object.keys(nodes).length,
      edgeCount: Object.keys(edges).length,
      hasValidationErrors: Object.values(uiState.validationErrors || {}).length > 0,
      hasSelectedNode: !!uiState.selectedNodeId,
      isExecuting: !!uiState.executionState?.isExecuting,
    };
  }, [nodes, edges, uiState]);

  return {
    getContextualHelp,
    getSuggestedFeatures,
    getFeatureById,
    searchFeatures,
    helpContext,
  };
}

