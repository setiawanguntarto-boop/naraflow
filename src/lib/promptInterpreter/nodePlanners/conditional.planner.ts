/**
 * Conditional Flow Planner
 * Plans nodes for conditional workflows with branching
 */

import { PromptAnalysis, NodePlan } from "../types";

const NODE_SPACING_X = 250;
const NODE_SPACING_Y = 150;

/**
 * Plan conditional workflow with if/else branches
 */
export function planConditionalWorkflow(analysis: PromptAnalysis): NodePlan[] {
  const plans: NodePlan[] = [];

  const nodeIds = {
    start: `start-${Date.now()}`,
    trigger: `trigger-${Date.now()}`,
    condition: `condition-${Date.now()}`,
    branchTrue: `branch-true-${Date.now()}`,
    branchFalse: `branch-false-${Date.now()}`,
    merge: `merge-${Date.now()}`,
    end: `end-${Date.now()}`,
  };

  let currentX = 100;
  const currentY = 300;

  // Start node
  plans.push({
    nodeId: nodeIds.start,
    nodeType: "default",
    position: { x: currentX, y: currentY },
    config: { label: "Start" },
    connections: [{ target: nodeIds.trigger, source_port: "default", target_port: "default" }],
  });

  // Trigger node
  currentX += NODE_SPACING_X;
  plans.push({
    nodeId: nodeIds.trigger,
    nodeType: "whatsapp.trigger",
    position: { x: currentX, y: currentY },
    config: {
      provider: "meta",
      webhookPath: "/webhook/conditional",
      validateSignature: true,
    },
    connections: [{ target: nodeIds.condition, source_port: "default", target_port: "default" }],
  });

  // Condition node (if/else switch)
  currentX += NODE_SPACING_X;
  plans.push({
    nodeId: nodeIds.condition,
    nodeType: "control.switch",
    position: { x: currentX, y: currentY },
    config: {
      condition: extractCondition(analysis),
      cases: [
        { value: "true", output: "if_branch" },
        { value: "false", output: "else_branch" },
      ],
    },
    connections: [
      { target: nodeIds.branchTrue, source_port: "if_branch", target_port: "default" },
      { target: nodeIds.branchFalse, source_port: "else_branch", target_port: "default" },
    ],
  });

  // True branch
  currentX += NODE_SPACING_X;
  plans.push({
    nodeId: nodeIds.branchTrue,
    nodeType: "default",
    position: { x: currentX, y: currentY - NODE_SPACING_Y },
    config: { label: "If True" },
    connections: [{ target: nodeIds.merge, source_port: "default", target_port: "default" }],
  });

  // False branch
  plans.push({
    nodeId: nodeIds.branchFalse,
    nodeType: "default",
    position: { x: currentX, y: currentY + NODE_SPACING_Y },
    config: { label: "If False" },
    connections: [{ target: nodeIds.merge, source_port: "default", target_port: "default" }],
  });

  // Merge node
  plans.push({
    nodeId: nodeIds.merge,
    nodeType: "default",
    position: { x: currentX + NODE_SPACING_X, y: currentY },
    config: { label: "Merge" },
    connections: [{ target: nodeIds.end, source_port: "default", target_port: "default" }],
  });

  // End node
  plans.push({
    nodeId: nodeIds.end,
    nodeType: "default",
    position: { x: currentX + NODE_SPACING_X * 2, y: currentY },
    config: { label: "End" },
    connections: [],
  });

  return plans;
}

function extractCondition(analysis: PromptAnalysis): string {
  // Extract condition from prompt entities or use default
  const entity = analysis.entities.find(e => e.field.includes("condition"));
  return entity ? `{{payload.${entity.field}}}` : "{{payload.condition}}";
}
