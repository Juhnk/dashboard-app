"use client"

import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartProps } from './types'

// Sample data for demo
const sampleData = [
  { name: 'Jan', desktop: 4000, mobile: 2400, tablet: 800 },
  { name: 'Feb', desktop: 3000, mobile: 1398, tablet: 600 },
  { name: 'Mar', desktop: 2000, mobile: 2800, tablet: 900 },
  { name: 'Apr', desktop: 2780, mobile: 3908, tablet: 1200 },
  { name: 'May', desktop: 1890, mobile: 4800, tablet: 1500 },
  { name: 'Jun', desktop: 2390, mobile: 3800, tablet: 1100 }
]

export function AreaChart({ data = sampleData, config = {}, title, className }: ChartProps) {
  const {
    xAxisKey = 'name',
    areas = [
      { key: 'desktop', color: '#2563eb', name: 'Desktop' },
      { key: 'mobile', color: '#10b981', name: 'Mobile' },
      { key: 'tablet', color: '#f59e0b', name: 'Tablet' }
    ],
    showGrid = true,
    showLegend = true,
    showTooltip = true,
    stackId = 'default'
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
          <RechartsAreaChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <defs>
              {areas.map((area: any, index: number) => (
                <linearGradient key={area.key} id={`gradient-${area.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={area.color || `var(--color-chart-${(index % 12) + 1})`} 
                    stopOpacity={0.8}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={area.color || `var(--color-chart-${(index % 12) + 1})`} 
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            
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
            
            {areas.map((area: any, index: number) => (
              <Area
                key={area.key}
                type="monotone"
                dataKey={area.key}
                stackId={stackId}
                stroke={area.color || `var(--color-chart-${(index % 12) + 1})`}
                fill={`url(#gradient-${area.key})`}
                name={area.name || area.key}
                strokeWidth={2}
              />
            ))}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}