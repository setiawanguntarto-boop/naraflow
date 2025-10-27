import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { connectionLabelLibrary } from "@/core/connectionLabelLibrary";
import { ConnectionLabel } from "@/types/connectionLabel.types";
import { useWorkflowState } from "@/hooks/useWorkflowState";

interface ConnectionLabelMenuProps {
  position: { x: number; y: number };
  connectionId: string;
  onSelect?: (label: ConnectionLabel) => void;
  onClose: () => void;
}

export const ConnectionLabelMenu: React.FC<ConnectionLabelMenuProps> = ({
  position,
  connectionId,
  onSelect,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const { setConnectionLabel, getConnectionLabel } = useWorkflowState();

  const currentLabel = getConnectionLabel(connectionId);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSelect = (label: ConnectionLabel) => {
    setConnectionLabel(connectionId, label);
    onSelect?.(label);
    onClose();
  };

  const handleRemoveLabel = () => {
    const { removeConnectionLabel } = useWorkflowState.getState();
    removeConnectionLabel(connectionId);
    onClose();
  };

  // Filter labels based on search term
  const filteredCategories = Object.entries(connectionLabelLibrary.categories)
    .map(([key, category]) => ({
      ...category,
      labels: category.labels.filter(
        label =>
          label.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          label.description.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter(category => category.labels.length > 0);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 max-h-96 w-80 overflow-hidden"
      style={{
        top: Math.min(position.y, window.innerHeight - 400),
        left: Math.min(position.x, window.innerWidth - 320),
      }}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Connection Label
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search labels..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-8 text-sm"
            autoFocus
          />
        </div>
      </div>

      {/* Current Label */}
      {currentLabel && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Label:</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: currentLabel.color }}
              />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {currentLabel.displayName}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveLabel}
              className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
            >
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Label Categories */}
      <ScrollArea className="max-h-64">
        {filteredCategories.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            No labels found for "{searchTerm}"
          </div>
        ) : (
          filteredCategories.map(category => (
            <div
              key={category.title}
              className="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              {/* Category Header */}
              <div
                className="px-3 py-2 border-l-4"
                style={{
                  backgroundColor: `${category.color}10`,
                  borderLeftColor: category.color,
                }}
              >
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3 border-2 border-white shadow-sm"
                    style={{ backgroundColor: category.color }}
                  />
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: category.color }}
                  >
                    {category.title}
                  </span>
                </div>
              </div>

              {/* Category Labels */}
              {category.labels.map(label => (
                <div
                  key={label.id}
                  onClick={() => handleSelect(label)}
                  className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-all duration-200 ${
                    currentLabel?.id === label.id
                      ? "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-3 border border-white shadow-sm"
                      style={{ backgroundColor: label.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {label.displayName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {label.description}
                      </div>
                    </div>
                    {currentLabel?.id === label.id && (
                      <div className="text-blue-600 dark:text-blue-400 text-sm font-bold">✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Right-click on any connection to add labels
        </div>
      </div>
    </div>
  );
};
