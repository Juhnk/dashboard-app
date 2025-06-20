"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { widgetApi, dataSourceApi } from '@/lib/api-client'
import { useDashboardStore } from '@/stores'
import { useDataSourceStore } from '@/stores/data-source-store'
import { GoogleSheetsService, EnhancedSheetsData } from '@/lib/google-sheets'
import { DetectedField, DataColumnMapping } from '@/lib/marketing-data-analyzer'
import { DemoDataService } from '@/lib/demo-data-service'
import { MultiSourceChartBuilder } from './multi-source-chart-builder'

interface EnhancedWidgetConfigurationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  widgetType: string
  widget?: any
}

const WIDGET_TYPE_NAMES: Record<string, string> = {
  line_chart: 'Line Chart',
  bar_chart: 'Bar Chart',
  pie_chart: 'Pie Chart',
  donut_chart: 'Donut Chart',
  area_chart: 'Area Chart',
  scatter_chart: 'Scatter Plot',
  table: 'Data Table',
  metric_card: 'Metric Card',
  funnel_chart: 'Funnel Chart',
  heatmap: 'Heatmap',
  gauge_chart: 'Gauge Chart'
}

const WIDGET_ICONS: Record<string, string> = {
  line_chart: '📈',
  bar_chart: '📊',
  pie_chart: '🥧',
  donut_chart: '🍩',
  area_chart: '📉',
  scatter_chart: '⚪',
  table: '📋',
  metric_card: '💳',
  funnel_chart: '🔽',
  heatmap: '🔥',
  gauge_chart: '⏰'
}

