"use client"

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartProps } from './types'
import { DemoDataService } from '@/lib/demo-data-service'

const CHART_COLORS = [
  '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4',
  '#6366f1', '#a855f7'
]

// Generate demo data using the unified service
const getDemoData = () => {
  const demoConfig = DemoDataService.getDemoDataForChart({
    chartType: 'pie_chart',
    dimension: 'campaign',
    metrics: ['conversions']
  })
  return demoConfig.data
}

export function PieChart({ data, config = {}, title, className }: ChartProps) {
  // Use provided data, or fall back to demo data if none provided
  const chartData = data && data.length > 0 ? data : getDemoData()
  
  const {
    dataKey = config.metrics?.[0] || 'value',
    nameKey = config.dimension || 'name',
    showTooltip = true,
    showLegend = true,
    colors = CHART_COLORS
  } = config

  return (
    <div className={`h-full w-full flex flex-col ${className || ''}`}>
      {title && (
        <div className="mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey={dataKey}
              nameKey={nameKey}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry: any, index: number) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || colors[index % colors.length]} 
                />
              ))}
            </Pie>
            
            {showTooltip && (
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any, name: string) => [
                  `${value} (${((value / chartData.reduce((sum, item) => sum + item[dataKey], 0)) * 100).toFixed(1)}%)`,
                  name
                ]}
              />
            )}
            
            {showLegend && (
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}