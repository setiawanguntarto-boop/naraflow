import { useState } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NODE_CATEGORIES, CATEGORY_COLORS, type NodeCategory } from '@/data/nodeCategories';
import { getIconForLabel } from '@/data/nodeIcons';
import { cn } from '@/lib/utils';

interface NodeLibraryProps {
  onNodeDragStart: (event: React.DragEvent, label: string) => void;
}

export const NodeLibrary = ({ onNodeDragStart }: NodeLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<NodeCategory>>(
    new Set(Object.keys(NODE_CATEGORIES) as NodeCategory[])
  );

  const toggleCategory = (category: NodeCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const filterNodes = (nodes: readonly string[]) => {
    if (!searchTerm) return nodes;
    return nodes.filter(label => 
      label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const hasVisibleNodes = (category: NodeCategory) => {
    return filterNodes(NODE_CATEGORIES[category]).length > 0;
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Categories */}
      <div className="space-y-2">
        {(Object.keys(NODE_CATEGORIES) as NodeCategory[]).map(category => {
          const filteredNodes = filterNodes(NODE_CATEGORIES[category]);
          if (filteredNodes.length === 0 && searchTerm) return null;

          const isExpanded = expandedCategories.has(category);
          const colors = CATEGORY_COLORS[category];

          return (
            <div key={category} className="rounded-lg border border-border overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 font-medium text-sm transition-colors",
                  colors.bg,
                  colors.text,
                  "hover:opacity-80"
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
                <span className="text-xs opacity-70">{filteredNodes.length}</span>
              </button>

              {/* Category Nodes */}
              {isExpanded && (
                <div className="p-2 space-y-1 bg-card">
                  {filteredNodes.map(label => {
                    const Icon = getIconForLabel(label);
                    return (
                      <div
                        key={label}
                        draggable
                        onDragStart={(e) => onNodeDragStart(e, label)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md",
                          "cursor-grab active:cursor-grabbing",
                          "transition-all hover:scale-102",
                          colors.bg,
                          "border",
                          colors.border,
                          "hover:shadow-sm"
                        )}
                      >
                        <Icon className={cn("w-4 h-4 flex-shrink-0", colors.icon)} />
                        <span className="text-sm font-medium text-foreground">{label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {searchTerm && !Object.keys(NODE_CATEGORIES).some(cat => hasVisibleNodes(cat as NodeCategory)) && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No nodes found for "{searchTerm}"
        </div>
      )}
    </div>
  );
};
