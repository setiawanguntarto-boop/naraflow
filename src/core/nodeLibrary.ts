export interface NodeDefinition {
  id: string;
  displayName: string;
  type: string;
  category: string;
  description: string;
  inputType: string;
  outputType: string;
  defaultConnections: string[];
  exampleUseCase: string;
  icon: string;
  color: string;
  inputs?: Record<string, string>;
  outputs?: Record<string, string>;
  suggestedLabels?: {
    input: string[];
    output: string[];
  };
}

export const nodeLibrary: Record<string, NodeDefinition> = {
  start: {
    id: "start",
    displayName: "Start Workflow",
    type: "Start",
    category: "meta",
    description: "Entry point that triggers the workflow",
    inputType: "trigger",
    outputType: "flow",
    defaultConnections: ["flow.start"],
    exampleUseCase: "Begin automated farm monitoring when sensor detects sunrise",
    icon: "play-circle",
    color: "#22C55E",
    suggestedLabels: {
      input: [],
      output: ["flow.start"],
    },
  },
  ask_question: {
    id: "ask_question",
    displayName: "Ask Question",
    type: "Ask Input",
    category: "input",
    description: "Collect text, number, or multiple-choice input from user",
    inputType: "user",
    outputType: "text",
    defaultConnections: ["user.response", "user.declined"],
    exampleUseCase: "Ask farm owner to input current flock age via WhatsApp",
    icon: "message-circle",
    color: "#3B82F6",
    suggestedLabels: {
      input: ["user.ready"],
      output: ["ai.send", "data.processed"],
    },
  },
  sensor_data: {
    id: "sensor_data",
    displayName: "Sensor Data",
    type: "Sensor",
    category: "input",
    description: "Receive data from IoT sensors (temperature, humidity, pH, etc.)",
    inputType: "sensor",
    outputType: "numeric",
    defaultConnections: ["data.received", "sensor.error"],
    exampleUseCase: "Collect temperature readings from chicken coop sensors",
    icon: "thermometer",
    color: "#3B82F6",
    suggestedLabels: {
      input: ["sensor.trigger"],
      output: ["data.received", "sensor.error"],
    },
  },
  ai_analysis: {
    id: "ai_analysis",
    displayName: "AI Analysis",
    type: "Process Data",
    category: "processing",
    description: "Analyze data using AI to extract insights and patterns",
    inputType: "data",
    outputType: "insights",
    defaultConnections: ["analysis.complete", "analysis.failed"],
    exampleUseCase: "Analyze feed consumption patterns to predict optimal feeding times",
    icon: "brain",
    color: "#8B5CF6",
    suggestedLabels: {
      input: ["ai.send", "data.processed"],
      output: ["ai.result", "data.transformed"],
    },
  },
  calculate: {
    id: "calculate",
    displayName: "Calculate",
    type: "Calculate",
    category: "processing",
    description: "Perform mathematical calculations (sum, average, ratio, etc.)",
    inputType: "numeric",
    outputType: "numeric",
    defaultConnections: ["calculation.complete", "calculation.error"],
    exampleUseCase: "Calculate Feed Conversion Ratio (FCR) from feed and weight data",
    icon: "calculator",
    color: "#8B5CF6",
    suggestedLabels: {
      input: ["data.processed"],
      output: ["calculation.complete", "calculation.error"],
    },
  },
  decision: {
    id: "decision",
    displayName: "Decision",
    type: "Decision",
    category: "logic",
    description: "Route workflow based on conditions (if-then-else logic)",
    inputType: "condition",
    outputType: "route",
    defaultConnections: ["decision.yes", "decision.no"],
    exampleUseCase: "Route to alert if temperature exceeds safe threshold",
    icon: "git-branch",
    color: "#EAB308",
    suggestedLabels: {
      input: ["ai.result", "data.validated"],
      output: ["logic.yes", "logic.no", "logic.highPriority", "logic.standard"],
    },
  },
  send_message: {
    id: "send_message",
    displayName: "Send Message",
    type: "Send Message",
    category: "output",
    description: "Send WhatsApp message with dynamic content",
    inputType: "message",
    outputType: "confirmation",
    defaultConnections: ["message.sent", "message.failed"],
    exampleUseCase: "Notify farmer of critical temperature alert via WhatsApp",
    icon: "send",
    color: "#10B981",
    suggestedLabels: {
      input: ["notify.user", "alert.triggered", "logic.yes"],
      output: ["flow.complete"],
    },
  },
  store_records: {
    id: "store_records",
    displayName: "Store Records",
    type: "Save Data",
    category: "output",
    description: "Save data to database or file system",
    inputType: "data",
    outputType: "confirmation",
    defaultConnections: ["records.saved", "records.failed"],
    exampleUseCase: "Save daily feed consumption data to farm database",
    icon: "database",
    color: "#10B981",
    suggestedLabels: {
      input: ["db.save", "data.processed"],
      output: ["flow.complete"],
    },
  },
  fetch_external_data: {
    id: "fetch_external_data",
    displayName: "Fetch External Data",
    type: "API Call",
    category: "input",
    description: "Retrieve data from external APIs or web services",
    inputType: "request",
    outputType: "data",
    defaultConnections: ["data.fetched", "fetch.failed"],
    exampleUseCase: "Get weather forecast from weather API for farm planning",
    icon: "globe",
    color: "#3B82F6",
    suggestedLabels: {
      input: ["api.send"],
      output: ["api.receive", "data.processed"],
    },
  },
  end: {
    id: "end",
    displayName: "End Workflow",
    type: "End",
    category: "meta",
    description: "Terminate workflow execution",
    inputType: "flow",
    outputType: "none",
    defaultConnections: [],
    exampleUseCase: "Complete daily farm monitoring workflow",
    icon: "stop-circle",
    color: "#6D28D9",
    suggestedLabels: {
      input: ["flow.complete", "flow.end"],
      output: [],
    },
  },
};
