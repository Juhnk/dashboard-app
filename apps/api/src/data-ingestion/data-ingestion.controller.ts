import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common'
import { Request } from 'express'
import { DataIngestionService } from './data-ingestion.service'

/**
 * DataIngestionController - API endpoints for managing data ingestion jobs
 * 
 * This controller provides the interface for:
 * 1. Triggering data ingestion jobs for various sources
 * 2. Monitoring job status and progress
 * 3. Retrieving ingested data
 * 
 * Every endpoint includes full traceability and structured logging
 * to maintain our Glass Box API principles.
 */

export interface GoogleSheetsIngestionRequest {
  spreadsheetId: string
  range: string
  accessToken: string
  refreshToken?: string
}

@Controller('data-ingestion')
export class DataIngestionController {
  constructor(private readonly dataIngestionService: DataIngestionService) {}

  /**
   * Trigger Google Sheets data ingestion
   */
  @Post('google-sheets')
  async ingestGoogleSheets(
    @Body() request: GoogleSheetsIngestionRequest,
    @Req() req: Request
  ) {
    const startTime = Date.now()

    console.log({
      level: 'info',
      message: 'Google Sheets ingestion request received',
      traceId: req.traceId,
      spreadsheetId: request.spreadsheetId,
      range: request.range,
      timestamp: new Date().toISOString()
    })

    try {
      const result = await this.dataIngestionService.ingestGoogleSheets(request, req.traceId)
      
      const responseTime = Date.now() - startTime

      console.log({
        level: 'info',
        message: 'Google Sheets ingestion job created successfully',
        traceId: req.traceId,
        jobId: result.jobId,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      })

      return {
        success: true,
        jobId: result.jobId,
        status: 'queued',
        message: 'Google Sheets ingestion job has been queued for processing',
        traceId: req.traceId,
        estimatedProcessingTime: '30-60 seconds'
      }

    } catch (error) {
      const responseTime = Date.now() - startTime

      console.log({
        level: 'error',
        message: 'Failed to create Google Sheets ingestion job',
        traceId: req.traceId,
        error: error instanceof Error ? error.message : String(error),
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        traceId: req.traceId
      }
    }
  }

  /**
   * Get job status and results
   */
  @Get('jobs/:jobId')
  async getJobStatus(@Param('jobId') jobId: string, @Req() req: Request) {
    console.log({
      level: 'info',
      message: 'Job status request received',
      traceId: req.traceId,
      jobId,
      timestamp: new Date().toISOString()
    })

    try {
      const status = await this.dataIngestionService.getJobStatus(jobId)
      
      return {
        success: true,
        jobId,
        ...status,
        traceId: req.traceId
      }

    } catch (error) {
      console.log({
        level: 'error',
        message: 'Failed to get job status',
        traceId: req.traceId,
        jobId,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        traceId: req.traceId
      }
    }
  }

  /**
   * Test endpoint for Google Sheets connector (direct processing without queue)
   */
  @Post('test/google-sheets')
  async testGoogleSheets(
    @Body() request: GoogleSheetsIngestionRequest,
    @Req() req: Request
  ) {
    const startTime = Date.now()

    console.log({
      level: 'info',
      message: 'Google Sheets test request received',
      traceId: req.traceId,
      spreadsheetId: request.spreadsheetId,
      range: request.range,
      timestamp: new Date().toISOString()
    })

    try {
      const result = await this.dataIngestionService.testGoogleSheetsConnector(request, req.traceId)
      
      const responseTime = Date.now() - startTime

      console.log({
        level: 'info',
        message: 'Google Sheets test completed successfully',
        traceId: req.traceId,
        recordCount: result.recordCount,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      })

      return {
        success: true,
        data: result.data,
        recordCount: result.recordCount,
        metadata: result.metadata,
        traceId: req.traceId,
        responseTime: `${responseTime}ms`
      }

    } catch (error) {
      const responseTime = Date.now() - startTime

      console.log({
        level: 'error',
        message: 'Google Sheets test failed',
        traceId: req.traceId,
        error: error instanceof Error ? error.message : String(error),
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        traceId: req.traceId,
        responseTime: `${responseTime}ms`
      }
    }
  }

  /**
   * Health check endpoint for data ingestion services
   */
  @Get('health')
  async getHealth(@Req() req: Request) {
    console.log({
      level: 'info',
      message: 'Data ingestion health check requested',
      traceId: req.traceId,
      timestamp: new Date().toISOString()
    })

    try {
      const health = await this.dataIngestionService.getHealth()
      
      return {
        success: true,
        ...health,
        traceId: req.traceId
      }

    } catch (error) {
      console.log({
        level: 'error',
        message: 'Data ingestion health check failed',
        traceId: req.traceId,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        traceId: req.traceId
      }
    }
  }
}