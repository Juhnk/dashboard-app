"use client"

import { ChartProps, MetricConfig } from './types'
import { DemoDataService } from '@/lib/demo-data-service'

// Generate demo data using the unified service
const getDemoData = () => {
  const demoConfig = DemoDataService.getDemoDataForChart({
    chartType: 'metric_card',
    metrics: ['revenue']
  })
  return demoConfig.data
}

// Sample config for demo
const sampleConfig: MetricConfig = {
  value: 12543,
  label: 'Total Revenue',
  format: 'currency',
  trend: {
    value: 12.5,
    type: 'up'
  },
  target: 15000
}

export function MetricCard({ data, config = sampleConfig, title, className }: ChartProps) {
  // Use provided data, or fall back to demo data if none provided
  const metricData = data && data.length > 0 ? data : getDemoData()
  // Handle demo data or use provided config
  let metricValue = config.value
  let metricLabel = config.label
  let metricFormat = config.format || 'number'
  
  // If we have demo data, extract the metric value
  if (metricData && metricData.length > 0 && config.metrics && config.metrics[0]) {
    const metric = config.metrics[0]
    if (metricData[0] && metricData[0][metric] !== undefined) {
      metricValue = metricData[0][metric]
      metricLabel = config.title || metric
      // Determine format based on metric name
      if (metric.includes('revenue') || metric.includes('cost')) {
        metricFormat = 'currency'
      } else if (metric.includes('ctr') || metric.includes('rate')) {
        metricFormat = 'percentage'
      }
    }
  }
  
  const {
    value = metricValue,
    label = metricLabel,
    format = metricFormat,
    trend,
    target
  } = config as MetricConfig

  const formatValue = (val: number | string | undefined) => {
    if (val === undefined || val === null) return '0'
    if (typeof val === 'string') return val
    if (typeof val !== 'number' || isNaN(val)) return '0'

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(val)
      case 'percentage':
        return `${val}%`
      default:
        return val.toLocaleString()
    }
  }

  const getTrendIcon = (type: string) => {
    switch (type) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7h-10" />
          </svg>
        )
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2L7 7h10v10" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
          </svg>
        )
    }
  }

  const getTrendColor = (type: string) => {
    switch (type) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const progressPercentage = target ? Math.min((Number(value) / target) * 100, 100) : 0

  return (
    <div className={`h-full ${className || ''}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      <div className="h-full flex flex-col justify-center p-6 bg-white rounded-lg">
        {/* Main Metric */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {formatValue(value)}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            {label}
          </div>
        </div>

        {/* Trend */}
        {trend && (
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-1">
              {getTrendIcon(trend.type)}
              <span className={`text-sm font-medium ${getTrendColor(trend.type)}`}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          </div>
        )}

        {/* Progress to Target */}
        {target && (
          <div className="mt-auto">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progress to target</span>
              <span>{formatValue(target)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-right text-xs text-gray-500 mt-1">
              {progressPercentage.toFixed(0)}% complete
            </div>
          </div>
        )}
      </div>
    </div>
  )
}