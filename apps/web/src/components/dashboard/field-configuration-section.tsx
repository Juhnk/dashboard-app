"use client"

import { useState, useCallback } from 'react'
import { ChartEditingConfig } from '@/stores/ui-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface FieldConfig {
  key: string
  name: string
  type: string
}

interface FieldConfigurationSectionProps {
  chartType: string
  config: ChartEditingConfig
  availableFields: {
    dimensions: FieldConfig[]
    metrics: FieldConfig[]
  }
  onChange: (updates: Partial<ChartEditingConfig>) => void
}

// Utility functions for field display
const getFieldIcon = (type: string) => {
  switch (type) {
    case 'date': return '📅'
    case 'string': return '📝'
    case 'number': return '🔢'
    case 'currency': return '💰'
    case 'percentage': return '📊'
    default: return '📊'
  }
}

const getFieldColor = (type: string) => {
  switch (type) {
    case 'date': return 'bg-blue-50 border-blue-200 text-blue-700'
    case 'string': return 'bg-green-50 border-green-200 text-green-700'
    case 'number': return 'bg-purple-50 border-purple-200 text-purple-700'
    case 'currency': return 'bg-yellow-50 border-yellow-200 text-yellow-700'
    case 'percentage': return 'bg-pink-50 border-pink-200 text-pink-700'
    default: return 'bg-gray-50 border-gray-200 text-gray-700'
  }
}

// Field Selector Dropdown Component
interface FieldSelectorProps {
  fields: FieldConfig[]
  selectedFields: string[]
  onSelectField: (field: FieldConfig) => void
  placeholder: string
  maxSelections?: number
}

