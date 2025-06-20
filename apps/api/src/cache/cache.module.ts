import { Module, Global } from '@nestjs/common'
import { RedisService } from './redis.service'

/**
 * CacheModule - Global cache access module
 * 
 * Provides Redis-based caching capabilities throughout the application.
 * Marked as @Global for frictionless access while maintaining observability.
 * 
 * This module enables our anti-fragile caching strategy:
 * - Fast responses through intelligent caching
 * - Graceful degradation when cache is unavailable
 * - Complete observability of cache operations
 */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class CacheModule {}