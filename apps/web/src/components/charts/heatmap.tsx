"use client"

import { ChartProps } from './types'

// Sample data for demo - represents hour vs day of week
const sampleData = [
  { day: 'Mon', hour: 0, value: 12 },
  { day: 'Mon', hour: 1, value: 8 },
  { day: 'Mon', hour: 2, value: 5 },
  { day: 'Mon', hour: 3, value: 3 },
  // ... more data points
  { day: 'Tue', hour: 0, value: 15 },
  { day: 'Tue', hour: 1, value: 10 },
  { day: 'Wed', hour: 12, value: 45 },
  { day: 'Thu', hour: 15, value: 38 },
  { day: 'Fri', hour: 18, value: 52 },
  { day: 'Sat', hour: 20, value: 48 },
  { day: 'Sun', hour: 14, value: 35 }
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function Heatmap({ data = sampleData, config = {}, title, className }: ChartProps) {
  const {
    xAxisKey = 'hour',
    yAxisKey = 'day',
    valueKey = 'value',
    colorScheme = 'blue'
  } = config

  // Create a data map for quick lookup
  const dataMap = new Map()
  data.forEach(item => {
    const key = `${item[yAxisKey]}-${item[xAxisKey]}`
    dataMap.set(key, item[valueKey])
  })

  // Find min and max values for color scaling
  const values = data.map(item => item[valueKey])
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  const getColorIntensity = (value: number) => {
    if (maxValue === minValue) return 0.5
    return (value - minValue) / (maxValue - minValue)
  }

  const getColor = (intensity: number) => {
    switch (colorScheme) {
      case 'red':
        return `rgba(239, 68, 68, ${intensity})`
      case 'green':
        return `rgba(16, 185, 129, ${intensity})`
      case 'purple':
        return `rgba(139, 92, 246, ${intensity})`
      default:
        return `rgba(37, 99, 235, ${intensity})`
    }
  }

  return (
    <div className={`h-full ${className || ''}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      <div className="h-full flex flex-col">
        {/* Heatmap Grid */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-max">
            {/* Hour Labels */}
            <div className="flex">
              <div className="w-12"></div> {/* Empty corner */}
              {HOURS.map(hour => (
                <div 
                  key={hour}
                  className="w-8 h-6 flex items-center justify-center text-xs text-gray-600"
                >
                  {hour}
                </div>
              ))}
            </div>

            {/* Heatmap Rows */}
            {DAYS.map(day => (
              <div key={day} className="flex">
                {/* Day Label */}
                <div className="w-12 h-8 flex items-center justify-center text-xs text-gray-600 font-medium">
                  {day}
                </div>
                
                {/* Hour Cells */}
                {HOURS.map(hour => {
                  const value = dataMap.get(`${day}-${hour}`) || 0
                  const intensity = getColorIntensity(value)
                  
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="w-8 h-8 border border-gray-200 flex items-center justify-center text-xs font-medium cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
                      style={{
                        backgroundColor: value > 0 ? getColor(intensity) : '#f9fafb',
                        color: intensity > 0.5 ? 'white' : '#374151'
                      }}
                      title={`${day} ${hour}:00 - ${value}`}
                    >
                      {value > 0 ? value : ''}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-2">
          <span className="text-xs text-gray-500">Low</span>
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="w-4 h-4 border border-gray-200"
                style={{
                  backgroundColor: getColor((i + 1) * 0.2)
                }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">High</span>
          <span className="text-xs text-gray-400 ml-4">
            {minValue} - {maxValue}
          </span>
        </div>
      </div>
    </div>
  )
}