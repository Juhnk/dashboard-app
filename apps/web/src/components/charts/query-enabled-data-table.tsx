"use client"

import React from 'react'
import { useDataSourceQuery } from '@/hooks/useDataSourceQuery'
import { ChartProps } from './types'

/**
 * QueryEnabledDataTable - Elite Data Table with TanStack Query Integration
 * 
 * This component demonstrates the power of our sophisticated data management system:
 * 
 * 1. Intelligent Caching: Data is cached for 5 minutes, preventing redundant API calls
 * 2. Background Updates: Automatic refetching when data becomes stale
 * 3. Loading States: Sophisticated loading, error, and empty state handling
 * 4. Observable State: Complete visibility through TanStack Query devtools
 * 5. Performance Optimization: Structural sharing and selective re-renders
 * 6. Error Resilience: Smart retry logic with exponential backoff
 * 
 * This is the template for all future chart components - showcasing how to build
 * sophisticated, observable, and performant data visualization components.
 */

interface QueryEnabledDataTableProps extends ChartProps {
  // Widget configuration for data fetching
  widgetConfig: {
    id: string
    name?: string
    dataSourceId?: string
    queryConfig?: {
      metrics?: string[]
      dimensions?: string[]
      filters?: Record<string, any>
      limit?: number
      orderBy?: string
      orderDirection?: 'asc' | 'desc'
    }
    // Demo data fallback configuration
    useDemoData?: boolean
    demoSourceType?: 'google-ads' | 'facebook-ads' | 'linkedin-ads' | 'google-sheets'
  }
  
  // Override default query options
  queryOptions?: {
    enabled?: boolean
    refetchInterval?: number | false
    staleTime?: number
    placeholderData?: any
  }
}

