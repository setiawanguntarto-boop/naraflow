/**
 * Auto-Layout Toolbar Component
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Layout,
  RotateCcw,
  Zap,
  ArrowRight,
  ArrowDown,
  Grid3X3,
  Maximize2,
  Minimize2,
  Loader2,
} from "lucide-react";
import { LayoutPresets } from "../../core/layout/useLayout";
import { LayoutOptions } from "../../core/layout/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LayoutPreview } from "./LayoutPreview";

interface AutoLayoutToolbarProps {
  onAutoLayout: (options: Partial<LayoutOptions>, selectedNodeIds?: string[]) => Promise<void>;
  onRestoreLayout: () => void;
  canRestore: boolean;
  isLayouting: boolean;
  nodeCount: number;
  edgeCount: number;
  selectedNodeIds?: string[];
  currentNodes?: any[];
  currentEdges?: any[];
}

export function AutoLayoutToolbar({
  onAutoLayout,
  onRestoreLayout,
  canRestore,
  isLayouting,
  nodeCount,
  edgeCount,
  selectedNodeIds = [],
  currentNodes = [],
  currentEdges = [],
}: AutoLayoutToolbarProps) {
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof LayoutPresets>("horizontal");
  const [isOpen, setIsOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewOptions, setPreviewOptions] = useState<LayoutOptions | null>(null);

  const handlePresetSelect = async (preset: keyof typeof LayoutPresets) => {
    setSelectedPreset(preset);
    await onAutoLayout(LayoutPresets[preset]);
    setIsOpen(false);
  };

  const handleCustomLayout = async (options: Partial<LayoutOptions>) => {
    await onAutoLayout(options);
    setIsOpen(false);
  };

  const handlePartialLayout = async (preset: keyof typeof LayoutPresets) => {
    await onAutoLayout(LayoutPresets[preset], selectedNodeIds);
    setIsOpen(false);
  };

  const handlePreview = (preset: keyof typeof LayoutPresets) => {
    const presetOptions = LayoutPresets[preset];
    setPreviewOptions({
      ...presetOptions,
      gridSize: presetOptions.gridSnap ? 20 : 0, // Add missing gridSize
    });
    setShowPreview(true);
    setIsOpen(false);
  };

  const handleApplyPreview = async () => {
    if (previewOptions) {
      await onAutoLayout(previewOptions, selectedNodeIds);
      setShowPreview(false);
      setPreviewOptions(null);
    }
  };

  const presetIcons = {
    horizontal: ArrowRight,
    vertical: ArrowDown,
    compact: Minimize2,
    spacious: Maximize2,
    complex: Zap,
  };

  const presetDescriptions = {
    horizontal: "Left to right flow",
    vertical: "Top to bottom flow",
    compact: "Dense arrangement",
    spacious: "Wide spacing",
    complex: "Advanced ELK layout",
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2">
        {/* Main Auto Arrange Button - FAB Style */}
        <div className="relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => handlePresetSelect(selectedPreset)}
                disabled={isLayouting || nodeCount === 0}
                className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90 text-primary-foreground"
                aria-label="Auto arrange workflow"
              >
                {isLayouting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Layout className="w-5 h-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Auto Arrange (Ctrl+L)</p>
            </TooltipContent>
          </Tooltip>

          {/* Node count badge */}
          {nodeCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
              {nodeCount}
            </div>
          )}

          {/* Selected nodes badge */}
          {selectedNodeIds.length > 0 && (
            <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
              {selectedNodeIds.length}
            </div>
          )}
        </div>

        {/* Arrange Selected Button - Show when nodes are selected */}
        {selectedNodeIds.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => handlePartialLayout(selectedPreset)}
                disabled={isLayouting}
                className="h-8 w-8 rounded-full shadow-md hover:shadow-lg transition-all duration-200 bg-green-500 hover:bg-green-600 text-white"
                aria-label="Arrange selected nodes"
              >
                <Layout className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Arrange Selected ({selectedNodeIds.length} nodes)</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Presets Dropdown */}
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 rounded-full shadow-md hover:shadow-lg transition-all duration-200 bg-background/80 backdrop-blur-sm border-border/50"
                  disabled={isLayouting}
                  aria-label="Layout presets"
                >
                  <Layout className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Layout Presets (Alt+1-5)</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-white border border-gray-200 shadow-lg"
          >
            <DropdownMenuLabel>Layout Presets</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {Object.entries(LayoutPresets).map(([key, preset], index) => {
              const Icon = presetIcons[key as keyof typeof LayoutPresets];
              const description = presetDescriptions[key as keyof typeof LayoutPresets];

              return (
                <div key={key} className="space-y-1">
                  <DropdownMenuItem
                    onClick={() => handlePresetSelect(key as keyof typeof LayoutPresets)}
                    className="flex items-center gap-3 cursor-pointer"
                    disabled={isLayouting}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="flex flex-col flex-1">
                      <span className="font-medium capitalize">{key}</span>
                      <span className="text-xs text-muted-foreground">{description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedPreset === key && (
                        <Badge variant="outline" className="text-xs">
                          Active
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">Alt+{index + 1}</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handlePreview(key as keyof typeof LayoutPresets)}
                    className="flex items-center gap-3 cursor-pointer ml-6 text-sm"
                    disabled={isLayouting}
                  >
                    <span className="text-muted-foreground">Preview {key}</span>
                  </DropdownMenuItem>
                </div>
              );
            })}

            <DropdownMenuSeparator />

            {/* Custom Options */}
            <DropdownMenuItem
              onClick={() =>
                handleCustomLayout({
                  engine: "dagre",
                  direction: "LR",
                  spacing: { node: 100, level: 200 },
                  gridSnap: true,
                })
              }
              className="flex items-center gap-3 cursor-pointer"
              disabled={isLayouting}
            >
              <Grid3X3 className="w-4 h-4" />
              <div className="flex flex-col">
                <span className="font-medium">Custom Spacing</span>
                <span className="text-xs text-muted-foreground">Extra wide layout</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() =>
                handleCustomLayout({
                  engine: "elk",
                  direction: "TB",
                  spacing: { node: 50, level: 100 },
                  groupAware: true,
                })
              }
              className="flex items-center gap-3 cursor-pointer"
              disabled={isLayouting}
            >
              <Zap className="w-4 h-4" />
              <div className="flex flex-col">
                <span className="font-medium">ELK Vertical</span>
                <span className="text-xs text-muted-foreground">Advanced top-down</span>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                onRestoreLayout();
                setIsOpen(false);
              }}
              disabled={!canRestore || isLayouting}
              className="flex items-center gap-3 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <div className="flex flex-col flex-1">
                <span className="font-medium">Restore Layout</span>
                <span className="text-xs text-muted-foreground">Undo last change</span>
              </div>
              <span className="text-xs text-muted-foreground">Ctrl+Shift+L</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Layout Preview Modal */}
      {previewOptions && (
        <LayoutPreview
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setPreviewOptions(null);
          }}
          onApply={handleApplyPreview}
          currentNodes={currentNodes}
          currentEdges={currentEdges}
          layoutOptions={previewOptions}
          selectedNodeIds={selectedNodeIds}
        />
      )}
    </TooltipProvider>
  );
}
