import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { WorkerAppModule } from './app.module'

/**
 * Bootstrap function - Initialize our Anti-Fragile Worker service
 * 
 * This worker is designed to be the backbone of our data ingestion pipeline.
 * It processes jobs with intelligence, resilience, and complete observability.
 */
async function bootstrap() {
  // Create the NestJS worker application (no HTTP server needed)
  const app = await NestFactory.createApplicationContext(WorkerAppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  })

  const configService = app.get(ConfigService)

  // Worker startup log with structured format
  console.log({
    level: 'info',
    message: 'Anti-Fragile Worker service started successfully',
    service: '@mustache/worker',
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    pid: process.pid,
    uptime: process.uptime(),
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || '6379',
      db: process.env.REDIS_DB || '0'
    }
  })

  // In development, show useful information
  if (process.env.NODE_ENV !== 'production') {
    console.log({
      level: 'info',
      message: 'Development mode - Worker ready to process jobs',
      queues: {
        dataIngestion: 'Ready to process data ingestion jobs',
        googleSheets: 'Ready to process Google Sheets ingestion',
        // Future queues will be added here
      },
      timestamp: new Date().toISOString()
    })
  }

  // Keep the application running
  await app.init()
}

// Handle uncaught exceptions and rejections gracefully
process.on('uncaughtException', (error) => {
  console.log({
    level: 'error',
    message: 'Worker uncaught exception - shutting down gracefully',
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    pid: process.pid
  })
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.log({
    level: 'error',
    message: 'Worker unhandled rejection - shutting down gracefully',
    reason: String(reason),
    timestamp: new Date().toISOString(),
    pid: process.pid
  })
  process.exit(1)
})

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log({
    level: 'info',
    message: 'Worker SIGTERM received - initiating graceful shutdown',
    timestamp: new Date().toISOString(),
    pid: process.pid
  })
  process.exit(0)
})

bootstrap().catch((error) => {
  console.log({
    level: 'error',
    message: 'Failed to start Worker service',
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })
  process.exit(1)
})