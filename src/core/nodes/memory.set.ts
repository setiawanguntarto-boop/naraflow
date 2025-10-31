import { NodeTypeDefinition } from "../nodeLibrary_v3";

export const MemorySetNode: NodeTypeDefinition = {
  id: "memory.set",
  version: "1.0.0",
  label: "Set Memory",
  description: "Write conversation memory for user/session",
  category: "utility",

  configSchema: {
    type: "object",
    properties: {
      key: {
        type: "string",
        description: "Memory key (supports {{placeholders}})",
      },
      value: {
        description: "Memory value to store",
      },
      merge: {
        type: "boolean",
        default: true,
        description: "Merge with existing value instead of replace",
      },
    },
    required: ["key", "value"],
  },

  inputs: {
    default: {
      name: "default",
      type: "data",
      required: true,
    },
  },

  outputs: {
    default: {
      name: "default",
      type: "data",
      description: "Updated memory object",
    },
  },

  metrics: {
    enabled: true,
    category: "technical",
    customizable: true,
    defaultMetrics: [
      {
        id: "write_count",
        label: "Write Operations",
        description: "Total memory write operations",
        type: "count",
        defaultValue: 0,
        required: true,
      },
      {
        id: "success_rate",
        label: "Write Success Rate",
        description: "Percentage of successful memory writes",
        type: "percentage",
        unit: "%",
        defaultValue: 100,
        required: true,
      },
      {
        id: "avg_write_time",
        label: "Average Write Time",
        description: "Average time to write memory",
        type: "duration",
        unit: "ms",
        defaultValue: 0,
      },
      {
        id: "merge_operations",
        label: "Merge Operations",
        description: "Number of merge vs replace operations",
        type: "count",
        defaultValue: 0,
      },
      {
        id: "data_size_avg",
        label: "Average Data Size",
        description: "Average size of stored data",
        type: "number",
        unit: "bytes",
        defaultValue: 0,
      },
      {
        id: "failed_writes",
        label: "Failed Writes",
        description: "Number of failed write operations",
        type: "count",
        defaultValue: 0,
      },
    ],
  },

  ui: {
    icon: "database",
    category: "utility",
    fieldsOrder: ["key", "value", "merge"],
  },

  runtime: {
    handler: "@/lib/executors/memorySetExecutor",
    timeoutMs: 1000,
    retry: {
      count: 0,
      backoffMs: 1000,
    },
  },

  meta: {
    tags: ["memory", "state", "utility"],
  },
};
