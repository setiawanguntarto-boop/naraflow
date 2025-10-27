import { ConnectionLabelLibrary } from '@/types/connectionLabel.types';

export const connectionLabelLibrary: ConnectionLabelLibrary = {
  version: "1.0.0",
  categories: {
    flowControl: {
      title: "Flow Control",
      color: "#9CA3AF",
      labels: [
        { 
          id: "flow.start", 
          displayName: "Start", 
          category: "flowControl",
          color: "#9CA3AF",
          description: "Entry point of the workflow" 
        },
        { 
          id: "flow.complete", 
          displayName: "Complete", 
          category: "flowControl",
          color: "#9CA3AF",
          description: "Marks successful completion of a path" 
        },
        { 
          id: "flow.end", 
          displayName: "End", 
          category: "flowControl",
          color: "#9CA3AF",
          description: "Terminates workflow" 
        },
        { 
          id: "flow.abort", 
          displayName: "Abort", 
          category: "flowControl",
          color: "#9CA3AF",
          description: "Stops workflow due to failure or user cancel" 
        }
      ]
    },
    userInteraction: {
      title: "User Interaction",
      color: "#3B82F6",
      labels: [
        { 
          id: "user.ready", 
          displayName: "User Ready", 
          category: "userInteraction",
          color: "#3B82F6",
          description: "User has confirmed readiness to continue" 
        },
        { 
          id: "user.confirmed", 
          displayName: "User Confirmed", 
          category: "userInteraction",
          color: "#3B82F6",
          description: "User agreed to prompt" 
        },
        { 
          id: "user.declined", 
          displayName: "User Declined", 
          category: "userInteraction",
          color: "#3B82F6",
          description: "User opted out of next step" 
        }
      ]
    },
    aiAutomation: {
      title: "AI & Automation",
      color: "#8B5CF6",
      labels: [
        { 
          id: "ai.send", 
          displayName: "Send to AI", 
          category: "aiAutomation",
          color: "#8B5CF6",
          description: "Forward data to AI processor" 
        },
        { 
          id: "ai.result", 
          displayName: "AI Result", 
          category: "aiAutomation",
          color: "#8B5CF6",
          description: "Return from AI node" 
        },
        { 
          id: "ai.classify", 
          displayName: "Classify as", 
          category: "aiAutomation",
          color: "#8B5CF6",
          description: "AI classification output" 
        }
      ]
    },
    logicRouting: {
      title: "Logic & Routing",
      color: "#EAB308",
      labels: [
        { 
          id: "logic.yes", 
          displayName: "Yes", 
          category: "logicRouting",
          color: "#EAB308",
          description: "Conditional path — true branch" 
        },
        { 
          id: "logic.no", 
          displayName: "No", 
          category: "logicRouting",
          color: "#EAB308",
          description: "Conditional path — false branch" 
        },
        { 
          id: "logic.highPriority", 
          displayName: "High Priority", 
          category: "logicRouting",
          color: "#EAB308",
          description: "AI classified input as high priority" 
        },
        { 
          id: "logic.standard", 
          displayName: "Standard", 
          category: "logicRouting",
          color: "#EAB308",
          description: "Default or normal route" 
        }
      ]
    },
    dataProcessing: {
      title: "Data Processing",
      color: "#A855F7",
      labels: [
        { 
          id: "data.processed", 
          displayName: "Processed", 
          category: "dataProcessing",
          color: "#A855F7",
          description: "Data processed successfully" 
        },
        { 
          id: "data.transformed", 
          displayName: "Transformed", 
          category: "dataProcessing",
          color: "#A855F7",
          description: "Data structure changed" 
        },
        { 
          id: "data.filtered", 
          displayName: "Filtered", 
          category: "dataProcessing",
          color: "#A855F7",
          description: "Filtered subset passed through" 
        },
        { 
          id: "data.validated", 
          displayName: "Validated", 
          category: "dataProcessing",
          color: "#A855F7",
          description: "Data validation completed" 
        }
      ]
    },
    notifications: {
      title: "Notifications",
      color: "#10B981",
      labels: [
        { 
          id: "notify.user", 
          displayName: "Notify User", 
          category: "notifications",
          color: "#10B981",
          description: "Send user notification" 
        },
        { 
          id: "notify.admin", 
          displayName: "Notify Admin", 
          category: "notifications",
          color: "#10B981",
          description: "Send admin notification" 
        },
        { 
          id: "alert.triggered", 
          displayName: "Alert Triggered", 
          category: "notifications",
          color: "#10B981",
          description: "Trigger alert event" 
        }
      ]
    },
    integration: {
      title: "Integration Hooks",
      color: "#F97316",
      labels: [
        { 
          id: "api.send", 
          displayName: "Send to API", 
          category: "integration",
          color: "#F97316",
          description: "Push data to external API" 
        },
        { 
          id: "api.receive", 
          displayName: "Receive Update", 
          category: "integration",
          color: "#F97316",
          description: "Webhook or data callback received" 
        },
        { 
          id: "db.save", 
          displayName: "Save to Database", 
          category: "integration",
          color: "#F97316",
          description: "Commit data to DB" 
        }
      ]
    },
    errorHandling: {
      title: "ERROR HANDLING",
      color: "#EF4444",
      labels: [
        { 
          id: "error.retry", 
          displayName: "Retry", 
          category: "errorHandling",
          color: "#EF4444",
          description: "Retry operation after error" 
        },
        { 
          id: "error.alert", 
          displayName: "Alert", 
          category: "errorHandling",
          color: "#EF4444",
          description: "Send alert for error" 
        },
        { 
          id: "error.abort", 
          displayName: "Abort", 
          category: "errorHandling",
          color: "#EF4444",
          description: "Abort workflow due to error" 
        },
        { 
          id: "error.escalated", 
          displayName: "Escalated", 
          category: "errorHandling",
          color: "#EF4444",
          description: "Error escalated to supervisor" 
        },
        { 
          id: "error.sensor", 
          displayName: "Sensor Error", 
          category: "errorHandling",
          color: "#EF4444",
          description: "IoT sensor communication failed" 
        }
      ]
    },
    timing: {
      title: "TIMING",
      color: "#8B5CF6",
      labels: [
        { 
          id: "timing.waitComplete", 
          displayName: "Wait Complete", 
          category: "timing",
          color: "#8B5CF6",
          description: "Wait period completed" 
        },
        { 
          id: "timing.waitTimeout", 
          displayName: "Wait Timeout", 
          category: "timing",
          color: "#8B5CF6",
          description: "Wait period timed out" 
        },
        { 
          id: "timing.scheduleReady", 
          displayName: "Schedule Ready", 
          category: "timing",
          color: "#8B5CF6",
          description: "Scheduled time reached" 
        }
      ]
    }
  }
};
