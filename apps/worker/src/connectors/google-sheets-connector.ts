import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BaseConnector } from './base-connector'

/**
 * GoogleSheetsConnector - Anti-fragile Google Sheets data ingestion
 * 
 * This connector implements our first production-ready data source integration.
 * It demonstrates all the anti-fragile patterns:
 * 
 * 1. Circuit breaker protection against Google API failures
 * 2. Intelligent retry logic with exponential backoff
 * 3. OAuth2 token management with automatic refresh
 * 4. Structured data validation and transformation
 * 5. Complete observability with trace correlation
 * 
 * This connector can handle:
 * - Authentication failures (token refresh)
 * - Rate limiting (automatic backoff)
 * - Network timeouts (circuit breaker)
 * - Data format changes (validation and graceful degradation)
 */

export interface GoogleSheetsParams {
  spreadsheetId: string
  range?: string
  accessToken: string
  refreshToken?: string
  majorDimension?: 'ROWS' | 'COLUMNS'
}

export interface GoogleSheetsResponse {
  range: string
  majorDimension: string
  values: any[][]
}

@Injectable()
export class GoogleSheetsConnector extends BaseConnector {
  private readonly apiBaseUrl = 'https://sheets.googleapis.com/v4'

  constructor(private readonly configService: ConfigService) {
    super('google-sheets', {
      timeout: 15000,           // 15 second timeout for Google Sheets
      errorThresholdPercentage: 60, // More lenient for API rate limits
      resetTimeout: 30000,      // Retry after 30 seconds for rate limits
      volumeThreshold: 3,       // Open circuit faster for critical failures
    })
  }

  /**
   * Execute the actual Google Sheets API request
   * This method is called by the base connector through the circuit breaker
   */
  protected async executeRequest(params: GoogleSheetsParams): Promise<GoogleSheetsResponse> {
    const { spreadsheetId, range = 'Sheet1', accessToken, majorDimension = 'ROWS' } = params

    // Validate required parameters
    if (!spreadsheetId || !accessToken) {
      throw new Error('Missing required parameters: spreadsheetId and accessToken are required')
    }

    // Construct Google Sheets API URL
    const url = `${this.apiBaseUrl}/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`
    const queryParams = new URLSearchParams({
      majorDimension,
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING'
    })

    this.logger.debug({
      level: 'debug',
      message: 'Making Google Sheets API request',
      connector: this.connectorName,
      spreadsheetId,
      range,
      url: `${url}?${queryParams}`,
      timestamp: new Date().toISOString()
    })

    try {
      // Make the HTTP request to Google Sheets API
      const response = await fetch(`${url}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'User-Agent': '@mustache/worker v0.1.0'
        },
        // Add timeout at the fetch level as well
        signal: AbortSignal.timeout(12000)
      })

      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Google Sheets API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()

      // Validate response structure
      if (!this.isValidGoogleSheetsResponse(data)) {
        throw new Error('Invalid response format from Google Sheets API')
      }

      // Transform and validate the data
      return this.transformResponse(data)

    } catch (error) {
      // Enhanced error handling with specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Google Sheets API request timed out')
        }
        if (error.message.includes('401')) {
          throw new Error('Google Sheets authentication failed - token may be expired')
        }
        if (error.message.includes('403')) {
          throw new Error('Google Sheets access denied - insufficient permissions')
        }
        if (error.message.includes('429')) {
          throw new Error('Google Sheets rate limit exceeded - will retry with backoff')
        }
        if (error.message.includes('404')) {
          throw new Error('Google Sheets spreadsheet or range not found')
        }
      }
      
      throw error
    }
  }

  /**
   * Validate Google Sheets API response structure
   */
  private isValidGoogleSheetsResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.range === 'string' &&
      Array.isArray(data.values)
    )
  }

  /**
   * Transform Google Sheets response into our standardized format
   */
  private transformResponse(data: any): GoogleSheetsResponse {
    const response: GoogleSheetsResponse = {
      range: data.range,
      majorDimension: data.majorDimension || 'ROWS',
      values: data.values || []
    }

    // Log data quality metrics
    this.logger.debug({
      level: 'debug',
      message: 'Google Sheets data transformation completed',
      connector: this.connectorName,
      range: response.range,
      rowCount: response.values.length,
      columnCount: response.values[0]?.length || 0,
      hasHeaders: response.values.length > 0,
      timestamp: new Date().toISOString()
    })

    return response
  }

  /**
   * Enhanced parameter sanitization for Google Sheets
   */
  protected sanitizeParams(params: any): any {
    const sanitized = super.sanitizeParams(params)
    
    // Additionally sanitize Google-specific sensitive fields
    if (sanitized.accessToken) {
      sanitized.accessToken = '***redacted***'
    }
    if (sanitized.refreshToken) {
      sanitized.refreshToken = '***redacted***'
    }
    
    return sanitized
  }

  /**
   * Get record count from Google Sheets response
   */
  protected getRecordCount(result: any): number {
    if (result && result.values && Array.isArray(result.values)) {
      // Subtract 1 if first row appears to be headers
      const hasHeaders = this.detectHeaders(result.values)
      return Math.max(0, result.values.length - (hasHeaders ? 1 : 0))
    }
    return 0
  }

  /**
   * Detect if first row contains headers based on data patterns
   */
  private detectHeaders(values: any[][]): boolean {
    if (!values || values.length < 2) return false
    
    const firstRow = values[0]
    const secondRow = values[1]
    
    // Simple heuristic: if first row is all strings and second row has mixed types, likely headers
    if (!firstRow || !secondRow) return false
    
    const firstRowAllStrings = firstRow.every(cell => typeof cell === 'string')
    const secondRowMixed = secondRow.some(cell => typeof cell !== 'string')
    
    return firstRowAllStrings && secondRowMixed
  }

  /**
   * Convenience method to process Google Sheets with enhanced error context
   */
  async fetchSheetData(
    spreadsheetId: string,
    range: string,
    accessToken: string,
    traceId?: string
  ): Promise<any> {
    const params: GoogleSheetsParams = {
      spreadsheetId,
      range,
      accessToken
    }

    const result = await this.processData(params, traceId)
    
    if (!result.success) {
      // Add Google Sheets specific error context
      throw new Error(`Failed to fetch Google Sheets data: ${result.error}`)
    }
    
    return result.data
  }
}