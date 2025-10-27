import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Bot, AlertCircle } from 'lucide-react';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { nodeTypeRegistry } from '@/lib/nodeTypeRegistry';

interface AgentNodeProps {
  id: string;
  data: {
    label: string;
    description?: string;
    subNodes?: Array<{
      id: string;
      type: string;
      label: string;
      portId?: string;
      config?: any;
    }>;
    attachmentPorts?: string[];
    [key: string]: any;
  };
  selected: boolean;
}

export const AgentNode = memo(({ id, data, selected }: AgentNodeProps) => {
  const { actions } = useWorkflowState();
  const errors = actions.getNodeErrors(id);
  const hasErrors = errors.filter(e => e.type === 'error').length > 0;
  
  // Get node type definition to determine attachment ports
  const nodeTypeDef = nodeTypeRegistry.getNodeType(data.type || 'agent');
  const attachmentPorts = nodeTypeDef?.attachments || {};
  
  // Active ports (either from data or inferred from type definition)
  const activePorts = data.attachmentPorts || Object.keys(attachmentPorts);
  
  return (
    <div
      className={`
        relative px-4 py-3 rounded-xl border-2 shadow-soft
        transition-all duration-200 min-w-[200px] max-w-[320px]
        bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20
        ${hasErrors 
          ? 'border-red-500 border-2' 
          : selected 
          ? 'border-purple-500 shadow-glow scale-105 dark:border-purple-400'
          : 'border-purple-300 hover:border-purple-400 dark:border-purple-700 dark:hover:border-purple-600'
        }
      `}
    >
      {/* Error indicator */}
      {hasErrors && (
        <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center bg-red-500 z-10">
          <AlertCircle className="w-3 h-3 text-white" />
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate text-purple-900 dark:text-purple-100">
            {data.label || 'Agent'}
          </p>
          {data.description && (
            <p className="text-xs font-medium truncate text-purple-700 dark:text-purple-300">
              {data.description}
            </p>
          )}
        </div>
      </div>
      
      {/* Main I/O Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-5 h-5 border-2 border-white cursor-pointer !bg-purple-500"
        style={{ width: '16px', height: '16px' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-5 h-5 border-2 border-white cursor-pointer !bg-purple-500"
        style={{ width: '16px', height: '16px' }}
      />
      
      {/* Attachment Ports (Sub-node connectors) */}
      {activePorts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
          <div className="flex justify-around items-center gap-1">
            {activePorts.map((portId) => {
              const port = attachmentPorts[portId];
              if (!port) return null;
              
              // Calculate position based on number of ports
              const index = activePorts.indexOf(portId);
              const total = activePorts.length;
              const offset = ((index + 1) / (total + 1)) * 100;
              
              return (
                <div key={portId} className="flex flex-col items-center flex-1">
                  <Handle
                    type="source"
                    position={Position.Bottom}
                    id={portId}
                    className="w-3 h-3 border-2 border-white cursor-pointer"
                    style={{ 
                      background: port.color || '#9C27B0',
                      width: '14px',
                      height: '14px'
                    }}
                  />
                  <span className="text-[9px] text-purple-600 dark:text-purple-400 font-medium mt-1 text-center line-clamp-1">
                    {port.label || portId}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Sub-nodes indicator */}
      {data.subNodes && data.subNodes.length > 0 && (
        <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-800">
          <div className="flex flex-wrap gap-1">
            {data.subNodes.map((sub, idx) => (
              <span 
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
              >
                {sub.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

AgentNode.displayName = 'AgentNode';