export function EnhancedWidgetConfigurationModal({
  isOpen,
  onClose,
  onSuccess,
  widgetType,
  widget
}: EnhancedWidgetConfigurationModalProps) {
  const { currentDashboard, currentTabId, fetchDashboard } = useDashboardStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dataSources, setDataSources] = useState<any[]>([])
  
  // Enhanced data analysis
  const [enhancedData, setEnhancedData] = useState<EnhancedSheetsData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Form state
  const [name, setName] = useState('')
  const [selectedDataSource, setSelectedDataSource] = useState<string>('')
  const [selectedDimension, setSelectedDimension] = useState<string>('')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [config, setConfig] = useState<any>({})
  
  // Multi-source state
  const [showMultiSourceBuilder, setShowMultiSourceBuilder] = useState(false)
  const [useMultiSource, setUseMultiSource] = useState(false)
  const { demoSources, mergeSuggestions } = useDataSourceStore()

  // Position settings (for new widgets)
  const [position, setPosition] = useState({ x: 0, y: 0, width: 4, height: 3 })

  const isEdit = !!widget

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      if (isEdit) {
        setName(widget.name)
        setSelectedDataSource(widget.data_source_id || '')
        setConfig(widget.config || {})
        setPosition({
          x: widget.position_x,
          y: widget.position_y,
          width: widget.width,
          height: widget.height
        })
      } else {
        setName(`New ${WIDGET_TYPE_NAMES[widgetType] || 'Widget'}`)
        setSelectedDataSource('demo')
        setSelectedDimension('')
        setSelectedMetrics([])
        setConfig({})
        setPosition({ x: 0, y: 0, width: 4, height: 3 })
        
        // Auto-configure demo data for the widget type
        handleDataSourceChange('demo')
      }
      
      setError(null)
      setEnhancedData(null)
      loadDataSources()
    }
  }, [isOpen, isEdit, widget, widgetType])

  const loadDataSources = async () => {
    try {
      const response = await dataSourceApi.fetchDataSources()
      setDataSources(response.dataSources || [])
    } catch (err) {
      console.error('Failed to load data sources:', err)
    }
  }

  const analyzeDataSource = async (dataSourceId: string) => {
    if (!dataSourceId) {
      setEnhancedData(null)
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // Get data source details
      const dataSource = dataSources.find(ds => ds.id === dataSourceId)
      if (!dataSource || dataSource.source_type !== 'google_sheets') {
        throw new Error('Only Google Sheets data sources support smart analysis')
      }

      // Get enhanced analysis
      const response = await fetch(`/api/data-sources/${dataSourceId}/analyze`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Failed to analyze data source')
      }

      const analysisData = await response.json()
      setEnhancedData(analysisData)

      // Auto-select suggested dimension and metrics
      if (analysisData.columnMapping.dimensions.length > 0) {
        setSelectedDimension(analysisData.columnMapping.dimensions[0])
      }
      
      if (analysisData.columnMapping.metrics.length > 0) {
        setSelectedMetrics([analysisData.columnMapping.metrics[0]])
      }

    } catch (err: any) {
      setError(err.message || 'Failed to analyze data source')
      setEnhancedData(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDataSourceChange = (dataSourceId: string) => {
    setSelectedDataSource(dataSourceId)
    
    if (dataSourceId === 'demo') {
      // Handle demo data source
      const demoMetrics = DemoDataService.getAvailableMetrics()
      const demoDimensions = DemoDataService.getAvailableDimensions()
      
      setEnhancedData({
        data: [],
        schema: {},
        detectedFields: [
          ...demoMetrics.map(m => ({
            originalName: m.key,
            suggestedMetric: { id: m.key, name: m.name, category: 'other' as const, dataType: 'number' as const, description: m.name },
            confidence: 1.0,
            sampleValues: [],
            dataType: m.type as any
          })),
          ...demoDimensions.map(d => ({
            originalName: d.key,
            suggestedMetric: null,
            confidence: 1.0,
            sampleValues: [],
            dataType: d.type as any
          }))
        ],
        columnMapping: {
          dimensions: demoDimensions.map(d => d.key),
          metrics: demoMetrics.map(m => m.key),
          identifiers: []
        },
        suggestedCharts: DemoDataService.getSuggestedConfigurations().map(config => ({
          type: config.chartType,
          name: config.name,
          reason: config.description,
          confidence: 0.9
        }))
      })
      
      // Auto-select appropriate defaults for the widget type
      const suggestedConfig = DemoDataService.getSuggestedConfigurations()
        .find(config => config.chartType === widgetType)
      
      if (suggestedConfig) {
        setSelectedDimension(suggestedConfig.config.dimension || '')
        setSelectedMetrics(suggestedConfig.config.metrics || [])
      }
    } else if (dataSourceId === '') {
      // No data source selected
      setEnhancedData(null)
      setSelectedDimension('')
      setSelectedMetrics([])
    } else {
      // Regular data source - analyze it
      analyzeDataSource(dataSourceId)
    }
  }

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    )
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Widget name is required')
      return
    }

    if (!currentTabId) {
      setError('No active tab selected')
      return
    }

    if ((selectedDataSource && selectedDataSource !== 'demo') && (!selectedDimension || selectedMetrics.length === 0)) {
      setError('Please select dimension and at least one metric for data visualization')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Build chart configuration based on selections
      const chartConfig: any = {
        dataSource: selectedDataSource,
        dimension: selectedDimension,
        metrics: selectedMetrics,
        chartType: widgetType
      }
      
      // Handle multi-source configuration
      if (selectedDataSource === 'multi-source' && useMultiSource) {
        // Use the multi-source config directly
        Object.assign(chartConfig, config)
      } else if (selectedDataSource === 'demo') {
        // Handle demo data configuration
        const demoConfig = DemoDataService.getDemoDataForChart({
          chartType: widgetType,
          dimension: selectedDimension,
          metrics: selectedMetrics
        })
        
        Object.assign(chartConfig, {
          isDemoData: true,
          data: demoConfig.data,
          ...demoConfig.config
        })
      }

      // Add type-specific configurations
      if (widgetType === 'line_chart') {
        chartConfig.xAxisKey = selectedDimension
        chartConfig.lines = selectedMetrics.map((metric, index) => ({
          key: metric,
          name: metric,
          color: `var(--color-chart-${(index % 12) + 1})`
        }))
      } else if (widgetType === 'bar_chart') {
        chartConfig.xAxisKey = selectedDimension
        chartConfig.bars = selectedMetrics.map((metric, index) => ({
          key: metric,
          name: metric,
          color: `var(--color-chart-${(index % 12) + 1})`
        }))
      } else if (widgetType === 'pie_chart' || widgetType === 'donut_chart') {
        chartConfig.dataKey = selectedMetrics[0]
        chartConfig.nameKey = selectedDimension
      }

      if (isEdit) {
        // Update existing widget
        await widgetApi.updateWidget(widget.id, {
          name: name.trim(),
          widget_type: widgetType,
          position_x: position.x,
          position_y: position.y,
          width: position.width,
          height: position.height,
          config: chartConfig,
          data_source_id: (selectedDataSource === 'demo' || selectedDataSource === 'multi-source') ? undefined : selectedDataSource || undefined
        })
      } else {
        // Create new widget
        await widgetApi.createWidget({
          tab_id: currentTabId,
          name: name.trim(),
          widget_type: widgetType,
          position_x: position.x,
          position_y: position.y,
          width: position.width,
          height: position.height,
          config: chartConfig,
          data_source_id: (selectedDataSource === 'demo' || selectedDataSource === 'multi-source') ? undefined : selectedDataSource || undefined
        })
      }

      // Refresh dashboard to get the new widget
      if (currentDashboard) {
        await fetchDashboard(currentDashboard.id)
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save widget')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setSelectedDataSource('')
    setSelectedDimension('')
    setSelectedMetrics([])
    setConfig({})
    setError(null)
    setEnhancedData(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{WIDGET_ICONS[widgetType]}</span>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEdit ? 'Edit' : 'Add'} {WIDGET_TYPE_NAMES[widgetType]}
                </h2>
                <p className="text-sm text-gray-500">
                  Configure your widget with intelligent data mapping
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Widget Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Widget Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Enter widget name"
              />
            </div>

            {/* Data Source Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Source
              </label>
              <select
                value={selectedDataSource}
                onChange={(e) => handleDataSourceChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">No data source</option>
                <option value="demo">📊 Demo Marketing Data (90 days)</option>
                {dataSources.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.name} ({ds.source_type})
                  </option>
                ))}
              </select>
              
              {/* Multi-Source Option */}
              {demoSources.length > 1 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">🚀 Advanced Multi-Source Analytics</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Combine data from {demoSources.length} sources with intelligent merging
                        {mergeSuggestions.length > 0 && ` • ${mergeSuggestions.length} merge opportunities detected`}
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowMultiSourceBuilder(true)}
                      size="sm"
                      variant="secondary"
                      className="text-blue-800 border-blue-300 hover:bg-blue-100"
                    >
                      Multi-Source Builder
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Smart Analysis Results */}
            {isAnalyzing && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-blue-800">Analyzing data structure...</p>
                </div>
              </div>
            )}

            {enhancedData && (
              <div className="space-y-4">
                {/* Chart Suggestions */}
                {enhancedData.suggestedCharts.length > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-sm font-medium text-green-800 mb-2">
                      💡 Smart Suggestions
                    </h4>
                    <div className="space-y-1">
                      {enhancedData.suggestedCharts.slice(0, 3).map((suggestion, index) => (
                        <p key={index} className="text-sm text-green-700">
                          <span className="font-medium">{suggestion.name}</span>: {suggestion.reason}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dimension Selection */}
                {enhancedData.columnMapping.dimensions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dimension (X-axis / Grouping)
                    </label>
                    <select
                      value={selectedDimension}
                      onChange={(e) => setSelectedDimension(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="">Select dimension...</option>
                      {enhancedData.columnMapping.dimensions.map((dim) => (
                        <option key={dim} value={dim}>
                          {dim}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Metrics Selection */}
                {enhancedData.columnMapping.metrics.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Metrics (Y-axis / Values)
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                      {enhancedData.columnMapping.metrics.map((metric) => {
                        const detectedField = enhancedData.detectedFields.find(f => f.originalName === metric)
                        return (
                          <label key={metric} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedMetrics.includes(metric)}
                              onChange={() => handleMetricToggle(metric)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-900">{metric}</span>
                            {detectedField?.suggestedMetric && (
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                {detectedField.suggestedMetric.name}
                              </span>
                            )}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Detected Fields Summary */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Data Analysis</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Dimensions:</span> {enhancedData.columnMapping.dimensions.length}
                    </div>
                    <div>
                      <span className="font-medium">Metrics:</span> {enhancedData.columnMapping.metrics.length}
                    </div>
                    <div>
                      <span className="font-medium">Identifiers:</span> {enhancedData.columnMapping.identifiers.length}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Widget Size Settings (for new widgets) */}
            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Widget Size
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Width (columns)</label>
                    <select
                      value={position.width}
                      onChange={(e) => setPosition({ ...position, width: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {[2, 3, 4, 5, 6, 8, 12].map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Height (rows)</label>
                    <select
                      value={position.height}
                      onChange={(e) => setPosition({ ...position, height: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      {[2, 3, 4, 5, 6, 8].map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-200">
            <Button
              onClick={handleClose}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !name.trim() || isAnalyzing}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : isEdit ? 'Update Widget' : 'Add Widget'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Multi-Source Chart Builder Modal */}
      <MultiSourceChartBuilder
        isOpen={showMultiSourceBuilder}
        onClose={() => setShowMultiSourceBuilder(false)}
        onSave={(multiSourceConfig) => {
          // Convert multi-source config to regular widget config
          setName(multiSourceConfig.title)
          setUseMultiSource(true)
          setConfig(multiSourceConfig)
          setSelectedDataSource('multi-source')
          setShowMultiSourceBuilder(false)
          
          // Set the dimensions and metrics from multi-source config
          if (multiSourceConfig.dimensions.length > 0) {
            setSelectedDimension(multiSourceConfig.dimensions[0])
          }
          setSelectedMetrics(multiSourceConfig.metrics)
        }}
        widgetType={widgetType}
        initialConfig={useMultiSource ? config : undefined}
      />
    </div>
  )
}