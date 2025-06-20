/**
 * Demo Data Service
 * Provides intelligent demo data for different chart types and configurations
 */

import { DEMO_DATA, DEMO_DATA_AGGREGATED, DEMO_CHART_CONFIGS, DemoDataPoint } from './demo-data'

export interface DemoDataConfig {
  chartType: string
  dimension?: string
  metrics?: string[]
  filters?: Record<string, any>
  limit?: number
  dateRange?: {
    start: string
    end: string
  }
}

export interface ProcessedDemoData {
  data: any[]
  config: {
    dimension?: string
    metrics?: string[]
    xAxisKey?: string
    yAxisKey?: string
    dataKey?: string
    nameKey?: string
    [key: string]: any
  }
  metadata: {
    totalRows: number
    dateRange: {
      start: string
      end: string
    }
    availableMetrics: string[]
    availableDimensions: string[]
  }
}

export class DemoDataService {
  private static readonly AVAILABLE_METRICS = [
    'impressions',
    'clicks', 
    'cost',
    'conversions',
    'revenue',
    'ctr'
  ]

  private static readonly AVAILABLE_DIMENSIONS = [
    'date',
    'channel',
    'campaign'
  ]

  private static readonly METRIC_DISPLAY_NAMES: Record<string, string> = {
    impressions: 'Impressions',
    clicks: 'Clicks',
    cost: 'Cost',
    conversions: 'Conversions',
    revenue: 'Revenue',
    ctr: 'CTR (%)'
  }

  private static readonly DIMENSION_DISPLAY_NAMES: Record<string, string> = {
    date: 'Date',
    channel: 'Channel',
    campaign: 'Campaign'
  }

