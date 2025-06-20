# Interactive Chart Editing System

## Overview

The Mustache Cashstage dashboard now features a comprehensive Looker Studio-style interactive chart editing system. This system allows users to click on any chart/widget to open a sophisticated editing panel with real-time configuration capabilities.

## Key Features

### 🎯 **Chart Selection & Editing**
- **One-Click Editing**: Click any chart to open the editing panel
- **Visual Selection Indicators**: Selected charts show blue border and "Editing" badge
- **Context-Aware Interface**: Panel adapts to different chart types
- **Real-Time Preview**: Changes reflect immediately in the chart

### 📊 **Field Configuration**
- **Drag-and-Drop Interface**: Move fields between Available ↔ Selected
- **Chart Type Constraints**: Automatic validation (e.g., Pie charts: 1 dimension + 1 metric)
- **Field Type Detection**: Visual indicators for dates, strings, numbers, currency
- **Smart Field Grouping**: Dimensions (categories) and Metrics (values) clearly separated

### 🔍 **Advanced Filtering**
- **Visual Filter Builder**: Point-and-click filter creation
- **Multiple Filter Types**: 
  - Text: equals, contains, not empty
  - Numeric: greater than, less than, between, range
  - Date: date range, before/after, relative dates
  - Category: multi-select, in/not in
- **Quick Filter Suggestions**: Common patterns like "Last 30 days", "High CTR"
- **Filter Management**: Enable/disable, reorder, bulk operations

### 🎨 **Style Customization**
- **Color Palettes**: Professional, Ocean, Sunset, Nature themes
- **Legend Control**: Position (top/bottom/left/right), show/hide
- **Axis Configuration**: Custom labels, grid lines
- **Chart-Specific Options**: Values display, row numbering, alternating colors

### ⚡ **Real-Time Updates**
- **Instant Feedback**: Changes appear immediately as you configure
- **Optimistic Updates**: UI responds instantly, API calls debounced
- **Auto-Save**: Changes saved automatically after 1 second of inactivity
- **Live Preview Indicator**: Visual confirmation when editing mode is active

## Usage Guide

### Getting Started

1. **Open the Dashboard**: Navigate to your dashboard with existing widgets
2. **Click to Edit**: Click on any chart/widget to open the editing panel
3. **Configure**: Use the tabs (Data, Style, Filters) to customize your chart
4. **Auto-Save**: Changes save automatically - no manual save needed
5. **Close**: Click the X or click elsewhere to close the panel

### Data Tab

#### Field Configuration
```
Available Fields          Selected Fields
┌─────────────────┐      ┌──────────────────┐
│ 📅 Date         │  ─→  │ Dimensions       │
│ 📝 Channel      │      │ ✓ Date           │
│ 📝 Campaign     │      │ ✓ Channel        │
│ 🔢 Impressions  │      ├──────────────────┤
│ 💰 Cost         │      │ Metrics          │
│ 💰 Revenue      │      │ ✓ Cost           │
└─────────────────┘      │ ✓ Revenue        │
                         └──────────────────┘
```

#### Chart Type Constraints
- **Pie/Donut Charts**: Max 1 dimension + 1 metric
- **Metric Cards**: Max 1 metric (no dimensions)
- **Scatter Plots**: 1 dimension + exactly 2 metrics
- **Line/Bar Charts**: Unlimited dimensions and metrics
- **Tables**: All fields available

### Filters Tab

#### Filter Builder Interface
```
┌─────────────────────────────────────────┐
│ ☑ Filter 1                        🗑️   │
│                                         │
│ Field:     [Channel           ▼]        │
│ Condition: [Equals            ▼]        │
│ Value:     [Google Ads            ]     │
└─────────────────────────────────────────┘
```

#### Quick Filters
- **Hide empty channels**: `channel` is not null
- **Last 30 days**: `date` > 30 days ago
- **High performing**: `CTR` > 2%
- **Significant spend**: `cost` > $100

### Style Tab

#### Available Customizations
- **Color Palettes**: 6 pre-designed themes
- **Legend**: Position and visibility
- **Grid Lines**: Show/hide chart grid
- **Axis Labels**: Custom X and Y axis titles
- **Chart Options**: Type-specific settings

## Technical Implementation

### Architecture

```
User Click → UI Store → Chart Editing Panel
     ↓              ↓            ↓
Widget Selection → Temp Config → Real-time Update
     ↓              ↓            ↓
Chart Wrapper → Live Preview → Auto-save API
```

### Component Structure

```
apps/web/src/components/dashboard/
├── chart-editing-panel.tsx          # Main editing interface
├── field-configuration-section.tsx  # Drag-drop field picker
├── filter-section.tsx               # Filter builder
├── style-section.tsx                # Style customization
└── widget-card.tsx                  # Click-to-edit handler

apps/web/src/stores/
└── ui-store.ts                      # Editing state management

apps/web/src/components/charts/
└── chart-wrapper.tsx                # Real-time preview logic
```

### State Management

#### UI Store Extensions
```typescript
interface UIState {
  selectedWidgetId: string | null
  editingPanelOpen: boolean
  editingMode: 'data' | 'style' | 'filters'
  tempWidgetConfig: ChartEditingConfig | null
  pendingChanges: boolean
}
```

