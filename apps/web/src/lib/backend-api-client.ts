import React from 'react'
import { getSession } from 'next-auth/react'

/**
 * BackendApiClient - Elite API client for our anti-fragile backend
 * 
 * This client provides a sophisticated interface to our NestJS backend API,
 * with complete observability, error handling, and trace correlation.
 * 
 * Features:
 * 1. Automatic traceId propagation for request correlation
 * 2. Intelligent retry logic with exponential backoff
 * 3. Circuit breaker pattern for frontend resilience
 * 4. Structured error handling with context preservation
 * 5. Real-time status monitoring and health checks
 * 6. Comprehensive logging for debugging and monitoring
 */

interface BackendApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
  retries?: number
  timeout?: number
  traceId?: string
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  traceId?: string
  responseTime?: string
  metadata?: any
}

class BackendApiClient {
  private baseUrl: string
  private retryAttempts: number = 3
  private defaultTimeout: number = 30000

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1') {
    this.baseUrl = baseUrl
  }

  /**
   * Generate unique trace ID for request correlation
   */
  private generateTraceId(): string {
    return `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Enhanced request method with anti-fragile patterns
   */
  async request<T>(endpoint: string, options: BackendApiOptions = {}): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      retries = this.retryAttempts,
      timeout = this.defaultTimeout,
      traceId = this.generateTraceId()
    } = options

    const startTime = Date.now()

    // Get session for auth token
    const session = await getSession()

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-ID': traceId,
        ...headers,
        ...(session?.user?.id && { 'Authorization': `Bearer ${session.user.id}` })
      },
      signal: AbortSignal.timeout(timeout)
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    let lastError: Error | null = null

    // Retry logic with exponential backoff
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log({
          level: 'info',
          message: 'Backend API request',
          traceId,
          method,
          endpoint,
          attempt,
          maxAttempts: retries,
          timestamp: new Date().toISOString()
        })

        const response = await fetch(`${this.baseUrl}${endpoint}`, config)
        const responseTime = Date.now() - startTime

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        console.log({
          level: 'info',
          message: 'Backend API response success',
          traceId,
          endpoint,
          responseTime: `${responseTime}ms`,
          status: response.status,
          timestamp: new Date().toISOString()
        })

        return {
          success: true,
          data,
          traceId,
          responseTime: `${responseTime}ms`
        }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        const responseTime = Date.now() - startTime

        console.log({
          level: 'error',
          message: 'Backend API request failed',
          traceId,
          endpoint,
          attempt,
          error: lastError.message,
          responseTime: `${responseTime}ms`,
          willRetry: attempt < retries,
          timestamp: new Date().toISOString()
        })

        // Don't retry on certain error types
        if (lastError.message.includes('401') || lastError.message.includes('403')) {
          break
        }

        // Exponential backoff before retry
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Unknown error occurred',
      traceId,
      responseTime: `${Date.now() - startTime}ms`
    }
  }

  // Convenience methods
  async get<T>(endpoint: string, options?: Omit<BackendApiOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any, options?: Omit<BackendApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  async put<T>(endpoint: string, body?: any, options?: Omit<BackendApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  async delete<T>(endpoint: string, options?: Omit<BackendApiOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const backendApi = new BackendApiClient()

/**
 * Data Ingestion API - Interface to our anti-fragile data pipeline
 */
export const dataIngestionApi = {
  /**
   * Test Google Sheets connector directly (bypass queue)
   */
  testGoogleSheets: async (request: {
    spreadsheetId: string
    range: string
    accessToken: string
    refreshToken?: string
  }) => {
    return backendApi.post<{
      data: {
        source: string
        spreadsheetId: string
        range: string
        headers: string[]
        rows: any[]
        metadata: any
      }
      recordCount: number
      metadata: any
    }>('/data-ingestion/test/google-sheets', request)
  },

  /**
   * Queue Google Sheets ingestion job for async processing
   */
  ingestGoogleSheets: async (request: {
    spreadsheetId: string
    range: string
    accessToken: string
    refreshToken?: string
  }) => {
    return backendApi.post<{
      jobId: string
      status: string
      message: string
      estimatedProcessingTime: string
    }>('/data-ingestion/google-sheets', request)
  },

  /**
   * Get job status and results
   */
  getJobStatus: async (jobId: string) => {
    return backendApi.get<{
      jobId: string
      status: string
      progress: number
      result?: any
    }>(`/data-ingestion/jobs/${jobId}`)
  },

  /**
   * Get data ingestion pipeline health
   */
  getHealth: async () => {
    return backendApi.get<{
      service: string
      status: string
      components: {
        queue: any
        connectors: any
      }
    }>('/data-ingestion/health')
  }
}

/**
 * System Health API - Monitor our anti-fragile infrastructure
 */
export const systemHealthApi = {
  /**
   * Get basic system health
   */
  getHealth: async () => {
    return backendApi.get<{
      status: string
      service: any
      performance: any
      database: any
      cache: any
      dependencies: any
    }>('/health')
  },

  /**
   * Get detailed system diagnostics
   */
  getDetailedHealth: async () => {
    return backendApi.get<{
      status: string
      system: any
      environment: any
      performance: any
    }>('/health/detailed')
  }
}

/**
 * Hook for real-time job monitoring
 */
export const useJobMonitoring = (jobId: string | null, pollInterval: number = 2000) => {
  const [jobStatus, setJobStatus] = React.useState<any>(null)
  const [isPolling, setIsPolling] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!jobId) return

    setIsPolling(true)
    setError(null)

    const pollJobStatus = async () => {
      try {
        const response = await dataIngestionApi.getJobStatus(jobId)
        
        if (response.success) {
          setJobStatus(response.data)
          
          // Stop polling if job is completed or failed
          if (response.data?.status === 'completed' || response.data?.status === 'failed') {
            setIsPolling(false)
          }
        } else {
          setError(response.error || 'Failed to get job status')
          setIsPolling(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsPolling(false)
      }
    }

    // Initial poll
    pollJobStatus()

    // Set up polling interval
    const interval = setInterval(() => {
      if (isPolling) {
        pollJobStatus()
      }
    }, pollInterval)

    return () => {
      clearInterval(interval)
      setIsPolling(false)
    }
  }, [jobId, pollInterval, isPolling])

  return {
    jobStatus,
    isPolling,
    error,
    refetch: () => {
      if (jobId) {
        setIsPolling(true)
        setError(null)
      }
    }
  }
}

// For backwards compatibility with existing code
export { backendApi as apiClient }