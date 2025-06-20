import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import * as crypto from 'crypto'

// Extend Express Request to include our tracing information
declare global {
  namespace Express {
    interface Request {
      traceId: string
      startTime: number
    }
  }
}

/**
 * TracingMiddleware - The foundation of our "Glass Box" API architecture
 * 
 * This middleware establishes the core principle of our System Intelligence pillar:
 * Every single request that enters our system gets a unique traceId that follows
 * it through every log entry, database query, and external API call.
 * 
 * This is what separates elite systems from standard ones - complete traceability.
 */
@Injectable()
export class TracingMiddleware implements NestMiddleware {
  private generateTraceId(): string {
    return crypto.randomBytes(6).toString('hex')
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Generate a unique trace ID for this request
    // Using crypto.randomBytes for URL-safe, collision-resistant IDs
    req.traceId = this.generateTraceId()
    req.startTime = Date.now()

    // Add trace ID to response headers for client-side correlation
    res.setHeader('X-Trace-ID', req.traceId)

    // Log the incoming request with structured data
    console.log({
      level: 'info',
      message: 'Incoming request',
      traceId: req.traceId,
      method: req.method,
      path: req.path,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      timestamp: new Date().toISOString(),
      requestSize: req.get('content-length') || 0
    })

    // Continue to next middleware
    next()
  }
}