function FieldSelector({ fields, selectedFields, onSelectField, placeholder, maxSelections }: FieldSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const availableFields = fields.filter(field => !selectedFields.includes(field.key))
  const filteredFields = availableFields.filter(field => 
    field.name.toLowerCase().includes(search.toLowerCase()) ||
    field.type.toLowerCase().includes(search.toLowerCase())
  )

  const isMaxReached = maxSelections !== undefined && selectedFields.length >= maxSelections

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="secondary" 
          className="w-full justify-start text-left font-normal"
          disabled={isMaxReached}
        >
          <span className="text-gray-500">
            {isMaxReached ? `Maximum ${maxSelections} reached` : placeholder}
          </span>
          <svg className="ml-auto h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-2">
          <input
            type="text"
            placeholder="Search fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="max-h-60 overflow-y-auto">
          {filteredFields.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {search ? 'No fields found' : 'No available fields'}
            </div>
          ) : (
            filteredFields.map(field => (
              <button
                key={field.key}
                onClick={() => {
                  onSelectField(field)
                  setOpen(false)
                  setSearch('')
                }}
                className={`w-full flex items-center space-x-2 p-2 text-left hover:bg-gray-100 ${getFieldColor(field.type)} border-0 rounded-none`}
              >
                <span className="text-sm">{getFieldIcon(field.type)}</span>
                <span className="text-sm font-medium flex-1">{field.name}</span>
                <Badge variant="outline" className="text-xs">
                  {field.type}
                </Badge>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Field Slot Component
interface FieldSlotProps {
  field?: FieldConfig
  onRemove?: () => void
  onClick?: () => void
  placeholder?: string
}

function FieldSlot({ field, onRemove, onClick, placeholder }: FieldSlotProps) {
  if (!field) {
    return (
      <button
        onClick={onClick}
        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm">{placeholder}</span>
      </button>
    )
  }

  return (
    <div className={`group relative flex items-center justify-between p-3 border rounded-lg transition-all duration-200 hover:shadow-sm ${getFieldColor(field.type)}`}>
      <button
        onClick={onClick}
        className="flex items-center space-x-2 min-w-0 flex-1 text-left"
      >
        <span className="text-sm">{getFieldIcon(field.type)}</span>
        <span className="text-sm font-medium truncate">{field.name}</span>
        <Badge variant="outline" className="text-xs ml-auto">
          {field.type}
        </Badge>
      </button>
      
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}


// Selected Fields Section
interface SelectedFieldsSectionProps {
  title: string
  fields: FieldConfig[]
  selectedFieldKeys: string[]
  onRemove: (fieldKey: string) => void
  onAddField: (field: FieldConfig) => void
  maxFields?: number
  fieldType: 'dimension' | 'metric'
}

function SelectedFieldsSection({
  title,
  fields,
  selectedFieldKeys,
  onRemove,
  onAddField,
  maxFields,
  fieldType
}: SelectedFieldsSectionProps) {
  const selectedFields = selectedFieldKeys
    .map(key => fields.find(f => f.key === key))
    .filter(Boolean) as FieldConfig[]

  const canAddMore = !maxFields || selectedFields.length < maxFields
  const availableFields = fields.filter(field => !selectedFieldKeys.includes(field.key))

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {maxFields && (
            <Badge variant="outline" className="text-xs">
              {selectedFields.length} / {maxFields}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {selectedFields.map((field) => (
          <FieldSlot
            key={field.key}
            field={field}
            onRemove={() => onRemove(field.key)}
          />
        ))}
        
        {canAddMore && (
          <FieldSelector
            fields={availableFields}
            selectedFields={selectedFieldKeys}
            onSelectField={onAddField}
            placeholder={`Add ${fieldType}`}
            maxSelections={maxFields}
          />
        )}
        
        {selectedFields.length === 0 && !canAddMore && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">No {fieldType}s available for this chart type</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function FieldConfigurationSection({
  chartType,
  config,
  availableFields,
  onChange
}: FieldConfigurationSectionProps) {
  // Chart type constraints
  const getChartConstraints = (type: string) => {
    switch (type) {
      case 'pie_chart':
      case 'donut_chart':
        return { maxDimensions: 1, maxMetrics: 1 }
      case 'metric_card':
        return { maxDimensions: 0, maxMetrics: 1 }
      case 'gauge_chart':
        return { maxDimensions: 0, maxMetrics: 1 }
      case 'scatter_chart':
        return { maxDimensions: 1, maxMetrics: 2 }
      case 'funnel_chart':
        return { maxDimensions: 1, maxMetrics: 1 }
      case 'heatmap':
        return { maxDimensions: 2, maxMetrics: 1 }
      default:
        return { maxDimensions: undefined, maxMetrics: undefined }
    }
  }

  const constraints = getChartConstraints(chartType)

  // Field management functions
  const addDimension = useCallback((field: FieldConfig) => {
    if (constraints.maxDimensions && config.dimensions.length >= constraints.maxDimensions) return
    if (!config.dimensions.includes(field.key)) {
      onChange({ dimensions: [...config.dimensions, field.key] })
    }
  }, [config.dimensions, constraints.maxDimensions, onChange])

  const addMetric = useCallback((field: FieldConfig) => {
    if (constraints.maxMetrics && config.metrics.length >= constraints.maxMetrics) return
    if (!config.metrics.includes(field.key)) {
      onChange({ metrics: [...config.metrics, field.key] })
    }
  }, [config.metrics, constraints.maxMetrics, onChange])

  const removeDimension = useCallback((fieldKey: string) => {
    onChange({ dimensions: config.dimensions.filter(d => d !== fieldKey) })
  }, [config.dimensions, onChange])

  const removeMetric = useCallback((fieldKey: string) => {
    onChange({ metrics: config.metrics.filter(m => m !== fieldKey) })
  }, [config.metrics, onChange])

  const allFields = [...availableFields.dimensions, ...availableFields.metrics]

  return (
    <div className="space-y-6">
      {/* Chart Type Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-800 font-medium">
              {chartType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Configuration
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            {constraints.maxDimensions !== undefined && `Max ${constraints.maxDimensions} dimension${constraints.maxDimensions !== 1 ? 's' : ''}`}
            {constraints.maxDimensions !== undefined && constraints.maxMetrics !== undefined && ' • '}
            {constraints.maxMetrics !== undefined && `Max ${constraints.maxMetrics} metric${constraints.maxMetrics !== 1 ? 's' : ''}`}
          </p>
        </CardContent>
      </Card>

      {/* Field Configuration */}
      <div className="grid gap-4">
        {/* Dimensions */}
        {constraints.maxDimensions !== 0 && (
          <SelectedFieldsSection
            title="Dimensions (Categories)"
            fields={allFields}
            selectedFieldKeys={config.dimensions}
            onRemove={removeDimension}
            onAddField={addDimension}
            maxFields={constraints.maxDimensions}
            fieldType="dimension"
          />
        )}

        {/* Metrics */}
        {constraints.maxMetrics !== 0 && (
          <SelectedFieldsSection
            title="Metrics (Values)"
            fields={allFields}
            selectedFieldKeys={config.metrics}
            onRemove={removeMetric}
            onAddField={addMetric}
            maxFields={constraints.maxMetrics}
            fieldType="metric"
          />
        )}
      </div>
    </div>
  )
}