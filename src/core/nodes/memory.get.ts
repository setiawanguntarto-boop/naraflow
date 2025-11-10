import { NodeTypeDefinition } from "../nodeLibrary_v3";

export const MemoryGetNode: NodeTypeDefinition = {
  id: "memory.get",
  version: "1.0.0",
  label: "Get Memory",
  description: "Read conversation memory for user/session",
  category: "utility",

  configSchema: {
    type: "object",
    properties: {
      key: {
        type: "string",
        description: "Memory key (supports {{placeholders}})",
      },
      scope: {
        type: "string",
        enum: ["user", "session", "workflow"],
        default: "user",
        description: "Memory scope",
      },
    },
    required: ["key", "scope"],
  },

  inputs: {
    default: {
      name: "default",
      type: "data",
      required: false,
      description: "Optional input data",
    },
  },

  outputs: {
    default: {
      name: "default",
      type: "data",
      description: "Retrieved memory value (null if not found)",
    },
  },

  metrics: {
    enabled: true,
    category: "technical",
    customizable: true,
    defaultMetrics: [
      {
        id: "read_count",
        label: "Read Operations",
        description: "Total memory read operations",
        type: "count",
        defaultValue: 0,
        required: true,
      },
      {
        id: "cache_hit_rate",
        label: "Cache Hit Rate",
        description: "Percentage of successful memory retrievals",
        type: "percentage",
        unit: "%",
        defaultValue: 0,
      },
      {
        id: "avg_read_time",
        label: "Average Read Time",
        description: "Average time to retrieve memory",
        type: "duration",
        unit: "ms",
        defaultValue: 0,
      },
      {
        id: "miss_count",
        label: "Cache Misses",
        description: "Number of times memory key not found",
        type: "count",
        defaultValue: 0,
      },
      {
        id: "scope_distribution",
        label: "Scope Distribution",
        description: "Distribution by scope (user/session/workflow)",
        type: "percentage",
        unit: "%",
        defaultValue: 0,
      },
    ],
  },

  ui: {
    icon: "database",
    category: "utility",
    fieldsOrder: ["key", "scope"],
    helpLinks: ["docs/memory-management"],
  },

  runtime: {
    handler: "@/lib/executors/memoryGetExecutor",
    timeoutMs: 1000,
    retry: {
      count: 0,
      backoffMs: 1000,
    },
  },

  meta: {
    tags: ["memory", "state", "utility"],
    author: "Naraflow Team",
    createdAt: "2025-01-01",
  },
};
