/**
 * Hook for Prompt Interpreter
 * Manages state and interactions for prompt-to-workflow conversion
 */

import { useState } from "react";
import { interpretPrompt, InterpreterResult } from "@/lib/promptInterpreter/promptEngine";
import { WorkflowOutput } from "@/lib/promptInterpreter/types";
import { toast } from "sonner";

export function usePromptInterpreter() {
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [previewData, setPreviewData] = useState<WorkflowOutput | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [analysis, setAnalysis] = useState<InterpreterResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const interpret = async (prompt: string, template?: any) => {
    if (!prompt.trim()) {
      toast.error("Masukkan deskripsi workflow");
      return;
    }

    setIsInterpreting(true);

    try {
      const result = await interpretPrompt(prompt, {
        llmProvider: "openai", // TODO: Get from settings
        validate: true,
        preview: true,
        template: template, // Pass template context
      });

      setAnalysis(result);

      if (result.success && result.workflow) {
        setPreviewData(result.workflow);
        setShowPreview(true);
        toast.success("Workflow berhasil digenerate!");
      } else {
        toast.error(result.error || "Gagal menggenerate workflow");
      }
    } catch (error: any) {
      console.error("Interpret error:", error);
      toast.error(`Error: ${error}`);
    } finally {
      setIsInterpreting(false);
    }
  };

  const applyToCanvas = (onApply: (workflow: WorkflowOutput) => void) => {
    if (previewData) {
      onApply(previewData);
      setShowPreview(false);
      toast.success("Workflow diterapkan ke canvas");
    }
  };

  const exportJSON = () => {
    if (!previewData) return;

    const dataStr = JSON.stringify(previewData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `workflow-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Workflow berhasil di-export");
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewData(null);
    setAnalysis(null);
  };

  return {
    interpret,
    applyToCanvas,
    exportJSON,
    closePreview,
    isInterpreting,
    showPreview,
    previewData,
    analysis,
    selectedTemplate,
    setSelectedTemplate,
  };
}
