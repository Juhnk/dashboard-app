"use client"

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartProps } from './types'
import { DemoDataService } from '@/lib/demo-data-service'

// Generate demo data using the unified service
const getDemoData = () => {
  const demoConfig = DemoDataService.getDemoDataForChart({
    chartType: 'bar_chart',
    dimension: 'channel',
    metrics: ['cost', 'revenue']
  })
  return demoConfig.data
}

export function BarChart({ data, config = {}, title, className }: ChartProps) {
  // Use provided data, or fall back to demo data if none provided
  const chartData = data && data.length > 0 ? data : getDemoData()
  
  const {
    xAxisKey = config.dimension || 'name',
    bars = config.metrics ? config.metrics.map((metric: string, index: number) => ({
      key: metric,
      name: metric,
      color: `var(--color-chart-${(index % 12) + 1})`
    })) : [{ key: 'value', color: '#2563eb', name: 'Value' }],
    showGrid = true,
    showLegend = true,
    showTooltip = true,
    layout = 'vertical' // 'vertical' or 'horizontal'
  } = config

  return (
    <div className={`h-full ${className || ''}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      <div className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={chartData}
            layout={layout}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />}
            <XAxis 
              type={layout === 'vertical' ? 'category' : 'number'}
              dataKey={layout === 'vertical' ? xAxisKey : undefined}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              type={layout === 'vertical' ? 'number' : 'category'}
              dataKey={layout === 'horizontal' ? xAxisKey : undefined}
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
            
            {bars.map((bar: any, index: number) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                fill={bar.color || `var(--color-chart-${(index % 12) + 1})`}
                name={bar.name || bar.key}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}