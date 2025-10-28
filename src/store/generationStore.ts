import { create } from "zustand";
import { WorkflowOutput } from "@/lib/promptInterpreter/types";
import type { ValidationError } from "@/utils/workflowValidation";

interface GenerationMessage {
  role: "user" | "assistant";
  text: string;
  timestamp?: Date;
  /** Optional: embed validation results for rich assistant messages */
  validationResults?: {
    summary: string;
    errors: ValidationError[];
  };
}

interface GenerationState {
  prompt: string;
  setPrompt: (p: string) => void;

  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;

  messages: GenerationMessage[];
  pushMessage: (m: GenerationMessage) => void;

  workflow: WorkflowOutput | null;
  setWorkflow: (wf: WorkflowOutput | null) => void;

  /** Reset session (optional) */
  reset: () => void;
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  prompt: "",
  setPrompt: (p: string) => set({ prompt: p }),

  isGenerating: false,
  setIsGenerating: (v: boolean) => set({ isGenerating: v }),

  messages: [],
  pushMessage: (m: GenerationMessage) =>
    set(state => ({
      messages: [...state.messages, { ...m, timestamp: m.timestamp || new Date() }],
    })),

  workflow: null,
  setWorkflow: (wf: WorkflowOutput | null) => set({ workflow: wf }),

  /** Reset session */
  reset: () => set({ prompt: "", isGenerating: false, messages: [], workflow: null }),
}));
