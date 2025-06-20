import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Redis } from 'ioredis'

/**
 * RedisService - Elite cache and queue management
 * 
 * This service provides:
 * 1. High-performance caching with automatic connection management
 * 2. Queue backend for our job processing system
 * 3. Health monitoring for cache availability
 * 4. Structured logging for all cache operations
 * 
 * The cache layer is critical for our anti-fragile architecture -
 * it reduces load on external services and provides fast fallbacks.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis
  private isConnected = false

  constructor(private configService: ConfigService) {
    // Create Redis client with resilient configuration
    this.client = new Redis({
      host: configService.get<string>('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
      password: configService.get<string>('REDIS_PASSWORD'),
      db: configService.get<number>('REDIS_DB', 0),
      // Resilience settings for anti-fragile behavior
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    })

    // Set up event handlers for connection monitoring
    this.setupEventHandlers()
  }

  async onModuleInit() {
    if (this.configService.get<string>('SKIP_REDIS') === 'true') {
      console.log({
        level: 'info',
        message: 'Redis connection skipped (SKIP_REDIS=true)',
        service: 'RedisService',
        timestamp: new Date().toISOString()
      })
      return
    }

    try {
      await this.client.connect()
      this.isConnected = true
      
      console.log({
        level: 'info',
        message: 'Redis connection established successfully',
        service: 'RedisService',
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        db: this.configService.get<number>('REDIS_DB', 0),
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      this.isConnected = false
      
      console.log({
        level: 'error',
        message: 'Failed to establish Redis connection',
        service: 'RedisService',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      })
      
      // Don't throw error - let the application start without cache
      // This is anti-fragile behavior - degraded but functional
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.disconnect()
      this.isConnected = false
      
      console.log({
        level: 'info',
        message: 'Redis connection closed successfully',
        service: 'RedisService',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.log({
        level: 'error',
        message: 'Error closing Redis connection',
        service: 'RedisService',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Get the Redis client for direct operations
   * Used by job queue and caching operations
   */
  getClient(): Redis {
    return this.client
  }

  /**
   * Check if Redis is connected and available
   */
  isAvailable(): boolean {
    return this.isConnected && this.client.status === 'ready'
  }

  /**
   * Health check method for Redis connectivity
   * Used by our health endpoint to verify cache status
   */
  async healthCheck(): Promise<{ status: string; responseTime: number; connections?: number }> {
    const startTime = Date.now()
    
    if (this.configService.get<string>('SKIP_REDIS') === 'true') {
      return {
        status: 'skipped',
        responseTime: Date.now() - startTime,
      }
    }
    
    try {
      if (!this.isAvailable()) {
        return {
          status: 'unavailable',
          responseTime: Date.now() - startTime,
        }
      }

      // Test Redis connectivity with a simple ping
      const pong = await this.client.ping()
      const responseTime = Date.now() - startTime
      
      return {
        status: pong === 'PONG' ? 'healthy' : 'unhealthy',
        responseTime,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      
      console.log({
        level: 'error',
        message: 'Redis health check failed',
        service: 'RedisService',
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

  /**
   * Enhanced caching methods with built-in observability
   */
  async get(key: string): Promise<string | null> {
    if (!this.isAvailable()) {
      console.log({
        level: 'warn',
        message: 'Cache miss - Redis unavailable',
        service: 'RedisService',
        key,
        timestamp: new Date().toISOString()
      })
      return null
    }

    try {
      const value = await this.client.get(key)
      
      console.log({
        level: 'debug',
        message: value ? 'Cache hit' : 'Cache miss',
        service: 'RedisService',
        key,
        hasValue: !!value,
        timestamp: new Date().toISOString()
      })
      
      return value
    } catch (error) {
      console.log({
        level: 'error',
        message: 'Cache get operation failed',
        service: 'RedisService',
        key,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      })
      return null
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (!this.isAvailable()) {
      console.log({
        level: 'warn',
        message: 'Cache set skipped - Redis unavailable',
        service: 'RedisService',
        key,
        timestamp: new Date().toISOString()
      })
      return false
    }

    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value)
      } else {
        await this.client.set(key, value)
      }
      
      console.log({
        level: 'debug',
        message: 'Cache set successful',
        service: 'RedisService',
        key,
        ttl: ttlSeconds,
        timestamp: new Date().toISOString()
      })
      
      return true
    } catch (error) {
      console.log({
        level: 'error',
        message: 'Cache set operation failed',
        service: 'RedisService',
        key,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      })
      return false
    }
  }

  /**
   * Set up Redis event handlers for monitoring and observability
   */
  private setupEventHandlers() {
    this.client.on('connect', () => {
      console.log({
        level: 'info',
        message: 'Redis client connected',
        service: 'RedisService',
        timestamp: new Date().toISOString()
      })
    })

    this.client.on('ready', () => {
      this.isConnected = true
      console.log({
        level: 'info',
        message: 'Redis client ready for operations',
        service: 'RedisService',
        timestamp: new Date().toISOString()
      })
    })

    this.client.on('error', (error) => {
      this.isConnected = false
      console.log({
        level: 'error',
        message: 'Redis client error',
        service: 'RedisService',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      })
    })

    this.client.on('close', () => {
      this.isConnected = false
      console.log({
        level: 'info',
        message: 'Redis client connection closed',
        service: 'RedisService',
        timestamp: new Date().toISOString()
      })
    })

    this.client.on('reconnecting', () => {
      console.log({
        level: 'info',
        message: 'Redis client reconnecting',
        service: 'RedisService',
        timestamp: new Date().toISOString()
      })
    })
  }
}