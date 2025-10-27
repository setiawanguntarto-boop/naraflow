/**
 * Auto-generated: Migrated Node Library v2 nodes to v3
 * Generated: 2025-10-26T08:47:57.922Z
 * 
 * This file contains v2 nodes migrated to v3 format.
 * These nodes maintain backward compatibility with existing workflows.
 */

import { NodeTypeDefinition } from '../nodeLibrary_v3';

export const v2MigratedNodes: Record<string, Partial<NodeTypeDefinition>> = {
  'start': {
    "id": "start",
    "version": "1.0.0",
    "label": "Start Workflow",
    "description": "Entry point that triggers the workflow",
    "category": "trigger",
    "configSchema": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "inputs": {},
    "outputs": {},
    "ui": {
        "icon": "play-circle",
        "category": "meta",
        "fieldsOrder": [],
        "helpLinks": []
    },
    "runtime": {
        "handler": "@/executors/startExecutor",
        "timeoutMs": 30000
    },
    "meta": {
        "tags": [
            "meta"
        ],
        "createdAt": "2025-10-26T08:47:57.564Z"
    }
},

  'ask_question': {
    "id": "ask_question",
    "version": "1.0.0",
    "label": "Ask Question",
    "description": "Collect text, number, or multiple-choice input from user",
    "category": "trigger",
    "configSchema": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "inputs": {},
    "outputs": {},
    "ui": {
        "icon": "message-circle",
        "category": "input",
        "fieldsOrder": [],
        "helpLinks": []
    },
    "runtime": {
        "handler": "@/executors/ask_questionExecutor",
        "timeoutMs": 30000
    },
    "meta": {
        "tags": [
            "input"
        ],
        "createdAt": "2025-10-26T08:47:57.577Z"
    }
},

  'sensor_data': {
    "id": "sensor_data",
    "version": "1.0.0",
    "label": "Sensor Data",
    "description": "Receive data from IoT sensors (temperature, humidity, pH, etc.)",
    "category": "trigger",
    "configSchema": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "inputs": {},
    "outputs": {},
    "ui": {
        "icon": "thermometer",
        "category": "input",
        "fieldsOrder": [],
        "helpLinks": []
    },
    "runtime": {
        "handler": "@/executors/sensor_dataExecutor",
        "timeoutMs": 30000
    },
    "meta": {
        "tags": [
            "input"
        ],
        "createdAt": "2025-10-26T08:47:57.579Z"
    }
},

  'ai_analysis': {
    "id": "ai_analysis",
    "version": "1.0.0",
    "label": "AI Analysis",
    "description": "Analyze data using AI to extract insights and patterns",
    "category": "logic",
    "configSchema": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "inputs": {},
    "outputs": {},
    "ui": {
        "icon": "brain",
        "category": "processing",
        "fieldsOrder": [],
        "helpLinks": []
    },
    "runtime": {
        "handler": "@/executors/ai_analysisExecutor",
        "timeoutMs": 30000
    },
    "meta": {
        "tags": [
            "processing"
        ],
        "createdAt": "2025-10-26T08:47:57.602Z"
    }
},

  'calculate': {
    "id": "calculate",
    "version": "1.0.0",
    "label": "Calculate",
    "description": "Perform mathematical calculations (sum, average, ratio, etc.)",
    "category": "logic",
    "configSchema": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "inputs": {},
    "outputs": {},
    "ui": {
        "icon": "calculator",
        "category": "processing",
        "fieldsOrder": [],
        "helpLinks": []
    },
    "runtime": {
        "handler": "@/executors/calculateExecutor",
        "timeoutMs": 30000
    },
    "meta": {
        "tags": [
            "processing"
        ],
        "createdAt": "2025-10-26T08:47:57.641Z"
    }
},

  'decision': {
    "id": "decision",
    "version": "1.0.0",
    "label": "Decision",
    "description": "Route workflow based on conditions (if-then-else logic)",
    "category": "control",
    "configSchema": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "inputs": {},
    "outputs": {},
    "ui": {
        "icon": "git-branch",
        "category": "logic",
        "fieldsOrder": [],
        "helpLinks": []
    },
    "runtime": {
        "handler": "@/executors/decisionExecutor",
        "timeoutMs": 30000
    },
    "meta": {
        "tags": [
            "logic"
        ],
        "createdAt": "2025-10-26T08:47:57.644Z"
    }
},

  'send_message': {
    "id": "send_message",
    "version": "1.0.0",
    "label": "Send Message",
    "description": "Send WhatsApp message with dynamic content",
    "category": "output",
    "configSchema": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "inputs": {},
    "outputs": {},
    "ui": {
        "icon": "send",
        "category": "output",
        "fieldsOrder": [],
        "helpLinks": []
    },
    "runtime": {
        "handler": "@/executors/send_messageExecutor",
        "timeoutMs": 30000
    },
    "meta": {
        "tags": [
            "output"
        ],
        "createdAt": "2025-10-26T08:47:57.651Z"
    }
},

  'store_records': {
    "id": "store_records",
    "version": "1.0.0",
    "label": "Store Records",
    "description": "Save data to database or file system",
    "category": "output",
    "configSchema": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "inputs": {},
    "outputs": {},
    "ui": {
        "icon": "database",
        "category": "output",
        "fieldsOrder": [],
        "helpLinks": []
    },
    "runtime": {
        "handler": "@/executors/store_recordsExecutor",
        "timeoutMs": 30000
    },
    "meta": {
        "tags": [
            "output"
        ],
        "createdAt": "2025-10-26T08:47:57.659Z"
    }
},

  'fetch_external_data': {
    "id": "fetch_external_data",
    "version": "1.0.0",
    "label": "Fetch External Data",
    "description": "Retrieve data from external APIs or web services",
    "category": "trigger",
    "configSchema": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "inputs": {},
    "outputs": {},
    "ui": {
        "icon": "globe",
        "category": "input",
        "fieldsOrder": [],
        "helpLinks": []
    },
    "runtime": {
        "handler": "@/executors/fetch_external_dataExecutor",
        "timeoutMs": 30000
    },
    "meta": {
        "tags": [
            "input"
        ],
        "createdAt": "2025-10-26T08:47:57.662Z"
    }
},

  'end': {
    "id": "end",
    "version": "1.0.0",
    "label": "End Workflow",
    "description": "Terminate workflow execution",
    "category": "trigger",
    "configSchema": {
        "type": "object",
        "properties": {},
        "required": []
    },
    "inputs": {},
    "outputs": {},
    "ui": {
        "icon": "stop-circle",
        "category": "meta",
        "fieldsOrder": [],
        "helpLinks": []
    },
    "runtime": {
        "handler": "@/executors/endExecutor",
        "timeoutMs": 30000
    },
    "meta": {
        "tags": [
            "meta"
        ],
        "createdAt": "2025-10-26T08:47:57.674Z"
    }
}
};

/**
 * Migration summary:
 * - Total v2 nodes: 10
 * - Successfully migrated: 10
 * - Errors: 0
 */
