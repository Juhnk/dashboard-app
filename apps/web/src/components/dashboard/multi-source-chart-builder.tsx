"use client"

import { useState, useEffect, useMemo } from 'react'
import { useDataSourceStore } from '@/stores/data-source-store'
import { SemanticMergeEngine, MergedDataQuery, MergedDataResult } from '@/lib/semantic-merge-engine'
import { DemoDataSource } from '@/lib/multi-source-demo-data'
import { ChartWrapper } from '@/components/charts'
import { Button } from '@/components/ui/Button'

interface MultiSourceChartBuilderProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: any) => void
  widgetType: string
  initialConfig?: any
}

interface ChartConfig {
  title: string
  selectedSources: string[]
  dimensions: string[]
  metrics: string[]
  mergedColumns: Record<string, string> // merged name -> original names
  filters: Array<{
    column: string
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'in'
    value: any
  }>
  dateRange?: {
    start: string
    end: string
  }
  chartType: string
}

export function MultiSourceChartBuilder({ 
  isOpen, 
  onClose, 
  onSave, 
  widgetType, 
  initialConfig 
}: MultiSourceChartBuilderProps) {
  const { 
    demoSources, 
    mergeSuggestions, 
    mergeRules,
    addMergeRule 
  } = useDataSourceStore()

  const [config, setConfig] = useState<ChartConfig>({
    title: `New ${widgetType.replace('_', ' ')} Chart`,
    selectedSources: [],
    dimensions: [],
    metrics: [],
    mergedColumns: {},
    filters: [],
    chartType: widgetType
  })

  const [previewData, setPreviewData] = useState<MergedDataResult | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [showMergeSuggestions, setShowMergeSuggestions] = useState(false)
  const [activeTab, setActiveTab] = useState<'sources' | 'columns' | 'filters' | 'preview'>('sources')

  // Initialize config from props
  useEffect(() => {
    if (initialConfig) {
      setConfig(prev => ({ ...prev, ...initialConfig }))
    }
  }, [initialConfig])

  // Auto-generate preview when config changes
  useEffect(() => {
    if (config.selectedSources.length > 0 && (config.dimensions.length > 0 || config.metrics.length > 0)) {
      generatePreview()
    } else {
      setPreviewData(null)
    }
  }, [config])

  // Get available columns from selected sources
  const availableColumns = useMemo(() => {
    const columns = new Map<string, {
      name: string
      displayName: string
      type: string
      classification: 'dimension' | 'metric' | 'identifier'
      sources: Array<{ sourceId: string; sourceName: string; columnName: string }>
    }>()

    // Collect all columns from selected sources
    config.selectedSources.forEach(sourceId => {
      const source = demoSources.find(s => s.id === sourceId)
      if (source) {
        source.schema.forEach(column => {
          const key = column.name
          if (!columns.has(key)) {
            columns.set(key, {
              name: column.name,
              displayName: column.displayName,
              type: column.type,
              classification: column.classification,
              sources: []
            })
          }
          columns.get(key)!.sources.push({
            sourceId: source.id,
            sourceName: source.name,
            columnName: column.name
          })
        })
      }
    })

    // Add merged columns from active merge rules
    mergeRules.forEach(rule => {
      if (rule.sourceColumns.some(sc => config.selectedSources.includes(sc.sourceId))) {
        columns.set(rule.mergedName, {
          name: rule.mergedName,
          displayName: rule.displayName,
          type: 'number', // Merged columns are typically metrics
          classification: rule.classification,
          sources: rule.sourceColumns
            .filter(sc => config.selectedSources.includes(sc.sourceId))
            .map(sc => {
              const source = demoSources.find(s => s.id === sc.sourceId)
              return {
                sourceId: sc.sourceId,
                sourceName: source?.name || 'Unknown',
                columnName: sc.columnName
              }
            })
        })
      }
    })

    return Array.from(columns.values())
  }, [config.selectedSources, demoSources, mergeRules])

  const dimensions = useMemo(() => 
    availableColumns.filter(col => col.classification === 'dimension'),
    [availableColumns]
  )

  const metrics = useMemo(() => 
    availableColumns.filter(col => col.classification === 'metric'),
    [availableColumns]
  )

  // Get relevant merge suggestions for selected sources
  const relevantSuggestions = useMemo(() => {
    return mergeSuggestions.filter(suggestion => 
      suggestion.columns.every(col => config.selectedSources.includes(col.sourceId))
    )
  }, [mergeSuggestions, config.selectedSources])

  const generatePreview = async () => {
    if (config.selectedSources.length === 0) return

    setIsLoadingPreview(true)
    try {
      const query: MergedDataQuery = {
        sources: config.selectedSources,
        dimensions: config.dimensions,
        metrics: config.metrics,
        filters: config.filters,
        dateRange: config.dateRange,
        limit: 100 // Limit for preview
      }

      const result = await SemanticMergeEngine.executeQuery(query, demoSources)
      setPreviewData(result)
    } catch (error) {
      console.error('Failed to generate preview:', error)
      setPreviewData(null)
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const handleSourceToggle = (sourceId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedSources: prev.selectedSources.includes(sourceId)
        ? prev.selectedSources.filter(id => id !== sourceId)
        : [...prev.selectedSources, sourceId],
      // Reset columns when sources change
      dimensions: [],
      metrics: []
    }))
  }

  const handleDimensionToggle = (columnName: string) => {
    setConfig(prev => ({
      ...prev,
      dimensions: prev.dimensions.includes(columnName)
        ? prev.dimensions.filter(name => name !== columnName)
        : [...prev.dimensions, columnName]
    }))
  }

  const handleMetricToggle = (columnName: string) => {
    setConfig(prev => ({
      ...prev,
      metrics: prev.metrics.includes(columnName)
        ? prev.metrics.filter(name => name !== columnName)
        : [...prev.metrics, columnName]
    }))
  }

  const handleCreateMerge = async (suggestion: any, aggregationType: 'sum' | 'avg' | 'max' | 'min' | 'first') => {
    const mergeRule = SemanticMergeEngine.createMergeRule(
      suggestion.canonicalName,
      suggestion.displayName,
      suggestion.columns.map((col: any) => ({
        sourceId: col.sourceId,
        columnName: col.columnName
      })),
      aggregationType
    )

    addMergeRule(mergeRule)
    setShowMergeSuggestions(false)
  }

  const handleSave = () => {
    const chartConfig = {
      title: config.title,
      multiSource: true,
      sources: config.selectedSources,
      dimensions: config.dimensions,
      metrics: config.metrics,
      filters: config.filters,
      dateRange: config.dateRange,
      chartType: config.chartType,
      data: previewData?.data || [],
      mergeRulesUsed: previewData?.metadata.mergeRulesApplied || []
    }

    onSave(chartConfig)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Multi-Source Chart Builder</h2>
              <p className="text-sm text-gray-500 mt-1">
                Create intelligent charts that merge data across multiple sources
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chart Title */}
          <div className="mt-4">
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
              className="text-lg font-medium w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Enter chart title"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'sources', label: 'Data Sources', icon: '🗂️' },
              { id: 'columns', label: 'Dimensions & Metrics', icon: '📊' },
              { id: 'filters', label: 'Filters', icon: '🔍' },
              { id: 'preview', label: 'Preview', icon: '👁️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            
            {/* Sources Tab */}
            {activeTab === 'sources' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select Data Sources</h3>
                  <p className="text-sm text-gray-600">
                    Choose multiple sources to create a unified view of your data
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {demoSources.map((source) => (
                    <div
                      key={source.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        config.selectedSources.includes(source.id)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSourceToggle(source.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{source.name}</h4>
                        <div className={`w-2 h-2 rounded-full ${
                          source.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{source.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{source.schema.length} columns</span>
                        <span>{source.data.length} rows</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Merge Suggestions */}
                {relevantSuggestions.length > 0 && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Merge Suggestions</h3>
                      <button
                        onClick={() => setShowMergeSuggestions(!showMergeSuggestions)}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        {showMergeSuggestions ? 'Hide' : 'Show'} Suggestions
                      </button>
                    </div>

                    {showMergeSuggestions && (
                      <div className="space-y-3">
                        {relevantSuggestions.map((suggestion, index) => (
                          <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-blue-900">{suggestion.displayName}</h4>
                              <span className="text-sm text-blue-700 font-medium">
                                {Math.round(suggestion.confidence * 100)}% confidence
                              </span>
                            </div>
                            <p className="text-sm text-blue-800 mb-3">{suggestion.reason}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {suggestion.columns.map((col, colIndex) => (
                                <span
                                  key={colIndex}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-white text-blue-800 border border-blue-200"
                                >
                                  {col.sourceName}: {col.columnName}
                                </span>
                              ))}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleCreateMerge(suggestion, 'sum')}
                                size="sm"
                                variant="secondary"
                              >
                                Merge (Sum)
                              </Button>
                              <Button
                                onClick={() => handleCreateMerge(suggestion, 'avg')}
                                size="sm"
                                variant="secondary"
                              >
                                Merge (Average)
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Columns Tab */}
            {activeTab === 'columns' && (
              <div>
                {config.selectedSources.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">Please select data sources first</div>
                    <Button onClick={() => setActiveTab('sources')} variant="secondary">
                      Go to Sources
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Dimensions */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Dimensions <span className="text-sm text-gray-500">(Group by)</span>
                      </h3>
                      <div className="space-y-2">
                        {dimensions.map((column) => (
                          <div
                            key={column.name}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              config.dimensions.includes(column.name)
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleDimensionToggle(column.name)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{column.displayName}</h4>
                                <p className="text-sm text-gray-600 font-mono">{column.name}</p>
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                column.type === 'date' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {column.type}
                              </span>
                            </div>
                            {column.sources.length > 1 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {column.sources.map((source, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                                  >
                                    {source.sourceName}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Metrics <span className="text-sm text-gray-500">(Measure)</span>
                      </h3>
                      <div className="space-y-2">
                        {metrics.map((column) => (
                          <div
                            key={column.name}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              config.metrics.includes(column.name)
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleMetricToggle(column.name)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{column.displayName}</h4>
                                <p className="text-sm text-gray-600 font-mono">{column.name}</p>
                              </div>
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {column.type}
                              </span>
                            </div>
                            {column.sources.length > 1 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {column.sources.map((source, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                                  >
                                    {source.sourceName}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Filters Tab */}
            {activeTab === 'filters' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Add filters to refine your data before visualization
                </p>
                
                {/* Date Range Filter */}
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Date Range</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={config.dateRange?.start || ''}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          dateRange: {
                            start: e.target.value,
                            end: prev.dateRange?.end || ''
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={config.dateRange?.end || ''}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          dateRange: {
                            start: prev.dateRange?.start || '',
                            end: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Filters Placeholder */}
                <div className="text-center py-8 text-gray-500">
                  Additional filter options coming soon...
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chart Preview</h3>
                  {previewData && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{previewData.metadata.totalRows} rows</span>
                      <span>•</span>
                      <span>{previewData.metadata.sourcesUsed.length} sources</span>
                      <span>•</span>
                      <span>{previewData.metadata.mergeRulesApplied.length} merge rules</span>
                      <span>•</span>
                      <span>{previewData.metadata.queryExecutionTime}ms execution</span>
                    </div>
                  )}
                </div>

                {isLoadingPreview ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Generating preview...</p>
                    </div>
                  </div>
                ) : previewData ? (
                  <div className="h-96 border border-gray-200 rounded-lg p-4">
                    <ChartWrapper
                      type={config.chartType}
                      data={previewData.data}
                      config={{
                        dimension: config.dimensions[0],
                        metrics: config.metrics,
                        xAxisKey: config.dimensions[0],
                        title: config.title
                      }}
                      className="h-full"
                    />
                  </div>
                ) : (
                  <div className="h-96 flex items-center justify-center border border-gray-200 rounded-lg">
                    <div className="text-center">
                      <div className="text-gray-500 mb-2">Configure your chart to see preview</div>
                      <p className="text-sm text-gray-400">
                        Select sources, dimensions, and metrics to generate a preview
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {config.selectedSources.length} sources • {config.dimensions.length} dimensions • {config.metrics.length} metrics
            </div>
            <div className="flex space-x-3">
              <Button onClick={onClose} variant="secondary">
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={config.selectedSources.length === 0 || (config.dimensions.length === 0 && config.metrics.length === 0)}
              >
                Save Chart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}