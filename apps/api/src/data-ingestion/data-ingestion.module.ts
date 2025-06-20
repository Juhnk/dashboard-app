import { Module } from '@nestjs/common'
import { DataIngestionController } from './data-ingestion.controller'
import { DataIngestionService } from './data-ingestion.service'

/**
 * DataIngestionModule - API endpoints for managing data ingestion
 * 
 * This module provides the RESTful interface for triggering and monitoring
 * data ingestion jobs. It demonstrates how to build resilient API endpoints
 * that coordinate with background worker processes.
 */
@Module({
  controllers: [DataIngestionController],
  providers: [DataIngestionService],
  exports: [DataIngestionService],
})
export class DataIngestionModule {}