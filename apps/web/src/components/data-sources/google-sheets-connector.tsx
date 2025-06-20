'use client'

import React, { useState } from 'react'
import { dataIngestionApi } from '@/lib/backend-api-client'
import { JobMonitor } from './job-monitor'

/**
 * GoogleSheetsConnector - Production Google Sheets integration
 * 
 * This component demonstrates how to build sophisticated data source
 * configuration interfaces that integrate with our anti-fragile backend:
 * 
 * 1. Real-time connection testing with circuit breaker protection
 * 2. Asynchronous job queuing for large datasets
 * 3. Live progress monitoring with trace correlation
 * 4. Error handling with detailed diagnostics
 * 5. Performance metrics and timing
 * 
 * This shows the level of sophistication needed for production
 * data integration platforms.
 */

interface GoogleSheetsFormData {
  spreadsheetId: string
  range: string
  accessToken: string
  refreshToken?: string
}

interface TestResult {
  success: boolean
  data?: any
  recordCount?: number
  error?: string
  responseTime?: string
  traceId?: string
}

export function GoogleSheetsConnector() {
  const [formData, setFormData] = useState<GoogleSheetsFormData>({
    spreadsheetId: '',
    range: 'Sheet1',
    accessToken: '',
    refreshToken: ''
  })

  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [processingMode, setProcessingMode] = useState<'test' | 'queue'>('test')

  const handleInputChange = (field: keyof GoogleSheetsFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const testConnection = async () => {
    if (!formData.spreadsheetId || !formData.accessToken) {
      setTestResult({
        success: false,
        error: 'Please provide both Spreadsheet ID and Access Token'
      })
      return
    }

    setIsTestingConnection(true)
    setTestResult(null)

    try {
      console.log({
        level: 'info',
        message: 'Testing Google Sheets connection',
        spreadsheetId: formData.spreadsheetId,
        range: formData.range,
        timestamp: new Date().toISOString()
      })

      const response = await dataIngestionApi.testGoogleSheets({
        spreadsheetId: formData.spreadsheetId,
        range: formData.range,
        accessToken: formData.accessToken,
        refreshToken: formData.refreshToken || undefined
      })

      if (response.success) {
        setTestResult({
          success: true,
          data: response.data?.data,
          recordCount: response.data?.recordCount,
          responseTime: response.responseTime,
          traceId: response.traceId
        })

        console.log({
          level: 'info',
          message: 'Google Sheets connection test successful',
          recordCount: response.data?.recordCount,
          responseTime: response.responseTime,
          traceId: response.traceId,
          timestamp: new Date().toISOString()
        })
      } else {
        setTestResult({
          success: false,
          error: response.error || 'Connection test failed',
          traceId: response.traceId
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const queueIngestion = async () => {
    if (!formData.spreadsheetId || !formData.accessToken) {
      return
    }

    try {
      console.log({
        level: 'info',
        message: 'Queueing Google Sheets ingestion job',
        spreadsheetId: formData.spreadsheetId,
        range: formData.range,
        timestamp: new Date().toISOString()
      })

      const response = await dataIngestionApi.ingestGoogleSheets({
        spreadsheetId: formData.spreadsheetId,
        range: formData.range,
        accessToken: formData.accessToken,
        refreshToken: formData.refreshToken || undefined
      })

      if (response.success) {
        setCurrentJobId(response.data?.jobId || null)
        
        console.log({
          level: 'info',
          message: 'Google Sheets ingestion job queued',
          jobId: response.data?.jobId,
          traceId: response.traceId,
          timestamp: new Date().toISOString()
        })
      } else {
        setTestResult({
          success: false,
          error: response.error || 'Failed to queue ingestion job',
          traceId: response.traceId
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }

  const handleJobComplete = (result: any) => {
    console.log({
      level: 'info',
      message: 'Ingestion job completed',
      jobId: currentJobId,
      result,
      timestamp: new Date().toISOString()
    })

    setTestResult({
      success: true,
      data: result.data,
      recordCount: result.recordCount,
      responseTime: result.processingTime
    })
  }

  const handleJobError = (error: string) => {
    console.log({
      level: 'error',
      message: 'Ingestion job failed',
      jobId: currentJobId,
      error,
      timestamp: new Date().toISOString()
    })

    setTestResult({
      success: false,
      error
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Google Sheets Data Source</h3>
        <p className="text-gray-600 mb-6">
          Connect to Google Sheets with our anti-fragile data pipeline featuring circuit breaker protection,
          intelligent retries, and real-time monitoring.
        </p>
      </div>

      {/* Configuration Form */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Spreadsheet ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.spreadsheetId}
            onChange={handleInputChange('spreadsheetId')}
            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Found in the Google Sheets URL between /d/ and /edit
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Range
          </label>
          <input
            type="text"
            value={formData.range}
            onChange={handleInputChange('range')}
            placeholder="Sheet1 or Sheet1!A1:Z100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Sheet name or specific range in A1 notation
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Access Token <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={formData.accessToken}
            onChange={handleInputChange('accessToken')}
            placeholder="OAuth2 access token"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            OAuth2 access token with Google Sheets read permissions
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Refresh Token (Optional)
          </label>
          <input
            type="password"
            value={formData.refreshToken}
            onChange={handleInputChange('refreshToken')}
            placeholder="OAuth2 refresh token"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            For automatic token refresh when access token expires
          </p>
        </div>

        {/* Processing Mode Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Processing Mode
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="processingMode"
                value="test"
                checked={processingMode === 'test'}
                onChange={(e) => setProcessingMode(e.target.value as 'test' | 'queue')}
                className="mr-2"
              />
              <span className="text-sm">Direct Test (immediate)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="processingMode"
                value="queue"
                checked={processingMode === 'queue'}
                onChange={(e) => setProcessingMode(e.target.value as 'test' | 'queue')}
                className="mr-2"
              />
              <span className="text-sm">Queue Job (async)</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={processingMode === 'test' ? testConnection : queueIngestion}
            disabled={isTestingConnection || !formData.spreadsheetId || !formData.accessToken}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isTestingConnection ? (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            <span>
              {processingMode === 'test' ? 'Test Connection' : 'Queue Ingestion'}
            </span>
          </button>

          {testResult && (
            <button
              onClick={() => {
                setTestResult(null)
                setCurrentJobId(null)
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Clear Results
            </button>
          )}
        </div>
      </div>

      {/* Job Monitor */}
      {currentJobId && (
        <JobMonitor
          jobId={currentJobId}
          onComplete={handleJobComplete}
          onError={handleJobError}
        />
      )}

      {/* Test Results */}
      {testResult && (
        <div className={`border rounded-lg p-6 ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center space-x-2 mb-4">
            {testResult.success ? (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <h4 className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {testResult.success ? 'Connection Successful' : 'Connection Failed'}
            </h4>
          </div>

          {testResult.success ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Records:</span>
                  <div className="font-mono text-green-700">{testResult.recordCount}</div>
                </div>
                <div>
                  <span className="text-gray-600">Response Time:</span>
                  <div className="font-mono text-green-700">{testResult.responseTime}</div>
                </div>
                {testResult.traceId && (
                  <div>
                    <span className="text-gray-600">Trace ID:</span>
                    <div className="font-mono text-green-700">{testResult.traceId.slice(-8)}</div>
                  </div>
                )}
              </div>

              {testResult.data && testResult.data.headers && (
                <div>
                  <h5 className="font-medium text-green-800 mb-2">Data Preview</h5>
                  <div className="bg-white border rounded p-3 max-h-48 overflow-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          {testResult.data.headers.map((header: string, index: number) => (
                            <th key={index} className="text-left py-1 px-2 font-medium text-gray-700">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {testResult.data.rows.slice(0, 5).map((row: any, index: number) => (
                          <tr key={index} className="border-b border-gray-100">
                            {testResult.data.headers.map((header: string, colIndex: number) => (
                              <td key={colIndex} className="py-1 px-2 text-gray-600">
                                {row[header] !== undefined ? String(row[header]) : '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {testResult.data.rows.length > 5 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Showing 5 of {testResult.recordCount} records
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-red-700">{testResult.error}</p>
              {testResult.traceId && (
                <p className="text-xs text-red-600">
                  Trace ID: {testResult.traceId} (for debugging)
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}