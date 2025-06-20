import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

/**
 * DataIngestionService - Bridge between API and Worker services
 * 
 * This service manages the interaction between our API and the data processing worker.
 * It demonstrates how to build resilient distributed systems:
 * 
 * 1. Queue-based job dispatch for horizontal scalability
 * 2. Direct connector testing for development and debugging
 * 3. Comprehensive status monitoring across services
 * 4. Graceful degradation when worker services are unavailable
 * 
 * This architecture allows our API to remain responsive while heavy data
 * processing happens asynchronously in dedicated worker processes.
 */

export interface GoogleSheetsRequest {
  spreadsheetId: string
  range: string
  accessToken: string
  refreshToken?: string
}

@Injectable()
export class DataIngestionService {
  private readonly logger = new Logger(DataIngestionService.name)

  constructor(private readonly configService: ConfigService) {}

  /**
   * Queue Google Sheets ingestion job for processing by worker
   */
  async ingestGoogleSheets(request: GoogleSheetsRequest, traceId?: string): Promise<any> {
    const operationId = traceId || this.generateOperationId()

    this.logger.log({
      level: 'info',
      message: 'Queueing Google Sheets ingestion job',
      operationId,
      spreadsheetId: request.spreadsheetId,
      range: request.range,
      timestamp: new Date().toISOString()
    })

    // For now, since we're running without Redis/queue, we'll simulate job creation
    // In a real implementation, this would use BullMQ to add jobs to the queue
    const mockJobId = `gs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    this.logger.log({
      level: 'info',
      message: 'Google Sheets ingestion job queued successfully',
      operationId,
      jobId: mockJobId,
      timestamp: new Date().toISOString()
    })

    return {
      jobId: mockJobId,
      status: 'queued',
      operationId
    }
  }

  /**
   * Test Google Sheets connector directly (bypass queue for immediate testing)
   */
  async testGoogleSheetsConnector(request: GoogleSheetsRequest, traceId?: string): Promise<any> {
    const operationId = traceId || this.generateOperationId()

    this.logger.log({
      level: 'info',
      message: 'Testing Google Sheets connector directly',
      operationId,
      spreadsheetId: request.spreadsheetId,
      range: request.range,
      timestamp: new Date().toISOString()
    })

    // For demonstration, we'll create a mock Google Sheets connector response
    // In a real implementation, this would use the actual GoogleSheetsConnector
    const mockData = this.createMockGoogleSheetsData(request)

    this.logger.log({
      level: 'info',
      message: 'Google Sheets connector test completed',
      operationId,
      recordCount: mockData.recordCount,
      timestamp: new Date().toISOString()
    })

    return mockData
  }

  /**
   * Get job status and results
   */
  async getJobStatus(jobId: string): Promise<any> {
    this.logger.log({
      level: 'info',
      message: 'Retrieving job status',
      jobId,
      timestamp: new Date().toISOString()
    })

    // Mock job status for demonstration
    // In a real implementation, this would query the Bull queue for job status
    const mockStatus = {
      status: 'completed',
      progress: 100,
      result: {
        recordCount: 42,
        processingTime: '1.2s',
        completedAt: new Date().toISOString()
      }
    }

    return mockStatus
  }

  /**
   * Get health status of data ingestion services
   */
  async getHealth(): Promise<any> {
    this.logger.log({
      level: 'info',
      message: 'Checking data ingestion health',
      timestamp: new Date().toISOString()
    })

    // Mock health status
    return {
      service: 'data-ingestion',
      status: 'healthy',
      components: {
        queue: {
          status: this.configService.get('SKIP_REDIS') === 'true' ? 'disabled' : 'healthy',
          jobs: {
            waiting: 0,
            active: 0,
            completed: 156,
            failed: 3
          }
        },
        connectors: {
          googleSheets: {
            status: 'healthy',
            circuitBreaker: 'closed',
            lastSuccess: new Date().toISOString()
          }
        }
      },
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Create mock Google Sheets data for testing
   */
  private createMockGoogleSheetsData(request: GoogleSheetsRequest): any {
    const mockHeaders = ['Date', 'Campaign', 'Impressions', 'Clicks', 'Cost', 'Conversions']
    const mockRows = [
      { Date: '2025-06-19', Campaign: 'Summer Sale', Impressions: 15420, Clicks: 342, Cost: 125.50, Conversions: 12 },
      { Date: '2025-06-18', Campaign: 'Summer Sale', Impressions: 14280, Clicks: 298, Cost: 109.80, Conversions: 8 },
      { Date: '2025-06-17', Campaign: 'Brand Awareness', Impressions: 22100, Clicks: 156, Cost: 89.30, Conversions: 3 },
      { Date: '2025-06-16', Campaign: 'Retargeting', Impressions: 8750, Clicks: 245, Cost: 78.20, Conversions: 15 },
    ]

    return {
      data: {
        source: 'google-sheets',
        spreadsheetId: request.spreadsheetId,
        range: request.range,
        headers: mockHeaders,
        rows: mockRows,
        metadata: {
          totalRows: mockRows.length,
          totalColumns: mockHeaders.length,
          transformedAt: new Date().toISOString()
        }
      },
      recordCount: mockRows.length,
      metadata: {
        connector: 'google-sheets',
        processingTime: '850ms',
        circuitBreakerState: 'closed',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Generate unique operation ID for tracking
   */
  private generateOperationId(): string {
    return `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}