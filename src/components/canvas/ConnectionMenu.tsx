import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Zap,
  User,
  Bot,
  Database,
} from "lucide-react";

export interface ConnectionOption {
  label: string;
  value: string;
  condition?: string;
  icon?: string;
  description?: string;
  color?: "default" | "success" | "warning" | "error" | "info";
}

export interface ConnectionMenuProps {
  position: { x: number; y: number };
  options: ConnectionOption[];
  onSelect: (option: ConnectionOption) => void;
  onClose: () => void;
  title?: string;
  description?: string;
}

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case "success":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "error":
      return <XCircle className="w-4 h-4 text-red-500" />;
    case "warning":
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case "clock":
      return <Clock className="w-4 h-4 text-blue-500" />;
    case "zap":
      return <Zap className="w-4 h-4 text-purple-500" />;
    case "user":
      return <User className="w-4 h-4 text-blue-500" />;
    case "bot":
      return <Bot className="w-4 h-4 text-green-500" />;
    case "database":
      return <Database className="w-4 h-4 text-orange-500" />;
    default:
      return <ArrowRight className="w-4 h-4 text-blue-500" />;
  }
};

const getBadgeVariant = (color?: string) => {
  switch (color) {
    case "success":
      return "default";
    case "error":
      return "destructive";
    case "warning":
      return "secondary";
    case "info":
      return "outline";
    default:
      return "secondary";
  }
};

export const ConnectionMenu: React.FC<ConnectionMenuProps> = ({
  position,
  options,
  onSelect,
  onClose,
  title = "Connection Options",
  description,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-56 max-w-80"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 hover:bg-gray-100"
        >
          ×
        </Button>
      </div>

      {/* Options */}
      <div className="space-y-1">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option)}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md flex items-center gap-3 group transition-colors"
          >
            <div className="flex-shrink-0">{getIcon(option.icon)}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 truncate">{option.label}</span>
                {option.color && (
                  <Badge variant={getBadgeVariant(option.color)} className="text-xs px-1.5 py-0.5">
                    {option.color}
                  </Badge>
                )}
              </div>

              {option.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{option.description}</p>
              )}

              {option.condition && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-400">Condition:</span>
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                    {option.condition}
                  </code>
                </div>
              )}
            </div>

            <ArrowRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 mt-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {options.length} option{options.length !== 1 ? "s" : ""}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700 h-6 px-2"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionMenu;
