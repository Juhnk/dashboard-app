"use client"

import { useState, useEffect, useCallback } from 'react'
import { useDashboardStore, useUIStore } from '@/stores'
import { ChartEditingConfig, FilterConfig, SortConfig, StyleConfig } from '@/stores/ui-store'
import { DemoDataService } from '@/lib/demo-data-service'
import { widgetApi } from '@/lib/api-client'
import { useDataSourceQuery } from '@/hooks/useDataSourceQuery'
import { debounce } from 'lodash-es'

// UI Components
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Sub-components (to be created)
import { FieldConfigurationSection } from './field-configuration-section'
import { FilterSection } from './filter-section'
import { StyleSection } from './style-section'

interface ChartEditingPanelProps {
  className?: string
}

export function ChartEditingPanel({ className }: ChartEditingPanelProps) {
  const {
    selectedWidgetId,
    editingPanelOpen,
    editingMode,
    tempWidgetConfig,
    pendingChanges,
    closeEditingPanel,
    setEditingMode,
    setTempWidgetConfig,
    setPendingChanges,
    resetTempConfig,
    showToast
  } = useUIStore()

  const {
    widgets,
    updateWidget,
    fetchDashboard,
    currentDashboard
  } = useDashboardStore()

  const [isLoading, setIsLoading] = useState(false)
  const [availableFields, setAvailableFields] = useState<{
    dimensions: Array<{ key: string; name: string; type: string }>
    metrics: Array<{ key: string; name: string; type: string }>
  }>({ dimensions: [], metrics: [] })

  // Get the selected widget
  const selectedWidget = widgets.find(w => w.id === selectedWidgetId)

  // Initialize temp config when widget changes
  useEffect(() => {
    if (selectedWidget && editingPanelOpen) {
      const currentConfig = selectedWidget.config || {}
      
      const initialConfig: ChartEditingConfig = {
        chartType: selectedWidget.widget_type,
        dimensions: currentConfig.dimensions || [currentConfig.dimension].filter(Boolean),
        metrics: currentConfig.metrics || [currentConfig.dataKey, currentConfig.yAxisKey].filter(Boolean),
        filters: currentConfig.filters || [],
        sorting: currentConfig.sorting || [],
        style: {
          colors: currentConfig.colors || [],
          showLegend: currentConfig.showLegend ?? true,
          showGrid: currentConfig.showGrid ?? true,
          legendPosition: currentConfig.legendPosition || 'bottom',
          axisLabels: currentConfig.axisLabels || {}
        }
      }
      
      setTempWidgetConfig(initialConfig)
      loadAvailableFields(selectedWidget)
    }
  }, [selectedWidget, editingPanelOpen, setTempWidgetConfig])

  // Load available fields from data source or demo data
  const loadAvailableFields = useCallback(async (widget: any) => {
    try {
      if (widget.data_source_id) {
        // Load from real data source
        // TODO: Implement data source field detection
        setAvailableFields({
          dimensions: [
            { key: 'date', name: 'Date', type: 'date' },
            { key: 'channel', name: 'Channel', type: 'string' },
            { key: 'campaign', name: 'Campaign', type: 'string' }
          ],
          metrics: [
            { key: 'impressions', name: 'Impressions', type: 'number' },
            { key: 'clicks', name: 'Clicks', type: 'number' },
            { key: 'cost', name: 'Cost', type: 'currency' },
            { key: 'conversions', name: 'Conversions', type: 'number' },
            { key: 'revenue', name: 'Revenue', type: 'currency' },
            { key: 'ctr', name: 'CTR (%)', type: 'percentage' }
          ]
        })
      } else {
        // Load from demo data service
        const demoFields = DemoDataService.getAvailableFields()
        setAvailableFields({
          dimensions: demoFields.dimensions.map(d => ({
            key: d.key,
            name: d.name,
            type: d.type
          })),
          metrics: demoFields.metrics.map(m => ({
            key: m.key,
            name: m.name,
            type: m.type
          }))
        })
      }
    } catch (error) {
      console.error('Error loading available fields:', error)
    }
  }, [])

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (config: ChartEditingConfig) => {
      if (!selectedWidget) return

      setIsLoading(true)
      try {
        // Convert config back to widget format
        const updatedConfig = {
          ...selectedWidget.config,
          chartType: config.chartType,
          dimensions: config.dimensions,
          metrics: config.metrics,
          filters: config.filters,
          sorting: config.sorting,
          ...config.style,
          
          // Backwards compatibility
          dimension: config.dimensions[0],
          dataKey: config.metrics[0],
          xAxisKey: config.dimensions[0],
          yAxisKey: config.metrics[0]
        }

        await widgetApi.updateWidget(selectedWidget.id, {
          config: updatedConfig
        })

        // Refresh dashboard to get updated widget
        if (currentDashboard) {
          await fetchDashboard(currentDashboard.id)
        }

        setPendingChanges(false)
        
        showToast({
          type: 'success',
          title: 'Chart updated',
          message: 'Your changes have been saved successfully.'
        })
      } catch (error) {
        console.error('Error saving widget config:', error)
        showToast({
          type: 'error',
          title: 'Save failed',
          message: 'Failed to save changes. Please try again.'
        })
      } finally {
        setIsLoading(false)
      }
    }, 1000),
    [selectedWidget, currentDashboard, fetchDashboard, setPendingChanges, showToast]
  )

  // Handle config changes with real-time updates
  const handleConfigChange = useCallback((newConfig: Partial<ChartEditingConfig>) => {
    if (!tempWidgetConfig) return

    const updatedConfig = { ...tempWidgetConfig, ...newConfig }
    setTempWidgetConfig(updatedConfig)
    
    // Trigger debounced save
    debouncedSave(updatedConfig)
  }, [tempWidgetConfig, setTempWidgetConfig, debouncedSave])

  // Handle manual save
  const handleSave = async () => {
    if (!tempWidgetConfig || !selectedWidget) return
    
    setIsLoading(true)
    try {
      await debouncedSave.flush() // Force immediate save
    } finally {
      setIsLoading(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    resetTempConfig()
    closeEditingPanel()
  }

  // Don't render if panel is not open or no widget is selected or widget not found
  if (!editingPanelOpen || !selectedWidgetId || !selectedWidget) {
    return null
  }

  // Don't render if tempWidgetConfig hasn't been initialized yet
  if (!tempWidgetConfig) {
    return null
  }

  const getChartTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
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
    return icons[type] || '📊'
  }

  const getChartTypeName = (type: string) => {
    const names: Record<string, string> = {
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
    return names[type] || type
  }

  return (
    <div className={`fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col ${className || ''}`}>
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getChartTypeIcon(selectedWidget.widget_type)}</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Edit Chart</h2>
              <p className="text-sm text-gray-500">
                {selectedWidget.name} • {getChartTypeName(selectedWidget.widget_type)}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center space-x-2 mt-3">
          {pendingChanges && (
            <Badge variant="secondary" className="text-xs">
              {isLoading ? 'Saving...' : 'Unsaved changes'}
            </Badge>
          )}
          {selectedWidget.data_source_id ? (
            <Badge variant="outline" className="text-xs">
              Connected to data source
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
              Demo data
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={editingMode} onValueChange={(value) => setEditingMode(value as any)} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto p-4">
            <TabsContent value="data" className="mt-0 space-y-4">
              <FieldConfigurationSection
                chartType={tempWidgetConfig.chartType}
                config={tempWidgetConfig}
                availableFields={availableFields}
                onChange={(updates) => handleConfigChange(updates)}
              />
            </TabsContent>
            
            <TabsContent value="style" className="mt-0 space-y-4">
              <StyleSection
                chartType={tempWidgetConfig.chartType}
                styleConfig={tempWidgetConfig.style}
                onChange={(style) => handleConfigChange({ style })}
              />
            </TabsContent>
            
            <TabsContent value="filters" className="mt-0 space-y-4">
              <FilterSection
                filters={tempWidgetConfig.filters}
                availableFields={availableFields}
                onChange={(filters) => handleConfigChange({ filters })}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <div className="flex items-center space-x-2">
            {pendingChanges && (
              <Button
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Now'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}