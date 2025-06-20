import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BullModule } from '@nestjs/bull'
import { ConnectorsModule } from './connectors/connectors.module'
import { DataIngestionProcessor } from './processors/data-ingestion.processor'

/**
 * WorkerAppModule - The foundation of our Anti-Fragile data processing architecture
 * 
 * This module establishes the core principles for resilient, intelligent data ingestion:
 * 
 * 1. Queue-based job processing with automatic retries and failure handling
 * 2. Circuit breaker patterns for external API calls
 * 3. Idempotent job processing to prevent data duplication
 * 4. Comprehensive structured logging with trace correlation
 * 
 * Every job processor built in this system will be designed with the explicit
 * assumption that external services WILL fail, and our system must thrive despite this.
 */
@Module({
  imports: [
    // Configuration management with validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
      expandVariables: true,
    }),
    
    // BullMQ for robust job queue management (conditionally loaded)
    ...(process.env.SKIP_REDIS !== 'true' ? [
      BullModule.forRoot({
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB || '0'),
          // Connection resilience settings
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          lazyConnect: true,
        },
      }),
      
      // Register job queues
      BullModule.registerQueue({
        name: 'data-ingestion',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,  // Keep last 100 completed jobs
          removeOnFail: 50,       // Keep last 50 failed jobs for debugging
        },
      }),
    ] : []),
    
    // Import connector modules
    ConnectorsModule,
  ],
  controllers: [],
  providers: [
    // Only include processor if Redis is available (since it depends on BullMQ)
    ...(process.env.SKIP_REDIS !== 'true' ? [DataIngestionProcessor] : []),
  ],
})
export class WorkerAppModule {}