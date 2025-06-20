"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseConnector = void 0;
const common_1 = require("@nestjs/common");
const CircuitBreaker = require('opossum');
class BaseConnector {
    connectorName;
    circuitBreakerOptions;
    logger = new common_1.Logger(this.constructor.name);
    circuitBreaker;
    constructor(connectorName, circuitBreakerOptions) {
        this.connectorName = connectorName;
        this.circuitBreakerOptions = circuitBreakerOptions;
        this.circuitBreaker = new CircuitBreaker(this.executeRequest.bind(this), {
            timeout: 30000,
            errorThresholdPercentage: 50,
            resetTimeout: 60000,
            rollingCountTimeout: 60000,
            rollingCountBuckets: 10,
            volumeThreshold: 5,
            ...circuitBreakerOptions
        });
        this.setupCircuitBreakerEvents();
    }
    async processData(params, traceId) {
        const startTime = Date.now();
        const operationId = traceId || this.generateOperationId();
        this.logger.log({
            level: 'info',
            message: `Starting ${this.connectorName} data processing`,
            connector: this.connectorName,
            operationId,
            params: this.sanitizeParams(params),
            timestamp: new Date().toISOString()
        });
        try {
            const result = await this.circuitBreaker.fire(params);
            const processingTime = Date.now() - startTime;
            this.logger.log({
                level: 'info',
                message: `${this.connectorName} data processing completed successfully`,
                connector: this.connectorName,
                operationId,
                processingTime: `${processingTime}ms`,
                recordCount: this.getRecordCount(result),
                timestamp: new Date().toISOString()
            });
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
            };
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            this.logger.error({
                level: 'error',
                message: `${this.connectorName} data processing failed`,
                connector: this.connectorName,
                operationId,
                error: error instanceof Error ? error.message : String(error),
                processingTime: `${processingTime}ms`,
                circuitBreakerState: this.circuitBreaker.stats,
                timestamp: new Date().toISOString()
            });
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
            };
        }
    }
    getHealth() {
        const stats = this.circuitBreaker.stats;
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
        };
    }
    setupCircuitBreakerEvents() {
        this.circuitBreaker.on('open', () => {
            this.logger.warn({
                level: 'warn',
                message: `Circuit breaker opened for ${this.connectorName}`,
                connector: this.connectorName,
                action: 'circuit_breaker_opened',
                timestamp: new Date().toISOString()
            });
        });
        this.circuitBreaker.on('halfOpen', () => {
            this.logger.log({
                level: 'info',
                message: `Circuit breaker half-opened for ${this.connectorName}`,
                connector: this.connectorName,
                action: 'circuit_breaker_half_opened',
                timestamp: new Date().toISOString()
            });
        });
        this.circuitBreaker.on('close', () => {
            this.logger.log({
                level: 'info',
                message: `Circuit breaker closed for ${this.connectorName}`,
                connector: this.connectorName,
                action: 'circuit_breaker_closed',
                timestamp: new Date().toISOString()
            });
        });
        this.circuitBreaker.on('reject', () => {
            this.logger.warn({
                level: 'warn',
                message: `Request rejected by circuit breaker for ${this.connectorName}`,
                connector: this.connectorName,
                action: 'circuit_breaker_reject',
                timestamp: new Date().toISOString()
            });
        });
    }
    generateOperationId() {
        return `${this.connectorName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    sanitizeParams(params) {
        if (!params || typeof params !== 'object')
            return params;
        const sanitized = { ...params };
        const sensitiveFields = ['apiKey', 'token', 'password', 'secret', 'auth', 'authorization'];
        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '***redacted***';
            }
        });
        return sanitized;
    }
    getRecordCount(result) {
        if (!result)
            return 0;
        if (Array.isArray(result))
            return result.length;
        if (result.data && Array.isArray(result.data))
            return result.data.length;
        if (result.values && Array.isArray(result.values))
            return result.values.length;
        return 1;
    }
}
exports.BaseConnector = BaseConnector;
//# sourceMappingURL=base-connector.js.map