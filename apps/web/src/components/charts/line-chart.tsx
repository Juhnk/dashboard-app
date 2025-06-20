"use client"

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartProps } from './types'
import { DemoDataService } from '@/lib/demo-data-service'

// Generate demo data using the unified service
const getDemoData = () => {
  const demoConfig = DemoDataService.getDemoDataForChart({
    chartType: 'line_chart',
    dimension: 'date',
    metrics: ['impressions', 'clicks']
  })
  return demoConfig.data
}

export function LineChart({ data, config = {}, title, className }: ChartProps) {
  // Use provided data, or fall back to demo data if none provided
  const chartData = data && data.length > 0 ? data : getDemoData()
  
  // Improved config processing with better fallbacks
  const metrics: string[] = config.metrics || ['impressions', 'clicks']
  const dimension: string = config.dimension || config.xAxisKey || 'date'
  
  // Ensure we have valid data keys by checking the actual data structure
  const dataKeys = chartData.length > 0 ? Object.keys(chartData[0]) : []
  const validMetrics = metrics.filter((metric: string) => dataKeys.includes(metric))
  const validDimension = dataKeys.includes(dimension) ? dimension : dataKeys.find((key: string) => key === 'date' || key === 'name') || dataKeys[0]

  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('LineChart Debug:', {
      chartDataLength: chartData.length,
      dataKeys,
      requestedMetrics: metrics,
      validMetrics,
      requestedDimension: dimension,
      validDimension,
      config,
      hasValidConfig: validMetrics.length > 0 && validDimension,
      sampleData: chartData.slice(0, 2)
    })
  }
  
  const {
    xAxisKey = validDimension,
    lines = validMetrics.length > 0 ? validMetrics.map((metric: string, index: number) => ({
      key: metric,
      name: metric.charAt(0).toUpperCase() + metric.slice(1),
      color: `var(--color-chart-${(index % 12) + 1})`
    })) : [{ key: validMetrics[0] || dataKeys[1] || 'value', color: '#2563eb', name: 'Value' }],
    showGrid = true,
    showLegend = true,
    showTooltip = true
  } = config

  // Error handling - show error state if no valid data or configuration
  if (!chartData || chartData.length === 0) {
    return (
      <div className={`h-full w-full flex flex-col ${className || ''}`}>
        {title && (
          <div className="mb-4 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-500 text-sm">No data available</p>
          </div>
        </div>
      </div>
    )
  }

  if (!lines || lines.length === 0) {
    return (
      <div className={`h-full w-full flex flex-col ${className || ''}`}>
        {title && (
          <div className="mb-4 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-gray-500 text-sm">Invalid chart configuration</p>
            <p className="text-xs text-gray-400 mt-1">No valid metrics found for line chart</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-full w-full flex flex-col ${className || ''}`}>
      {title && (
        <div className="mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />}
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            {showTooltip && (
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            )}
            {showLegend && <Legend />}
            
            {lines.map((line: any, index: number) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color || `var(--color-chart-${(index % 12) + 1})`}
                strokeWidth={2}
                dot={{ fill: line.color || `var(--color-chart-${(index % 12) + 1})`, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name={line.name || line.key}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}