import { Module } from '@nestjs/common'
import { HealthController } from './health.controller'

/**
 * HealthModule - Core system observability module
 * 
 * Provides comprehensive health checking capabilities that form the foundation
 * of our System Intelligence pillar. This module will be extended with
 * database, cache, and external service health checks.
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}