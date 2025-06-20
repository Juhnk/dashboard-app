"use client"

import { useMemo } from 'react'
import { useUIStore } from '@/stores'
import { DemoDataService } from '@/lib/demo-data-service'
import { LineChart } from './line-chart'
import { BarChart } from './bar-chart'
import { PieChart } from './pie-chart'
import { DonutChart } from './donut-chart'
import { AreaChart } from './area-chart'
import { ScatterChart } from './scatter-chart'
import { DataTable } from './data-table'
import { MetricCard } from './metric-card'
import { FunnelChart } from './funnel-chart'
import { Heatmap } from './heatmap'
import { GaugeChart } from './gauge-chart'

interface ChartWrapperProps {
  type: string
  data?: any[]
  config?: any
  title?: string
  className?: string
  widgetId?: string
}

export function ChartWrapper({ type, data = [], config = {}, title, className, widgetId }: ChartWrapperProps) {
  const { selectedWidgetId, tempWidgetConfig, editingPanelOpen } = useUIStore()
  
  // Use temp config if this widget is being edited
  const isBeingEdited = editingPanelOpen && selectedWidgetId === widgetId && tempWidgetConfig
  const effectiveConfig = isBeingEdited ? {
    ...config,
    ...tempWidgetConfig.style,
    dimensions: tempWidgetConfig.dimensions || config.dimensions || [],
    metrics: tempWidgetConfig.metrics || config.metrics || [],
    dimension: (tempWidgetConfig.dimensions && tempWidgetConfig.dimensions[0]) || config.dimension || 'date',
    dataKey: (tempWidgetConfig.metrics && tempWidgetConfig.metrics[0]) || config.dataKey || 'value',
    xAxisKey: (tempWidgetConfig.dimensions && tempWidgetConfig.dimensions[0]) || config.xAxisKey || config.dimension || 'date',
    yAxisKey: (tempWidgetConfig.metrics && tempWidgetConfig.metrics[0]) || config.yAxisKey || config.dataKey || 'value'
  } : config

  // Generate new data if configuration changed significantly
  const effectiveData = useMemo(() => {
    if (isBeingEdited && tempWidgetConfig) {
      // If we have filters or dimension/metric changes, regenerate demo data
      const hasSignificantChanges = 
        tempWidgetConfig.dimensions.length !== (config.dimensions?.length || 0) ||
        tempWidgetConfig.metrics.length !== (config.metrics?.length || 0) ||
        JSON.stringify(tempWidgetConfig.filters) !== JSON.stringify(config.filters || [])

      if (hasSignificantChanges) {
        try {
          const demoConfig = DemoDataService.getDemoDataForChart({
            chartType: tempWidgetConfig.chartType,
            dimension: tempWidgetConfig.dimensions[0],
            metrics: tempWidgetConfig.metrics,
            filters: tempWidgetConfig.filters.reduce((acc, filter) => {
              if (filter.enabled && filter.field && filter.value) {
                acc[filter.field] = filter.value
              }
              return acc
            }, {} as Record<string, any>)
          })
          return demoConfig.data
        } catch (error) {
          console.warn('Failed to generate demo data:', error)
          return data
        }
      }
    }
    return data
  }, [isBeingEdited, tempWidgetConfig, data, config])

  const chartComponent = useMemo(() => {
    const props = { 
      data: effectiveData, 
      config: effectiveConfig, 
      title, 
      className,
      isPreview: Boolean(isBeingEdited)
    }

    // Debug logging for development
    if (process.env.NODE_ENV === 'development' && type === 'line_chart') {
      console.log('ChartWrapper Debug (LineChart):', {
        type,
        isBeingEdited,
        dataLength: effectiveData?.length || 0,
        originalConfig: config,
        effectiveConfig,
        widgetId
      })
    }

    switch (type) {
      case 'line_chart':
        return <LineChart {...props} />
      case 'bar_chart':
        return <BarChart {...props} />
      case 'pie_chart':
        return <PieChart {...props} />
      case 'donut_chart':
        return <DonutChart {...props} />
      case 'area_chart':
        return <AreaChart {...props} />
      case 'scatter_chart':
        return <ScatterChart {...props} />
      case 'table':
        return <DataTable {...props} />
      case 'metric_card':
        return <MetricCard {...props} />
      case 'funnel_chart':
        return <FunnelChart {...props} />
      case 'heatmap':
        return <Heatmap {...props} />
      case 'gauge_chart':
        return <GaugeChart {...props} />
      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">❓</div>
              <p className="text-gray-500">Unknown chart type: {type}</p>
            </div>
          </div>
        )
    }
  }, [type, effectiveData, effectiveConfig, title, className, isBeingEdited])

  return (
    <div className={`chart-wrapper h-full ${className || ''}`}>
      {chartComponent}
    </div>
  )
}