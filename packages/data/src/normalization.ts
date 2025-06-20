import type { QueryPayload, QueryResult } from '@mustache/types'

// Data normalization utilities
export interface NormalizationRule {
  field: string
  type: 'number' | 'string' | 'boolean' | 'date'
  format?: string
  default?: any
}

export function normalizeData(
  data: Record<string, any>[],
  rules: NormalizationRule[]
): Record<string, any>[] {
  return data.map(row => {
    const normalized: Record<string, any> = { ...row }
    
    rules.forEach(rule => {
      const value = row[rule.field]
      
      if (value === null || value === undefined) {
        normalized[rule.field] = rule.default ?? null
        return
      }
      
      switch (rule.type) {
        case 'number':
          normalized[rule.field] = parseFloat(value)
          if (isNaN(normalized[rule.field])) {
            normalized[rule.field] = rule.default ?? 0
          }
          break
          
        case 'string':
          normalized[rule.field] = String(value).trim()
          break
          
        case 'boolean':
          normalized[rule.field] = Boolean(value)
          break
          
        case 'date':
          const date = new Date(value)
          normalized[rule.field] = isNaN(date.getTime()) 
            ? rule.default ?? null 
            : date.toISOString()
          break
          
        default:
          normalized[rule.field] = value
      }
    })
    
    return normalized
  })
}

// Field mapping utilities
export function mapFields(
  data: Record<string, any>[],
  mapping: Record<string, string>
): Record<string, any>[] {
  return data.map(row => {
    const mapped: Record<string, any> = {}
    
    Object.entries(row).forEach(([originalField, value]) => {
      const newField = mapping[originalField] || originalField
      mapped[newField] = value
    })
    
    return mapped
  })
}

// Value transformation utilities
export interface TransformRule {
  field: string
  transform: (value: any) => any
}

export function transformValues(
  data: Record<string, any>[],
  transforms: TransformRule[]
): Record<string, any>[] {
  return data.map(row => {
    const transformed: Record<string, any> = { ...row }
    
    transforms.forEach(({ field, transform }) => {
      if (field in transformed) {
        transformed[field] = transform(transformed[field])
      }
    })
    
    return transformed
  })
}

// Standardize currency values
export function normalizeCurrency(
  data: Record<string, any>[],
  currencyFields: string[],
  targetCurrency: string = 'USD'
): Record<string, any>[] {
  // In a real implementation, this would use exchange rates
  // For now, just ensure values are numbers
  return data.map(row => {
    const normalized: Record<string, any> = { ...row }
    
    currencyFields.forEach(field => {
      if (field in normalized) {
        const value = normalized[field]
        if (typeof value === 'string') {
          // Remove currency symbols and convert to number
          normalized[field] = parseFloat(value.replace(/[^0-9.-]/g, ''))
        }
      }
    })
    
    return normalized
  })
}

// Percentage normalization
export function normalizePercentages(
  data: Record<string, any>[],
  percentageFields: string[],
  isDecimal: boolean = false
): Record<string, any>[] {
  return data.map(row => {
    const normalized: Record<string, any> = { ...row }
    
    percentageFields.forEach(field => {
      if (field in normalized) {
        let value = parseFloat(normalized[field])
        if (!isNaN(value)) {
          // Convert to decimal if needed
          normalized[field] = isDecimal ? value : value / 100
        }
      }
    })
    
    return normalized
  })
}