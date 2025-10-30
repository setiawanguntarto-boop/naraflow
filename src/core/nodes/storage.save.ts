import { NodeTypeDefinition } from "../nodeLibrary_v3";

export const StorageSaveNode: NodeTypeDefinition = {
  id: "storage.save",
  version: "1.0.0",
  label: "Store Records",
  description: "Save data to storage (Google Sheets, Database, or Cloud Storage)",
  category: "output",

  configSchema: {
    type: "object",
    properties: {
      destination: {
        type: "string",
        enum: ["google_sheets", "supabase", "local_storage"],
        default: "google_sheets",
        description: "Storage destination"
      },
      sheetId: {
        type: "string",
        description: "Google Sheets ID or Database table name"
      },
      sheetName: {
        type: "string",
        description: "Sheet tab name or table name"
      },
      writeMode: {
        type: "string",
        enum: ["append", "overwrite", "update"],
        default: "append",
        description: "How to write data"
      },
      fieldMapping: {
        type: "array",
        items: {
          type: "object",
          properties: {
            source: { type: "string", description: "Source field from payload" },
            target: { type: "string", description: "Target column in storage" },
            transform: { type: "string", enum: ["none", "uppercase", "lowercase", "date"], default: "none" }
          }
        },
        default: [],
        description: "Map payload fields to storage columns"
      },
      primaryKey: {
        type: "string",
        description: "Primary key field for update mode"
      },
      includeTimestamp: {
        type: "boolean",
        default: true,
        description: "Add timestamp column"
      },
      onConflict: {
        type: "string",
        enum: ["ignore", "overwrite", "fail"],
        default: "ignore",
        description: "Conflict resolution strategy"
      }
    },
    required: ["destination", "sheetId"]
  },

  inputs: {
    default: {
      name: "default",
      type: "data",
      required: true,
      description: "Data to be stored"
    }
  },

  outputs: {
    success: {
      name: "success",
      type: "confirmation",
      description: "Data saved successfully"
    },
    error: {
      name: "error",
      type: "confirmation",
      description: "Save failed"
    }
  },

  ui: {
    icon: "database",
    category: "output",
    fieldsOrder: ["destination", "sheetId", "sheetName", "writeMode", "fieldMapping", "primaryKey", "includeTimestamp", "onConflict"],
    helpLinks: ["https://docs.lovable.dev/integrations/google-sheets"]
  },

  runtime: {
    handler: "@/lib/executors/storageSaveExecutor",
    timeoutMs: 30000,
    retry: {
      count: 2,
      backoffMs: 2000
    }
  },

  meta: {
    tags: ["storage", "database", "output", "save"]
  }
};
