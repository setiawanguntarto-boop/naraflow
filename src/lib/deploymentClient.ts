/**
 * Enhanced Deployment Client
 * Provides robust error handling and validation for workflow deployment
 */

import type { CloudConfig } from './cloudInfrastructureDetector';

export interface DeploymentConfig {
  agentName: string;
  environment: "staging" | "production";
  phoneNumberId: string;
  accessToken: string;
  wabaId?: string;
  webhookUrl?: string;
  apiKey?: string;
  cloudConfig?: CloudConfig;
}

export interface DeploymentData {
  agentName: string;
  environment: string;
  phoneNumberId: string;
  accessToken: string;
  wabaId?: string;
  webhookUrl?: string;
  apiKey?: string;
  workflow: {
    nodes: any[];
    edges: any[];
  };
  cloudConfig?: CloudConfig;
}

export interface DeploymentResponse {
  success: boolean;
  endpoint?: string;
  agentId?: string;
  message?: string;
  error?: string;
}

export interface DeploymentStep {
  name: string;
  status: "pending" | "running" | "success" | "error";
  duration?: number;
  message?: string;
}

/**
 * Deployment Client with enhanced error handling
 */
export class DeploymentClient {
  private baseURL: string;
  private timeoutMs: number;

  constructor(baseURL: string = "/api", timeoutMs: number = 30000) {
    this.baseURL = baseURL;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Deploy workflow with comprehensive error handling
   */
  async deployWorkflow(
    workflowData: DeploymentData,
    config: DeploymentConfig
  ): Promise<DeploymentResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      console.log("Starting deployment request...", {
        agentName: config.agentName,
        environment: config.environment,
      });

      const response = await fetch(`${this.baseURL}/deploy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          agentName: config.agentName,
          environment: config.environment,
          phoneNumberId: config.phoneNumberId,
          accessToken: config.accessToken,
          wabaId: config.wabaId,
          webhookUrl: workflowData.webhookUrl,
          apiKey: workflowData.apiKey,
          workflow: workflowData.workflow,
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Log response status
      console.log("Response received:", {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get("content-type"),
      });

      // Check if response is OK
      if (!response.ok) {
        const errorText = await this.getResponseText(response);
        console.error("HTTP error response:", errorText);

        // Try to parse as JSON for error details
        let errorData: any = {};
        try {
          errorData = errorText ? JSON.parse(errorText) : {};
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }

        throw new Error(
          errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      // Get response text
      const responseText = await this.getResponseText(response);

      // Check if response is empty
      if (!responseText || !responseText.trim()) {
        console.error("Empty response received");
        throw new Error("Server returned empty response. Please try again.");
      }

      // Try to parse JSON
      let data: DeploymentResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError: any) {
        console.error("JSON parse error:", parseError);
        console.error("Response text:", responseText);
        throw new Error(
          `Invalid JSON response from server: ${responseText.substring(0, 200)}...`
        );
      }

      // Validate response structure
      if (!data.success && !data.error) {
        console.error("Invalid response structure:", data);
        throw new Error("Invalid response format from server");
      }

      console.log("Deployment successful:", data);
      return data;

    } catch (error: any) {
      console.error("Deployment error:", error);

      // Handle specific error cases
      if (error.name === "AbortError") {
        throw new Error("Deployment timeout - server took too long to respond. Please check your connection and try again.");
      }

      if (error.message?.includes("fetch")) {
        throw new Error("Network error - unable to reach deployment server. Please check your connection.");
      }

      if (error.message?.includes("JSON")) {
        throw new Error("Server response error - received invalid data. Please contact support.");
      }

      // Return or rethrow the error
      throw error;
    }
  }

  /**
   * Get response text with error handling
   */
  private async getResponseText(response: Response): Promise<string> {
    try {
      const text = await response.text();
      return text;
    } catch (error: any) {
      console.error("Failed to read response text:", error);
      return "";
    }
  }

  /**
   * Simulate deployment steps for UI feedback
   */
  async simulateDeploymentSteps(): Promise<DeploymentStep[]> {
    const steps: DeploymentStep[] = [
      { name: "Validation Check", status: "running", message: "Validating workflow structure..." },
    ];

    // Simulate each step with delays
    await this.delay(800);
    steps[0] = { name: "Validation Check", status: "success", duration: 800 };

    steps.push({ name: "Environment Setup", status: "running", message: "Setting up environment..." });
    await this.delay(1000);
    steps[1] = { name: "Environment Setup", status: "success", duration: 1000 };

    steps.push({ name: "Resource Allocation", status: "running", message: "Allocating resources..." });
    await this.delay(1200);
    steps[2] = { name: "Resource Allocation", status: "success", duration: 1200 };

    steps.push({ name: "Workflow Compilation", status: "running", message: "Compiling workflow..." });
    await this.delay(1500);
    steps[3] = { name: "Workflow Compilation", status: "success", duration: 1500 };

    steps.push({ name: "Agent Deployment", status: "running", message: "Deploying agent..." });
    await this.delay(1800);
    steps[4] = { name: "Agent Deployment", status: "success", duration: 1800 };

    steps.push({ name: "Health Check", status: "running", message: "Running health checks..." });
    await this.delay(1000);
    steps[5] = { name: "Health Check", status: "success", duration: 1000 };

    return steps;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate deployment configuration
   */
  validateConfig(config: DeploymentConfig, workflow: { nodes: any[]; edges: any[] }): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.agentName?.trim()) {
      errors.push("Agent name is required");
    }

    if (!config.phoneNumberId?.trim()) {
      errors.push("Phone Number ID is required");
    }

    if (!config.accessToken?.trim()) {
      errors.push("Access Token is required");
    }

    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push("Workflow cannot be empty");
    }

    // Validate workflow structure
    // Accept either an explicit 'start' node, any 'input' node,
    // or a node with no incoming edges as an implicit start.
    const nodes = workflow.nodes || [];
    const edges = workflow.edges || [];
    const explicitStart = nodes.some((n: any) => n.type === "start");
    const hasInputNode = nodes.some((n: any) => n.type === "input");
    const hasImplicitStart = nodes.some((n: any) => !edges.some((e: any) => e.target === n.id));
    const hasStartNode = explicitStart || hasInputNode || hasImplicitStart;
    if (!hasStartNode) {
      errors.push("Workflow must have a start node or an input/entry node");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const deploymentClient = new DeploymentClient();

