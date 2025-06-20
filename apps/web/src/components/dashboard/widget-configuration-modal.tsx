"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { widgetApi, dataSourceApi } from '@/lib/api-client'
import { useDashboardStore } from '@/stores'
import { DEMO_DATA, DEMO_CHART_CONFIGS } from '@/lib/demo-data'

interface WidgetConfigurationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  widgetType: string
  widget?: any // For editing existing widgets
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

export function WidgetConfigurationModal({
  isOpen,
  onClose,
  onSuccess,
  widgetType,
  widget
}: WidgetConfigurationModalProps) {
  const { currentDashboard, currentTabId, addWidget, fetchDashboard } = useDashboardStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dataSources, setDataSources] = useState<any[]>([])
  
  // Form state
  const [name, setName] = useState('')
  const [selectedDataSource, setSelectedDataSource] = useState<string>('')
  const [config, setConfig] = useState<any>({})

  // Default position settings (for new widgets) - removed UI controls
  const defaultPosition = { x: 0, y: 0, width: 4, height: 3 }

  const isEdit = !!widget

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      if (isEdit) {
        setName(widget.name)
        setSelectedDataSource(widget.data_source_id || '')
        setConfig(widget.config || {})
      } else {
        setName(`New ${WIDGET_TYPE_NAMES[widgetType] || 'Widget'}`)
        setSelectedDataSource('')
        setConfig({})
      }
      
      setError(null)
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

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Widget name is required')
      return
    }

    if (!currentTabId) {
      setError('No active tab selected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (isEdit) {
        // TODO: Implement widget update API
        console.log('Update widget functionality not yet implemented')
        setError('Widget editing is not yet implemented')
        return
      } else {
        let widgetConfig = config

        // Handle demo data configuration
        if (!selectedDataSource) {
          // Use demo data with chart-specific configuration
          const demoConfig = DEMO_CHART_CONFIGS[widgetType as keyof typeof DEMO_CHART_CONFIGS]
          if (demoConfig) {
            widgetConfig = {
              ...config,
              ...demoConfig,
              isDemoData: true
            }
          } else {
            // Fallback demo configuration
            widgetConfig = {
              ...config,
              data: DEMO_DATA.slice(0, 50), // First 50 rows for general use
              isDemoData: true
            }
          }
        }

        // Create new widget
        await widgetApi.createWidget({
          tab_id: currentTabId,
          name: name.trim(),
          widget_type: widgetType,
          position_x: defaultPosition.x,
          position_y: defaultPosition.y,
          width: defaultPosition.width,
          height: defaultPosition.height,
          config: widgetConfig,
          data_source_id: selectedDataSource || 'demo' // Use 'demo' identifier for demo data
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
    setConfig({})
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{WIDGET_ICONS[widgetType]}</span>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEdit ? 'Edit' : 'Add'} {WIDGET_TYPE_NAMES[widgetType]}
                </h2>
                <p className="text-sm text-gray-500">
                  Configure your widget settings and data source
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

          <div className="space-y-4">
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
                onChange={(e) => setSelectedDataSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">No data source (demo data)</option>
                {dataSources.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.name} ({ds.source_type})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select a data source to connect real data to this widget
              </p>
            </div>

            {/* Chart Configuration (basic for now) */}
            {selectedDataSource && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chart Configuration
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Advanced chart configuration options will be available soon.
                    For now, the widget will use default settings with your selected data source.
                  </p>
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
              disabled={isLoading || !name.trim()}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : isEdit ? 'Update Widget' : 'Add Widget'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}