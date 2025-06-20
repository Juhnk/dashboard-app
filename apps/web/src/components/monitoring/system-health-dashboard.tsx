'use client'

import React, { useState, useEffect } from 'react'
import { systemHealthApi, dataIngestionApi } from '@/lib/backend-api-client'

/**
 * SystemHealthDashboard - Elite system monitoring interface
 * 
 * This dashboard provides comprehensive visibility into our anti-fragile
 * backend infrastructure. It demonstrates production-grade monitoring:
 * 
 * 1. Real-time health status with automatic refresh
 * 2. Circuit breaker state monitoring
 * 3. Performance metrics visualization
 * 4. Database and cache connection status
 * 5. Data ingestion pipeline health
 * 6. Error tracking and alerting
 * 
 * This is the kind of monitoring interface that separates elite systems
 * from standard applications - complete operational visibility.
 */

interface HealthStatus {
  api: any
  dataIngestion: any
  lastUpdate: string
  isLoading: boolean
  error: string | null
}

export function SystemHealthDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    api: null,
    dataIngestion: null,
    lastUpdate: '',
    isLoading: true,
    error: null
  })

  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5000) // 5 seconds

  const fetchHealth = async () => {
    try {
      setHealthStatus(prev => ({ ...prev, isLoading: true, error: null }))

      // Fetch health data from both services
      const [apiResponse, dataIngestionResponse] = await Promise.all([
        systemHealthApi.getHealth(),
        dataIngestionApi.getHealth()
      ])

      setHealthStatus({
        api: apiResponse.success ? apiResponse.data : null,
        dataIngestion: dataIngestionResponse.success ? dataIngestionResponse.data : null,
        lastUpdate: new Date().toISOString(),
        isLoading: false,
        error: null
      })

    } catch (error) {
      setHealthStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch health status'
      }))
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchHealth()

    // Set up auto-refresh
    let interval: NodeJS.Timeout | null = null
    if (autoRefresh) {
      interval = setInterval(fetchHealth, refreshInterval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200'
      case 'degraded': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'unhealthy': return 'text-red-600 bg-red-50 border-red-200'
      case 'skipped': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'degraded':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      case 'unhealthy':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
          <p className="text-gray-600">Anti-fragile infrastructure monitoring</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Auto-refresh:</label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
          </div>
          
          <button
            onClick={fetchHealth}
            disabled={healthStatus.isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <svg className={`w-4 h-4 ${healthStatus.isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {healthStatus.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800 font-medium">Health Check Failed</span>
          </div>
          <p className="text-red-700 mt-1">{healthStatus.error}</p>
        </div>
      )}

      {/* Overall Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* API Service */}
        <div className={`border rounded-lg p-4 ${getStatusColor(healthStatus.api?.status || 'unknown')}`}>
          <div className="flex items-center space-x-3">
            {getStatusIcon(healthStatus.api?.status || 'unknown')}
            <div>
              <h3 className="font-medium">API Service</h3>
              <p className="text-sm capitalize">{healthStatus.api?.status || 'Unknown'}</p>
            </div>
          </div>
        </div>

        {/* Data Ingestion */}
        <div className={`border rounded-lg p-4 ${getStatusColor(healthStatus.dataIngestion?.status || 'unknown')}`}>
          <div className="flex items-center space-x-3">
            {getStatusIcon(healthStatus.dataIngestion?.status || 'unknown')}
            <div>
              <h3 className="font-medium">Data Pipeline</h3>
              <p className="text-sm capitalize">{healthStatus.dataIngestion?.status || 'Unknown'}</p>
            </div>
          </div>
        </div>

        {/* Database */}
        <div className={`border rounded-lg p-4 ${getStatusColor(healthStatus.api?.database?.status || 'unknown')}`}>
          <div className="flex items-center space-x-3">
            {getStatusIcon(healthStatus.api?.database?.status || 'unknown')}
            <div>
              <h3 className="font-medium">Database</h3>
              <p className="text-sm capitalize">{healthStatus.api?.database?.status || 'Unknown'}</p>
            </div>
          </div>
        </div>

        {/* Cache */}
        <div className={`border rounded-lg p-4 ${getStatusColor(healthStatus.api?.cache?.status || 'unknown')}`}>
          <div className="flex items-center space-x-3">
            {getStatusIcon(healthStatus.api?.cache?.status || 'unknown')}
            <div>
              <h3 className="font-medium">Cache</h3>
              <p className="text-sm capitalize">{healthStatus.api?.cache?.status || 'Unknown'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        {healthStatus.api?.performance && (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Response Time:</span>
                <span className="font-mono">{healthStatus.api.performance.responseTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Memory Usage:</span>
                <span className="font-mono">
                  {healthStatus.api.performance.memoryUsage?.used}MB / {healthStatus.api.performance.memoryUsage?.total}MB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CPU User Time:</span>
                <span className="font-mono">{Math.round(healthStatus.api.performance.cpuUsage?.user / 1000)}ms</span>
              </div>
            </div>
          </div>
        )}

        {/* Data Ingestion Status */}
        {healthStatus.dataIngestion?.components && (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Data Ingestion</h3>
            <div className="space-y-4">
              {/* Queue Status */}
              {healthStatus.dataIngestion.components.queue && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Job Queue</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <div className="font-medium">{healthStatus.dataIngestion.components.queue.status}</div>
                    </div>
                    {healthStatus.dataIngestion.components.queue.jobs && (
                      <>
                        <div>
                          <span className="text-gray-600">Completed:</span>
                          <div className="font-mono">{healthStatus.dataIngestion.components.queue.jobs.completed}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Active:</span>
                          <div className="font-mono">{healthStatus.dataIngestion.components.queue.jobs.active}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Failed:</span>
                          <div className="font-mono">{healthStatus.dataIngestion.components.queue.jobs.failed}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Connector Status */}
              {healthStatus.dataIngestion.components.connectors && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Connectors</h4>
                  <div className="space-y-2">
                    {Object.entries(healthStatus.dataIngestion.components.connectors).map(([name, status]: [string, any]) => (
                      <div key={name} className="flex justify-between items-center">
                        <span className="text-gray-600 capitalize">{name}:</span>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                            {status.status}
                          </span>
                          <span className="text-xs text-gray-500">{status.circuitBreaker}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Last Update */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {healthStatus.lastUpdate ? new Date(healthStatus.lastUpdate).toLocaleString() : 'Never'}
        {autoRefresh && (
          <span className="ml-2">
            • Auto-refresh every {refreshInterval / 1000}s
          </span>
        )}
      </div>
    </div>
  )
}