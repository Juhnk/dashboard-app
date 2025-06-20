import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { HealthModule } from './health/health.module'
import { DatabaseModule } from './database/database.module'
import { CacheModule } from './cache/cache.module'
import { DataIngestionModule } from './data-ingestion/data-ingestion.module'
import { TracingMiddleware } from './middleware/tracing.middleware'

/**
 * AppModule - The foundation of our Anti-Fragile API architecture
 * 
 * This module establishes the core principles that will make our system
 * indestructible and intelligent:
 * 
 * 1. Complete request traceability (TracingMiddleware on every route)
 * 2. Rate limiting and security (ThrottlerModule)
 * 3. Environment-based configuration (ConfigModule)
 * 4. Comprehensive health monitoring (HealthModule)
 * 
 * Every decision here is made with the assumption that the outside world
 * is chaotic and unreliable, and our system must thrive in that chaos.
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
    
    // Rate limiting to protect against abuse
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,   // 1 second
        limit: 10,   // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 60000,  // 1 minute
        limit: 100,  // 100 requests per minute
      },
      {
        name: 'long',
        ttl: 900000, // 15 minutes
        limit: 1000, // 1000 requests per 15 minutes
      },
    ]),
    
    // Core infrastructure modules
    DatabaseModule,
    CacheModule,
    HealthModule,
    
    // Feature modules
    DataIngestionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  /**
   * Configure middleware that applies to ALL routes
   * TracingMiddleware ensures every single request gets a traceId
   * and structured logging from the very first moment it enters our system
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TracingMiddleware)
      .forRoutes('*') // Apply to ALL routes - no exceptions
  }
}