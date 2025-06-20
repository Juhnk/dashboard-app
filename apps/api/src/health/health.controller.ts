import { Controller, Get, Req } from '@nestjs/common'
import { Request } from 'express'
import { PrismaService } from '../database/prisma.service'
import { RedisService } from '../cache/redis.service'

/**
 * HealthController - The first implementation of our System Intelligence pillar
 * 
 * This is NOT just a simple { status: 'ok' } endpoint. This is our proof of concept
 * for elite-level observability. Every response includes structured data that
 * enables deep system understanding.
 */
@Controller('health')
export class HealthController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async getHealth(@Req() req: Request) {
    const now = Date.now()
    const responseTime = now - req.startTime

    // Structured health response with comprehensive system intelligence
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      traceId: req.traceId,
      service: {
        name: '@mustache/api',
        version: process.env.npm_package_version || '0.1.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        pid: process.pid
      },
      performance: {
        responseTime: `${responseTime}ms`,
        memoryUsage: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB'
        },
        cpuUsage: process.cpuUsage()
      },
      database: await this.getDatabaseHealth(),
      cache: await this.getCacheHealth(),
      dependencies: {
        // External service health checks will go here
        googleSheets: 'pending',
        facebookAds: 'pending',
        linkedinAds: 'pending'
      }
    }

    // Log the health check with our structured format
    console.log({
      level: 'info',
      message: 'Health check completed',
      traceId: req.traceId,
      responseTime,
      memoryUsage: healthData.performance.memoryUsage,
      uptime: healthData.service.uptime,
      timestamp: healthData.timestamp
    })

    return healthData
  }

  /**
   * Deep health check endpoint for comprehensive system diagnostics
   * This will be used by monitoring systems for detailed health assessment
   */
  @Get('detailed')
  async getDetailedHealth(@Req() req: Request) {
    const now = Date.now()
    const responseTime = now - req.startTime

    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      traceId: req.traceId,
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        memory: {
          rss: process.memoryUsage().rss,
          heapTotal: process.memoryUsage().heapTotal,
          heapUsed: process.memoryUsage().heapUsed,
          external: process.memoryUsage().external,
          arrayBuffers: process.memoryUsage().arrayBuffers
        },
        cpu: process.cpuUsage(),
        uptime: {
          process: process.uptime(),
          system: require('os').uptime()
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        databaseUrl: process.env.DATABASE_URL ? '***configured***' : 'missing',
        redisUrl: process.env.REDIS_URL ? '***configured***' : 'missing'
      },
      performance: {
        responseTime: `${responseTime}ms`,
        loadAverage: require('os').loadavg(),
        freeMemory: Math.round(require('os').freemem() / 1024 / 1024),
        totalMemory: Math.round(require('os').totalmem() / 1024 / 1024)
      }
    }

    console.log({
      level: 'info',
      message: 'Detailed health check completed',
      traceId: req.traceId,
      responseTime,
      systemLoad: detailedHealth.performance.loadAverage[0],
      freeMemory: detailedHealth.performance.freeMemory,
      timestamp: detailedHealth.timestamp
    })

    return detailedHealth
  }

  /**
   * Database health check helper
   */
  private async getDatabaseHealth() {
    try {
      const result = await this.prismaService.healthCheck()
      return {
        status: result.status,
        responseTime: `${result.responseTime}ms`,
        connectionPool: result.status === 'healthy' ? 'active' : 'inactive'
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: 'timeout',
        connectionPool: 'inactive',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Cache health check helper
   */
  private async getCacheHealth() {
    try {
      const result = await this.redisService.healthCheck()
      return {
        status: result.status,
        responseTime: `${result.responseTime}ms`,
        connections: result.status === 'healthy' ? 'active' : 'inactive'
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: 'timeout',
        connections: 'inactive',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }
}