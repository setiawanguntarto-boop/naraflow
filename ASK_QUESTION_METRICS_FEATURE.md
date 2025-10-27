# Ask Question Metrics Configuration Feature

## Problem
Node "Ask Question" butuh konfigurasi terstruktur untuk mengumpulkan data dari user. Saat ini hanya punya input generik yang tidak memberikan cukup informasi untuk agent.

## Solution
Implementasi sistem konfigurasi metrics yang memungkinkan user untuk:
1. Define multiple metrics questions
2. Specify metric metadata (name, label, description, type)
3. Set validation rules (required, min/max, options)
4. Store structured data yang bisa dipahami oleh agent

## Implementation Details

### 1. MetricDefinition Interface
**File**: `src/components/workflow/NodeConfigPanel.tsx`

```typescript
interface MetricDefinition {
  name: string;          // Unique ID (e.g., "flock_age")
  label: string;         // Display label (e.g., "Flock Age (weeks)")
  description: string;    // What this metric measures
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}
```

### 2. Metrics State Management
```typescript
const [metrics, setMetrics] = useState<MetricDefinition[]>(
  node.data?.metrics || []
);

// Load metrics when node changes
useEffect(() => {
  setMetrics(node.data?.metrics || []);
}, [node.id]);
```

### 3. Metrics Management Functions
```typescript
// Add new metric
const addMetric = () => {
  setMetrics([...metrics, {
    name: '',
    label: '',
    description: '',
    type: 'text',
    required: true
  }]);
};

// Update metric field
const updateMetric = (index: number, field: keyof MetricDefinition, value: any) => {
  const updated = [...metrics];
  updated[index] = { ...updated[index], [field]: value };
  setMetrics(updated);
};

// Remove metric
const removeMetric = (index: number) => {
  setMetrics(metrics.filter((_, i) => i !== index));
};
```

### 4. Save Handler
```typescript
const handleSave = () => {
  if (node.data?.label === 'Ask Question') {
    onSave(node.id, title, description, metrics);
  } else {
    onSave(node.id, title, description);
  }
  setHasChanges(false);
};
```

### 5. Metrics UI Components

#### Add/Remove Controls
```typescript
<div className="flex items-center justify-between">
  <Label>Question Metrics</Label>
  <Button variant="outline" size="sm" onClick={addMetric}>
    <Plus className="w-4 h-4 mr-1" />
    Add Metric
  </Button>
</div>
```

#### Metric Cards
- **Name (ID)**: Unique identifier (snake_case)
- **Display Label**: Human-readable label
- **Description**: Detailed explanation
- **Type**: text, number, date, or select
- **Required**: Checkbox for mandatory fields
- **Validation**: Min/max for numbers, options for select

#### Conditional Fields
- **Number type**: Shows min/max validation fields
- **Select type**: Shows options input (comma-separated)
- **Dynamic UI**: Adapts based on selected type

### 6. Storage Structure
Data saved to node.data:
```json
{
  "nodeId": "ask-question-123",
  "data": {
    "label": "Ask Question",
    "title": "Collect Farm Data",
    "description": "Gather metrics from farm owner",
    "metrics": [
      {
        "name": "flock_age",
        "label": "Flock Age (weeks)",
        "description": "Age of the chicken flock in weeks",
        "type": "number",
        "required": true,
        "validation": {
          "min": 0,
          "max": 104
        }
      },
      {
        "name": "temperature",
        "label": "Temperature (°C)",
        "description": "Current coop temperature",
        "type": "number",
        "required": true,
        "validation": {
          "min": 15,
          "max": 40
        }
      },
      {
        "name": "feed_type",
        "label": "Feed Type",
        "description": "Type of feed currently used",
        "type": "select",
        "required": false,
        "validation": {
          "options": ["Starter", "Grower", "Layer", "Finisher"]
        }
      }
    ]
  }
}
```

## Files Modified

