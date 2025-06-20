"use client"

import { ChartProps } from './types'

// Sample config for demo
const sampleConfig = {
  value: 75,
  min: 0,
  max: 100,
  target: 80,
  label: 'Performance Score',
  unit: '%'
}

export function GaugeChart({ data, config = sampleConfig, title, className }: ChartProps) {
  const {
    value = 0,
    min = 0,
    max = 100,
    target,
    label = 'Value',
    unit = '',
    color = '#2563eb',
    targetColor = '#ef4444'
  } = config

  const percentage = ((value - min) / (max - min)) * 100
  const targetPercentage = target ? ((target - min) / (max - min)) * 100 : null
  
  // Calculate the arc path
  const radius = 80
  const strokeWidth = 12
  const normalizedRadius = radius - strokeWidth * 0.5
  const circumference = normalizedRadius * Math.PI // Half circle
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Calculate target marker position if target exists
  const targetAngle = targetPercentage ? (targetPercentage / 100) * 180 - 90 : null
  const targetX = targetAngle ? Math.cos((targetAngle * Math.PI) / 180) * normalizedRadius : null
  const targetY = targetAngle ? Math.sin((targetAngle * Math.PI) / 180) * normalizedRadius : null

  return (
    <div className={`h-full ${className || ''}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      <div className="h-full flex flex-col items-center justify-center">
        <div className="relative">
          <svg
            height={radius * 2}
            width={radius * 2}
            className="transform -rotate-90"
          >
            {/* Background Arc */}
            <path
              d={`M ${strokeWidth/2},${radius} A ${normalizedRadius},${normalizedRadius} 0 0,1 ${radius * 2 - strokeWidth/2},${radius}`}
              fill="transparent"
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            {/* Progress Arc */}
            <path
              d={`M ${strokeWidth/2},${radius} A ${normalizedRadius},${normalizedRadius} 0 0,1 ${radius * 2 - strokeWidth/2},${radius}`}
              fill="transparent"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 0.5s ease-in-out'
              }}
            />

            {/* Target Marker */}
            {targetX !== null && targetY !== null && (
              <circle
                cx={radius + targetX}
                cy={radius + targetY}
                r={4}
                fill={targetColor}
              />
            )}
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-gray-900">
              {value}{unit}
            </div>
            <div className="text-sm text-gray-600">{label}</div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-gray-600">Current: {value}{unit}</span>
          </div>
          
          {target && (
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: targetColor }}
              />
              <span className="text-gray-600">Target: {target}{unit}</span>
            </div>
          )}
        </div>

        {/* Range Labels */}
        <div className="mt-4 flex justify-between w-full max-w-xs text-xs text-gray-500">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>

        {/* Status */}
        {target && (
          <div className="mt-2 text-center">
            <div className={`text-sm font-medium ${
              value >= target ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {value >= target ? '✓ Target achieved' : `${target - value}${unit} to target`}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}