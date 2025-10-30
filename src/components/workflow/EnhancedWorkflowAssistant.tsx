import { useState, useCallback, useMemo } from "react";
import { Search, Book, HelpCircle, Play, Settings, X, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { 
  workflowFeatures, 
  getRelatedFeatures, 
  type FeatureData 
} from "@/data/workflowFeatures";

export interface EnhancedWorkflowAssistantProps {
  onClose?: () => void;
  initialFeature?: string;
  context?: {
    nodeCount: number;
    edgeCount: number;
    errorCount: number;
    llamaConnected: boolean;
    selectedPreset?: string | null;
  };
}

export const EnhancedWorkflowAssistant = ({ 
  onClose,
  initialFeature,
  context,
}: EnhancedWorkflowAssistantProps) => {
  const [query, setQuery] = useState("");
  const [selectedFeature, setSelectedFeature] = useState<string | null>(initialFeature || null);

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    
    const normalizedQuery = query.toLowerCase();
    return Object.entries(workflowFeatures)
      .filter(([id, feature]) => 
        feature.title.toLowerCase().includes(normalizedQuery) ||
        feature.description.toLowerCase().includes(normalizedQuery) ||
        id.toLowerCase().includes(normalizedQuery) ||
        feature.usage?.toLowerCase().includes(normalizedQuery) ||
        feature.tips?.some(tip => tip.toLowerCase().includes(normalizedQuery))
      )
      .map(([id, data]) => ({ id, data }));
  }, [query]);

  const getFeatureTutorial = useCallback((featureId: string): string[] => {
    const tutorials: Record<string, string[]> = {
      "describe-workflow": [
        "1. Ketik deskripsi workflow di text area 'Describe Workflow'",
        "2. Gunakan @ untuk memilih template spesifik",
        "3. Klik tombol 'Generate' untuk membuat workflow otomatis",
        "4. Review hasil di preview panel",
        "5. Klik 'Apply to Canvas' untuk terapkan"
      ],
      "node-library": [
        "1. Buka panel 'Node Library' di sidebar kiri",
        "2. Expand kategori untuk melihat nodes",
        "3. Drag node yang diinginkan ke canvas",
        "4. Drop di posisi yang diinginkan",
        "5. Konfigurasi node dengan double-click"
      ],
      "workflow-canvas": [
        "1. Drag node dari library ke canvas",
        "2. Connect nodes dengan drag dari output ke input handle",
        "3. Right-click untuk context menu",
        "4. Gunakan Ctrl+L untuk auto-layout",
        "5. Scroll untuk zoom, drag untuk pan"
      ],
      "validation": [
        "1. Klik tombol 'Validate' di canvas header",
        "2. Panel validation akan muncul jika ada error",
        "3. Hover pada error untuk detail",
        "4. Klik error untuk navigate ke node",
        "5. Perbaiki error sebelum deployment"
      ],
      "llama-integration": [
        "1. Klik tombol 'Connect to LLaMA'",
        "2. Pilih sumber: Local atau Remote",
        "3. Configure connection settings",
        "4. Klik 'Test Connection'",
        "5. Save configuration"
      ],
      "node-configuration": [
        "1. Double-click node untuk open config panel",
        "2. Atau right-click → 'Configure Node'",
        "3. Edit title dan description",
        "4. Configure parameters dan metrics",
        "5. Klik 'Save' untuk apply changes"
      ],
      "execution-system": [
        "1. Select node atau edge",
        "2. Klik 'Run' button di header",
        "3. View execution result di panel",
        "4. Check logs untuk debugging",
        "5. Iterate berdasarkan hasil"
      ],
      "export-import": [
        "1. Klik 'Export' button di canvas toolbar",
        "2. Save workflow sebagai JSON file",
        "3. Untuk import: klik 'Import' → pilih file",
        "4. Confirm merge atau replace",
        "5. Workflow loaded ke canvas"
      ],
      "deployment": [
        "1. Validasi workflow terlebih dahulu",
        "2. Klik 'Deploy Agent' di config panel",
        "3. Configure deployment settings",
        "4. Test di sandbox environment",
        "5. Deploy to production"
      ],
      "simulation": [
        "1. Build workflow di canvas",
        "2. Klik 'Simulate' button",
        "3. Test berbagai skenario",
        "4. Check conversation flow",
        "5. Validate before deployment"
      ],
      "auto-layout": [
        "1. Select nodes atau seluruh canvas",
        "2. Klik FAB 'Auto Layout' di canvas",
        "3. Pilih preset: Horizontal, Vertical, Compact, dll",
        "4. Tunggu layout animation selesai",
        "5. Use Ctrl+Shift+L untuk restore"
      ]
    };

    return tutorials[featureId] || [
      "See feature description above for usage instructions"
    ];
  }, []);

  const features = searchResults || Object.entries(workflowFeatures).map(([id, data]) => ({ id, data }));
  const ctx = context || { nodeCount: 0, edgeCount: 0, errorCount: 0, llamaConnected: false, selectedPreset: null };

  const recommendedIds = useMemo(() => {
    const ids: string[] = [];
    if (ctx.errorCount > 0) ids.push("validation");
    if (!ctx.llamaConnected) ids.push("llama-integration");
    if (ctx.nodeCount === 0) { ids.push("describe-workflow", "node-library"); }
    ids.push("workflow-canvas", "auto-layout");
    return Array.from(new Set(ids));
  }, [ctx.errorCount, ctx.llamaConnected, ctx.nodeCount]);

  return (
    <ErrorBoundary 
      fallback={
        <div className="w-full max-w-5xl mx-auto bg-card rounded-2xl border border-border shadow-2xl p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-sm text-muted-foreground">Please try refreshing the page.</p>
          </div>
        </div>
      }
    >
      <div className="w-full max-w-5xl mx-auto bg-card rounded-2xl border border-border shadow-2xl max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary/10 rounded-lg">
              <Book className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Workflow Assistant</h2>
              <p className="text-sm text-muted-foreground">
                Panduan lengkap semua fitur Workflow Studio
              </p>
            </div>
          </div>
          
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Cari fitur atau tanya tentang Workflow Studio..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Search Results Count */}
        {searchResults && (
          <p className="text-xs text-muted-foreground mt-2">
            Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Context Snapshot */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary">Nodes: {ctx.nodeCount}</Badge>
          <Badge variant="secondary">Edges: {ctx.edgeCount}</Badge>
          <Badge variant={ctx.errorCount > 0 ? "destructive" : "secondary"}>
            Errors: {ctx.errorCount}
          </Badge>
          <Badge variant={ctx.llamaConnected ? "secondary" : "outline"}>
            LLaMA: {ctx.llamaConnected ? "Connected" : "Disconnected"}
          </Badge>
          {ctx.selectedPreset ? <Badge variant="secondary">Preset: {ctx.selectedPreset}</Badge> : null}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-6 overflow-y-auto">
        {selectedFeature ? (
          // Feature Detail View
          <div className="space-y-4">
            <button 
              onClick={() => setSelectedFeature(null)}
              className="text-sm text-brand-primary hover:underline flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Kembali ke semua fitur
            </button>
            
            {(() => {
              const feature = workflowFeatures[selectedFeature];
              if (!feature) return null;

              const related = getRelatedFeatures(selectedFeature);

              return (
                <div className="space-y-4">
                  {/* Feature Header */}
                  <div className="bg-muted/20 rounded-lg p-6">
                    <div className="flex items-start gap-3 mb-3">
                      {feature.icon && <span className="text-3xl">{feature.icon}</span>}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    {feature.usage && (
                      <div className="mt-4 p-3 bg-background rounded-lg border border-border">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Cara Penggunaan:
                        </h4>
                        <code className="text-sm bg-muted px-3 py-2 rounded block whitespace-pre-wrap">
                          {feature.usage}
                        </code>
                      </div>
                    )}
                  </div>

                  {/* Tutorial Steps */}
                  <div className="bg-gradient-to-r from-brand-primary/5 to-transparent rounded-lg p-4 border border-brand-primary/20">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Play className="w-5 h-5 text-brand-primary" />
                      Langkah-langkah:
                    </h4>
                    <ol className="space-y-2">
                      {getFeatureTutorial(selectedFeature).map((step, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="text-brand-primary font-semibold flex-shrink-0">
                            {index + 1}.
                          </span>
                          <span className="text-sm leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Tips */}
                  {feature.tips && feature.tips.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        💡 Tips:
                      </h4>
                      <ul className="space-y-2">
                        {feature.tips.map((tip, index) => (
                          <li key={index} className="text-sm flex gap-2 items-start">
                            <span className="text-green-500 mt-1">•</span>
                            <span className="flex-1">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Categories */}
                  {feature.categories && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Kategori:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(feature.categories).map(([cat, desc]) => (
                          <div key={cat} className="p-3 bg-muted/20 rounded-lg border border-border">
                            <div className="font-medium text-sm mb-1 capitalize">{cat}</div>
                            <div className="text-xs text-muted-foreground">{desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features List */}
                  {feature.features && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {feature.features.map((feat, index) => (
                          <Badge key={index} variant="secondary">{feat}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Checks List */}
                  {feature.checks && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Validasi:</h4>
                      <ul className="space-y-1">
                        {feature.checks.map((check, index) => (
                          <li key={index} className="text-sm flex gap-2">
                            <span className="text-blue-500 mt-1">✓</span>
                            <span>{check}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Related Features */}
                  {related.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-border">
                      <h4 className="font-semibold mb-3">Fitur Terkait:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {related.map((relatedFeature) => {
                          const featureKey = Object.keys(workflowFeatures).find(
                            key => workflowFeatures[key] === relatedFeature
                          );
                          return (
                            <div
                              key={featureKey}
                              onClick={() => {
                                setSelectedFeature(featureKey || null);
                                setQuery("");
                              }}
                              className="p-3 bg-muted/20 rounded-lg border border-border hover:border-brand-primary/30 cursor-pointer transition-colors"
                            >
                              <div className="font-medium text-sm">{relatedFeature.title}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {relatedFeature.description}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          // Feature List View
          <div className="space-y-4">
            {/* Recommended for you */}
            {(!query || !query.trim()) && recommendedIds.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Recommended for you</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recommendedIds.map((id) => {
                    const data = workflowFeatures[id];
                    if (!data) return null;
                    return (
                      <div
                        key={`rec-${id}`}
                        onClick={() => setSelectedFeature(id)}
                        className="p-4 border border-brand-primary/30 rounded-lg bg-brand-primary/5 cursor-pointer hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-3 mb-1">
                          {data.icon && <span className="text-2xl">{data.icon}</span>}
                          <h3 className="font-semibold text-brand-primary">{data.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{data.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map(({ id, data }) => (
              <div
                key={id}
                onClick={() => setSelectedFeature(id)}
                className="p-4 border border-border rounded-lg hover:border-brand-primary/30 cursor-pointer transition-all hover:shadow-md group"
              >
                <div className="flex items-start gap-3 mb-2">
                  {data.icon && <span className="text-2xl">{data.icon}</span>}
                  <h3 className="font-semibold group-hover:text-brand-primary transition-colors">
                    {data.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {data.description}
                </p>
                {data.usage && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                    💡 {data.usage}
                  </p>
                )}
              </div>
            ))}
            </div>
          </div>
        )}
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border bg-muted/10 flex-shrink-0">
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" className="gap-2">
            <Play className="w-4 h-4" />
            Video Tutorial
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            Best Practices
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </Button>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
};

