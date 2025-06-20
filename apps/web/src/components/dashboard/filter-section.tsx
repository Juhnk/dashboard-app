"use client"

import { useState, useCallback } from 'react'
import { FilterConfig } from '@/stores/ui-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface FieldConfig {
  key: string
  name: string
  type: string
}

interface FilterSectionProps {
  filters: FilterConfig[]
  availableFields: {
    dimensions: FieldConfig[]
    metrics: FieldConfig[]
  }
  onChange: (filters: FilterConfig[]) => void
}

interface FilterBuilderProps {
  filter: FilterConfig
  availableFields: FieldConfig[]
  onChange: (filter: FilterConfig) => void
  onRemove: () => void
}

// Filter Builder Component
function FilterBuilder({ filter, availableFields, onChange, onRemove }: FilterBuilderProps) {
  const field = availableFields.find(f => f.key === filter.field)
  const fieldType = field?.type || 'string'

  const getOperatorOptions = (type: string) => {
    switch (type) {
      case 'string':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'contains', label: 'Contains' },
          { value: 'not_null', label: 'Is not empty' },
          { value: 'is_null', label: 'Is empty' }
        ]
      case 'number':
      case 'currency':
      case 'percentage':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'greater_than', label: 'Greater than' },
          { value: 'less_than', label: 'Less than' },
          { value: 'between', label: 'Between' },
          { value: 'not_null', label: 'Is not empty' },
          { value: 'is_null', label: 'Is empty' }
        ]
      case 'date':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'greater_than', label: 'After' },
          { value: 'less_than', label: 'Before' },
          { value: 'date_range', label: 'Date range' },
          { value: 'not_null', label: 'Is not empty' },
          { value: 'is_null', label: 'Is empty' }
        ]
      default:
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'contains', label: 'Contains' }
        ]
    }
  }

  const operatorOptions = getOperatorOptions(fieldType)
  const needsValue = !['not_null', 'is_null'].includes(filter.operator)
  const needsMultipleValues = filter.operator === 'between' || filter.operator === 'date_range'
  const isArrayValue = filter.operator === 'in'

  const renderValueInput = () => {
    if (!needsValue) return null

    if (needsMultipleValues) {
      return (
        <div className="grid grid-cols-2 gap-2">
          <input
            type={fieldType === 'date' ? 'date' : fieldType === 'number' || fieldType === 'currency' || fieldType === 'percentage' ? 'number' : 'text'}
            value={Array.isArray(filter.value) ? filter.value[0] || '' : filter.value || ''}
            onChange={(e) => {
              const newValue = Array.isArray(filter.value) 
                ? [e.target.value, filter.value[1] || '']
                : [e.target.value, '']
              onChange({ ...filter, value: newValue })
            }}
            placeholder="From"
            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type={fieldType === 'date' ? 'date' : fieldType === 'number' || fieldType === 'currency' || fieldType === 'percentage' ? 'number' : 'text'}
            value={Array.isArray(filter.value) ? filter.value[1] || '' : ''}
            onChange={(e) => {
              const newValue = Array.isArray(filter.value) 
                ? [filter.value[0] || '', e.target.value]
                : ['', e.target.value]
              onChange({ ...filter, value: newValue })
            }}
            placeholder="To"
            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )
    }

    if (isArrayValue) {
      return (
        <input
          type="text"
          value={Array.isArray(filter.value) ? filter.value.join(', ') : filter.value || ''}
          onChange={(e) => {
            const values = e.target.value.split(',').map(v => v.trim()).filter(Boolean)
            onChange({ ...filter, value: values })
          }}
          placeholder="Value1, Value2, Value3..."
          className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      )
    }

    return (
      <input
        type={fieldType === 'date' ? 'date' : fieldType === 'number' || fieldType === 'currency' || fieldType === 'percentage' ? 'number' : 'text'}
        value={Array.isArray(filter.value) ? filter.value[0] || '' : filter.value || ''}
        onChange={(e) => onChange({ ...filter, value: e.target.value })}
        placeholder="Enter value..."
        className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    )
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Header with toggle and remove */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onChange({ ...filter, enabled: !filter.enabled })}
                className={`
                  w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                  ${filter.enabled 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                {filter.enabled && (
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <span className="text-sm font-medium text-gray-900">
                Filter {availableFields.findIndex(f => f.key === filter.field) + 1}
              </span>
              <Badge variant="outline" className={`text-xs ${filter.enabled ? '' : 'opacity-50'}`}>
                {filter.enabled ? 'Active' : 'Disabled'}
              </Badge>
            </div>
            <button
              onClick={onRemove}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Filter Configuration */}
          <div className={`space-y-3 ${filter.enabled ? '' : 'opacity-50'}`}>
            {/* Field Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Field</label>
              <select
                value={filter.field}
                onChange={(e) => onChange({ ...filter, field: e.target.value, operator: 'equals', value: '' })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select field...</option>
                <optgroup label="Dimensions">
                  {availableFields.filter(f => ['string', 'date'].includes(f.type)).map(field => (
                    <option key={field.key} value={field.key}>{field.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Metrics">
                  {availableFields.filter(f => ['number', 'currency', 'percentage'].includes(f.type)).map(field => (
                    <option key={field.key} value={field.key}>{field.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Operator Selection */}
            {filter.field && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Condition</label>
                <select
                  value={filter.operator}
                  onChange={(e) => onChange({ ...filter, operator: e.target.value as any, value: '' })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {operatorOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Value Input */}
            {filter.field && needsValue && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
                {renderValueInput()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Quick Filter Suggestions
function QuickFilterSuggestions({ 
  availableFields, 
  onAddFilter 
}: { 
  availableFields: FieldConfig[]
  onAddFilter: (filter: Partial<FilterConfig>) => void 
}) {
  const suggestions = [
    {
      label: 'Hide empty channels',
      filter: { field: 'channel', operator: 'not_null' as const, value: '' }
    },
    {
      label: 'Last 30 days',
      filter: { field: 'date', operator: 'greater_than' as const, value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
    },
    {
      label: 'High performing campaigns (CTR > 2%)',
      filter: { field: 'ctr', operator: 'greater_than' as const, value: '2' }
    },
    {
      label: 'Significant spend (> $100)',
      filter: { field: 'cost', operator: 'greater_than' as const, value: '100' }
    }
  ]

  const applicableSuggestions = suggestions.filter(suggestion => 
    availableFields.some(field => field.key === suggestion.filter.field)
  )

  if (applicableSuggestions.length === 0) return null

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">Quick Filters</h4>
      <div className="flex flex-wrap gap-2">
        {applicableSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onAddFilter(suggestion.filter)}
            className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
          >
            {suggestion.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function FilterSection({ filters, availableFields, onChange }: FilterSectionProps) {
  const [showBuilder, setShowBuilder] = useState(false)

  const allFields = [...availableFields.dimensions, ...availableFields.metrics]

  const addFilter = useCallback((partialFilter: Partial<FilterConfig> = {}) => {
    const newFilter: FilterConfig = {
      id: `filter-${Date.now()}`,
      field: partialFilter.field || '',
      operator: partialFilter.operator || 'equals',
      value: partialFilter.value || '',
      enabled: true,
      label: partialFilter.label,
      ...partialFilter
    }
    onChange([...filters, newFilter])
    setShowBuilder(true)
  }, [filters, onChange])

  const updateFilter = useCallback((index: number, updatedFilter: FilterConfig) => {
    const newFilters = [...filters]
    newFilters[index] = updatedFilter
    onChange(newFilters)
  }, [filters, onChange])

  const removeFilter = useCallback((index: number) => {
    onChange(filters.filter((_, i) => i !== index))
  }, [filters, onChange])

  const clearAllFilters = useCallback(() => {
    onChange([])
  }, [onChange])

  const activeFiltersCount = filters.filter(f => f.enabled).length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {filters.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
          <Button
            onClick={() => addFilter()}
            size="sm"
            className="text-xs"
          >
            + Add Filter
          </Button>
        </div>
      </div>

      {/* Existing Filters */}
      {filters.length > 0 && (
        <div className="space-y-3">
          {filters.map((filter, index) => (
            <FilterBuilder
              key={filter.id}
              filter={filter}
              availableFields={allFields}
              onChange={(updatedFilter) => updateFilter(index, updatedFilter)}
              onRemove={() => removeFilter(index)}
            />
          ))}
        </div>
      )}

      {/* Empty State / Quick Filters */}
      {filters.length === 0 && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No filters applied</h3>
            <p className="text-sm text-gray-500 mb-4">Add filters to focus on specific data segments</p>
            <Button onClick={() => addFilter()} size="sm">
              Add Your First Filter
            </Button>
          </div>

          <Separator />

          <QuickFilterSuggestions
            availableFields={allFields}
            onAddFilter={addFilter}
          />
        </div>
      )}

      {/* Filter Summary */}
      {activeFiltersCount > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-blue-800 font-medium">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Data will be filtered based on the active conditions above
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}