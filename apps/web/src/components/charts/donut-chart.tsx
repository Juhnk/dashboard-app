"use client"

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartProps } from './types'

// Sample data for demo
const sampleData = [
  { name: 'Organic', value: 45, color: '#2563eb' },
  { name: 'Social', value: 25, color: '#10b981' },
  { name: 'Email', value: 20, color: '#f59e0b' },
  { name: 'Direct', value: 10, color: '#ef4444' }
]

const CHART_COLORS = [
  '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4',
  '#6366f1', '#a855f7'
]

export function DonutChart({ data = sampleData, config = {}, title, className }: ChartProps) {
  const {
    dataKey = 'value',
    nameKey = 'name',
    showTooltip = true,
    showLegend = true,
    colors = CHART_COLORS,
    innerRadius = 40,
    outerRadius = 80,
    showCenterLabel = true
  } = config

  const total = data.reduce((sum, item) => sum + item[dataKey], 0)

  return (
    <div className={`h-full ${className || ''}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      <div className="h-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              dataKey={dataKey}
              nameKey={nameKey}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry: any, index: number) => (
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
                  `${value} (${((value / total) * 100).toFixed(1)}%)`,
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

        {/* Center Label */}
        {showCenterLabel && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}