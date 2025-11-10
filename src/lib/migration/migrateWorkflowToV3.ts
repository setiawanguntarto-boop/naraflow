/**
 * Workflow migration utility: v2 ids -> v3 ids
 * Call this on workflow load/import before rendering.
 */

export interface WorkflowNodeLite {
  id: string;
  type: string; // node type id
  data?: any;
}

export interface WorkflowLite {
  nodes: WorkflowNodeLite[];
  edges: any[];
}

const ID_MAP: Record<string, string> = {
  start: "start", // no v3 replacement defined; keep as-is
  end: "end",
  ask_question: "interaction.askQuestion",
  sensor_data: "sensor.data",
  ai_analysis: "ai.analysis",
  calculate: "process.calculate",
  decision: "control.decision",
  send_message: "comm.sendMessage",
  store_records: "data.storeRecords",
  fetch_external_data: "data.fetchExternal",
};

export function migrateWorkflowToV3<T extends WorkflowLite>(wf: T): T {
  const migratedNodes = wf.nodes.map(n => {
    const mapped = ID_MAP[n.type];
    if (!mapped) return n;
    return { ...n, type: mapped };
  });
  return { ...(wf as any), nodes: migratedNodes };
}


