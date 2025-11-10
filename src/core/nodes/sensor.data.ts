import { NodeTypeDefinition } from "../nodeLibrary_v3";

export const SensorDataNode: NodeTypeDefinition = {
  id: "sensor.data",
  version: "1.0.0",
  label: "Sensor Data",
  description:
    "Receive data from sensors via Webhook/MQTT/HTTP Polling. Define metric mappings, units, and validation thresholds.",
  category: "trigger",

  configSchema: {
    type: "object",
    properties: {
      sourceType: {
        type: "string",
        enum: ["webhook", "mqtt", "http_poll"],
        default: "webhook",
        description: "How sensor data arrives",
      },
      webhookPath: {
        type: "string",
        pattern: "^/webhook/",
        description: "Webhook endpoint path (when sourceType=webhook)",
      },
      mqtt: {
        type: "object",
        properties: {
          brokerUrl: { type: "string", description: "MQTT broker URL" },
          topic: { type: "string", description: "MQTT topic to subscribe" },
          username: { type: "string" },
          password: { type: "string" },
        },
      },
      httpPoll: {
        type: "object",
        properties: {
          url: { type: "string", description: "HTTP endpoint to poll" },
          intervalSec: { type: "number", default: 60, description: "Polling interval in seconds" },
        },
      },
      metrics: {
        type: "array",
        description: "Configure each metric mapping and validation",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "Metric identifier (e.g., temp_c)" },
            label: { type: "string", description: "Human readable label" },
            path: { type: "string", description: "Dot path to extract from payload (e.g., data.temp)" },
            type: { type: "string", enum: ["number", "text", "boolean"], default: "number" },
            unit: { type: "string", description: "Unit (e.g., °C, %RH, ppm)" },
            required: { type: "boolean", default: true },
            min: { type: "number", description: "Valid minimum value (number)" },
            max: { type: "number", description: "Valid maximum value (number)" },
            aggregation: { type: "string", enum: ["none", "avg", "min", "max"], default: "none" },
            windowSec: { type: "number", default: 0, description: "Aggregation window secs (0=none)" },
          },
          required: ["id", "path", "type"],
        },
      },
      dedupeWindowSec: { type: "number", default: 60, description: "Deduplicate identical payloads within window" },
      dropOutOfRange: { type: "boolean", default: false, description: "Drop readings outside min/max" },
      saveToMemoryKey: { type: "string", description: "Persist latest readings in memory under this key" },

      // Advanced payload mapping
      timestampPath: { type: "string", description: "Dot path to timestamp in payload" },
      deviceIdPath: { type: "string", description: "Dot path to device ID in payload" },
      qualityFlagPath: { type: "string", description: "Dot path to quality flag in payload" },
      dedupeKeyPath: { type: "string", description: "Dot path used to deduplicate events" },

      // Sampling & smoothing
      samplingRateSec: { type: "number", default: 0, description: "Downsample rate in seconds (0=disabled)" },
      smoothing: { type: "string", enum: ["none", "ema"], default: "none", description: "Apply smoothing to number metrics" },
      smoothingAlpha: { type: "number", default: 0.3, description: "EMA alpha (0-1) when smoothing=ema" },

      // Defaults for aggregation
      defaultAggregation: { type: "string", enum: ["none", "avg", "min", "max"], default: "none" },
      defaultWindowSec: { type: "number", default: 0 },

      // Out-of-range policy & alerts
      onOutOfRange: { type: "string", enum: ["drop", "clip", "route"], default: "drop" },
      alertThresholds: {
        type: "array",
        items: {
          type: "object",
          properties: {
            metricId: { type: "string" },
            operator: { type: "string", enum: [">", ">=", "<", "<=", "=="] },
            value: { type: "number" },
          },
          required: ["metricId", "operator", "value"],
        },
        description: "Send alert when condition matched (integration handled externally)",
      },

      // Persistence
      persistHistory: { type: "boolean", default: false },
      historyRetention: { type: "number", default: 1000, description: "How many records to retain in history" },

      // Unit & device allowlist
      unitOverrides: {
        type: "array",
        items: { type: "object", properties: { metricId: { type: "string" }, from: { type: "string" }, to: { type: "string" } }, required: ["metricId", "from", "to"] },
      },
      allowlistDeviceIds: { type: "array", items: { type: "string" }, description: "Only accept readings from listed devices" },
    },
    required: ["sourceType", "metrics"],
  },

  inputs: {
    webhook: { name: "webhook", type: "trigger", required: false, description: "Webhook trigger (when sourceType=webhook)" },
  },

  outputs: {
    default: { name: "default", type: "data", description: "Normalized sensor readings { metrics: Record<string, any> }" },
    dropped: { name: "dropped", type: "route", description: "Emitted when reading dropped due to validation" },
  },

  ui: {
    icon: "thermometer",
    category: "trigger",
    fieldsOrder: [
      "sourceType",
      "webhookPath",
      "mqtt",
      "httpPoll",
      "metrics",
    ],
    advanced: {
      collapsed: true,
      fields: [
        "dedupeWindowSec",
        "dropOutOfRange",
        "saveToMemoryKey",
        "timestampPath",
        "deviceIdPath",
        "qualityFlagPath",
        "dedupeKeyPath",
        "samplingRateSec",
        "smoothing",
        "smoothingAlpha",
        "defaultAggregation",
        "defaultWindowSec",
        "onOutOfRange",
        "alertThresholds",
        "persistHistory",
        "historyRetention",
        "unitOverrides",
        "allowlistDeviceIds",
      ],
    },
    helpLinks: ["docs/sensor-data"],
  },

  runtime: {
    handler: "@/lib/executors/sensorDataExecutor",
    timeoutMs: 15000,
  },

  security: { authType: "none" },
  meta: { tags: ["sensor", "input", "trigger"], author: "Naraflow Team", createdAt: new Date().toISOString() },
};


