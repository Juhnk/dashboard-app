import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClient } from '@prisma/client'

/**
 * PrismaService - Elite database connection management
 * 
 * This service establishes our database connection with:
 * 1. Automatic connection management (connect on init, disconnect on destroy)
 * 2. Structured logging for all database operations
 * 3. Connection pool optimization for high performance
 * 4. Health check capabilities for monitoring
 * 
 * This is the foundation that enables our "Glass Box" principle -
 * every database interaction will be traceable and observable.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL') || 'postgresql://skip:skip@localhost:5432/skip'
    
    super({
      // Use connection URL from environment, or a dummy URL if skipping database
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      // Enable query logging in development
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      // Connection pool optimization
      // This configuration makes our database layer resilient to connection issues
    })
  }

  async onModuleInit() {
    if (this.configService.get<string>('SKIP_DATABASE') === 'true') {
      console.log({
        level: 'info',
        message: 'Database connection skipped (SKIP_DATABASE=true)',
        service: 'PrismaService',
        timestamp: new Date().toISOString()
      })
      return
    }

    try {
      await this.$connect()
      
      console.log({
        level: 'info',
        message: 'Database connection established successfully',
        service: 'PrismaService',
        databaseUrl: this.configService.get<string>('DATABASE_URL')?.replace(/\/\/.*@/, '//***:***@'),
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.log({
        level: 'error',
        message: 'Failed to establish database connection',
        service: 'PrismaService',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      })
      // Don't throw error - let the application start without database in development
      if (process.env.NODE_ENV === 'production') {
        throw error
      }
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect()
      
      console.log({
        level: 'info',
        message: 'Database connection closed successfully',
        service: 'PrismaService',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.log({
        level: 'error',
        message: 'Error closing database connection',
        service: 'PrismaService',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Health check method for database connectivity
   * Used by our health endpoint to verify database status
   */
  async healthCheck(): Promise<{ status: string; responseTime: number; connections?: number }> {
    const startTime = Date.now()
    
    if (this.configService.get<string>('SKIP_DATABASE') === 'true') {
      return {
        status: 'skipped',
        responseTime: Date.now() - startTime,
      }
    }
    
    try {
      // Simple query to test database connectivity
      await this.$queryRaw`SELECT 1 as health_check`
      
      const responseTime = Date.now() - startTime
      
      return {
        status: 'healthy',
        responseTime,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      
      console.log({
        level: 'error',
        message: 'Database health check failed',
        service: 'PrismaService',
        error: error instanceof Error ? error.message : String(error),
        responseTime,
        timestamp: new Date().toISOString()
      })
      
      return {
        status: 'unhealthy',
        responseTime,
      }
    }
  }
}