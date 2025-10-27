import { useCallback, useRef, useEffect } from 'react';

interface CanvasEvent {
  type: string;
  payload: any;
  timestamp: number;
  namespace?: string;
}

interface EventListener {
  (event: CanvasEvent): void;
}

export const useCanvasEventBus = () => {
  const eventQueue = useRef<CanvasEvent[]>([]);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const listeners = useRef<Map<string, Set<EventListener>>>(new Map());
  const isProcessing = useRef(false);

  // Event types with namespacing
  const EVENT_TYPES = {
    NODE: {
      UPDATE: 'node:update',
      SELECT: 'node:select',
      DESELECT: 'node:deselect',
      ADD: 'node:add',
      DELETE: 'node:delete',
      MOVE: 'node:move',
      RESIZE: 'node:resize',
    },
    EDGE: {
      CREATE: 'edge:create',
      DELETE: 'edge:delete',
      UPDATE: 'edge:update',
      SELECT: 'edge:select',
    },
    SESSION: {
      SAVE: 'session:save',
      LOAD: 'session:load',
      CREATE: 'session:create',
      DELETE: 'session:delete',
      SWITCH: 'session:switch',
    },
    EXECUTION: {
      START: 'execution:start',
      COMPLETE: 'execution:complete',
      ERROR: 'execution:error',
      CANCEL: 'execution:cancel',
    },
    UI: {
      ZOOM: 'ui:zoom',
      PAN: 'ui:pan',
      SELECTION_CHANGE: 'ui:selection:change',
    },
  } as const;

  const emit = useCallback((event: Omit<CanvasEvent, 'timestamp'>) => {
    const canvasEvent: CanvasEvent = {
      ...event,
      timestamp: Date.now(),
    };

    // Add to queue
    eventQueue.current.push(canvasEvent);

    // Debounce batch processing
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      processEventBatch();
    }, 100);
  }, []);

  const on = useCallback((eventType: string, listener: EventListener) => {
    if (!listeners.current.has(eventType)) {
      listeners.current.set(eventType, new Set());
    }
    listeners.current.get(eventType)!.add(listener);

    // Return cleanup function
    return () => {
      const eventListeners = listeners.current.get(eventType);
      if (eventListeners) {
        eventListeners.delete(listener);
        if (eventListeners.size === 0) {
          listeners.current.delete(eventType);
        }
      }
    };
  }, []);

  const off = useCallback((eventType: string, listener: EventListener) => {
    const eventListeners = listeners.current.get(eventType);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        listeners.current.delete(eventType);
      }
    }
  }, []);

  const processEventBatch = useCallback(() => {
    if (isProcessing.current) return;
    
    isProcessing.current = true;
    const events = eventQueue.current.splice(0);
    
    // Group events by type for efficient processing
    const eventGroups = new Map<string, CanvasEvent[]>();
    events.forEach(event => {
      if (!eventGroups.has(event.type)) {
        eventGroups.set(event.type, []);
      }
      eventGroups.get(event.type)!.push(event);
    });

    // Process each event type
    eventGroups.forEach((eventList, eventType) => {
      const eventListeners = listeners.current.get(eventType);
      if (eventListeners) {
        eventListeners.forEach(listener => {
          eventList.forEach(event => {
            try {
              listener(event);
            } catch (error) {
              console.error(`Error in event listener for ${eventType}:`, error);
            }
          });
        });
      }
    });

    isProcessing.current = false;
  }, []);

  // Immediate emit for critical events (no debouncing)
  const emitImmediate = useCallback((event: Omit<CanvasEvent, 'timestamp'>) => {
    const canvasEvent: CanvasEvent = {
      ...event,
      timestamp: Date.now(),
    };

    const eventListeners = listeners.current.get(event.type);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(canvasEvent);
        } catch (error) {
          console.error(`Error in immediate event listener for ${event.type}:`, error);
        }
      });
    }
  }, []);

  // Batch emit for multiple events
  const emitBatch = useCallback((events: Omit<CanvasEvent, 'timestamp'>[]) => {
    events.forEach(event => {
      eventQueue.current.push({
        ...event,
        timestamp: Date.now(),
      });
    });

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      processEventBatch();
    }, 50); // Shorter debounce for batch operations
  }, [processEventBatch]);

  // Get event queue size for debugging
  const getQueueSize = useCallback(() => {
    return eventQueue.current.length;
  }, []);

  // Clear event queue
  const clearQueue = useCallback(() => {
    eventQueue.current = [];
    clearTimeout(debounceTimer.current);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(debounceTimer.current);
      listeners.current.clear();
      eventQueue.current = [];
    };
  }, []);

  return {
    emit,
    emitImmediate,
    emitBatch,
    on,
    off,
    getQueueSize,
    clearQueue,
    EVENT_TYPES,
  };
};

// Global event bus instance for cross-component communication
class GlobalCanvasEventBus {
  private listeners = new Map<string, Set<EventListener>>();
  private eventQueue: CanvasEvent[] = [];
  private debounceTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  emit(event: Omit<CanvasEvent, 'timestamp'>) {
    const canvasEvent: CanvasEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.eventQueue.push(canvasEvent);

    clearTimeout(this.debounceTimer!);
    this.debounceTimer = setTimeout(() => {
      this.processEventBatch();
    }, 100);
  }

  emitImmediate(event: Omit<CanvasEvent, 'timestamp'>) {
    const canvasEvent: CanvasEvent = {
      ...event,
      timestamp: Date.now(),
    };

    const eventListeners = this.listeners.get(event.type);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(canvasEvent);
        } catch (error) {
          console.error(`Error in immediate event listener for ${event.type}:`, error);
        }
      });
    }
  }

  on(eventType: string, listener: EventListener) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    return () => {
      const eventListeners = this.listeners.get(eventType);
      if (eventListeners) {
        eventListeners.delete(listener);
        if (eventListeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  off(eventType: string, listener: EventListener) {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  // Subscribe to all events
  subscribe(listener: EventListener) {
    // Store the listener for all events
    if (!this.listeners.has('*')) {
      this.listeners.set('*', new Set());
    }
    this.listeners.get('*')!.add(listener);

    return () => {
      const eventListeners = this.listeners.get('*');
      if (eventListeners) {
        eventListeners.delete(listener);
        if (eventListeners.size === 0) {
          this.listeners.delete('*');
        }
      }
    };
  }

  private processEventBatch() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const events = this.eventQueue.splice(0);
    
    const eventGroups = new Map<string, CanvasEvent[]>();
    events.forEach(event => {
      if (!eventGroups.has(event.type)) {
        eventGroups.set(event.type, []);
      }
      eventGroups.get(event.type)!.push(event);
    });

    eventGroups.forEach((eventList, eventType) => {
      const eventListeners = this.listeners.get(eventType);
      if (eventListeners) {
        eventListeners.forEach(listener => {
          eventList.forEach(event => {
            try {
              listener(event);
            } catch (error) {
              console.error(`Error in event listener for ${eventType}:`, error);
            }
          });
        });
      }
    });

    // Also call wildcard listeners for all events
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(listener => {
        events.forEach(event => {
          try {
            listener(event);
          } catch (error) {
            console.error(`Error in wildcard event listener:`, error);
          }
        });
      });
    }

    this.isProcessing = false;
  }

  getQueueSize() {
    return this.eventQueue.length;
  }

  clearQueue() {
    this.eventQueue = [];
    clearTimeout(this.debounceTimer!);
  }
}

export const globalCanvasEventBus = new GlobalCanvasEventBus();
