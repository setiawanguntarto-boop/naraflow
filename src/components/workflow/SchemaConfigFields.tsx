/**
 * Schema-based Configuration Fields Renderer
 * Dynamically generates form fields from JSON Schema definitions
 */

import { useState } from "react";
import { JSONSchema7 } from "json-schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Trash2, ChevronDown, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SchemaConfigFieldsProps {
  schema: JSONSchema7;
  fieldsOrder?: string[];
  advancedFields?: {
    collapsed: boolean;
    fields: string[];
  };
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
}

interface FieldProps {
  fieldName: string;
  fieldSchema: JSONSchema7;
  value: any;
  onChange: (value: any) => void;
  required?: boolean;
}

// Provider-specific model options
const AI_MODELS: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ],
  anthropic: [
    { value: "claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
    { value: "claude-opus-4-1", label: "Claude Opus 4.1" },
    { value: "claude-instant", label: "Claude Instant" },
  ],
  google: [
    { value: "gemini-pro", label: "Gemini Pro" },
    { value: "gemini-ultra", label: "Gemini Ultra" },
  ],
  local: [
    { value: "llama-3.1-8b", label: "Llama 3.1 8B" },
    { value: "mistral-7b", label: "Mistral 7B" },
  ],
};

const SchemaField = ({ fieldName, fieldSchema, value, onChange, required }: FieldProps) => {
  const description = fieldSchema.description;
  const enumValues = fieldSchema.enum as string[] | undefined;
  const type = fieldSchema.type as string;

  // Render enum as select dropdown
  if (enumValues && enumValues.length > 0) {
    // Special handling for provider field - show model options dynamically
    if (fieldName === "provider") {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor={fieldName} className="capitalize">
              {fieldSchema.title || fieldName.replace(/_/g, " ")}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger id={fieldName}>
              <SelectValue placeholder={`Select ${fieldName}...`} />
            </SelectTrigger>
            <SelectContent>
              {enumValues.map((enumValue) => (
                <SelectItem key={String(enumValue)} value={String(enumValue)}>
                  {String(enumValue)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={fieldName} className="capitalize">
            {fieldSchema.title || fieldName.replace(/_/g, " ")}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger id={fieldName}>
            <SelectValue placeholder={`Select ${fieldName}...`} />
          </SelectTrigger>
          <SelectContent>
            {enumValues.map((enumValue) => (
              <SelectItem key={String(enumValue)} value={String(enumValue)}>
                {String(enumValue)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Render boolean as switch
  if (type === "boolean") {
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={fieldName} className="capitalize">
            {fieldSchema.title || fieldName.replace(/_/g, " ")}
          </Label>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Switch
          id={fieldName}
          checked={value || false}
          onCheckedChange={onChange}
        />
      </div>
    );
  }

  // Render number with slider for temperature-like fields
  if (type === "number") {
    const min = (fieldSchema.minimum as number) ?? 0;
    const max = (fieldSchema.maximum as number) ?? 100;
    const isTemperature = fieldName.toLowerCase().includes("temperature");
    const isSliderField = isTemperature || (max - min <= 10 && max <= 2);

    if (isSliderField) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor={fieldName} className="capitalize">
                {fieldSchema.title || fieldName.replace(/_/g, " ")}
                {required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">{description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {value ?? min}
            </Badge>
          </div>
          <Slider
            id={fieldName}
            min={min}
            max={max}
            step={isTemperature ? 0.1 : 1}
            value={[value ?? min]}
            onValueChange={([val]) => onChange(val)}
          />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={fieldName} className="capitalize">
            {fieldSchema.title || fieldName.replace(/_/g, " ")}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Input
          id={fieldName}
          type="number"
          min={min}
          max={max}
          value={value ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={`Enter ${fieldName}...`}
        />
      </div>
    );
  }

  // Render array
  if (type === "array") {
    const items = Array.isArray(value) ? value : [];
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="capitalize">
              {fieldSchema.title || fieldName.replace(/_/g, " ")}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange([...items, ""])}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={item}
                onChange={(e) => {
                  const updated = [...items];
                  updated[index] = e.target.value;
                  onChange(updated);
                }}
                placeholder={`Item ${index + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const updated = items.filter((_, i) => i !== index);
                  onChange(updated);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render string as textarea for long text fields
  const isLongText = 
    fieldName.toLowerCase().includes("prompt") || 
    fieldName.toLowerCase().includes("template") ||
    fieldName.toLowerCase().includes("message") ||
    fieldName.toLowerCase().includes("content");

  if (type === "string" && isLongText) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={fieldName} className="capitalize">
            {fieldSchema.title || fieldName.replace(/_/g, " ")}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Textarea
          id={fieldName}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${fieldName}...`}
          rows={5}
          className="font-mono text-sm"
        />
      </div>
    );
  }

  // Default: render as input
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={fieldName} className="capitalize">
          {fieldSchema.title || fieldName.replace(/_/g, " ")}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <Input
        id={fieldName}
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${fieldName}...`}
      />
    </div>
  );
};

export const SchemaConfigFields = ({
  schema,
  fieldsOrder = [],
  advancedFields,
  value,
  onChange,
}: SchemaConfigFieldsProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(!advancedFields?.collapsed);

  const properties = schema.properties || {};
  const required = schema.required || [];

  // Separate fields into basic and advanced
  const advancedFieldNames = advancedFields?.fields || [];
  const basicFieldNames = fieldsOrder.filter(f => !advancedFieldNames.includes(f));
  const unorderedFieldNames = Object.keys(properties).filter(
    f => !fieldsOrder.includes(f) && !advancedFieldNames.includes(f)
  );

  const allBasicFields = [...basicFieldNames, ...unorderedFieldNames];

  const handleFieldChange = (fieldName: string, fieldValue: any) => {
    onChange({
      ...value,
      [fieldName]: fieldValue,
    });
  };

  return (
    <div className="space-y-4">
      {/* Basic Configuration Fields */}
      {allBasicFields.map((fieldName) => {
        const fieldSchema = properties[fieldName] as JSONSchema7;
        if (!fieldSchema) return null;

        return (
          <SchemaField
            key={fieldName}
            fieldName={fieldName}
            fieldSchema={fieldSchema}
            value={value[fieldName]}
            onChange={(val) => handleFieldChange(fieldName, val)}
            required={required.includes(fieldName)}
          />
        );
      })}

      {/* Advanced Configuration Fields */}
      {advancedFieldNames.length > 0 && (
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between" type="button">
              <span className="flex items-center gap-2">
                Advanced Configuration
                <Badge variant="secondary" className="text-xs">
                  {advancedFieldNames.length} fields
                </Badge>
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isAdvancedOpen ? "transform rotate-180" : ""
                }`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {advancedFieldNames.map((fieldName) => {
              const fieldSchema = properties[fieldName] as JSONSchema7;
              if (!fieldSchema) return null;

              return (
                <SchemaField
                  key={fieldName}
                  fieldName={fieldName}
                  fieldSchema={fieldSchema}
                  value={value[fieldName]}
                  onChange={(val) => handleFieldChange(fieldName, val)}
                  required={required.includes(fieldName)}
                />
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};
