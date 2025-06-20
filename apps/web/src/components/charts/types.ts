export interface ChartProps {
  data?: any[]
  config?: any
  title?: string
  className?: string
  isPreview?: boolean
}

export interface ChartDataPoint {
  [key: string]: any
}

export interface LineConfig {
  key: string
  color?: string
  name?: string
}

export interface BarConfig {
  key: string
  color?: string
  name?: string
}

export interface PieConfig {
  dataKey: string
  nameKey: string
  colors?: string[]
}

export interface MetricConfig {
  value: number | string
  label: string
  format?: 'number' | 'currency' | 'percentage'
  trend?: {
    value: number
    type: 'up' | 'down' | 'neutral'
  }
  target?: number
}