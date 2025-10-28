# Broiler Workflow Templates - Complete Implementation

## Overview
Implemented a complete workflow template system for broiler farming that allows users to:
1. Select broiler-specific quick templates
2. Auto-generate workflow nodes and connections
3. Configure nodes with broiler-specific data

## Components Created

### 1. QuickTemplatesPanel Component
**Location**: `src/components/workflow/QuickTemplatesPanel.tsx`

**Features**:
- Display three broiler-specific templates:
  - **Budidaya Broiler - End to End**: Complete workflow from farm registration to harvest
  - **Broiler Daily Check-in**: Quick template for daily data entry
  - **Broiler Harvest Processing**: Template for harvest data processing
- Visual cards with complexity badges (simple/medium/complex)
- Category tags and node count display
- Integrated in modal overlay

**Templates Available**:
1. **End to End** (12 nodes, complex):
   - Farm registration with metrics
   - QR code generation
   - WhatsApp notifications
   - Daily check-in system
   - Performance monitoring
   - Harvest processing
   - Alert system

2. **Daily Check-in** (6 nodes, simple):
   - Daily data input
   - Performance calculations
   - Mortality alert system
   - WhatsApp confirmations

3. **Harvest Processing** (8 nodes, medium):
   - Harvest data input
   - Performance calculations
   - PDF report generation
   - Distribution via WhatsApp

### 2. Broiler Workflow Generator Hook
**Location**: `src/hooks/useBroilerWorkflowGenerator.ts`

**Functionality**:
- Generates pre-configured nodes for broiler workflows
- Creates appropriate edges/connections between nodes
- Handles template-specific node generation
- Returns properly formatted nodes and edges for the workflow canvas

**Generated Nodes Include (user-centric messaging)**:
- **Farm Registration**: Input node with metrics for farm data
- **QR Code Generator**: Process node (silent) for QR code generation
- **WhatsApp Messages**: Output nodes for notifications (use `data.templateId`)
- **Daily Check-in**: Input node with daily metrics
- **Performance Calculator**: Process node for FCR/ADG calculations
- **Condition Nodes**: Logic nodes for mortality threshold checking
- **Alert System**: WhatsApp alerts for critical conditions
- **Harvest Processing**: Input and calculation nodes for harvest data

### 3. Integration with Workflow Studio (Interactive)
**Location**: `src/components/sections/workflow-studio.tsx`

**New Features Added**:
- "Broiler Templates" button in the workflow description header
- Modal overlay for template selection
- Handlers for template selection and workflow generation
- Auto-populate description field with template prompt
- Batch workflow application to canvas
- WhatsApp Simulation is now driven by an FSM compiled from the canvas graph; chat hanya menampilkan output yang relevan bagi user (processing steps diam secara default). Gunakan `data.debug=true` pada node process bila ingin log debug tampil di chat.

**User Flow**:
1. User clicks "Broiler Templates" button
2. Modal opens with available templates
3. User selects a template (auto-fills description)
4. User clicks "Generate Workflow"
5. Nodes and edges are generated and applied to canvas
6. User can configure individual nodes via NodeConfigPanel

## Technical Implementation

### State Management
Added new state variables:
```typescript
const [showBroilerTemplates, setShowBroilerTemplates] = useState(false);
const [selectedBroilerTemplate, setSelectedBroilerTemplate] = useState<QuickTemplate | null>(null);
```

### New Hooks
- `useBroilerWorkflowGenerator()`: Generates broiler-specific workflows
- `useNodesRecord()`: Returns nodes as Record<string, Node> for components expecting records

### Handlers
1. `handleBroilerTemplateSelect()`: Updates description and shows toast
2. `handleBroilerWorkflowGenerate()`: Generates and applies workflow to canvas
3. FSM integration: compile nodes/edges to FSM on change and run in WhatsAppSimulationPanel

### UI Components
- Toggle button for showing/hiding broiler templates panel
- Modal overlay for template selection
- Integrated with existing NodeConfigPanel for node configuration

## Node Configuration Enhancement

The NodeConfigPanel (already enhanced) now supports:
- Broiler-specific templates for WhatsApp messages via `data.templateId` that maps to `src/lib/templates/whatsappTemplates.ts`
- Metric presets for daily check-in and farm registration
- Calculator templates for performance calculations
- Indonesian language labels and placeholders
- Broiler-specific validation ranges

## Usage Example

### For Users:
1. Open Workflow Studio
2. Click "Broiler Templates" button
3. Select "Broiler Daily Check-in" template
4. Click "Generate Workflow"
5. Workflow appears on canvas with:
   - Farm registration node
   - QR code generator
   - WhatsApp confirmation
   - Daily check-in input
   - Performance calculator
   - Mortality condition check
   - Alert and confirmation nodes
6. Click on any node to configure it using broiler-specific templates and presets
7. Configure nodes with pre-filled metrics and calculations. For chat simulation:
   - Ensure input nodes have `data.prompt`
   - Label decision edges with options (e.g., `ya`, `batal`, `1`, `2`)
   - Set `data.templateId` on output nodes to render WhatsApp message templates
8. Save and deploy workflow

## Benefits

1. **Faster Workflow Creation**: Users can generate complete workflows with a single click
2. **Broiler-Specific**: All templates and configurations are tailored for broiler farming
3. **Best Practices Built-in**: Templates include industry-standard metrics and calculations
4. **Localization**: Interface and labels in Bahasa Indonesia
5. **Extensible**: Easy to add more templates for other agricultural sectors
6. **Context-Aware**: Node configuration panel provides broiler-specific guidance

## Files Modified/Created

### Created:
- `src/components/workflow/QuickTemplatesPanel.tsx`
- `src/hooks/useBroilerWorkflowGenerator.ts`
- `BROILER_WORKFLOW_TEMPLATES_COMPLETE.md`

### Modified:
- `src/components/sections/workflow-studio.tsx`
- `src/hooks/useWorkflowState.ts`
- `src/components/workflow/NodeConfigPanel.tsx` (from previous enhancement)

## Next Steps (Optional Enhancements)

1. Add more agricultural workflow templates (paddy, corn, etc.)
2. Add export functionality for generated workflows
3. Add template versioning system
4. Allow users to save custom templates
5. Add workflow validation specific to broiler operations
6. Integrate with deployment system for direct WhatsApp deployment

## Testing Checklist

- [x] Template selection works correctly
- [x] Description field is populated
- [x] Workflow generation produces correct nodes and edges
- [x] Nodes can be configured using NodeConfigPanel
- [x] No TypeScript/linter errors
- [ ] Test all three template types
- [ ] Verify workflow execution
- [ ] Test node configuration with broiler presets
- [ ] Verify WhatsApp message templates
- [ ] Test with real farm data