### 1. `src/components/workflow/NodeConfigPanel.tsx`
**Changes**:
- Added `MetricDefinition` interface
- Updated `NodeConfigPanelProps` to support metrics parameter
- Added `metrics` state management
- Added `addMetric`, `updateMetric`, `removeMetric` functions
- Added comprehensive metrics UI (200+ lines)
- Updated `handleSave` to include metrics
- Updated `hasChanges` detection to track metrics changes

### 2. `src/components/sections/workflow-studio.tsx`
**Changes**:
- Updated `onSave` handler to accept optional `metrics` parameter
- Store metrics to node data when provided
- Pass metrics from config panel to save handler

## UI Features

### 1. Metrics Section (Only for Ask Question nodes)
```
┌────────────────────────────────────┐
│ Question Metrics          [+ Add]  │
├────────────────────────────────────┤
│ Metric 1                  [🗑️]     │
│ Name: flock_age          │
│ Label: Flock Age         │
│ Description: Age in...    │
│ Type: [Number ▼] Required:☑│
│ Min: 0      Max: 104     │
└────────────────────────────────────┘
```

### 2. Empty State
```
No metrics defined. Click "Add Metric" to start collecting data.
```

### 3. Validation Fields (Type-specific)
- **Number**: Min/Max value inputs
- **Select**: Comma-separated options input
- **Text/Date**: No additional validation fields

## User Workflow

### Creating Ask Question Node:
1. Drag "Ask Question" node to canvas
2. Right-click → "Configure Node"
3. Enter title and description
4. Click "Add Metric" button
5. Fill in metric details:
   - Name (ID): `flock_age`
   - Display Label: `Flock Age (weeks)`
   - Description: `Age of chicken flock in weeks`
   - Type: `number`
   - Required: ☑
   - Min: `0`, Max: `104`
6. Click "Add Metric" to add more metrics
7. Click "Save Changes"

### Result:
Node now contains structured metrics data that agent can use to:
- Generate appropriate questions
- Validate user inputs
- Store data in structured format
- Make decisions based on collected metrics

## Benefits

1. **Structured Data Collection**: Organized metrics instead of free-form text
2. **Agent Clarity**: Each metric has clear name, description, and type
3. **Built-in Validation**: Min/max constraints and required fields
4. **Multiple Types**: Support text, number, date, and select fields
5. **Dynamic UI**: Validation fields appear based on selected type
6. **Scalable**: Add unlimited metrics to a single Ask Question node

## Use Cases

### Example 1: Farm Data Collection
```json
{
  "metrics": [
    {
      "name": "flock_age",
      "label": "Flock Age",
      "description": "Age of chicken flock in weeks",
      "type": "number",
      "required": true,
      "validation": { "min": 0, "max": 104 }
    },
    {
      "name": "daily_egg_production",
      "label": "Daily Egg Production",
      "description": "Average eggs per day",
      "type": "number",
      "required": true,
      "validation": { "min": 0, "max": 1000 }
    }
  ]
}
```

### Example 2: Customer Feedback
```json
{
  "metrics": [
    {
      "name": "satisfaction_level",
      "label": "Satisfaction Level",
      "description": "Rate your experience",
      "type": "select",
      "required": true,
      "validation": {
        "options": ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"]
      }
    },
    {
      "name": "feedback_text",
      "label": "Feedback",
      "description": "Additional comments",
      "type": "text",
      "required": false
    }
  ]
}
```

## Build Status

✅ Build successful - No TypeScript errors
✅ NodeConfigPanel bundle: 9.80 kB (increased from ~5-6 kB)
✅ Total bundle: 3234.67 KiB

## Testing

1. Add "Ask Question" node to canvas
2. Right-click → "Configure Node"
3. Fill in title/description
4. Click "Add Metric"
5. Fill in metric fields
6. Test different types (number, select, text, date)
7. Add validation (min/max, options)
8. Save and verify metrics stored in node.data
9. Check that metrics persist when reopening config panel

