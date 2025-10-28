import { useState, useMemo, useCallback } from "react";
import { Search, ChevronDown, ChevronRight, Zap, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  NODE_CATEGORIES,
  CATEGORY_COLORS,
  type NodeCategory,
  getCategoryForNode,
} from "@/data/nodeCategories";
import { getIconForLabel } from "@/data/nodeIcons";
import { cn } from "@/lib/utils";
import { nodeTypeRegistry } from "@/lib/nodeTypeRegistry";
import { Badge } from "@/components/ui/badge";
import { NodeSizeAnalyzer } from "@/lib/nodeSizeAnalyzer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NodeLibraryProps {
  onNodeDragStart: (event: React.DragEvent, label: string) => void;
  showTitle?: boolean; // NEW: Prop to control title visibility
}

type NodeSizeFilter = "all" | "small" | "medium" | "large";
type NodeVersionFilter = "all" | "v2" | "v3";

interface NodeItem {
  id: string;
  label: string;
  isV3: boolean;
  category: NodeCategory;
  description?: string;
}

export const NodeLibrary = ({ onNodeDragStart, showTitle = true }: NodeLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sizeFilter, setSizeFilter] = useState<NodeSizeFilter>("all");
  const [versionFilter, setVersionFilter] = useState<NodeVersionFilter>("all");
  const [expandedCategories, setExpandedCategories] = useState<Set<NodeCategory>>(
    new Set(Object.keys(NODE_CATEGORIES) as NodeCategory[])
  );

  // Memoized node data processing
  const { nodesByCategory, allNodes } = useMemo(() => {
    const v3Nodes = nodeTypeRegistry.getAllNodeTypesGroupedByCategory();

    const categoryMap: Record<string, NodeCategory> = {
      trigger: "Input",
      logic: "Processing",
      control: "Logic",
      output: "Output",
      utility: "Meta",
    };

    const result: Record<NodeCategory, NodeItem[]> = {
      Input: [],
      Processing: [],
      Logic: [],
      Output: [],
      Meta: [],
    };

    const allNodesList: NodeItem[] = [];

    // Process v3 nodes
    Object.entries(v3Nodes).forEach(([v3Category, nodes]) => {
      const uiCategory = categoryMap[v3Category] || "Meta";
      nodes.forEach(node => {
        const nodeItem: NodeItem = {
          id: node.id,
          label: node.label,
          isV3: true,
          category: uiCategory,
          description: node.description,
        };

        if (!result[uiCategory].find(n => n.id === node.id)) {
          result[uiCategory].push(nodeItem);
          allNodesList.push(nodeItem);
        }
      });
    });

    // Add legacy v2 nodes
    Object.entries(NODE_CATEGORIES).forEach(([category, nodes]) => {
      nodes.forEach(node => {
        const nodeId = node.toLowerCase().replace(/\s+/g, "_");
        if (!allNodesList.find(n => n.id === nodeId)) {
          const nodeItem: NodeItem = {
            id: nodeId,
            label: node,
            isV3: false,
            category: category as NodeCategory,
          };

          result[category as NodeCategory].push(nodeItem);
          allNodesList.push(nodeItem);
        }
      });
    });

    return { nodesByCategory: result, allNodes: allNodesList };
  }, []);

  // Filter nodes based on search and filters
  const filteredNodesByCategory = useMemo(() => {
    const result: Record<NodeCategory, NodeItem[]> = {
      Input: [],
      Processing: [],
      Logic: [],
      Output: [],
      Meta: [],
    };

    Object.entries(nodesByCategory).forEach(([category, nodes]) => {
      const filtered = nodes.filter(node => {
        // Search filter
        const matchesSearch =
          !searchTerm ||
          node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.description?.toLowerCase().includes(searchTerm.toLowerCase());

        // Size filter
        const nodeTypeId = node.label.toLowerCase().replace(/\s+/g, "-");
        const sizeCategory = NodeSizeAnalyzer.getSizeCategory(nodeTypeId);
        const matchesSize = sizeFilter === "all" || sizeCategory === sizeFilter;

        // Version filter
        const matchesVersion =
          versionFilter === "all" ||
          (versionFilter === "v3" && node.isV3) ||
          (versionFilter === "v2" && !node.isV3);

        return matchesSearch && matchesSize && matchesVersion;
      });

      result[category as NodeCategory] = filtered;
    });

    return result;
  }, [nodesByCategory, searchTerm, sizeFilter, versionFilter]);

  // Category management
  const toggleCategory = useCallback((category: NodeCategory) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  const expandAllCategories = useCallback(() => {
    setExpandedCategories(new Set(Object.keys(NODE_CATEGORIES) as NodeCategory[]));
  }, []);

  const collapseAllCategories = useCallback(() => {
    setExpandedCategories(new Set());
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSizeFilter("all");
    setVersionFilter("all");
  }, []);

  // Check if any filter is active
  const hasActiveFilters = searchTerm || sizeFilter !== "all" || versionFilter !== "all";

  // Check if category has visible nodes
  const hasVisibleNodes = useCallback((category: NodeCategory) => {
    return filteredNodesByCategory[category].length > 0;
  }, [filteredNodesByCategory]);

  // Get total visible nodes count
  const totalVisibleNodes = useMemo(() => {
    return Object.values(filteredNodesByCategory).reduce((total, nodes) => total + nodes.length, 0);
  }, [filteredNodesByCategory]);

  // Handle node drag start with better error handling
  const handleNodeDragStart = useCallback(
    (event: React.DragEvent, node: NodeItem) => {
      try {
        event.dataTransfer.setData("application/reactflow", node.id);
        event.dataTransfer.setData("text/plain", node.label);
        event.dataTransfer.effectAllowed = "move";

        onNodeDragStart(event, node.label);
      } catch (error) {
        console.error("Error starting node drag:", error);
      }
    },
    [onNodeDragStart]
  );

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header with search and controls - CONDITIONAL RENDERING */}
      {showTitle && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Node Library
            </h3>
            <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={expandAllCategories} className="h-8 px-2">
                    Expand All
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Expand all categories</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={collapseAllCategories} className="h-8 px-2">
                    Collapse All
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Collapse all categories</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
            placeholder="Search nodes by name or description..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters:</span>
          </div>

          <select
            value={sizeFilter}
            onChange={e => setSizeFilter(e.target.value as NodeSizeFilter)}
            className="text-xs border rounded px-2 py-1 bg-background"
          >
            <option value="all">All Sizes</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>

          <select
            value={versionFilter}
            onChange={e => setVersionFilter(e.target.value as NodeVersionFilter)}
            className="text-xs border rounded px-2 py-1 bg-background"
          >
            <option value="all">All Versions</option>
            <option value="v3">V3 Only</option>
            <option value="v2">V2 Only</option>
          </select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
              Clear All
            </Button>
          )}
      </div>

        {/* Results counter */}
        {hasActiveFilters && (
          <div className="text-xs text-muted-foreground">
            Showing {totalVisibleNodes} of {allNodes.length} nodes
          </div>
        )}
        </div>
      )}

      {/* Categories */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {(Object.keys(filteredNodesByCategory) as NodeCategory[]).map(category => {
          const filteredNodes = filteredNodesByCategory[category];
          if (filteredNodes.length === 0) return null;

          const isExpanded = expandedCategories.has(category);
          const colors = CATEGORY_COLORS[category];

          return (
            <div key={category} className="rounded-lg border border-border overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 font-semibold text-sm transition-all",
                  "bg-white border-l-4 hover:bg-gray-50 hover:shadow-sm",
                  colors.border.replace("border-", "border-l-"),
                  colors.text
                )}
              >
                <span className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  {category}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                  {filteredNodes.length}
                  </Badge>
                </div>
              </button>

              {/* Category Nodes */}
              {isExpanded && (
                <div className="p-2 space-y-1 bg-card max-h-80 overflow-y-auto">
                  {filteredNodes.map(node => {
                    const Icon = getIconForLabel(node.label);
                    const nodeColors = CATEGORY_COLORS[node.category];

                    return (
                      <TooltipProvider key={node.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              draggable
                              onDragStart={e => handleNodeDragStart(e, node)}
                              className={cn(
                                "flex items-start gap-3 px-3 py-2 rounded-lg",
                                "cursor-grab active:cursor-grabbing transition-all",
                                "border-2 hover:shadow-md hover:border-opacity-80",
                                nodeColors?.bg || "bg-white",
                                nodeColors?.border || "border-gray-200",
                                "group hover:scale-[1.02]"
                              )}
                            >
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0",
                                  nodeColors?.bg || "bg-gray-100",
                                  nodeColors?.border || "border border-gray-200",
                                  "group-hover:shadow-sm"
                                )}
                              >
                                <Icon
                                  className={cn("w-4 h-4", nodeColors?.icon || "text-gray-600")}
                                />
                              </div>

                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-start gap-2">
                                  <span
                                    className={cn(
                                      "text-sm font-medium break-words",
                                      nodeColors?.text || "text-foreground"
                                    )}
                                  >
                                    {node.label}
                                  </span>
                                </div>
                                {node.description && (
                                  <p className="text-xs text-muted-foreground break-words leading-relaxed">
                                    {node.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-medium">{node.label}</p>
                              {node.description && <p className="text-sm">{node.description}</p>}
                              <div className="flex gap-2 text-xs text-muted-foreground">
                                <span>Version: {node.isV3 ? "v3" : "v2"}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Drag to canvas to add</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

      {/* Empty State */}
        {totalVisibleNodes === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <div className="mb-2">🔍</div>
            <p>No nodes found</p>
            {hasActiveFilters && (
              <Button variant="link" onClick={clearFilters} className="h-auto p-0 text-xs">
                Clear filters to show all nodes
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
