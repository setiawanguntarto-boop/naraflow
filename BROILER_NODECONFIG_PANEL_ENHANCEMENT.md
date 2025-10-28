# NodeConfigPanel Enhancement for Broiler Workflow

## Overview
Enhanced the `NodeConfigPanel` component to support broiler farming workflow with specialized templates, presets, and configuration options.

## Key Improvements

### 1. **Broiler-Specific Templates**

#### WhatsApp Message Templates
- **Daily Check-in Reminder**: Template for requesting daily data entry from farmers
- **Mortality Alert**: Template for alerting when mortality rate is high
- **Harvest Notification**: Template for notifying when harvest is ready

#### Metric Presets for "Ask Question" Node
- **Daily Check-in Metrics**: 
  - Mortality (jumlah mati)
  - Feed (pakan dalam kg)
  - Average weight (berat rata-rata)
  - Temperature (suhu kandang)
- **Farm Registration Metrics**:
  - Farm name (nama farm)
  - Owner name (nama peternak)
  - Location (lokasi)
  - Capacity (kapasitas kandang)

#### Calculator Templates for "Process Data" Node
- **Performance Calculator**: Calculates FCR, ADG, and mortality percentage
- **Harvest Calculator**: Calculates cycle FCR and ADG for harvest data

### 2. **Enhanced User Interface**

#### Context-Aware Hints
Added specialized hints for broiler workflow nodes:
- WhatsApp Trigger/Message
- Ask Question (data entry)
- Process Data (calculations)
- Condition (alerts and logic)
- Notification (multi-recipient)
- Report generation
- Data Storage
- QR Generator

#### Node Category Badges
Display badges showing node categories:
- **communication**: WhatsApp, Notifications
- **input**: Ask Question, Ask Input
- **processing**: Process Data
- **logic**: Condition, Loop, Switch
- **output**: Report (PDF)
- **storage**: Data Storage
- **utility**: QR Generator

### 3. **Advanced Configuration Options**

#### WhatsApp Configuration
- **Recipient Type**: Select recipient (Peternak, PPL, Admin, or both)
- **Message Type**: Select message category (Reminder, Alert, Confirmation, Report)

#### Enhanced Field Configuration
- **Data Types**: Added `boolean` type for Yes/No fields
- **Better Labels**: "Field ID" (with monospace font) and "Display Label"
- **Improved Placeholders**: Broiler-specific examples in Indonesian
- **Field Instructions**: Better description field for guidance

### 4. **Smart Preset System**
- **One-Click Apply**: Users can quickly apply metric presets for common broiler workflows
- **Template Messages**: Pre-formatted messages with placeholders
- **Code Templates**: Pre-written calculation logic for common metrics

### 5. **Improved UX for Data Entry**
- Field labels in Bahasa Indonesia
- Validation ranges suitable for broiler data (mortality 0-1000, feed 0-5000kg, etc.)
- Placeholder texts relevant to broiler farming context
- Code editor styling for Process Data nodes (monospace font, better spacing)

## Technical Changes

### New Imports
```typescript
import { Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
```

### New Interfaces
- Added `config` parameter to `onSave` function for node-specific configuration
- Added `category` to return type of `getNodeTypeInfo`
- Added `boolean` type to `MetricDefinition`

### New Functions
- `applyMetricPreset()`: Applies broiler-specific metric presets
- `applyWhatsAppTemplate()`: Applies pre-formatted WhatsApp messages
- `applyCalculatorTemplate()`: Applies calculation code templates

### Enhanced State Management
- Added `nodeConfig` state for node-specific configuration
- Added `selectedPreset` state to track selected preset
- Updated change detection to include `nodeConfig`

## Usage Examples

### For WhatsApp Message Node
1. Click on a WhatsApp Message node
2. Select a template from "Broiler Quick Templates" section
3. Configure recipient (Peternak, PPL, or Admin)
4. Select message type (Reminder, Alert, etc.)
5. Customize message content if needed

### For Ask Question Node
1. Click on an Ask Question node
2. Select a metric preset from "Broiler Quick Templates" dropdown
   - Daily Check-in Metrics (for daily data collection)
   - Farm Registration (for farm setup)
3. Customize fields as needed
4. Add more fields manually if required

### For Process Data Node
1. Click on a Process Data node
2. Select a calculator template from "Broiler Quick Templates"
   - Performance Calculator (for FCR, ADG calculations)
   - Harvest Calculator (for harvest metrics)
3. Customize the JavaScript code as needed
4. Save to apply the calculation logic

## Benefits
1. **Faster Configuration**: Pre-built templates reduce setup time
2. **Consistency**: Standardized data fields and calculations
3. **Better Guidance**: Context-specific hints and labels
4. **Localization**: Interface in Bahasa Indonesia for Indonesian users
5. **Validation**: Appropriate ranges for broiler-specific data
6. **Visual Feedback**: Category badges help identify node types

## Files Modified
- `src/components/workflow/NodeConfigPanel.tsx`

## Testing Recommendations
1. Test WhatsApp template application
2. Test metric preset application
3. Test calculator template application
4. Verify configuration saving
5. Test field validation
6. Verify UI responsiveness on different screen sizes

