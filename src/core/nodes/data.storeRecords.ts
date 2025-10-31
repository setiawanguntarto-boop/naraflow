import { NodeTypeDefinition } from "../nodeLibrary_v3";

export const StoreRecordsNode: NodeTypeDefinition = {
  id: "data.storeRecords",
  version: "1.0.0",
  label: "Store Records",
  description: "Store structured records to a destination (local storage, HTTP API, or Google Sheets-like).",
  category: "output",

  configSchema: {
    type: "object",
    properties: {
      destination: { type: "string", enum: ["storage", "http"], default: "storage" },
      key: { type: "string", default: "records", description: "Storage key or dataset name when destination=storage" },
      httpUrl: { type: "string", description: "HTTP endpoint to POST records when destination=http" },
      httpHeaders: {
        type: "array",
        items: { type: "object", properties: { key: { type: "string" }, value: { type: "string" } }, required: ["key", "value"] },
      },
      mode: { type: "string", enum: ["append", "upsert"], default: "append" },
      upsertKey: { type: "string", description: "Field name used as unique key for upsert mode" },
      recordsPath: { type: "string", default: "payload", description: "Dot path to array of records in input payload" },
      fieldMapping: {
        type: "array",
        description: "Map incoming fields to output fields",
        items: {
          type: "object",
          properties: { from: { type: "string" }, to: { type: "string" } },
          required: ["from", "to"],
        },
        default: [],
      },
      addTimestamp: { type: "boolean", default: true },
      timestampField: { type: "string", default: "_ts" },
      batchSize: { type: "number", default: 0, description: "0 = no batching; >0 to split into chunks" },
    },
    required: ["destination", "mode", "recordsPath"],
  },

  inputs: {
    default: { name: "default", type: "data", required: true, description: "Payload containing records" },
  },

  outputs: {
    default: { name: "default", type: "confirmation", description: "Store summary" },
    error: { name: "error", type: "route", description: "Emitted when store operation fails" },
  },

  ui: {
    icon: "database",
    category: "output",
    fieldsOrder: [
      "destination",
      "key",
      "httpUrl",
      "httpHeaders",
      "mode",
      "upsertKey",
      "recordsPath",
      "fieldMapping",
    ],
    advanced: { collapsed: true, fields: ["addTimestamp", "timestampField", "batchSize"] },
    helpLinks: ["docs/store-records"],
  },

  runtime: {
    handler: "@/lib/executors/storeRecordsExecutor",
    timeoutMs: 20000,
  },

  security: { authType: "none" },
  meta: { tags: ["storage", "output"], author: "Naraflow Team", createdAt: new Date().toISOString() },
};


