/**
 * Visual Feedback System for Auto-Layout
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Node } from '@xyflow/react';
import { CheckCircle, AlertCircle, Loader2, Zap, X } from 'lucide-react';
import { globalCanvasEventBus } from '@/hooks/useCanvasEventBus';

interface LayoutFeedbackProps {
  isLayouting: boolean;
  layoutResult?: {
    engine: string;
    direction: string;
    nodeCount: number;
    executionTime: number;
    layoutQuality?: number;
  };
  error?: Error;
  onComplete?: () => void;
}

export function LayoutFeedback({ 
  isLayouting, 
  layoutResult, 
  error, 
  onComplete 
}: LayoutFeedbackProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [eventBusResult, setEventBusResult] = useState<any>(null);
  const [eventBusError, setEventBusError] = useState<Error | null>(null);

  useEffect(() => {
    // Subscribe to layout events from event bus
    const unsubscribe = globalCanvasEventBus.subscribe((event) => {
      if (event.type.startsWith('layout:')) {
        switch (event.type) {
          case 'layout:start':
            setShowFeedback(true);
            setProgress(0);
            setProgressMessage('Starting layout...');
            setEventBusError(null);
            break;
          case 'layout:progress':
            setProgress(event.payload.progress || 0);
            setProgressMessage(event.payload.message || 'Processing...');
            break;
          case 'layout:complete':
            setEventBusResult(event.payload);
            setProgress(100);
            setProgressMessage('Layout complete!');
            setEventBusError(null);
            break;
          case 'layout:error':
            setEventBusError(event.payload.error);
            setProgress(0);
            setProgressMessage('Layout failed');
            break;
        }
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (layoutResult || error || eventBusResult || eventBusError) {
      setShowFeedback(true);
      
      // Auto-hide after 5 seconds for better readability
      const timer = setTimeout(() => {
        setShowFeedback(false);
        onComplete?.();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [layoutResult, error, eventBusResult, eventBusError, onComplete]);

  return (
    <AnimatePresence>
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-20 right-4 z-50"
        >
          <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[300px] relative">
            {/* Dismiss button */}
            <button
              onClick={() => setShowFeedback(false)}
              className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            {/* Progress indicator */}
            {progress > 0 && progress < 100 && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{progressMessage}</span>
                  <span className="text-xs text-muted-foreground">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Main content */}
            {isLayouting || progress > 0 ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <div>
                  <p className="font-medium">{progressMessage || 'Arranging workflow...'}</p>
                  <p className="text-sm text-muted-foreground">Please wait</p>
                </div>
              </div>
            ) : error || eventBusError ? (
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Layout failed</p>
                  <p className="text-sm text-muted-foreground">{(error || eventBusError)?.message}</p>
                </div>
              </div>
            ) : layoutResult || eventBusResult ? (
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Layout applied successfully</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• {(layoutResult || eventBusResult)?.nodeCount} nodes arranged</p>
                    <p>• Engine: {(layoutResult || eventBusResult)?.engine}</p>
                    <p>• Direction: {(layoutResult || eventBusResult)?.direction}</p>
                    <p>• Time: {(layoutResult || eventBusResult)?.executionTime?.toFixed(0)}ms</p>
                    {(layoutResult || eventBusResult)?.layoutQuality && (
                      <p>• Quality: {(layoutResult || eventBusResult)?.layoutQuality}/100</p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Node Glow Effect for Auto-Layouted Nodes
 */
interface NodeGlowEffectProps {
  nodeId: string;
  isActive: boolean;
  duration?: number;
}

export function NodeGlowEffect({ nodeId, isActive, duration = 2000 }: NodeGlowEffectProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 1 }}
          animate={{ 
            opacity: [0, 0.8, 0],
            scale: [1, 1.05, 1],
          }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ 
            duration: duration / 1000,
            ease: "easeInOut",
            times: [0, 0.5, 1]
          }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
            borderRadius: 'inherit',
          }}
        />
      )}
    </AnimatePresence>
  );
}

/**
 * Layout Animation Controller
 */
export class LayoutAnimationController {
  private static instance: LayoutAnimationController;
  private activeAnimations = new Set<string>();

  static getInstance(): LayoutAnimationController {
    if (!LayoutAnimationController.instance) {
      LayoutAnimationController.instance = new LayoutAnimationController();
    }
    return LayoutAnimationController.instance;
  }

  /**
   * Trigger glow effect for a node
   */
  triggerNodeGlow(nodeId: string, duration = 2000): void {
    if (this.activeAnimations.has(nodeId)) return;

    this.activeAnimations.add(nodeId);
    
    // Dispatch custom event for the glow effect
    const event = new CustomEvent('nodeGlow', {
      detail: { nodeId, duration }
    });
    window.dispatchEvent(event);

    // Remove from active animations after duration
    setTimeout(() => {
      this.activeAnimations.delete(nodeId);
    }, duration);
  }

  /**
   * Trigger glow effect for multiple nodes
   */
  triggerBulkGlow(nodeIds: string[], staggerDelay = 100): void {
    nodeIds.forEach((nodeId, index) => {
      setTimeout(() => {
        this.triggerNodeGlow(nodeId);
      }, index * staggerDelay);
    });
  }

  /**
   * Clear all active animations
   */
  clearAllAnimations(): void {
    this.activeAnimations.clear();
  }
}

/**
 * Layout Progress Indicator
 */
interface LayoutProgressProps {
  progress: number;
  stage: 'building' | 'calculating' | 'applying' | 'complete';
}

export function LayoutProgress({ progress, stage }: LayoutProgressProps) {
  const stageLabels = {
    building: 'Building graph structure...',
    calculating: 'Calculating optimal layout...',
    applying: 'Applying layout to canvas...',
    complete: 'Layout complete!',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border border-border rounded-lg shadow-lg p-4 min-w-[250px]">
      <div className="flex items-center gap-3 mb-2">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{stageLabels[stage]}</span>
      </div>
      
      <div className="w-full bg-muted rounded-full h-2">
        <motion.div
          className="bg-primary h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      
      <div className="text-xs text-muted-foreground mt-1">
        {Math.round(progress)}% complete
      </div>
    </div>
  );
}
