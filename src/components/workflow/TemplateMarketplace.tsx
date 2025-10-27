import { useState, useEffect, useMemo } from 'react';
import { Search, Download, Upload, Star, Filter, Grid, List, Plus, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { TemplateData, TemplateMetadata, TemplateManager } from '@/lib/templateManager';
import { TemplateStorage } from '@/lib/templateStorage';
import { workflowTemplates } from '@/lib/templates/workflowTemplates';

interface TemplateMarketplaceProps {
  onSelectTemplate?: (template: TemplateData) => void;
  onImportTemplate?: (template: TemplateData) => void;
  onCreateTemplate?: () => void;
  className?: string;
}

export const TemplateMarketplace: React.FC<TemplateMarketplaceProps> = ({
  onSelectTemplate,
  onImportTemplate,
  onCreateTemplate,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [userTemplates, setUserTemplates] = useState<TemplateMetadata[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  const templateStorage = useMemo(() => new TemplateStorage(), []);

  // Load user templates on mount
  useEffect(() => {
    loadUserTemplates();
  }, []);

  const loadUserTemplates = async () => {
    try {
      setIsLoading(true);
      const templates = await templateStorage.listTemplates();
      setUserTemplates(templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert workflow templates to TemplateData
  const builtInTemplates = useMemo(() => {
    return Object.entries(workflowTemplates).map(([id, template]) => 
      TemplateManager.fromWorkflowTemplate(id, template)
    );
  }, []);

  // Combine built-in and user templates
  const allTemplates = useMemo(() => {
    const builtInMetadata = builtInTemplates.map(t => t.metadata);
    return [...builtInMetadata, ...userTemplates];
  }, [builtInTemplates, userTemplates]);

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allTemplates, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(allTemplates.map(t => t.category))];
    return ['all', ...cats];
  }, [allTemplates]);

  const handleTemplateSelect = async (templateId: string) => {
    try {
      setIsLoading(true);
      
      // Check if it's a built-in template
      const builtInTemplate = builtInTemplates.find(t => t.metadata.id === templateId);
      if (builtInTemplate) {
        setSelectedTemplate(builtInTemplate);
        onSelectTemplate?.(builtInTemplate);
        return;
      }

      // Load user template
      const template = await templateStorage.loadTemplate(templateId);
      if (template) {
        setSelectedTemplate(template);
        onSelectTemplate?.(template);
      } else {
        toast.error('Template not found');
      }
    } catch (error) {
      console.error('Failed to load template:', error);
      toast.error('Failed to load template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportTemplate = async (templateId: string) => {
    try {
      const template = await templateStorage.loadTemplate(templateId);
      if (template) {
        await templateStorage.exportToFile(template);
        toast.success('Template exported successfully');
      } else {
        toast.error('Template not found');
      }
    } catch (error) {
      console.error('Failed to export template:', error);
      toast.error('Failed to export template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await templateStorage.deleteTemplate(templateId);
      await loadUserTemplates();
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const template = await templateStorage.importFromFile(file);
      
      // Save the imported template
      await templateStorage.saveTemplate(template);
      await loadUserTemplates();
      
      toast.success('Template imported successfully');
      setShowImportDialog(false);
      onImportTemplate?.(template);
    } catch (error) {
      console.error('Failed to import template:', error);
      toast.error(`Failed to import template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const TemplateCard: React.FC<{ template: TemplateMetadata }> = ({ template }) => {
    const isBuiltIn = builtInTemplates.some(t => t.metadata.id === template.id);
    const stats = TemplateManager.getTemplateStats({ metadata: template, nodes: [], edges: [] });

    return (
      <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg group-hover:text-brand-primary transition-colors">
                {template.name}
              </CardTitle>
              <CardDescription className="mt-1 line-clamp-2">
                {template.description}
              </CardDescription>
            </div>
            {isBuiltIn && (
              <Badge variant="secondary" className="ml-2">
                <Star className="w-3 h-3 mr-1" />
                Built-in
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Tags */}
            {template.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{template.nodeCount} nodes</span>
              <span>{template.edgeCount} edges</span>
              <Badge 
                variant={stats.complexity === 'simple' ? 'default' : stats.complexity === 'moderate' ? 'secondary' : 'destructive'}
                className="text-xs"
              >
                {stats.complexity}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => handleTemplateSelect(template.id)}
                className="flex-1"
              >
                Use Template
              </Button>
              
              {!isBuiltIn && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportTemplate(template.id)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const TemplateListItem: React.FC<{ template: TemplateMetadata }> = ({ template }) => {
    const isBuiltIn = builtInTemplates.some(t => t.metadata.id === template.id);
    const stats = TemplateManager.getTemplateStats({ metadata: template, nodes: [], edges: [] });

    return (
      <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium">{template.name}</h3>
            {isBuiltIn && (
              <Badge variant="secondary" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                Built-in
              </Badge>
            )}
            <Badge 
              variant={stats.complexity === 'simple' ? 'default' : stats.complexity === 'moderate' ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {stats.complexity}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{template.nodeCount} nodes</span>
            <span>{template.edgeCount} edges</span>
            <span>{template.category}</span>
            <span>{new Date(template.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleTemplateSelect(template.id)}
          >
            Use
          </Button>
          
          {!isBuiltIn && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportTemplate(template.id)}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteTemplate(template.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Template Marketplace</h2>
          <p className="text-muted-foreground">
            Discover and manage workflow templates
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Template</DialogTitle>
                <DialogDescription>
                  Select a template file to import
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Select a JSON file exported from Naraflow
                </p>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={onCreateTemplate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex items-center gap-1 border rounded-md">
          <Button
            size="sm"
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Templates */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredTemplates.map(template => (
            viewMode === 'grid' ? (
              <TemplateCard key={template.id} template={template} />
            ) : (
              <TemplateListItem key={template.id} template={template} />
            )
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t">
        <span>{filteredTemplates.length} templates</span>
        <span>{userTemplates.length} user templates</span>
        <span>{builtInTemplates.length} built-in templates</span>
      </div>
    </div>
  );
};