export function QueryEnabledDataTable({ 
  widgetConfig, 
  config = {}, 
  title, 
  className,
  queryOptions = {}
}: QueryEnabledDataTableProps) {
  
  // The Golden Path Hook - Complete Data Management
  const {
    data: tableData,
    schema,
    metadata,
    isLoading,
    isFetching,
    isError,
    error,
    queryInfo,
    refetch,
    invalidate
  } = useDataSourceQuery(widgetConfig, {
    ...queryOptions,
    // Callback for successful data fetch
    onSuccess: (result) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Data Table updated:', {
          widgetId: widgetConfig.id,
          rowCount: result.metadata.rowCount,
          cacheHit: queryInfo.isCached,
          queryExecutionTime: result.metadata.queryExecutionTime,
        })
      }
    },
    // Callback for fetch errors
    onError: (error) => {
      console.error('❌ Data Table fetch failed:', {
        widgetId: widgetConfig.id,
        error: error.message,
      })
    }
  })

  // Auto-generate columns from schema if available, otherwise from data
  const generateColumns = React.useMemo(() => {
    // Use schema information if available (preferred)
    if (schema && Object.keys(schema).length > 0) {
      return Object.entries(schema).map(([key, type]) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        type: mapSchemaTypeToDisplayType(type, key)
      }))
    }
    
    // Fallback to auto-detection from data
    if (tableData && tableData.length > 0) {
      return Object.keys(tableData[0]).map(key => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        type: detectColumnType(tableData[0][key], key)
      }))
    }
    
    // Default columns if no data
    return [
      { key: 'campaign', label: 'Campaign', type: 'text' },
      { key: 'impressions', label: 'Impressions', type: 'number' },
      { key: 'clicks', label: 'Clicks', type: 'number' },
      { key: 'cost', label: 'Cost', type: 'currency' },
      { key: 'ctr', label: 'CTR', type: 'percentage' }
    ]
  }, [schema, tableData])

  const {
    columns = generateColumns,
    showHeader = true,
    striped = true,
    sortable = true,
    pageSize = 50
  } = config

  // Format values based on column type
  const formatValue = React.useCallback((value: any, type: string) => {
    if (value == null) return '-'

    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(Number(value))
      
      case 'percentage':
        const num = Number(value)
        return (
          <span className={`${num >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {num >= 0 ? '+' : ''}{num.toFixed(2)}%
          </span>
        )
      
      case 'number':
        return Number(value).toLocaleString()
      
      case 'date':
        return new Date(value).toLocaleDateString()
      
      default:
        return String(value)
    }
  }, [])

  // Handle error state
  if (isError) {
    return (
      <div className={`h-full flex items-center justify-center ${className || ''}`}>
        <div className="text-center space-y-4">
          <div className="text-4xl">❌</div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Data</h3>
            <p className="text-gray-600 mb-4">{error?.message || 'Unknown error occurred'}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className={`h-full ${className || ''}`}>
        {title && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2">
              <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-gray-600">Loading data...</span>
            </div>
            
            {/* Development: Show query information */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 space-y-1">
                <div>Widget: {widgetConfig.id}</div>
                {widgetConfig.dataSourceId && (
                  <div>Source: {widgetConfig.dataSourceId}</div>
                )}
                {widgetConfig.useDemoData && (
                  <div>Demo: {widgetConfig.demoSourceType}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Handle empty data state
  if (!tableData || tableData.length === 0) {
    return (
      <div className={`h-full ${className || ''}`}>
        {title && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-4xl">📊</div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600 mb-4">
                {widgetConfig.dataSourceId ? 
                  'No data found for the current configuration.' :
                  'Connect a data source to see your data here.'
                }
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-full ${className || ''}`}>
      {/* Header with Title and Status Indicators */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          
          {/* Development: Query Information */}
          {process.env.NODE_ENV === 'development' && (
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                queryInfo.isCached ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {queryInfo.isCached ? '📋 Cached' : '🌐 Fresh'}
              </span>
              
              {isFetching && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  🔄 Updating
                </span>
              )}
              
              {metadata?.queryExecutionTime && (
                <span className="text-xs text-gray-500">
                  {metadata.queryExecutionTime}
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Refresh data"
          >
            <svg className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          <button
            onClick={() => invalidate()}
            className="p-2 text-gray-400 hover:text-gray-600"
            title="Invalidate cache"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Data Table */}
      <div className="h-full overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {showHeader && (
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {columns.map((column: any) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {sortable && (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          )}
          
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.slice(0, pageSize).map((row: any, index: number) => (
              <tr 
                key={index}
                className={striped && index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
              >
                {columns.map((column: any) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {formatValue(row[column.key], column.type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer with Metadata */}
      {metadata && (
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Showing {Math.min(pageSize, tableData.length)} of {metadata.rowCount} rows</span>
            <span>•</span>
            <span>{metadata.columnCount} columns</span>
            {metadata.lastSynced && (
              <>
                <span>•</span>
                <span>Updated {new Date(metadata.lastSynced).toLocaleString()}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              metadata.syncStatus === 'success' ? 'bg-green-100 text-green-800' :
              metadata.syncStatus === 'demo' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {metadata.syncStatus === 'demo' ? '🧪 Demo Data' : 
               metadata.syncStatus === 'success' ? '✅ Live Data' : 
               metadata.syncStatus}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Utility Functions
 */

function mapSchemaTypeToDisplayType(schemaType: string, fieldName: string): string {
  const lowerFieldName = fieldName.toLowerCase()
  
  // Check field name patterns first
  if (lowerFieldName.includes('cost') || lowerFieldName.includes('revenue') || lowerFieldName.includes('price')) {
    return 'currency'
  }
  if (lowerFieldName.includes('rate') || lowerFieldName.includes('ctr') || lowerFieldName.includes('percent')) {
    return 'percentage'
  }
  if (lowerFieldName.includes('date') || lowerFieldName.includes('time')) {
    return 'date'
  }
  
  // Map schema types
  switch (schemaType.toLowerCase()) {
    case 'number':
    case 'integer':
    case 'float':
    case 'decimal':
      return 'number'
    case 'string':
    case 'text':
      return 'text'
    case 'date':
    case 'datetime':
    case 'timestamp':
      return 'date'
    case 'boolean':
      return 'text'
    default:
      return 'text'
  }
}

function detectColumnType(value: any, fieldName: string): string {
  const lowerFieldName = fieldName.toLowerCase()
  
  // Check field name patterns
  if (lowerFieldName.includes('cost') || lowerFieldName.includes('revenue') || lowerFieldName.includes('price')) {
    return 'currency'
  }
  if (lowerFieldName.includes('rate') || lowerFieldName.includes('ctr') || lowerFieldName.includes('percent')) {
    return 'percentage'
  }
  if (lowerFieldName.includes('date') || lowerFieldName.includes('time')) {
    return 'date'
  }
  
  // Check value type
  if (typeof value === 'number') {
    return 'number'
  }
  
  return 'text'
}