  /**
   * Get demo data configured for a specific chart type
   */
  static getDemoDataForChart(config: DemoDataConfig): ProcessedDemoData {
    const { chartType, dimension, metrics, filters, limit, dateRange } = config

    // Start with base demo data
    let data = [...DEMO_DATA]

    // Apply date range filter if specified
    if (dateRange) {
      data = data.filter(item => 
        item.date >= dateRange.start && item.date <= dateRange.end
      )
    }

    // Apply additional filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && Array.isArray(value)) {
          data = data.filter(item => value.includes(item[key as keyof DemoDataPoint]))
        } else if (value) {
          data = data.filter(item => item[key as keyof DemoDataPoint] === value)
        }
      })
    }

    // Process data based on chart type
    let processedData: any[]
    let chartConfig: any = {}

    switch (chartType) {
      case 'line_chart':
      case 'area_chart':
        const lineMetrics = metrics || ['impressions', 'clicks']
        const lineDimension = dimension || 'date'
        processedData = this.aggregateByDimension(data, lineDimension, lineMetrics)
        
        // Ensure we have valid data for line charts
        if (processedData.length === 0) {
          // Fallback to demo data if no processed data available
          processedData = DEMO_DATA_AGGREGATED.dailyTotals.slice(0, 30) // Last 30 days
        }
        
        chartConfig = {
          dimension: lineDimension,
          metrics: lineMetrics,
          xAxisKey: lineDimension,
          // Ensure lines configuration is present for LineChart component
          lines: lineMetrics.map((metric: string, index: number) => ({
            key: metric,
            name: metric.charAt(0).toUpperCase() + metric.slice(1),
            color: `var(--color-chart-${(index % 12) + 1})`
          }))
        }
        break

      case 'bar_chart':
        processedData = this.aggregateByDimension(data, dimension || 'channel', metrics || ['cost', 'revenue'])
        chartConfig = {
          dimension: dimension || 'channel',
          metrics: metrics || ['cost', 'revenue'],
          xAxisKey: dimension || 'channel',
          layout: 'vertical'
        }
        break

      case 'pie_chart':
      case 'donut_chart':
        processedData = this.aggregateByDimension(data, dimension || 'campaign', metrics || ['conversions'])
        chartConfig = {
          dimension: dimension || 'campaign',
          metrics: metrics || ['conversions'],
          dataKey: metrics?.[0] || 'conversions',
          nameKey: dimension || 'campaign'
        }
        break

      case 'scatter_chart':
        processedData = this.aggregateByDimension(data, dimension || 'date', metrics || ['cost', 'revenue'])
        chartConfig = {
          dimension: dimension || 'date',
          metrics: metrics || ['cost', 'revenue'],
          xAxisKey: metrics?.[0] || 'cost',
          yAxisKey: metrics?.[1] || 'revenue'
        }
        break

      case 'table':
        processedData = data.slice(0, limit || 50)
        chartConfig = {
          columns: this.AVAILABLE_METRICS.concat(this.AVAILABLE_DIMENSIONS)
        }
        break

      case 'metric_card':
        const metric = metrics?.[0] || 'revenue'
        const totalValue = data.reduce((sum, item) => sum + (item[metric as keyof DemoDataPoint] as number || 0), 0)
        processedData = [{
          [metric]: totalValue,
          label: this.METRIC_DISPLAY_NAMES[metric] || metric
        }]
        chartConfig = {
          metric: metric,
          dataKey: metric
        }
        break

      case 'funnel_chart':
        processedData = this.createFunnelData(data)
        chartConfig = {
          stages: ['Impressions', 'Clicks', 'Conversions']
        }
        break

      case 'gauge_chart':
        const gaugeMetric = metrics?.[0] || 'ctr'
        const avgValue = data.reduce((sum, item) => sum + (item[gaugeMetric as keyof DemoDataPoint] as number || 0), 0) / data.length
        processedData = [{
          value: Math.round(avgValue * 100) / 100,
          max: gaugeMetric === 'ctr' ? 10 : 100
        }]
        chartConfig = {
          metric: gaugeMetric,
          dataKey: 'value'
        }
        break

      case 'heatmap':
        processedData = this.createHeatmapData(data)
        chartConfig = {
          xAxisKey: 'day',
          yAxisKey: 'hour',
          valueKey: 'value'
        }
        break

      default:
        processedData = this.aggregateByDimension(data, dimension || 'date', metrics || ['impressions'])
        chartConfig = {
          dimension: dimension || 'date',
          metrics: metrics || ['impressions']
        }
    }

    // Apply limit if specified
    if (limit && processedData.length > limit) {
      processedData = processedData.slice(0, limit)
    }

    // Debug logging for development
    if (process.env.NODE_ENV === 'development' && chartType === 'line_chart') {
      console.log('DemoDataService Debug (LineChart):', {
        chartType,
        originalDataLength: data.length,
        processedDataLength: processedData.length,
        requestedDimension: dimension,
        requestedMetrics: metrics,
        chartConfig,
        sampleData: processedData.slice(0, 3)
      })
    }

    return {
      data: processedData,
      config: chartConfig,
      metadata: {
        totalRows: data.length,
        dateRange: {
          start: data.length > 0 ? data[0].date : '',
          end: data.length > 0 ? data[data.length - 1].date : ''
        },
        availableMetrics: this.AVAILABLE_METRICS,
        availableDimensions: this.AVAILABLE_DIMENSIONS
      }
    }
  }

  /**
   * Aggregate data by a specific dimension
   */
  private static aggregateByDimension(data: DemoDataPoint[], dimension: string, metrics: string[]): any[] {
    const aggregated = new Map<string, any>()

    data.forEach(item => {
      const key = item[dimension as keyof DemoDataPoint] as string
      
      if (!aggregated.has(key)) {
        aggregated.set(key, {
          [dimension]: key,
          ...Object.fromEntries(metrics.map(m => [m, 0]))
        })
      }

      const existing = aggregated.get(key)!
      metrics.forEach(metric => {
        existing[metric] += (item[metric as keyof DemoDataPoint] as number) || 0
      })
    })

    return Array.from(aggregated.values()).sort((a, b) => {
      if (dimension === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }
      return a[dimension] > b[dimension] ? 1 : -1
    })
  }

  /**
   * Create funnel data from marketing metrics
   */
  private static createFunnelData(data: DemoDataPoint[]): any[] {
    const totals = data.reduce((acc, item) => ({
      impressions: acc.impressions + item.impressions,
      clicks: acc.clicks + item.clicks,
      conversions: acc.conversions + item.conversions
    }), { impressions: 0, clicks: 0, conversions: 0 })

    return [
      { name: 'Impressions', value: totals.impressions, percentage: 100 },
      { name: 'Clicks', value: totals.clicks, percentage: Math.round((totals.clicks / totals.impressions) * 100) },
      { name: 'Conversions', value: totals.conversions, percentage: Math.round((totals.conversions / totals.impressions) * 100) }
    ]
  }

  /**
   * Create heatmap data showing performance by day of week and hour
   */
  private static createHeatmapData(data: DemoDataPoint[]): any[] {
    const heatmapData: any[] = []
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    // Generate sample heatmap data (24 hours x 7 days)
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const baseValue = data.length > 0 ? data[0].impressions : 1000
        const randomMultiplier = 0.5 + Math.random() * 1.5
        const dayMultiplier = [0, 6].includes(day) ? 0.6 : 1.0 // Weekend reduction
        const hourMultiplier = hour >= 9 && hour <= 17 ? 1.2 : 0.8 // Business hours boost
        
        heatmapData.push({
          day: daysOfWeek[day],
          hour: hour,
          value: Math.round(baseValue * randomMultiplier * dayMultiplier * hourMultiplier / 100)
        })
      }
    }

    return heatmapData
  }

  /**
   * Get available metrics for the demo dataset
   */
  static getAvailableMetrics(): Array<{ key: string; name: string; type: string }> {
    return this.AVAILABLE_METRICS.map(metric => ({
      key: metric,
      name: this.METRIC_DISPLAY_NAMES[metric] || metric,
      type: 'number'
    }))
  }

  /**
   * Get available dimensions for the demo dataset
   */
  static getAvailableDimensions(): Array<{ key: string; name: string; type: string }> {
    return this.AVAILABLE_DIMENSIONS.map(dimension => ({
      key: dimension,
      name: this.DIMENSION_DISPLAY_NAMES[dimension] || dimension,
      type: dimension === 'date' ? 'date' : 'string'
    }))
  }

  /**
   * Get all available fields (dimensions and metrics) for field pickers
   */
  static getAvailableFields(): {
    dimensions: Array<{ key: string; name: string; type: string }>
    metrics: Array<{ key: string; name: string; type: string }>
  } {
    return {
      dimensions: this.getAvailableDimensions(),
      metrics: this.getAvailableMetrics()
    }
  }

  /**
   * Get suggested chart configurations for different use cases
   */
  static getSuggestedConfigurations(): Array<{
    chartType: string
    name: string
    description: string
    config: DemoDataConfig
  }> {
    return [
      {
        chartType: 'line_chart',
        name: 'Performance Trends',
        description: 'Daily impressions and clicks over time',
        config: {
          chartType: 'line_chart',
          dimension: 'date',
          metrics: ['impressions', 'clicks']
        }
      },
      {
        chartType: 'bar_chart',
        name: 'Channel Performance',
        description: 'Cost and revenue by marketing channel',
        config: {
          chartType: 'bar_chart',
          dimension: 'channel',
          metrics: ['cost', 'revenue']
        }
      },
      {
        chartType: 'pie_chart',
        name: 'Campaign Conversions',
        description: 'Conversion distribution by campaign',
        config: {
          chartType: 'pie_chart',
          dimension: 'campaign',
          metrics: ['conversions']
        }
      },
      {
        chartType: 'metric_card',
        name: 'Total Revenue',
        description: 'Total revenue across all campaigns',
        config: {
          chartType: 'metric_card',
          metrics: ['revenue']
        }
      }
    ]
  }
}