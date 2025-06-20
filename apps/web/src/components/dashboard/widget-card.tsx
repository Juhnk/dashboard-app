"use client"

import { useState } from 'react'
import { useDashboardStore, useUIStore } from '@/stores'
import { ChartWrapper } from '@/components/charts'
import { useDataSourceQuery } from '@/hooks/useDataSourceQuery'
import { DemoDataService } from '@/lib/demo-data-service'
import { QueryEnabledDataTable } from '../charts/query-enabled-data-table'

interface WidgetCardProps {
  widget: any
}

export function WidgetCard({ widget }: WidgetCardProps) {
  const { deleteWidget } = useDashboardStore()
  const { 
    showToast, 
    selectedWidgetId, 
    editingPanelOpen,
    selectWidget
  } = useUIStore()
  const [showActions, setShowActions] = useState(false)

  const isSelected = selectedWidgetId === widget.id
  const isEditing = isSelected && editingPanelOpen

  // Fetch real data from the connected data source, but disable if it's a table widget
  // The QueryEnabledDataTable will handle its own data fetching.
  const { data: fetchedData, isLoading, error } = useDataSourceQuery(widget, {
    enabled: widget.widget_type !== 'table',
  })
  
  // Generate demo data for this widget type if no real data source is connected
  const getDemoData = () => {
    // Check if this is a multi-source widget with pre-computed data
    if (widget.config?.multiSource && widget.config?.data) {
      return widget.config.data
    }
    
    if (widget.config?.isDemoData && widget.config?.data) {
      return widget.config.data
    }
    
    // Generate fresh demo data using the service
    const demoConfig = DemoDataService.getDemoDataForChart({
      chartType: widget.widget_type,
      dimension: widget.config?.dimension || undefined,
      metrics: widget.config?.metrics || undefined
    })
    
    return demoConfig.data
  }
  
  // Use demo data when no data source is connected, otherwise use fetched data
  const data = fetchedData ?? getDemoData()
  const isUsingDemoData = !fetchedData
  const isMultiSource = widget.config?.multiSource

  const handleDelete = () => {
    deleteWidget(widget.id)
    showToast({
      type: 'success',
      title: 'Widget deleted',
      message: `${widget.name} has been removed from the dashboard.`
    })
  }


  const getWidgetIcon = (type: string) => {
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

  const getWidgetTypeName = (type: string) => {
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
    <div className={`widget-card-container h-full relative ${isSelected ? 'is-selected' : ''}`}>
      <div 
        className={`
          widget-card h-full bg-white rounded-lg shadow-widget overflow-hidden transition-all duration-200 flex flex-col
          ${isEditing 
            ? 'border-2 border-blue-500 shadow-lg shadow-blue-100' 
            : 'border border-gray-200 hover:shadow-widget-hover hover:border-gray-300'
          }
        `}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Widget Header */}
        <div className="widget-header p-4 border-b border-gray-100 relative flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <span className="text-lg">{getWidgetIcon(widget.widget_type)}</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-gray-900 truncate">{widget.name}</h3>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-500">{getWidgetTypeName(widget.widget_type)}</p>
                  {isUsingDemoData && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      isMultiSource 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isMultiSource ? '🔗 Multi-Source' : 'Demo Data'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {(showActions || isSelected) && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    selectWidget(widget.id, 'data')
                  }}
                  className={`
                    p-1 rounded transition-colors
                    ${isEditing 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'hover:bg-gray-100 text-gray-500'
                    }
                  `}
                  title="Edit widget"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                  }}
                  className="p-1 rounded hover:bg-red-50 text-red-500"
                  title="Delete widget"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Widget Content */}
        <div className="widget-content flex-1 p-4 min-h-0">
          {isLoading && widget.data_source_id && widget.widget_type !== 'table' ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading data...</p>
              </div>
            </div>
          ) : error && widget.data_source_id && widget.widget_type !== 'table' ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-red-600 mb-1">Data Error</p>
                <p className="text-xs text-gray-500 mb-3">{error.message}</p>
                <p className="text-xs text-gray-500 mb-2">Showing demo data instead</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    selectWidget(widget.id, 'data')
                  }}
                  className="text-xs text-primary-600 hover:text-primary-700 underline"
                >
                  Fix data connection
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full relative">
              {widget.widget_type === 'table' ? (
                <QueryEnabledDataTable widgetConfig={widget} />
              ) : (
                <ChartWrapper
                  type={widget.widget_type}
                  data={data}
                  config={widget.config}
                  className="h-full"
                  widgetId={widget.id}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editing Mode Indicator */}
      {isEditing && (
        <div className="absolute top-2 left-2 z-10">
          <div className="flex items-center space-x-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Editing</span>
          </div>
        </div>
      )}
    </div>
  )
}