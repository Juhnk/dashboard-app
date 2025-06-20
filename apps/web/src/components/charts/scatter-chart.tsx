"use client"

import { ScatterChart as RechartsScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartProps } from './types'

// Sample data for demo
const sampleData = [
  { x: 10, y: 30, z: 200 },
  { x: 30, y: 50, z: 300 },
  { x: 45, y: 70, z: 400 },
  { x: 60, y: 90, z: 500 },
  { x: 80, y: 110, z: 600 },
  { x: 100, y: 130, z: 700 }
]

export function ScatterChart({ data = sampleData, config = {}, title, className }: ChartProps) {
  const {
    xAxisKey = 'x',
    yAxisKey = 'y',
    sizeKey = 'z',
    showGrid = true,
    showTooltip = true,
    color = '#2563eb'
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
          <RechartsScatterChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              bottom: 20,
              left: 20,
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />}
            <XAxis 
              type="number" 
              dataKey={xAxisKey}
              stroke="#6b7280"
              fontSize={12}
              name="X Axis"
            />
            <YAxis 
              type="number" 
              dataKey={yAxisKey}
              stroke="#6b7280"
              fontSize={12}
              name="Y Axis"
            />
            {showTooltip && (
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any, name: string) => [value, name]}
              />
            )}
            
            <Scatter 
              data={data} 
              fill={color}
              shape="circle"
            />
          </RechartsScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}