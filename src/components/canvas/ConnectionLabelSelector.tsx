import React, { useState } from "react";
import { ConnectionLabel } from "@/types/connectionLabel.types";
import { connectionLabelLibrary } from "@/core/connectionLabelLibrary";
import { getAllConnectionLabels, getLabelsByCategory } from "@/builder/connectionRenderer";
import { suggestLabel } from "@/builder/autoLabelSuggestor";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Sparkles } from "lucide-react";

interface ConnectionLabelSelectorProps {
  fromNodeType: string;
  toNodeType: string;
  currentLabelId?: string;
  onLabelSelect: (labelId: string) => void;
  disabled?: boolean;
}

export const ConnectionLabelSelector: React.FC<ConnectionLabelSelectorProps> = ({
  fromNodeType,
  toNodeType,
  currentLabelId,
  onLabelSelect,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Get suggested label
  const suggestion = suggestLabel(fromNodeType, toNodeType);

  // Get all labels or filter by category
  const allLabels = getAllConnectionLabels(connectionLabelLibrary);
  const filteredLabels =
    selectedCategory === "all"
      ? allLabels
      : getLabelsByCategory(selectedCategory, connectionLabelLibrary);

  // Get current label
  const currentLabel = currentLabelId ? allLabels.find(l => l.id === currentLabelId) : null;

  const handleLabelSelect = (labelId: string) => {
    onLabelSelect(labelId);
    setIsOpen(false);
  };

  const categories = [
    { id: "all", title: "All Labels" },
    ...Object.entries(connectionLabelLibrary.categories).map(([id, cat]) => ({
      id,
      title: cat.title,
    })),
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} className="h-8 px-2 text-xs">
          {currentLabel ? (
            <div className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentLabel.color }}
              />
              <span className="truncate max-w-20">{currentLabel.displayName}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Auto</span>
            </div>
          )}
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 bg-white border border-gray-200 shadow-lg" align="start">
        <div className="p-3 border-b">
          <h4 className="font-medium text-sm">Select Connection Label</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {fromNodeType} → {toNodeType}
          </p>

          {suggestion && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                  Suggested: {suggestion.label.displayName}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {Math.round(suggestion.confidence * 100)}%
                </Badge>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{suggestion.reason}</p>
            </div>
          )}
        </div>

        <div className="p-3">
          {/* Category Filter */}
          <div className="flex gap-1 mb-3 overflow-x-auto">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs h-7 px-2 flex-shrink-0"
              >
                {category.title}
              </Button>
            ))}
          </div>

          {/* Labels List */}
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {filteredLabels.map(label => (
              <button
                key={label.id}
                onClick={() => handleLabelSelect(label.id)}
                className={`w-full p-2 text-left rounded-md border transition-colors ${
                  currentLabelId === label.id
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-accent border-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: label.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{label.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{label.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-3 pt-3 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLabelSelect("")}
                className="text-xs h-7 px-2"
              >
                Clear Label
              </Button>
              {suggestion && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleLabelSelect(suggestion.label.id)}
                  className="text-xs h-7 px-2"
                >
                  Use Suggestion
                </Button>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
