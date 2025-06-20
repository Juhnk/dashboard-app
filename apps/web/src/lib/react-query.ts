import { QueryClient } from '@tanstack/react-query'

/**
 * QueryClient Configuration - Elite Data Management Setup
 * 
 * This configuration transforms our frontend into a sophisticated data management
 * platform with intelligent caching, background updates, and complete observability.
 * 
 * Key Features:
 * 1. Intelligent Caching: 5-minute stale time prevents redundant API calls
 * 2. Memory Management: 1-hour garbage collection optimizes performance
 * 3. Background Updates: Automatic refetching when user returns to app
 * 4. Error Resilience: Smart retry logic with exponential backoff
 * 5. Observable State: Complete visibility into all data operations
 * 
 * This setup ensures our app is performant, resilient, and provides operators
 * with complete visibility into client-side data management.
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale Time: Data is considered fresh for 5 minutes
      // This prevents redundant API calls for recently fetched data
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Garbage Collection Time: Keep inactive queries in cache for 1 hour
      // This enables instant loading when user navigates back to cached data
      gcTime: 60 * 60 * 1000, // 1 hour (formerly cacheTime)
      
      // Refetch Configuration: Smart background updates
      refetchOnWindowFocus: true,  // Refetch when user returns to tab
      refetchOnReconnect: true,    // Refetch when network reconnects
      refetchOnMount: true,        // Refetch when component mounts (if stale)
      
      // Retry Configuration: Exponential backoff for resilience
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors or client errors (4xx)
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        
        // Retry up to 3 times for server errors and network issues
        return failureCount < 3
      },
      
      // Retry Delay: Exponential backoff (1s, 2s, 4s)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Network Mode: Handle offline scenarios gracefully
      networkMode: 'online', // Only fetch when online
      
      // Structural Sharing: Optimize re-renders by preserving object references
      structuralSharing: true,
    },
    
    mutations: {
      // Mutation Configuration: Data modification operations
      retry: (failureCount, error: any) => {
        // Never retry authentication errors
        if (error?.status === 401 || error?.status === 403) {
          return false
        }
        
        // Retry once for server errors
        return failureCount < 1
      },
      
      // Network Mode: Only mutate when online
      networkMode: 'online',
    },
  },
})

/**
 * Query Key Factory - Consistent, Type-Safe Query Keys
 * 
 * This factory ensures all our query keys are consistent and follow
 * a predictable pattern for optimal caching and invalidation.
 */
export const queryKeys = {
  // Widget Data Queries
  widgetData: (widgetId: string, config?: any) => 
    ['widgetData', widgetId, config] as const,
  
  // Data Source Queries
  dataSources: () => ['dataSources'] as const,
  dataSource: (id: string) => ['dataSource', id] as const,
  dataSourceData: (id: string, query?: any) => 
    ['dataSourceData', id, query] as const,
  
  // Dashboard Queries
  dashboards: () => ['dashboards'] as const,
  dashboard: (id: string) => ['dashboard', id] as const,
  
  // System Health Queries
  systemHealth: () => ['systemHealth'] as const,
  apiHealth: () => ['apiHealth'] as const,
  dataIngestionHealth: () => ['dataIngestionHealth'] as const,
  
  // Job Monitoring Queries
  job: (jobId: string) => ['job', jobId] as const,
  jobs: (filters?: any) => ['jobs', filters] as const,
  
  // Demo Data Queries (for development)
  demoData: (sourceId: string, config?: any) => 
    ['demoData', sourceId, config] as const,
} as const

/**
 * Query Client Utilities - Advanced Cache Management
 * 
 * These utilities provide sophisticated cache management capabilities
 * for complex data scenarios and real-time updates.
 */
export const queryUtils = {
  /**
   * Invalidate all widget data queries
   * Used when data sources are updated or reconnected
   */
  invalidateWidgetData: () => {
    return queryClient.invalidateQueries({
      queryKey: ['widgetData'],
    })
  },
  
  /**
   * Prefetch widget data for better UX
   * Used when user hovers over widgets or navigates predictably
   */
  prefetchWidgetData: (widgetId: string, config: any) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.widgetData(widgetId, config),
      queryFn: () => {
        // This will be implemented in our data fetching hook
        throw new Error('Query function not implemented')
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  },
  
  /**
   * Update widget data in cache
   * Used for optimistic updates or real-time data pushes
   */
  setWidgetData: (widgetId: string, config: any, data: any) => {
    queryClient.setQueryData(
      queryKeys.widgetData(widgetId, config),
      data
    )
  },
  
  /**
   * Get cached widget data
   * Used for synchronous access to cached data
   */
  getWidgetData: (widgetId: string, config: any) => {
    return queryClient.getQueryData(
      queryKeys.widgetData(widgetId, config)
    )
  },
  
  /**
   * Remove widget data from cache
   * Used when widgets are deleted or data sources disconnected
   */
  removeWidgetData: (widgetId: string) => {
    queryClient.removeQueries({
      queryKey: ['widgetData', widgetId],
    })
  },
  
  /**
   * Clear all cached data
   * Used for logout or major state resets
   */
  clearCache: () => {
    queryClient.clear()
  },
  
  /**
   * Get cache statistics for monitoring
   * Used by our monitoring dashboard
   */
  getCacheStats: () => {
    const cache = queryClient.getQueryCache()
    const queries = cache.getAll()
    
    return {
      totalQueries: queries.length,
      freshQueries: queries.filter(q => q.state.dataUpdatedAt && 
        Date.now() - q.state.dataUpdatedAt < ((q.options as any).staleTime || 0)).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      loadingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      cacheSize: queries.reduce((size, q) => {
        const dataSize = JSON.stringify(q.state.data || {}).length
        return size + dataSize
      }, 0),
    }
  },
}

/**
 * Development Utilities - Enhanced Debugging
 * 
 * These utilities help developers understand and debug the query system
 * in development environments.
 */
export const devUtils = {
  /**
   * Log all query states to console
   * Useful for debugging cache behavior
   */
  logQueryStates: () => {
    if (process.env.NODE_ENV !== 'development') return
    
    const cache = queryClient.getQueryCache()
    const queries = cache.getAll()
    
    console.group('🔍 TanStack Query Cache State')
    queries.forEach(query => {
      const key = JSON.stringify(query.queryKey)
      const status = query.state.status
      const fetchStatus = query.state.fetchStatus
      const dataUpdatedAt = query.state.dataUpdatedAt
      const isStale = query.isStale()
      
      console.log(`${key}:`, {
        status,
        fetchStatus,
        isStale,
        dataUpdatedAt: dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null,
        errorUpdateCount: query.state.errorUpdateCount,
        dataUpdateCount: query.state.dataUpdateCount,
      })
    })
    console.groupEnd()
  },
  
  /**
   * Monitor query state changes
   * Automatically logs changes in development
   */
  enableQueryLogging: () => {
    if (process.env.NODE_ENV !== 'development') return
    
    const cache = queryClient.getQueryCache()
    
    const unsubscribe = cache.subscribe((event) => {
      if (event?.type === 'updated') {
        const query = event.query
        const key = JSON.stringify(query.queryKey)
        
        console.log(`🔄 Query Updated: ${key}`, {
          status: query.state.status,
          fetchStatus: query.state.fetchStatus,
          isStale: query.isStale(),
        })
      }
    })
    
    // Return unsubscribe function
    return unsubscribe
  },
}