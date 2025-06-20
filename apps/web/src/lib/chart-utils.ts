/**
 * Chart utility functions for consistent chart configuration and data processing
 */

export interface ChartColor {
  primary: string
  secondary: string
  accent: string
}

export const CHART_COLORS = {
  primary: '#2563eb',
  secondary: '#10b981',
  accent: '#f59e0b',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  info: '#3b82f6',
  gray: '#6b7280'
}

export const CHART_PALETTE = [
  '#2563eb', // blue-600
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
  '#64748b'  // slate-500
]

/**
 * Get a color from the palette by index
 */
export function getChartColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length]
}

/**
 * Generate CSS custom properties for chart colors
 */
export function generateChartColorVars(): Record<string, string> {
  const vars: Record<string, string> = {}
  
  CHART_PALETTE.forEach((color, index) => {
    vars[`--color-chart-${index + 1}`] = color
  })
  
  return vars
}

/**
 * Format numbers for chart display
 */
export function formatChartValue(value: number, type?: 'currency' | 'percentage' | 'number'): string {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value)
    
    case 'percentage':
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(value / 100)
    
    default:
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value)
  }
}

/**
 * Get responsive chart dimensions
 */
export function getResponsiveChartHeight(containerHeight?: number): number {
  if (!containerHeight) return 300
  
  // Ensure minimum height while allowing flexibility
  return Math.max(200, Math.min(600, containerHeight - 40))
}

/**
 * Common chart tooltip styling
 */
export const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  fontSize: '12px',
  padding: '8px 12px'
}

/**
 * Common chart grid styling
 */
export const CHART_GRID_STYLE = {
  strokeDasharray: '3 3',
  stroke: '#f3f4f6',
  strokeWidth: 1
}

/**
 * Prepare data for different chart types
 */
export function prepareChartData(
  data: any[], 
  dimension: string, 
  metrics: string[], 
  chartType: string
): any[] {
  if (!data || data.length === 0) return []
  
  switch (chartType) {
    case 'pie_chart':
    case 'donut_chart':
      // For pie charts, aggregate by dimension and use first metric
      return aggregateDataByDimension(data, dimension, metrics[0])
    
    case 'scatter_chart':
      // For scatter plots, ensure we have x and y values
      return data.map(item => ({
        ...item,
        x: item[metrics[0]] || 0,
        y: item[metrics[1]] || 0
      }))
    
    default:
      return data
  }
}

/**
 * Aggregate data by dimension for pie charts
 */
function aggregateDataByDimension(data: any[], dimension: string, metric: string): any[] {
  const aggregated = data.reduce((acc, item) => {
    const key = item[dimension]
    if (!acc[key]) {
      acc[key] = { [dimension]: key, [metric]: 0 }
    }
    acc[key][metric] += item[metric] || 0
    return acc
  }, {})
  
  return Object.values(aggregated)
}

/**
 * Get chart configuration defaults by type
 */
export function getChartDefaults(chartType: string): any {
  const baseConfig = {
    showGrid: true,
    showLegend: true,
    showTooltip: true,
    colors: CHART_PALETTE
  }
  
  switch (chartType) {
    case 'line_chart':
      return {
        ...baseConfig,
        strokeWidth: 2,
        dotSize: 4,
        activeDotSize: 6
      }
    
    case 'bar_chart':
      return {
        ...baseConfig,
        layout: 'vertical',
        barRadius: [2, 2, 0, 0]
      }
    
    case 'pie_chart':
    case 'donut_chart':
      return {
        ...baseConfig,
        showGrid: false,
        innerRadius: chartType === 'donut_chart' ? 60 : 0,
        outerRadius: 100
      }
    
    default:
      return baseConfig
  }
}