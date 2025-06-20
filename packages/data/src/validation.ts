import type { QueryPayload, QueryResult } from '@mustache/types'

// Validation rule types
export interface ValidationRule {
  field: string
  type: 'required' | 'type' | 'range' | 'pattern' | 'custom'
  dataType?: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'
  min?: number
  max?: number
  pattern?: RegExp
  message?: string
  validate?: (value: any, row: Record<string, any>) => boolean
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  field: string
  value: any
  rule: string
  message: string
  rowIndex?: number
}

// Validate data against rules
export function validateData(
  data: Record<string, any>[],
  rules: ValidationRule[]
): ValidationResult {
  const errors: ValidationError[] = []
  
  data.forEach((row, index) => {
    rules.forEach(rule => {
      const value = row[rule.field]
      const error = validateField(value, rule, row)
      
      if (error) {
        errors.push({
          ...error,
          rowIndex: index
        })
      }
    })
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

function validateField(
  value: any,
  rule: ValidationRule,
  row: Record<string, any>
): ValidationError | null {
  switch (rule.type) {
    case 'required':
      if (value === null || value === undefined || value === '') {
        return {
          field: rule.field,
          value,
          rule: 'required',
          message: rule.message || `${rule.field} is required`
        }
      }
      break
      
    case 'type':
      if (!validateType(value, rule.dataType!)) {
        return {
          field: rule.field,
          value,
          rule: 'type',
          message: rule.message || `${rule.field} must be of type ${rule.dataType}`
        }
      }
      break
      
    case 'range':
      const numValue = Number(value)
      if (!isNaN(numValue)) {
        if (rule.min !== undefined && numValue < rule.min) {
          return {
            field: rule.field,
            value,
            rule: 'range',
            message: rule.message || `${rule.field} must be at least ${rule.min}`
          }
        }
        if (rule.max !== undefined && numValue > rule.max) {
          return {
            field: rule.field,
            value,
            rule: 'range',
            message: rule.message || `${rule.field} must be at most ${rule.max}`
          }
        }
      }
      break
      
    case 'pattern':
      if (rule.pattern && !rule.pattern.test(String(value))) {
        return {
          field: rule.field,
          value,
          rule: 'pattern',
          message: rule.message || `${rule.field} does not match required pattern`
        }
      }
      break
      
    case 'custom':
      if (rule.validate && !rule.validate(value, row)) {
        return {
          field: rule.field,
          value,
          rule: 'custom',
          message: rule.message || `${rule.field} failed custom validation`
        }
      }
      break
  }
  
  return null
}

function validateType(value: any, dataType: string): boolean {
  if (value === null || value === undefined) {
    return true // Allow null/undefined for type validation
  }
  
  switch (dataType) {
    case 'string':
      return typeof value === 'string'
      
    case 'number':
      return typeof value === 'number' && !isNaN(value)
      
    case 'boolean':
      return typeof value === 'boolean'
      
    case 'date':
      return !isNaN(new Date(value).getTime())
      
    case 'array':
      return Array.isArray(value)
      
    case 'object':
      return typeof value === 'object' && !Array.isArray(value)
      
    default:
      return true
  }
}

// Data quality checks
export interface DataQualityReport {
  totalRows: number
  validRows: number
  invalidRows: number
  completeness: Record<string, number> // percentage of non-null values per field
  uniqueness: Record<string, number> // percentage of unique values per field
  patterns: Record<string, Record<string, number>> // value frequency per field
}

export function analyzeDataQuality(
  data: Record<string, any>[],
  fields?: string[]
): DataQualityReport {
  if (data.length === 0) {
    return {
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      completeness: {},
      uniqueness: {},
      patterns: {}
    }
  }
  
  const fieldsToAnalyze = fields || Object.keys(data[0])
  const completeness: Record<string, number> = {}
  const uniqueness: Record<string, number> = {}
  const patterns: Record<string, Record<string, number>> = {}
  
  fieldsToAnalyze.forEach(field => {
    const values = data.map(row => row[field])
    const nonNullValues = values.filter(v => v !== null && v !== undefined)
    const uniqueValues = new Set(values)
    
    // Calculate completeness
    completeness[field] = (nonNullValues.length / data.length) * 100
    
    // Calculate uniqueness
    uniqueness[field] = (uniqueValues.size / data.length) * 100
    
    // Calculate value patterns (top 10 most frequent)
    const frequency: Record<string, number> = {}
    values.forEach(value => {
      const key = String(value)
      frequency[key] = (frequency[key] || 0) + 1
    })
    
    patterns[field] = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((acc, [key, count]) => {
        acc[key] = count
        return acc
      }, {} as Record<string, number>)
  })
  
  return {
    totalRows: data.length,
    validRows: data.length, // Would be calculated based on validation rules
    invalidRows: 0,
    completeness,
    uniqueness,
    patterns
  }
}

// Schema validation
export interface DataSchema {
  fields: Array<{
    name: string
    type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'
    required?: boolean
    nullable?: boolean
  }>
}

export function validateSchema(
  data: Record<string, any>[],
  schema: DataSchema
): ValidationResult {
  const errors: ValidationError[] = []
  
  data.forEach((row, index) => {
    schema.fields.forEach(field => {
      const value = row[field.name]
      
      // Check required fields
      if (field.required && (value === null || value === undefined)) {
        errors.push({
          field: field.name,
          value,
          rule: 'required',
          message: `${field.name} is required`,
          rowIndex: index
        })
        return
      }
      
      // Check nullable
      if (!field.nullable && value === null) {
        errors.push({
          field: field.name,
          value,
          rule: 'nullable',
          message: `${field.name} cannot be null`,
          rowIndex: index
        })
        return
      }
      
      // Check type
      if (value !== null && value !== undefined && !validateType(value, field.type)) {
        errors.push({
          field: field.name,
          value,
          rule: 'type',
          message: `${field.name} must be of type ${field.type}`,
          rowIndex: index
        })
      }
    })
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}