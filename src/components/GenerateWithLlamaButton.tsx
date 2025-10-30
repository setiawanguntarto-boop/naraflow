import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import { generateWorkflowFromPrompt } from "@/lib/llamaClient";
import { RawLlamaOutputModal } from "@/components/RawLlamaOutputModal";
import { useWorkflowState } from "@/hooks/useWorkflowState";
import { toast } from "sonner";

interface GenerateWithLlamaButtonProps {
  prompt: string;
  disabled?: boolean;
  onUseWorkflow?: (parsed: any) => void;
}

export function GenerateWithLlamaButton({
  prompt,
  disabled,
  onUseWorkflow,
}: GenerateWithLlamaButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    raw: string;
    parsed: any;
    timestamp: string;
    model?: string;
  } | null>(null);

  const llamaConfig = useWorkflowState(state => state.llamaConfig);
  const setLlamaCache = useWorkflowState(state => state.actions.setLlamaCache);
  const getLlamaCache = useWorkflowState(state => state.actions.getLlamaCache);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!llamaConfig.connected) {
      toast.error("Please connect to LLaMA first");
      return;
    }

    // Check cache first
    const cached = getLlamaCache(prompt);
    if (cached) {
      setGeneratedData(cached);
      setShowOutputModal(true);
      toast.success("Using cached LLaMA response");
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateWorkflowFromPrompt(
        llamaConfig.endpoint,
        llamaConfig.apiKey,
        prompt,
        llamaConfig.mode
      );

      const timestamp = new Date().toLocaleString();
      const data = {
        raw: result.raw,
        parsed: result.parsed,
        timestamp,
        model: llamaConfig.lastModel,
      };

      // Cache the result
      setLlamaCache(prompt, data);

      setGeneratedData(data);
      setShowOutputModal(true);

      toast.success("LLaMA workflow generated successfully");
    } catch (error) {
      console.error("LLaMA generation error:", error);
      toast.error(`Generation failed: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseWorkflow = (parsed: any) => {
    if (onUseWorkflow) {
      onUseWorkflow(parsed);
    }
  };

  return (
    <>
      <Button
        onClick={handleGenerate}
        disabled={disabled || isGenerating || !llamaConfig.connected}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2" />
            Generate with LLaMA
          </>
        )}
      </Button>

      {generatedData && (
        <RawLlamaOutputModal
          open={showOutputModal}
          onOpenChange={setShowOutputModal}
          rawOutput={generatedData.raw}
          parsedOutput={generatedData.parsed}
          timestamp={generatedData.timestamp}
          model={generatedData.model}
          onUseWorkflow={handleUseWorkflow}
        />
      )}
    </>
  );
}
