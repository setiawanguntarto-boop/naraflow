import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, X, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowAssistant } from "@/components/workflow/WorkflowAssistant";

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [avoidConfigPanel, setAvoidConfigPanel] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  // Detect NodeConfigPanel presence to avoid overlap
  useEffect(() => {
    const check = () => {
      const el = document.getElementById("node-config-panel");
      setAvoidConfigPanel(Boolean(el));
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const positioning = useMemo(() => {
    // If config panel is open, push button to the left and slightly up
    return avoidConfigPanel
      ? "right-[26rem] bottom-24"
      : "right-6 bottom-6";
  }, [avoidConfigPanel]);

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <motion.button
          onClick={toggleChat}
          title="Bingung? Klik untuk bertanya ke Workflow Assistant"
          aria-label="Buka Workflow Assistant"
          className={`fixed ${positioning} z-50 bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-3 shadow-lg flex items-center gap-2 transition-colors duration-200`}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">Butuh bantuan? Chat</span>
        </motion.button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
            isMinimized ? "w-80 h-16" : "w-[400px] h-[600px] md:w-[450px] md:h-[650px]"
          }`}
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Workflow Assistant</h3>
                  <p className="text-xs text-gray-500">AI-powered help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={minimizeChat} variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button onClick={toggleChat} variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <WorkflowAssistant />
            )}
          </div>
        </div>
      )}
    </>
  );
}
