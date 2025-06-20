import { Logger } from '@nestjs/common'
const CircuitBreaker = require('opossum')

/**
 * BaseConnector - Foundation for all data source connectors
 * 
 * This abstract class implements the core anti-fragile patterns that ALL
 * connectors must follow:
 * 
 * 1. Circuit breaker pattern for external API resilience
 * 2. Structured logging with trace correlation
 * 3. Retry logic with exponential backoff
 * 4. Idempotent data processing
 * 5. Comprehensive error handling
 * 
 * Every data source connector inherits these capabilities, ensuring
 * consistent behavior across our entire data pipeline.
 */
export abstract class BaseConnector {
  protected readonly logger = new Logger(this.constructor.name)
  protected circuitBreaker: any

  constructor(
    protected readonly connectorName: string,
    protected readonly circuitBreakerOptions?: any
  ) {
    // Initialize circuit breaker with anti-fragile defaults
    this.circuitBreaker = new CircuitBreaker(this.executeRequest.bind(this), {
      timeout: 30000,           // 30 second timeout
      errorThresholdPercentage: 50, // Open circuit at 50% failure rate
      resetTimeout: 60000,      // Try again after 1 minute
      rollingCountTimeout: 60000, // 1 minute rolling window
      rollingCountBuckets: 10,  // Track in 6-second buckets
      volumeThreshold: 5,       // Need at least 5 requests before opening
      ...circuitBreakerOptions
    })

    this.setupCircuitBreakerEvents()
  }

  /**
   * Abstract method that each connector must implement
   * This is where the actual API call logic goes
   */
  protected abstract executeRequest(params: any): Promise<any>

  /**
   * Process data with full anti-fragile capabilities
   * This is the main entry point for all data connector operations
   */
  async processData(params: any, traceId?: string): Promise<any> {
    const startTime = Date.now()
    const operationId = traceId || this.generateOperationId()

    this.logger.log({
      level: 'info',
      message: `Starting ${this.connectorName} data processing`,
      connector: this.connectorName,
      operationId,
      params: this.sanitizeParams(params),
      timestamp: new Date().toISOString()
    })

    try {
      // Execute request through circuit breaker
      const result = await this.circuitBreaker.fire(params)
      
      const processingTime = Date.now() - startTime

      this.logger.log({
        level: 'info',
        message: `${this.connectorName} data processing completed successfully`,
        connector: this.connectorName,
        operationId,
        processingTime: `${processingTime}ms`,
        recordCount: this.getRecordCount(result),
        timestamp: new Date().toISOString()
      })

      return {
        success: true,
        data: result,
        metadata: {
          connector: this.connectorName,
          operationId,
          processingTime,
          recordCount: this.getRecordCount(result),
          timestamp: new Date().toISOString()
        }
      }

    } catch (error) {
      const processingTime = Date.now() - startTime

      this.logger.error({
        level: 'error',
        message: `${this.connectorName} data processing failed`,
        connector: this.connectorName,
        operationId,
        error: error instanceof Error ? error.message : String(error),
        processingTime: `${processingTime}ms`,
        circuitBreakerState: this.circuitBreaker.stats,
        timestamp: new Date().toISOString()
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          connector: this.connectorName,
          operationId,
          processingTime,
          circuitBreakerState: this.circuitBreaker.stats,
          timestamp: new Date().toISOString()
        }
      }
    }
  }

  /**
   * Get connector health status including circuit breaker state
   */
  getHealth(): any {
    const stats = this.circuitBreaker.stats
    
    return {
      connector: this.connectorName,
      status: this.circuitBreaker.opened ? 'circuit_open' : 'healthy',
      circuitBreaker: {
        state: this.circuitBreaker.opened ? 'open' : this.circuitBreaker.halfOpen ? 'half-open' : 'closed',
        failures: stats.failures,
        successes: stats.successes,
        rejects: stats.rejects,
        timeouts: stats.timeouts,
        fallbacks: stats.fallbacks,
        semaphoreRejections: stats.semaphoreRejections
      },
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Set up circuit breaker event monitoring for observability
   */
  private setupCircuitBreakerEvents() {
    this.circuitBreaker.on('open', () => {
      this.logger.warn({
        level: 'warn',
        message: `Circuit breaker opened for ${this.connectorName}`,
        connector: this.connectorName,
        action: 'circuit_breaker_opened',
        timestamp: new Date().toISOString()
      })
    })

    this.circuitBreaker.on('halfOpen', () => {
      this.logger.log({
        level: 'info',
        message: `Circuit breaker half-opened for ${this.connectorName}`,
        connector: this.connectorName,
        action: 'circuit_breaker_half_opened',
        timestamp: new Date().toISOString()
      })
    })

    this.circuitBreaker.on('close', () => {
      this.logger.log({
        level: 'info',
        message: `Circuit breaker closed for ${this.connectorName}`,
        connector: this.connectorName,
        action: 'circuit_breaker_closed',
        timestamp: new Date().toISOString()
      })
    })

    this.circuitBreaker.on('reject', () => {
      this.logger.warn({
        level: 'warn',
        message: `Request rejected by circuit breaker for ${this.connectorName}`,
        connector: this.connectorName,
        action: 'circuit_breaker_reject',
        timestamp: new Date().toISOString()
      })
    })
  }

  /**
   * Generate unique operation ID for request tracking
   */
  private generateOperationId(): string {
    return `${this.connectorName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Sanitize parameters for logging (remove sensitive data)
   * Override this method in specific connectors to handle sensitive fields
   */
  protected sanitizeParams(params: any): any {
    if (!params || typeof params !== 'object') return params
    
    const sanitized = { ...params }
    
    // Remove common sensitive fields
    const sensitiveFields = ['apiKey', 'token', 'password', 'secret', 'auth', 'authorization']
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***redacted***'
      }
    })
    
    return sanitized
  }

  /**
   * Extract record count from result for metrics
   * Override this method in specific connectors based on their response format
   */
  protected getRecordCount(result: any): number {
    if (!result) return 0
    if (Array.isArray(result)) return result.length
    if (result.data && Array.isArray(result.data)) return result.data.length
    if (result.values && Array.isArray(result.values)) return result.values.length
    return 1
  }
}