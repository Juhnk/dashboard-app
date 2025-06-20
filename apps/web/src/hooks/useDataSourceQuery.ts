import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/react-query'
import { apiClient } from '@/lib/api-client'
import { backendApi } from '@/lib/backend-api-client'

/**
 * useDataSourceQuery - The Golden Path Hook for Data Fetching
 * 
 * This is the cornerstone of our data management system. It provides:
 * 
 * 1. Intelligent Caching: 5-minute stale time prevents redundant API calls
 * 2. Background Updates: Automatic refetching when data becomes stale
 * 3. Error Resilience: Smart retry logic with exponential backoff
 * 4. Loading States: Comprehensive loading and error state management
 * 5. Cache Invalidation: Intelligent cache updates when dependencies change
 * 6. Development Tools: Complete observability through TanStack Query devtools
 * 
 * This hook abstracts all complexity of data fetching, caching, and state management,
 * providing components with a clean, predictable interface for accessing server state.
 */

interface WidgetConfig {
  id: string
  name?: string
  dataSourceId?: string
  queryConfig?: {
    metrics?: string[]
    dimensions?: string[]
    filters?: Record<string, any>
    dateRange?: {
      start: string
      end: string
    }
    limit?: number
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
  }
  // For demo data fallback
  useDemoData?: boolean
  demoSourceType?: 'google-ads' | 'facebook-ads' | 'linkedin-ads' | 'google-sheets'
}

interface DataSourceQueryResult {
  data: any[]
  schema: Record<string, string>
  metadata: {
    dataSourceId: string
    sourceType: string
    rowCount: number
    columnCount: number
    lastSynced: string | null
    syncStatus: string
    queryExecutionTime?: string
    cacheHit?: boolean
  }
}

interface UseDataSourceQueryOptions {
  enabled?: boolean
  refetchInterval?: number | false
  staleTime?: number
  placeholderData?: any
  onSuccess?: (data: DataSourceQueryResult) => void
  onError?: (error: Error) => void
}

/**
 * The Golden Path Hook for Widget Data Fetching
 * 
 * @param config - Widget configuration containing data source and query parameters
 * @param options - Query options for customizing behavior
 * @returns Comprehensive query state and data
 */
export function useDataSourceQuery(
  config: WidgetConfig,
  options: UseDataSourceQueryOptions = {}
) {
  const queryClient = useQueryClient()
  
  // Determine if query should be enabled
  const shouldFetch = Boolean(
    config &&
    (config.dataSourceId || config.useDemoData) &&
    (options.enabled !== false)
  )

  // Generate stable query key for optimal caching
  const queryKey = queryKeys.widgetData(config.id, {
    dataSourceId: config.dataSourceId,
    queryConfig: config.queryConfig,
    useDemoData: config.useDemoData,
    demoSourceType: config.demoSourceType,
  })

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<DataSourceQueryResult> => {
      const startTime = Date.now()

      // Development logging
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Fetching widget data:', {
          widgetId: config.id,
          dataSourceId: config.dataSourceId,
          useDemoData: config.useDemoData,
          queryConfig: config.queryConfig,
        })
      }

      try {
        let result: DataSourceQueryResult

        if (config.useDemoData) {
          // Fetch demo data for development/preview
          result = await fetchDemoData(config)
        } else if (config.dataSourceId) {
          // Fetch real data from connected source
          result = await fetchRealData(config)
        } else {
          throw new Error('No data source configured')
        }

        const executionTime = Date.now() - startTime

        // Add performance metadata
        result.metadata = {
          ...result.metadata,
          queryExecutionTime: `${executionTime}ms`,
          cacheHit: false, // First fetch is never a cache hit
        }

        // Success callback
        if (options.onSuccess) {
          options.onSuccess(result)
        }

        // Development logging
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Widget data fetched successfully:', {
            widgetId: config.id,
            rowCount: result.metadata.rowCount,
            executionTime: `${executionTime}ms`,
            sourceType: result.metadata.sourceType,
          })
        }

        return result

      } catch (error) {
        const executionTime = Date.now() - startTime

        // Error logging
        console.error('❌ Widget data fetch failed:', {
          widgetId: config.id,
          dataSourceId: config.dataSourceId,
          error: error instanceof Error ? error.message : String(error),
          executionTime: `${executionTime}ms`,
        })

        // Error callback
        if (options.onError && error instanceof Error) {
          options.onError(error)
        }

        throw error
      }
    },
    enabled: shouldFetch,
    staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes default
    refetchInterval: options.refetchInterval,
    placeholderData: options.placeholderData,
    // Enhanced error handling
    retry: (failureCount, error: any) => {
      // Don't retry on configuration errors
      if (error?.message?.includes('No data source configured')) {
        return false
      }
      
      // Don't retry on authentication errors
      if (error?.status === 401 || error?.status === 403) {
        return false
      }
      
      // Retry up to 3 times for other errors
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Cache management utilities
  const invalidateQuery = React.useCallback(() => {
    return queryClient.invalidateQueries({ queryKey })
  }, [queryClient, queryKey])

  const refetchQuery = React.useCallback(() => {
    return query.refetch()
  }, [query])

  const updateCache = React.useCallback((newData: DataSourceQueryResult) => {
    queryClient.setQueryData(queryKey, newData)
  }, [queryClient, queryKey])

  // Performance and cache information
  const queryInfo = React.useMemo(() => {
    const queryState = queryClient.getQueryState(queryKey)
    
    return {
      isCached: Boolean(queryState?.data),
      lastFetched: queryState?.dataUpdatedAt ? new Date(queryState.dataUpdatedAt) : null,
      isStale: query.isStale,
      fetchStatus: query.fetchStatus,
      errorUpdateCount: queryState?.errorUpdateCount || 0,
      dataUpdateCount: queryState?.dataUpdateCount || 0,
    }
  }, [queryClient, queryKey, query.isStale, query.fetchStatus])

  return {
    // Data and states
    data: query.data?.data,
    schema: query.data?.schema,
    metadata: query.data?.metadata,
    
    // Loading states
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    isError: query.isError,
    
    // Error information
    error: query.error as Error | null,
    failureCount: query.failureCount,
    failureReason: query.failureReason,
    
    // Cache and performance info
    queryInfo,
    
    // Utilities
    refetch: refetchQuery,
    invalidate: invalidateQuery,
    updateCache,
    
    // Raw query object for advanced use cases
    query,
  }
}

