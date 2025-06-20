import type { QueryPayload, QueryResult } from '@mustache/types'
import { groupBy, sortBy } from '@mustache/utils'

// Aggregation functions
export type AggregationFunction = 'sum' | 'avg' | 'count' | 'max' | 'min' | 'median'

export function aggregateData(
  data: Record<string, any>[],
  metrics: string[],
  dimensions: string[],
  aggregationType: AggregationFunction = 'sum'
): Record<string, any>[] {
  if (!data.length) return []
  
  // Group data by dimensions
  const grouped = groupBy(data, (row) => {
    return dimensions.map(dim => row[dim]).join('|')
  })
  
  // Aggregate each group
  return Object.entries(grouped).map(([key, group]) => {
    const result: Record<string, any> = {}
    
    // Add dimension values
    const dimensionValues = key.split('|')
    dimensions.forEach((dim, index) => {
      result[dim] = dimensionValues[index]
    })
    
    // Aggregate metrics
    metrics.forEach(metric => {
      const values = group
        .map(row => parseFloat(row[metric]))
        .filter(val => !isNaN(val))
      
      if (values.length === 0) {
        result[metric] = 0
        return
      }
      
      switch (aggregationType) {
        case 'sum':
          result[metric] = values.reduce((sum, val) => sum + val, 0)
          break
        case 'avg':
          result[metric] = values.reduce((sum, val) => sum + val, 0) / values.length
          break
        case 'count':
          result[metric] = values.length
          break
        case 'max':
          result[metric] = Math.max(...values)
          break
        case 'min':
          result[metric] = Math.min(...values)
          break
        case 'median':
          const sorted = [...values].sort((a, b) => a - b)
          const mid = Math.floor(sorted.length / 2)
          result[metric] = sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid]
          break
        default:
          result[metric] = values[0]
      }
    })
    
    return result
  })
}

// Multi-source data merging
export function mergeDataSources(
  dataSources: Array<{
    id: string
    data: Record<string, any>[]
    mapping: Record<string, string> // original field -> normalized field
  }>,
  joinKeys: string[] = []
): Record<string, any>[] {
  if (dataSources.length === 0) return []
  if (dataSources.length === 1) {
    return normalizeFields(dataSources[0].data, dataSources[0].mapping)
  }
  
  // If no join keys specified, concatenate all data
  if (joinKeys.length === 0) {
    return dataSources.flatMap(source => 
      normalizeFields(source.data, source.mapping)
    )
  }
  
  // Join data sources on specified keys
  let result = normalizeFields(dataSources[0].data, dataSources[0].mapping)
  
  for (let i = 1; i < dataSources.length; i++) {
    const source = dataSources[i]
    const normalizedData = normalizeFields(source.data, source.mapping)
    result = joinData(result, normalizedData, joinKeys)
  }
  
  return result
}

function normalizeFields(
  data: Record<string, any>[],
  mapping: Record<string, string>
): Record<string, any>[] {
  return data.map(row => {
    const normalized: Record<string, any> = {}
    
    Object.entries(row).forEach(([originalField, value]) => {
      const normalizedField = mapping[originalField] || originalField
      normalized[normalizedField] = value
    })
    
    return normalized
  })
}

function joinData(
  left: Record<string, any>[],
  right: Record<string, any>[],
  joinKeys: string[]
): Record<string, any>[] {
  const result: Record<string, any>[] = []
  
  // Create lookup map for right data
  const rightLookup = new Map<string, Record<string, any>[]>()
  
  right.forEach(row => {
    const key = joinKeys.map(k => row[k]).join('|')
    if (!rightLookup.has(key)) {
      rightLookup.set(key, [])
    }
    rightLookup.get(key)!.push(row)
  })
  
  // Join with left data
  left.forEach(leftRow => {
    const key = joinKeys.map(k => leftRow[k]).join('|')
    const rightRows = rightLookup.get(key) || [{}]
    
    rightRows.forEach(rightRow => {
      result.push({ ...leftRow, ...rightRow })
    })
  })
  
  return result
}

// Time-series aggregation
export function aggregateTimeSeries(
  data: Record<string, any>[],
  dateField: string,
  metrics: string[],
  interval: 'day' | 'week' | 'month' = 'day'
): Record<string, any>[] {
  // Group by time interval
  const grouped = groupBy(data, (row) => {
    const date = new Date(row[dateField])
    
    switch (interval) {
      case 'day':
        return date.toISOString().split('T')[0]
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        return weekStart.toISOString().split('T')[0]
      case 'month':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      default:
        return date.toISOString().split('T')[0]
    }
  })
  
  return Object.entries(grouped).map(([period, group]) => {
    const result: Record<string, any> = { [dateField]: period }
    
    metrics.forEach(metric => {
      const values = group
        .map(row => parseFloat(row[metric]))
        .filter(val => !isNaN(val))
      
      result[metric] = values.reduce((sum, val) => sum + val, 0)
    })
    
    return result
  })
}