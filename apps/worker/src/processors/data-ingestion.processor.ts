import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed, OnQueueStalled, OnQueueProgress } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'
import { GoogleSheetsConnector } from '../connectors/google-sheets-connector'

/**
 * DataIngestionProcessor - The heart of our anti-fragile data pipeline
 * 
 * This processor handles all data ingestion jobs with intelligent retry logic,
 * comprehensive error handling, and complete observability.
 * 
 * Key features:
 * 1. Idempotent job processing (can safely retry without side effects)
 * 2. Structured logging with full trace correlation
 * 3. Intelligent failure handling with exponential backoff
 * 4. Circuit breaker integration for external API protection
 * 5. Comprehensive job metrics and monitoring
 * 
 * This processor will be extended to handle multiple data sources while
 * maintaining consistent behavior and observability.
 */

export interface DataIngestionJobData {
  source: 'google-sheets' | 'facebook-ads' | 'linkedin-ads'
  sourceId: string
  config: any
  traceId?: string
  userId?: string
  retryCount?: number
}

export interface GoogleSheetsJobConfig {
  spreadsheetId: string
  range: string
  accessToken: string
  refreshToken?: string
}

@Processor('data-ingestion')
export class DataIngestionProcessor {
  private readonly logger = new Logger(DataIngestionProcessor.name)

  constructor(
    private readonly googleSheetsConnector: GoogleSheetsConnector
  ) {}

  /**
   * Main job processing method
   * This handles all types of data ingestion jobs based on the source type
   */
  @Process()
  async process(job: Job<DataIngestionJobData>): Promise<any> {
    const startTime = Date.now()
    const { source, sourceId, config, traceId, userId } = job.data

    // Generate operation ID for this specific job execution
    const operationId = traceId || `job-${job.id}-${Date.now()}`

    this.logger.log({
      level: 'info',
      message: `Starting data ingestion job`,
      jobId: job.id,
      operationId,
      source,
      sourceId,
      userId,
      attempt: job.attemptsMade + 1,
      maxAttempts: job.opts.attempts || 3,
      timestamp: new Date().toISOString()
    })

    try {
      let result: any

      // Route to appropriate connector based on source type
      switch (source) {
        case 'google-sheets':
          result = await this.processGoogleSheetsJob(config as GoogleSheetsJobConfig, operationId)
          break
          
        case 'facebook-ads':
          throw new Error('Facebook Ads connector not yet implemented')
          
        case 'linkedin-ads':
          throw new Error('LinkedIn Ads connector not yet implemented')
          
        default:
          throw new Error(`Unsupported data source: ${source}`)
      }

      const processingTime = Date.now() - startTime

      this.logger.log({
        level: 'info',
        message: `Data ingestion job completed successfully`,
        jobId: job.id,
        operationId,
        source,
        sourceId,
        userId,
        processingTime: `${processingTime}ms`,
        recordCount: result?.recordCount || 0,
        timestamp: new Date().toISOString()
      })

      // Return structured result for job completion
      return {
        success: true,
        source,
        sourceId,
        operationId,
        processingTime,
        recordCount: result?.recordCount || 0,
        data: result?.data,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      const processingTime = Date.now() - startTime

      this.logger.error({
        level: 'error',
        message: `Data ingestion job failed`,
        jobId: job.id,
        operationId,
        source,
        sourceId,
        userId,
        error: error instanceof Error ? error.message : String(error),
        processingTime: `${processingTime}ms`,
        attempt: job.attemptsMade + 1,
        willRetry: job.attemptsMade < (job.opts.attempts || 3) - 1,
        timestamp: new Date().toISOString()
      })

      // Re-throw error to trigger Bull's retry mechanism
      throw error
    }
  }

  /**
   * Process Google Sheets data ingestion job
   */
  private async processGoogleSheetsJob(
    config: GoogleSheetsJobConfig,
    operationId: string
  ): Promise<any> {
    const { spreadsheetId, range, accessToken } = config

    // Validate required configuration
    if (!spreadsheetId || !range || !accessToken) {
      throw new Error('Missing required Google Sheets configuration: spreadsheetId, range, and accessToken are required')
    }

    this.logger.debug({
      level: 'debug',
      message: 'Processing Google Sheets ingestion job',
      operationId,
      spreadsheetId,
      range,
      timestamp: new Date().toISOString()
    })

    // Use the Google Sheets connector with circuit breaker protection
    const result = await this.googleSheetsConnector.processData({
      spreadsheetId,
      range,
      accessToken
    }, operationId)

    if (!result.success) {
      throw new Error(`Google Sheets connector failed: ${result.error}`)
    }

    // Transform data for storage/consumption
    const transformedData = this.transformGoogleSheetsData(result.data)

    return {
      data: transformedData,
      recordCount: this.googleSheetsConnector['getRecordCount'](result.data),
      metadata: result.metadata
    }
  }

  /**
   * Transform Google Sheets data into our standardized format
   */
  private transformGoogleSheetsData(data: any): any {
    if (!data || !data.values || !Array.isArray(data.values)) {
      return { headers: [], rows: [] }
    }

    const values = data.values
    if (values.length === 0) {
      return { headers: [], rows: [] }
    }

    // Assume first row contains headers
    const headers = values[0] || []
    const rows = values.slice(1)

    // Convert rows to objects with header keys
    const transformedRows = rows.map((row: any[], index: number) => {
      const rowObject: any = { _rowIndex: index + 2 } // +2 because we skip header and are 1-indexed
      
      headers.forEach((header: string, colIndex: number) => {
        const cellValue = row[colIndex]
        rowObject[header || `column_${colIndex}`] = cellValue !== undefined ? cellValue : null
      })
      
      return rowObject
    })

    return {
      source: 'google-sheets',
      range: data.range,
      headers,
      rows: transformedRows,
      metadata: {
        totalRows: rows.length,
        totalColumns: headers.length,
        transformedAt: new Date().toISOString()
      }
    }
  }

  /**
   * Job event handlers for comprehensive monitoring
   */
  @OnQueueCompleted()
  onCompleted(job: Job<DataIngestionJobData>, result: any) {
    this.logger.log({
      level: 'info',
      message: 'Job completed successfully',
      jobId: job.id,
      source: job.data.source,
      sourceId: job.data.sourceId,
      duration: Date.now() - job.processedOn!,
      recordCount: result?.recordCount || 0,
      timestamp: new Date().toISOString()
    })
  }

  @OnQueueFailed()
  onFailed(job: Job<DataIngestionJobData>, error: Error) {
    this.logger.error({
      level: 'error',
      message: 'Job failed permanently',
      jobId: job.id,
      source: job.data.source,
      sourceId: job.data.sourceId,
      error: error.message,
      attempts: job.attemptsMade,
      maxAttempts: job.opts.attempts || 3,
      timestamp: new Date().toISOString()
    })
  }

  @OnQueueStalled()
  onStalled(job: Job<DataIngestionJobData>) {
    this.logger.warn({
      level: 'warn',
      message: 'Job stalled - may be stuck or taking too long',
      jobId: job.id,
      source: job.data.source,
      sourceId: job.data.sourceId,
      timestamp: new Date().toISOString()
    })
  }

  @OnQueueProgress()
  onProgress(job: Job<DataIngestionJobData>, progress: number) {
    this.logger.debug({
      level: 'debug',
      message: 'Job progress update',
      jobId: job.id,
      source: job.data.source,
      progress: `${progress}%`,
      timestamp: new Date().toISOString()
    })
  }
}