#### Configuration Structure
```typescript
interface ChartEditingConfig {
  dimensions: string[]
  metrics: string[]
  filters: FilterConfig[]
  sorting: SortConfig[]
  style: StyleConfig
  chartType: string
}
```

### Real-Time Preview System

#### Data Flow
1. **User Changes Config** → `setTempWidgetConfig()`
2. **Chart Wrapper Detects** → `tempWidgetConfig` changes
3. **Apply Temp Config** → Merge with existing config
4. **Regenerate Data** → If dimensions/metrics/filters changed
5. **Re-render Chart** → With new config and data
6. **Debounced Save** → API call after 1s delay

#### Preview Indicators
- **Blue border** around edited chart
- **"Live Preview"** badge in top-right
- **"Editing"** indicator on widget card
- **Ring effect** on chart container

## Field Types & Validation

### Supported Field Types

| Type | Icon | Examples | Operations |
|------|------|----------|------------|
| `date` | 📅 | Date, Created At | equals, after, before, range |
| `string` | 📝 | Channel, Campaign | equals, contains, in, not empty |
| `number` | 🔢 | Impressions, Clicks | equals, >, <, between |
| `currency` | 💰 | Cost, Revenue | equals, >, <, between |
| `percentage` | 📊 | CTR, Conversion Rate | equals, >, <, between |

### Chart Type Validation

The system automatically validates field combinations:

```typescript
// Example: Pie Chart Validation
if (chartType === 'pie_chart') {
  if (dimensions.length > 1) {
    // Show error: "Pie charts support only 1 dimension"
  }
  if (metrics.length > 1) {
    // Show error: "Pie charts support only 1 metric"
  }
}
```

## Demo Data Integration

### Available Demo Fields

**Dimensions:**
- `date` - Daily data for last 90 days
- `channel` - Google Ads, Facebook, LinkedIn, etc.
- `campaign` - Q4 Brand Awareness, Summer Sale, etc.

**Metrics:**
- `impressions` - Ad impression counts
- `clicks` - Click-through counts  
- `cost` - Advertising spend ($)
- `conversions` - Conversion events
- `revenue` - Revenue generated ($)
- `ctr` - Click-through rate (%)

### Filter Examples

```javascript
// Last 30 days of high-performing Google Ads
{
  filters: [
    { field: 'date', operator: 'greater_than', value: '30 days ago' },
    { field: 'channel', operator: 'equals', value: 'Google Ads' },
    { field: 'ctr', operator: 'greater_than', value: 2.0 }
  ]
}
```

## Development Guide

### Adding New Chart Types

1. **Define Constraints** in `field-configuration-section.tsx`:
```typescript
case 'new_chart_type':
  return { maxDimensions: 2, maxMetrics: 3 }
```

2. **Add Style Options** in `style-section.tsx`:
```typescript
case 'new_chart_type':
  return <NewChartSpecificSettings />
```

3. **Handle Demo Data** in `demo-data-service.ts`:
```typescript
case 'new_chart_type':
  processedData = this.processForNewChart(data, config)
```

### Adding New Filter Types

1. **Extend FilterConfig** in `ui-store.ts`:
```typescript
operator: 'equals' | 'contains' | 'new_operator'
```

2. **Add UI Support** in `filter-section.tsx`:
```typescript
case 'string':
  return [
    { value: 'new_operator', label: 'New Operation' }
  ]
```

3. **Implement Logic** in `demo-data-service.ts`:
```typescript
if (filter.operator === 'new_operator') {
  // Custom filtering logic
}
```

## Troubleshooting

### Common Issues

**Panel won't open**
- Check that widget has valid `id`
- Verify UI store state with React DevTools
- Check console for JavaScript errors

**Changes not saving**
- Verify API endpoints are working
- Check network tab for failed requests
- Ensure proper authentication

**Demo data not updating**
- Clear browser cache
- Check DemoDataService configuration
- Verify field mappings are correct

**Drag-and-drop not working**
- Ensure @dnd-kit dependencies are installed
- Check for CSS conflicts with drag handles
- Verify DndContext is properly configured

### Debug Tools

**React DevTools**: Inspect UI store state
```javascript
// In browser console
window.__ZUSTAND_STORE__ // Access store state
```

**TanStack Query DevTools**: Monitor data fetching
- Available at bottom-right of screen in development
- Shows cache status and query states

**Browser Console**: Error logging
```javascript
// Enable verbose logging
localStorage.setItem('debug', 'mustache:*')
```

## Future Enhancements

### Planned Features
- **Undo/Redo**: Action history with keyboard shortcuts
- **Keyboard Shortcuts**: Power-user efficiency
- **Widget Templates**: Pre-configured chart templates
- **Collaborative Editing**: Multi-user editing with conflict resolution
- **Custom Themes**: User-defined color palettes
- **Export Options**: PDF/PNG export directly from editor

### Integration Opportunities
- **Data Source Editor**: In-panel data source configuration
- **Calculated Fields**: Custom metric creation
- **Advanced Analytics**: Trend analysis, forecasting
- **Dashboard Comments**: Collaborative annotations
- **Version History**: Track and revert changes

---

**Last Updated**: 2024-01-21  
**Version**: v1.0.0  
**Maintainer**: Mustache Cashstage Development Team