/**
 * Fetch demo data for development and preview purposes
 */
async function fetchDemoData(config: WidgetConfig): Promise<DataSourceQueryResult> {
  // Use our sophisticated demo data service
  const { DemoDataService } = await import('@/lib/demo-data-service')

  const sourceType = config.demoSourceType || 'google-ads'
  const demoData = DemoDataService.getDemoDataForChart({
    chartType: 'line-chart',
    ...config.queryConfig
  })

  return {
    data: demoData.data,
    schema: demoData.metadata.availableMetrics.reduce((acc, metric) => ({ ...acc, [metric]: 'number' }), {}),
    metadata: {
      dataSourceId: `demo-${sourceType}`,
      sourceType: `demo-${sourceType}`,
      rowCount: demoData.data.length,
      columnCount: demoData.metadata.availableMetrics.length,
      lastSynced: new Date().toISOString(),
      syncStatus: 'demo',
    }
  }
}

/**
 * Fetch real data from connected data sources
 */
async function fetchRealData(config: WidgetConfig): Promise<DataSourceQueryResult> {
  if (!config.dataSourceId) {
    throw new Error('Data source ID is required for real data fetching')
  }

  try {
    // First try the new backend API
    const response = await backendApi.post('/data-sources/query', {
      dataSourceId: config.dataSourceId,
      queryConfig: config.queryConfig || {},
    })

    if (response.success && response.data) {
      return response.data as DataSourceQueryResult
    }

    // Fallback to existing API client
    const fallbackResponse = await apiClient.get(`/data-sources/${config.dataSourceId}/data`)
    return fallbackResponse as DataSourceQueryResult

  } catch (error) {
    // Enhanced error context
    throw new Error(
      `Failed to fetch data from source ${config.dataSourceId}: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

/**
 * Hook for prefetching widget data
 * Useful for performance optimization when user interactions are predictable
 */
export function usePrefetchWidgetData() {
  const queryClient = useQueryClient()

  return React.useCallback(
    (config: WidgetConfig) => {
      if (!config.dataSourceId && !config.useDemoData) {
        return Promise.resolve()
      }

      const queryKey = queryKeys.widgetData(config.id, {
        dataSourceId: config.dataSourceId,
        queryConfig: config.queryConfig,
        useDemoData: config.useDemoData,
        demoSourceType: config.demoSourceType,
      })

      return queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => {
          if (config.useDemoData) {
            return await fetchDemoData(config)
          } else {
            return await fetchRealData(config)
          }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      })
    },
    [queryClient]
  )
}

/**
 * Hook for invalidating widget data queries
 * Useful when data sources are updated or reconnected
 */
export function useInvalidateWidgetData() {
  const queryClient = useQueryClient()

  return React.useCallback(
    (widgetId?: string) => {
      if (widgetId) {
        // Invalidate specific widget
        return queryClient.invalidateQueries({
          queryKey: ['widgetData', widgetId],
        })
      } else {
        // Invalidate all widget data
        return queryClient.invalidateQueries({
          queryKey: ['widgetData'],
        })
      }
    },
    [queryClient]
  )
}

// Import React for the hooks
import React from 'react'