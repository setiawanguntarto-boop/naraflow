import { useState } from "react";
import { MessageSquare, X, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense, lazy } from "react";

const WorkflowAssistant = lazy(() =>
  import("@/components/workflow/WorkflowAssistant").then(mod => ({
    default: mod.WorkflowAssistant,
  }))
);

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-3 shadow-lg flex items-center gap-2 transition-all duration-200 hover:scale-105"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">Chat</span>
        </button>
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
              <Suspense
                fallback={<div className="flex items-center justify-center h-full">Loading...</div>}
              >
                <WorkflowAssistant />
              </Suspense>
            )}
          </div>
        </div>
      )}
    </>
  );
}
