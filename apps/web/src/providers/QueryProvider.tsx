'use client'

import React, { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient, devUtils, queryUtils } from '@/lib/react-query'

/**
 * QueryProvider - Elite Data Management Provider
 * 
 * This provider establishes our sophisticated data management infrastructure
 * with complete observability and debugging capabilities.
 * 
 * Features:
 * 1. Global Query Client: Single source of truth for all server state
 * 2. Development Tools: Powerful debugging interface for query inspection
 * 3. Performance Monitoring: Real-time visibility into cache behavior
 * 4. Error Boundaries: Graceful handling of query system failures
 * 5. Development Utilities: Enhanced debugging in development mode
 * 
 * This transforms our frontend into an observable, sophisticated data platform
 * that provides complete visibility into client-server state synchronization.
 */

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Enable development utilities in dev mode
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Enable automatic query logging
      const unsubscribe = devUtils.enableQueryLogging()
      
      // Add global cache inspection utility
      if (typeof window !== 'undefined') {
        ;(window as any).__queryClient = queryClient
        ;(window as any).__queryUtils = devUtils
        
        console.log('🚀 TanStack Query DevTools Available!')
        console.log('📊 Access query client: window.__queryClient')
        console.log('🛠️ Access dev utilities: window.__queryUtils')
        console.log('🔍 Log query states: window.__queryUtils.logQueryStates()')
      }
      
      return unsubscribe
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children as any}
      
      {/* Development Tools - Only in Development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
      
      {/* Cache Statistics Monitor - Development Only */}
      {process.env.NODE_ENV === 'development' && <CacheStatsMonitor />}
    </QueryClientProvider>
  )
}

/**
 * CacheStatsMonitor - Real-time Cache Performance Monitoring
 * 
 * This component provides real-time visibility into our query cache
 * performance and behavior during development.
 */
function CacheStatsMonitor() {
  const [isVisible, setIsVisible] = React.useState(false)
  const [stats, setStats] = React.useState<any>(null)

  // Update stats every 2 seconds when visible
  React.useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setStats(queryUtils.getCacheStats())
    }, 2000)

    // Initial load
    setStats(queryUtils.getCacheStats())

    return () => clearInterval(interval)
  }, [isVisible])

  // Keyboard shortcut to toggle stats (Shift + Ctrl + Q)
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.ctrlKey && event.key === 'Q') {
        setIsVisible(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isVisible || !stats) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 100000,
        minWidth: '200px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <strong>🔍 Query Cache Stats</strong>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        <div>Total Queries:</div>
        <div style={{ color: '#60a5fa' }}>{stats.totalQueries}</div>
        
        <div>Fresh Queries:</div>
        <div style={{ color: '#34d399' }}>{stats.freshQueries}</div>
        
        <div>Stale Queries:</div>
        <div style={{ color: '#fbbf24' }}>{stats.staleQueries}</div>
        
        <div>Loading:</div>
        <div style={{ color: '#3b82f6' }}>{stats.loadingQueries}</div>
        
        <div>Errors:</div>
        <div style={{ color: '#ef4444' }}>{stats.errorQueries}</div>
        
        <div>Cache Size:</div>
        <div style={{ color: '#a78bfa' }}>
          {(stats.cacheSize / 1024).toFixed(1)}KB
        </div>
      </div>
      
      <div style={{ marginTop: '8px', fontSize: '10px', color: '#9ca3af' }}>
        Press Shift+Ctrl+Q to toggle
      </div>
    </div>
  )
}

/**
 * QueryErrorBoundary - Graceful Query Error Handling
 * 
 * This error boundary provides graceful fallbacks when the query system
 * encounters unrecoverable errors.
 */
interface QueryErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface QueryErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class QueryErrorBoundary extends React.Component<
  QueryErrorBoundaryProps,
  QueryErrorBoundaryState
> {
  constructor(props: QueryErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): QueryErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Query system error:', error, errorInfo)
    
    // In development, show detailed error information
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Query Error Boundary Caught Error')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Query Client State:', queryClient.getQueryCache().getAll())
      console.groupEnd()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          backgroundColor: '#fef2f2',
          color: '#dc2626'
        }}>
          <h3>Query System Error</h3>
          <p>The data management system encountered an error.</p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '10px' }}>
              <summary>Error Details</summary>
              <pre style={{ 
                fontSize: '12px', 
                backgroundColor: '#f9fafb', 
                padding: '10px', 
                borderRadius: '4px',
                overflow: 'auto'
              }}>
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined })
              // Clear cache and reload
              queryClient.clear()
            }}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reset Query System
          </button>
        </div>
      )
    }

    return this.props.children
  }
}