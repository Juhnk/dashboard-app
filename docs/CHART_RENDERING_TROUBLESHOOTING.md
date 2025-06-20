# Chart Rendering Troubleshooting Guide

This document provides comprehensive troubleshooting information for chart rendering issues in the dashboard application.

## Overview

The chart rendering system consists of several key components:
- **ChartWrapper**: Manages chart configuration and data flow
- **Individual Chart Components**: (LineChart, BarChart, etc.) Handle specific chart rendering
- **DemoDataService**: Provides demo data and configuration processing
- **UI Store**: Manages widget selection and temporary configurations

## Data Flow Architecture

```
Widget Selection → ChartWrapper → DemoDataService → Chart Component → Recharts
     ↓              ↓              ↓                ↓
UI Store → Temp Config → Processed Data → Props → Visual Output
```

### 1. Widget Selection Flow
1. User selects a widget (WidgetCard)
2. UI Store updates `selectedWidgetId` and `tempWidgetConfig`
3. ChartWrapper detects editing mode and merges configurations
4. Effective config is passed to chart components

### 2. Data Processing Flow
1. ChartWrapper determines if widget is being edited
2. If editing: merges original config with temp config
3. DemoDataService processes data based on chart type
4. Chart component validates data and renders visualization

## Common Issues and Solutions

### Issue 1: Blank Chart Rendering

**Symptoms**: Chart container shows but no visual elements (lines, bars, etc.)

**Root Causes**:
- Data format mismatch between expected and actual structure
- Missing or invalid `dataKey` configuration
- Empty or undefined data array
- Configuration property misalignment

**Debugging Steps**:
1. Check browser console for debug logs (development mode only)
2. Verify data structure in ChartWrapper debug output
3. Confirm valid metrics exist in LineChart debug output
4. Check DemoDataService debug for data processing

**Solutions**:
- Ensure data contains fields matching chart metrics
- Verify dimension field exists in data (e.g., 'date', 'channel')
- Check that metric fields are properly named and contain numbers

### Issue 2: Configuration Not Updating in Edit Mode

**Symptoms**: Chart doesn't reflect changes made in editing panel

**Root Causes**:
- Temp configuration not properly merged
- Missing reactive dependencies in useMemo
- Invalid configuration structure

**Debugging Steps**:
1. Verify `tempWidgetConfig` in UI Store
2. Check `effectiveConfig` in ChartWrapper debug
3. Confirm `isBeingEdited` flag is true

**Solutions**:
- Ensure editing panel updates `tempWidgetConfig` correctly
- Verify configuration keys match expected format
- Check that dimensions and metrics arrays are properly formed

### Issue 3: Error Boundaries and Fallbacks

**Symptoms**: Chart shows error state or falls back to demo data

**Root Causes**:
- Invalid data structure causing render errors
- Missing required configuration properties
- Network errors in data fetching

**Debugging Steps**:
1. Check error messages in console
2. Verify data source connection
3. Review configuration validation

**Solutions**:
- Implement proper error boundaries
- Add configuration validation
- Provide meaningful fallback states

## Debug Information

### Development Mode Logging

The system provides extensive debug logging in development mode:

```javascript
// ChartWrapper Debug Output
ChartWrapper Debug (LineChart): {
  type: "line_chart",
  isBeingEdited: true,
  dataLength: 30,
  originalConfig: {...},
  effectiveConfig: {...},
  widgetId: "widget-123"
}

// LineChart Debug Output
LineChart Debug: {
  chartDataLength: 30,
  dataKeys: ["date", "impressions", "clicks"],
  requestedMetrics: ["impressions", "clicks"],
  validMetrics: ["impressions", "clicks"],
  requestedDimension: "date",
  validDimension: "date",
  config: {...}
}

// DemoDataService Debug Output
DemoDataService Debug (LineChart): {
  chartType: "line_chart",
  originalDataLength: 540,
  processedDataLength: 30,
  requestedDimension: "date",
  requestedMetrics: ["impressions", "clicks"],
  chartConfig: {...},
  sampleData: [...]
}
```

### Key Debug Points

1. **Data Length**: Should be > 0
2. **Valid Metrics**: Should match data fields
3. **Valid Dimension**: Should exist in data
4. **Configuration Merge**: Should combine temp and original configs

## Configuration Structure

### Expected Chart Configuration

```typescript
interface ChartConfig {
  // Core configuration
  dimension: string          // x-axis field (e.g., 'date', 'channel')
  metrics: string[]         // y-axis fields (e.g., ['impressions', 'clicks'])
  
  // Chart-specific
  xAxisKey: string         // same as dimension
  yAxisKey: string         // primary metric
  lines?: LineConfig[]     // for line charts
  
  // Style options
  showGrid?: boolean
  showLegend?: boolean
  showTooltip?: boolean
}
```

### Expected Data Structure

```typescript
interface ChartData {
  [dimension: string]: string | number  // dimension field
  [metric: string]: number              // metric fields
}

// Example:
[
  { date: '2024-01-01', impressions: 1500, clicks: 45 },
  { date: '2024-01-02', impressions: 1800, clicks: 52 },
  // ...
]
```

## Performance Considerations

### Memory Management
- Chart components use `useMemo` for expensive computations
- Data processing is cached when configuration doesn't change
- Demo data is generated once and reused

### Rendering Optimization
- ResponsiveContainer handles resize events efficiently
- Chart re-renders only when data or config changes
- Error states prevent expensive chart rendering attempts

## Testing Chart Rendering

### Manual Testing Checklist
1. Create new line chart widget
2. Verify demo data renders correctly
3. Enter edit mode and change metrics
4. Confirm live preview updates
5. Test with different data configurations
6. Verify error states display properly

### Automated Testing Considerations
- Mock DemoDataService for consistent test data
- Test configuration merging logic separately
- Verify error boundary behavior
- Test responsive container interactions

## Recent Fixes Applied

### Configuration Mapping Fix
- Fixed inconsistent property mapping in ChartWrapper
- Added fallbacks for missing configuration properties
- Improved temp config merging logic

### Data Validation Enhancement
- Added runtime validation of data structure
- Implemented intelligent metric filtering
- Enhanced dimension field detection

### Error Handling Improvements
- Added comprehensive error states
- Implemented graceful fallbacks
- Enhanced debug logging for development

## Troubleshooting Commands

```bash
# Check for console errors
# Open browser dev tools → Console tab

# Verify build integrity
npm run build

# Run type checking
npm run typecheck

# Clear cache and restart
rm -rf .next
npm run dev
```

## Getting Help

If you encounter issues not covered by this guide:

1. Check browser console for debug output
2. Verify data structure matches expected format
3. Review configuration object in ChartWrapper debug
4. Test with simplified demo data first
5. File an issue with debug output and steps to reproduce

---

*Last updated: 2024-06-20*
*Related components: ChartWrapper, LineChart, DemoDataService, UIStore*