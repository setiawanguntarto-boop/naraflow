import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NODE_CATEGORIES, CATEGORY_COLORS, type NodeCategory, getCategoryForNode } from '@/data/nodeCategories';
import { getIconForLabel } from '@/data/nodeIcons';
import { cn } from '@/lib/utils';
import { nodeTypeRegistry } from '@/lib/nodeTypeRegistry';
import { Badge } from '@/components/ui/badge';

interface NodeLibraryProps {
  onNodeDragStart: (event: React.DragEvent, label: string) => void;
}

export const NodeLibrary = ({ onNodeDragStart }: NodeLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<NodeCategory>>(
    new Set(Object.keys(NODE_CATEGORIES) as NodeCategory[])
  );

  // Get all nodes from v3 registry and group them
  const v3NodesByCategory = useMemo(() => {
    const grouped = nodeTypeRegistry.getAllNodeTypesGroupedByCategory();
    
    // Map v3 categories to UI categories
    const categoryMap: Record<string, NodeCategory> = {
      'trigger': 'Input',
      'logic': 'Processing',
      'control': 'Logic',
      'output': 'Output',
      'utility': 'Meta'
    };
    
    const result: Record<NodeCategory, Array<{ id: string; label: string; isV3: boolean }>> = {
      Input: [],
      Processing: [],
      Logic: [],
      Output: [],
      Meta: []
    };
    
    Object.entries(grouped).forEach(([v3Category, nodes]) => {
      const uiCategory = categoryMap[v3Category] || 'Meta';
      nodes.forEach(node => {
        result[uiCategory].push({
          id: node.id,
          label: node.label,
          isV3: true
        });
      });
    });
    
    // Also add legacy v2 nodes
    Object.entries(NODE_CATEGORIES).forEach(([category, nodes]) => {
      nodes.forEach(node => {
        if (!result[category as NodeCategory].find(n => n.label === node)) {
          result[category as NodeCategory].push({
            id: node.toLowerCase().replace(/\s+/g, '_'),
            label: node,
            isV3: false
          });
        }
      });
    });
    
    return result;
  }, []);

  const toggleCategory = (category: NodeCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const filterNodes = (nodes: Array<{ id: string; label: string; isV3: boolean }>) => {
    if (!searchTerm) return nodes;
    return nodes.filter(node => 
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const hasVisibleNodes = (category: NodeCategory) => {
    return filterNodes(v3NodesByCategory[category]).length > 0;
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
        {(Object.keys(v3NodesByCategory) as NodeCategory[]).map(category => {
          const filteredNodes = filterNodes(v3NodesByCategory[category]);
          if (filteredNodes.length === 0 && searchTerm) return null;

          const isExpanded = expandedCategories.has(category);
          const colors = CATEGORY_COLORS[category];

          return (
            <div key={category} className="rounded-lg border border-border overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 font-semibold text-sm transition-all",
                  "bg-white border-l-4",
                  colors.border.replace('border-', 'border-l-'),
                  colors.text,
                  "hover:bg-gray-50 hover:shadow-sm"
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
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full font-medium">
                  {filteredNodes.length}
                </span>
              </button>

              {/* Category Nodes */}
              {isExpanded && (
                <div className="p-2 space-y-1 bg-card">
                  {filteredNodes.map(node => {
                    const Icon = getIconForLabel(node.label);
                    const nodeCategory = getCategoryForNode(node.label);
                    const nodeColors = nodeCategory ? CATEGORY_COLORS[nodeCategory] : null;
                    
                    return (
                      <div
                        key={node.id}
                        draggable
                        onDragStart={(e) => onNodeDragStart(e, node.label)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg",
                          "cursor-grab active:cursor-grabbing",
                          "transition-all hover:scale-102",
                          "border-2",
                          nodeColors?.bg || 'bg-white',
                          nodeColors?.border || 'border-gray-200',
                          "hover:shadow-md hover:border-opacity-80"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          nodeColors?.bg || 'bg-gray-100',
                          nodeColors?.border || 'border border-gray-200'
                        )}>
                          <Icon className={cn("w-4 h-4", nodeColors?.icon || 'text-gray-600')} />
                        </div>
                        <div className="flex-1">
                          <span className={cn("text-sm font-medium", nodeColors?.text || 'text-foreground')}>
                            {node.label}
                          </span>
                        </div>
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
