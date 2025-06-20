"use client"

import { ChartProps } from './types'

// Sample data for demo
const sampleData = [
  { name: 'Visitors', value: 10000, color: '#2563eb' },
  { name: 'Leads', value: 3000, color: '#3b82f6' },
  { name: 'Prospects', value: 1200, color: '#60a5fa' },
  { name: 'Customers', value: 300, color: '#93c5fd' }
]

export function FunnelChart({ data = sampleData, config = {}, title, className }: ChartProps) {
  const {
    showLabels = true,
    showValues = true,
    showPercentages = true
  } = config

  // Ensure data is valid and has required properties
  if (!data || data.length === 0) {
    return (
      <div className={`h-full ${className || ''}`}>
        {title && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="h-full flex items-center justify-center text-gray-500">
          No data available
        </div>
      </div>
    )
  }

  // Filter out invalid data points and ensure they have required properties
  const validData = data.filter(item => item && typeof item.value === 'number' && !isNaN(item.value))
  
  if (validData.length === 0) {
    return (
      <div className={`h-full ${className || ''}`}>
        {title && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="h-full flex items-center justify-center text-gray-500">
          Invalid data format
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...validData.map(item => item.value))

  return (
    <div className={`h-full ${className || ''}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      <div className="h-full flex flex-col justify-center">
        <div className="space-y-2">
          {validData.map((item, index) => {
            const widthPercentage = (item.value / maxValue) * 100
            const conversionRate = index > 0 ? (item.value / validData[index - 1].value) * 100 : 100
            
            return (
              <div key={item.name} className="relative">
                {/* Funnel Segment */}
                <div 
                  className="h-16 flex items-center justify-center transition-all duration-300 hover:opacity-80"
                  style={{
                    backgroundColor: item.color,
                    width: `${widthPercentage}%`,
                    margin: '0 auto',
                    clipPath: index === validData.length - 1 
                      ? 'none' 
                      : 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 20px 100%)'
                  }}
                >
                  {/* Labels */}
                  {(showLabels || showValues) && (
                    <div className="text-white text-sm font-medium text-center">
                      {showLabels && <div>{item.name}</div>}
                      {showValues && (
                        <div className="flex items-center space-x-2">
                          <span>{item.value.toLocaleString()}</span>
                          {showPercentages && index > 0 && (
                            <span className="text-xs opacity-80">
                              ({conversionRate.toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Conversion Rate Arrow */}
                {index < validData.length - 1 && (
                  <div className="flex items-center justify-center mt-1 mb-1">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      <span>
                        {((validData[index + 1].value / item.value) * 100).toFixed(1)}% conversion
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary Stats */}
        {validData.length > 1 && (
          <div className="mt-6 grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {((validData[validData.length - 1].value / validData[0].value) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Overall Conversion</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {(validData[0].value - validData[validData.length - 1].value).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total Drop-off</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}