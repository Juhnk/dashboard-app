'use client'

import React, { useState, useEffect } from 'react'
import { dataIngestionApi } from '@/lib/backend-api-client'

/**
 * JobMonitor - Real-time job monitoring component
 * 
 * This component demonstrates elite-level real-time monitoring capabilities:
 * 
 * 1. Live job status updates with intelligent polling
 * 2. Progress visualization with detailed metrics
 * 3. Error handling with retry capabilities
 * 4. Trace correlation for debugging
 * 5. Performance monitoring and timing
 * 
 * This shows how to build sophisticated monitoring UIs that provide
 * complete visibility into our anti-fragile data pipeline.
 */

interface JobMonitorProps {
  jobId: string | null
  onComplete?: (result: any) => void
  onError?: (error: string) => void
  className?: string
}

interface JobStatus {
  jobId: string
  status: 'queued' | 'active' | 'completed' | 'failed' | 'stalled'
  progress: number
  result?: any
  error?: string
  startedAt?: string
  completedAt?: string
  processingTime?: string
  attempt?: number
  maxAttempts?: number
}

export function JobMonitor({ jobId, onComplete, onError, className = '' }: JobMonitorProps) {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pollCount, setPollCount] = useState(0)
  const [traceId, setTraceId] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId) {
      setJobStatus(null)
      setIsPolling(false)
      setError(null)
      setPollCount(0)
      return
    }

    setIsPolling(true)
    setError(null)
    setPollCount(0)

    const pollJobStatus = async () => {
      try {
        console.log({
          level: 'debug',
          message: 'Polling job status',
          jobId,
          pollCount: pollCount + 1,
          timestamp: new Date().toISOString()
        })

        const response = await dataIngestionApi.getJobStatus(jobId)
        setPollCount(prev => prev + 1)
        
        if (response.success && response.data) {
          setJobStatus(response.data as JobStatus)
          setTraceId(response.traceId || null)
          
          // Handle job completion
          if (response.data.status === 'completed') {
            setIsPolling(false)
            if (onComplete) {
              onComplete(response.data.result)
            }
          }
          
          // Handle job failure
          if (response.data.status === 'failed') {
            setIsPolling(false)
            const errorMsg = (response.data as any).error || 'Job failed'
            setError(errorMsg)
            if (onError) {
              onError(errorMsg)
            }
          }
        } else {
          const errorMsg = response.error || 'Failed to get job status'
          setError(errorMsg)
          setIsPolling(false)
          if (onError) {
            onError(errorMsg)
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMsg)
        setIsPolling(false)
        if (onError) {
          onError(errorMsg)
        }
      }
    }

    // Initial poll
    pollJobStatus()

    // Set up polling interval (adaptive based on job status)
    const getPollingInterval = () => {
      if (!jobStatus) return 1000 // Fast polling initially
      if (jobStatus.status === 'queued') return 2000 // Medium for queued
      if (jobStatus.status === 'active') return 1000 // Fast for active
      return 5000 // Slow for other states
    }

    const interval = setInterval(() => {
      if (isPolling) {
        pollJobStatus()
      }
    }, getPollingInterval())

    return () => {
      clearInterval(interval)
      setIsPolling(false)
    }
  }, [jobId, isPolling, pollCount, onComplete, onError])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued': return 'text-yellow-600 bg-yellow-50'
      case 'active': return 'text-blue-600 bg-blue-50'
      case 'completed': return 'text-green-600 bg-green-50'
      case 'failed': return 'text-red-600 bg-red-50'
      case 'stalled': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'active':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'failed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  if (!jobId) {
    return null
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900">Job Monitor</h3>
          <span className="text-xs text-gray-500">#{jobId.slice(-8)}</span>
        </div>
        {traceId && (
          <span className="text-xs font-mono text-gray-400">
            trace: {traceId.slice(-6)}
          </span>
        )}
      </div>

      {error ? (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      ) : jobStatus ? (
        <div className="space-y-3">
          {/* Status Badge */}
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(jobStatus.status)}`}>
            {getStatusIcon(jobStatus.status)}
            <span className="capitalize">{jobStatus.status}</span>
          </div>

          {/* Progress Bar */}
          {jobStatus.status === 'active' && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progress</span>
                <span>{jobStatus.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${jobStatus.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Job Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            {jobStatus.startedAt && (
              <div>
                <span className="text-gray-500">Started:</span>
                <div className="font-mono">{new Date(jobStatus.startedAt).toLocaleTimeString()}</div>
              </div>
            )}
            {jobStatus.processingTime && (
              <div>
                <span className="text-gray-500">Duration:</span>
                <div className="font-mono">{jobStatus.processingTime}</div>
              </div>
            )}
            {jobStatus.attempt && jobStatus.maxAttempts && (
              <div>
                <span className="text-gray-500">Attempt:</span>
                <div className="font-mono">{jobStatus.attempt}/{jobStatus.maxAttempts}</div>
              </div>
            )}
            <div>
              <span className="text-gray-500">Poll Count:</span>
              <div className="font-mono">{pollCount}</div>
            </div>
          </div>

          {/* Completed Job Results */}
          {jobStatus.status === 'completed' && jobStatus.result && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="text-sm font-medium text-green-800 mb-2">
                Job Completed Successfully
              </div>
              <div className="text-xs text-green-700 space-y-1">
                {jobStatus.result.recordCount && (
                  <div>Records processed: <span className="font-mono">{jobStatus.result.recordCount}</span></div>
                )}
                {jobStatus.completedAt && (
                  <div>Completed: <span className="font-mono">{new Date(jobStatus.completedAt).toLocaleTimeString()}</span></div>
                )}
              </div>
            </div>
          )}

          {/* Live Polling Indicator */}
          {isPolling && (
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Live monitoring active</span>
            </div>
          )}
        </div>
      ) : isPolling ? (
        <div className="flex items-center space-x-2 text-gray-600">
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-sm">Loading job status...</span>
        </div>
      ) : null}
    </div>
  )
}