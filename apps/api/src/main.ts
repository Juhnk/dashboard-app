import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import cors from 'cors'
import { AppModule } from './app.module'

/**
 * Bootstrap function - Initialize our Anti-Fragile API service
 * 
 * This setup establishes the security and observability foundations
 * that make our system production-ready from day one.
 */
async function bootstrap() {
  // Create the NestJS application
  const app = await NestFactory.create(AppModule, {
    // Configure structured logging from the very start
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  })

  const configService = app.get(ConfigService)
  
  // Security middleware - Production-ready from day one
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow dashboard embedding
  }))

  // CORS configuration for our frontend
  app.use(cors({
    origin: [
      'http://localhost:3000',  // Next.js dev server
      'http://localhost:6006',  // Storybook
      process.env.FRONTEND_URL || 'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Trace-ID'],
  }))

  // Global validation pipe with elite configuration
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // Strip unknown properties
    forbidNonWhitelisted: true, // Throw error for unknown properties
    transform: true,           // Transform payloads to DTO instances
    disableErrorMessages: process.env.NODE_ENV === 'production', // Hide validation details in prod
  }))

  // API versioning prefix
  app.setGlobalPrefix('api/v1')

  // Get port from environment or default
  const port = configService.get<number>('PORT', 3001)

  // Start the server
  await app.listen(port)

  // Structured startup log - First example of our elite logging standards
  console.log({
    level: 'info',
    message: 'Anti-Fragile API service started successfully',
    service: '@mustache/api',
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    port,
    healthCheckUrl: `http://localhost:${port}/api/v1/health`,
    timestamp: new Date().toISOString(),
    pid: process.pid,
    uptime: process.uptime()
  })

  // In development, show useful information
  if (process.env.NODE_ENV !== 'production') {
    console.log({
      level: 'info',
      message: 'Development mode - API endpoints available',
      endpoints: {
        health: `http://localhost:${port}/api/v1/health`,
        detailedHealth: `http://localhost:${port}/api/v1/health/detailed`,
        documentation: 'Additional endpoints will be added as modules are built'
      },
      timestamp: new Date().toISOString()
    })
  }
}

// Handle uncaught exceptions and rejections gracefully
process.on('uncaughtException', (error) => {
  console.log({
    level: 'error',
    message: 'Uncaught exception - shutting down gracefully',
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
    message: 'Unhandled rejection - shutting down gracefully',
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
    message: 'SIGTERM received - initiating graceful shutdown',
    timestamp: new Date().toISOString(),
    pid: process.pid
  })
  process.exit(0)
})

bootstrap().catch((error) => {
  console.log({
    level: 'error',
    message: 'Failed to start API service',
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })
  process.exit(1)
})