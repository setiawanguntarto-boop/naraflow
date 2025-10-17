import { Settings2, Waves, Minus, Square, Move, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { toast } from 'sonner';

export const EdgeSettingsPanel = () => {
  const {
    defaultEdgeType,
    defaultEdgeStyle,
    defaultEdgeAnimated,
    defaultEdgeWidth,
    setDefaultEdgeType,
    setDefaultEdgeStyle,
    setDefaultEdgeAnimated,
    setDefaultEdgeWidth,
    applyStyleToAllEdges,
    edges,
  } = useWorkflowState();

  const handleApplyToAll = () => {
    if (edges.length === 0) {
      toast.error('No edges to update');
      return;
    }

    let strokeDasharray = undefined;
    if (defaultEdgeStyle === 'dashed') {
      strokeDasharray = '5, 5';
    } else if (defaultEdgeStyle === 'dotted') {
      strokeDasharray = '2, 4';
    }

    applyStyleToAllEdges({
      type: defaultEdgeType,
      animated: defaultEdgeAnimated,
      style: {
        stroke: 'hsl(var(--brand-primary))',
        strokeWidth: defaultEdgeWidth,
        strokeDasharray,
      },
      data: {
        lineStyle: defaultEdgeStyle,
      },
    });

    toast.success('Style applied to all edges', {
      description: `Updated ${edges.length} connection${edges.length !== 1 ? 's' : ''}`,
    });
  };

  return (
    <div className="h-full bg-card border-l border-border-light p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="w-5 h-5 text-brand-primary" />
        <h3 className="font-semibold text-foreground">Edge Settings</h3>
      </div>

      <div className="space-y-6">
        {/* Edge Type */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Edge Type</Label>
          <RadioGroup value={defaultEdgeType} onValueChange={setDefaultEdgeType}>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="smoothstep" id="smoothstep" />
              <Label htmlFor="smoothstep" className="flex items-center gap-2 cursor-pointer">
                <Waves className="w-4 h-4 text-brand-secondary" />
                <span>Smooth Step</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="straight" id="straight" />
              <Label htmlFor="straight" className="flex items-center gap-2 cursor-pointer">
                <Minus className="w-4 h-4 text-brand-secondary" />
                <span>Straight</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="step" id="step" />
              <Label htmlFor="step" className="flex items-center gap-2 cursor-pointer">
                <Square className="w-4 h-4 text-brand-secondary" />
                <span>Step</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="default" id="bezier" />
              <Label htmlFor="bezier" className="flex items-center gap-2 cursor-pointer">
                <Move className="w-4 h-4 text-brand-secondary" />
                <span>Bezier</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Line Style */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Line Style</Label>
          <RadioGroup value={defaultEdgeStyle} onValueChange={setDefaultEdgeStyle}>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="solid" id="solid" />
              <Label htmlFor="solid" className="cursor-pointer">
                <span>━━━ Solid</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="dashed" id="dashed" />
              <Label htmlFor="dashed" className="cursor-pointer">
                <span>┈┈┈ Dashed</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dotted" id="dotted" />
              <Label htmlFor="dotted" className="cursor-pointer">
                <span>⋯⋯⋯ Dotted</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Animation */}
        <div className="flex items-center justify-between">
          <Label htmlFor="animated" className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-accent" />
            <span>Animated</span>
          </Label>
          <Switch
            id="animated"
            checked={defaultEdgeAnimated}
            onCheckedChange={setDefaultEdgeAnimated}
          />
        </div>

        {/* Line Width */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Line Width: {defaultEdgeWidth}px
          </Label>
          <Slider
            value={[defaultEdgeWidth]}
            onValueChange={(value) => setDefaultEdgeWidth(value[0])}
            min={1}
            max={5}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Apply to All Button */}
        <Button
          onClick={handleApplyToAll}
          variant="outline"
          className="w-full"
          disabled={edges.length === 0}
        >
          Apply to All Edges ({edges.length})
        </Button>

        {/* Help Text */}
        <div className="text-xs text-foreground-muted bg-background-soft p-3 rounded-lg">
          <p className="mb-2">💡 <strong>Tip:</strong></p>
          <p>• Right-click any edge to customize it individually</p>
          <p>• Select an edge and press 1-4 to change type</p>
          <p>• Press D for dashed, A for animation</p>
        </div>
      </div>
    </div>
  );
};
