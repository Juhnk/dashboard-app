"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let RedisService = class RedisService {
    configService;
    client;
    isConnected = false;
    constructor(configService) {
        this.configService = configService;
        this.client = new ioredis_1.Redis({
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
            password: configService.get('REDIS_PASSWORD'),
            db: configService.get('REDIS_DB', 0),
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: true,
        });
        this.setupEventHandlers();
    }
    async onModuleInit() {
        if (this.configService.get('SKIP_REDIS') === 'true') {
            console.log({
                level: 'info',
                message: 'Redis connection skipped (SKIP_REDIS=true)',
                service: 'RedisService',
                timestamp: new Date().toISOString()
            });
            return;
        }
        try {
            await this.client.connect();
            this.isConnected = true;
            console.log({
                level: 'info',
                message: 'Redis connection established successfully',
                service: 'RedisService',
                host: this.configService.get('REDIS_HOST', 'localhost'),
                port: this.configService.get('REDIS_PORT', 6379),
                db: this.configService.get('REDIS_DB', 0),
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.isConnected = false;
            console.log({
                level: 'error',
                message: 'Failed to establish Redis connection',
                service: 'RedisService',
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString()
            });
        }
    }
    async onModuleDestroy() {
        try {
            await this.client.disconnect();
            this.isConnected = false;
            console.log({
                level: 'info',
                message: 'Redis connection closed successfully',
                service: 'RedisService',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.log({
                level: 'error',
                message: 'Error closing Redis connection',
                service: 'RedisService',
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString()
            });
        }
    }
    getClient() {
        return this.client;
    }
    isAvailable() {
        return this.isConnected && this.client.status === 'ready';
    }
    async healthCheck() {
        const startTime = Date.now();
        if (this.configService.get('SKIP_REDIS') === 'true') {
            return {
                status: 'skipped',
                responseTime: Date.now() - startTime,
            };
        }
        try {
            if (!this.isAvailable()) {
                return {
                    status: 'unavailable',
                    responseTime: Date.now() - startTime,
                };
            }
            const pong = await this.client.ping();
            const responseTime = Date.now() - startTime;
            return {
                status: pong === 'PONG' ? 'healthy' : 'unhealthy',
                responseTime,
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            console.log({
                level: 'error',
                message: 'Redis health check failed',
                service: 'RedisService',
                error: error instanceof Error ? error.message : String(error),
                responseTime,
                timestamp: new Date().toISOString()
            });
            return {
                status: 'unhealthy',
                responseTime,
            };
        }
    }
    async get(key) {
        if (!this.isAvailable()) {
            console.log({
                level: 'warn',
                message: 'Cache miss - Redis unavailable',
                service: 'RedisService',
                key,
                timestamp: new Date().toISOString()
            });
            return null;
        }
        try {
            const value = await this.client.get(key);
            console.log({
                level: 'debug',
                message: value ? 'Cache hit' : 'Cache miss',
                service: 'RedisService',
                key,
                hasValue: !!value,
                timestamp: new Date().toISOString()
            });
            return value;
        }
        catch (error) {
            console.log({
                level: 'error',
                message: 'Cache get operation failed',
                service: 'RedisService',
                key,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString()
            });
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        if (!this.isAvailable()) {
            console.log({
                level: 'warn',
                message: 'Cache set skipped - Redis unavailable',
                service: 'RedisService',
                key,
                timestamp: new Date().toISOString()
            });
            return false;
        }
        try {
            if (ttlSeconds) {
                await this.client.setex(key, ttlSeconds, value);
            }
            else {
                await this.client.set(key, value);
            }
            console.log({
                level: 'debug',
                message: 'Cache set successful',
                service: 'RedisService',
                key,
                ttl: ttlSeconds,
                timestamp: new Date().toISOString()
            });
            return true;
        }
        catch (error) {
            console.log({
                level: 'error',
                message: 'Cache set operation failed',
                service: 'RedisService',
                key,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString()
            });
            return false;
        }
    }
    setupEventHandlers() {
        this.client.on('connect', () => {
            console.log({
                level: 'info',
                message: 'Redis client connected',
                service: 'RedisService',
                timestamp: new Date().toISOString()
            });
        });
        this.client.on('ready', () => {
            this.isConnected = true;
            console.log({
                level: 'info',
                message: 'Redis client ready for operations',
                service: 'RedisService',
                timestamp: new Date().toISOString()
            });
        });
        this.client.on('error', (error) => {
            this.isConnected = false;
            console.log({
                level: 'error',
                message: 'Redis client error',
                service: 'RedisService',
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString()
            });
        });
        this.client.on('close', () => {
            this.isConnected = false;
            console.log({
                level: 'info',
                message: 'Redis client connection closed',
                service: 'RedisService',
                timestamp: new Date().toISOString()
            });
        });
        this.client.on('reconnecting', () => {
            console.log({
                level: 'info',
                message: 'Redis client reconnecting',
                service: 'RedisService',
                timestamp: new Date().toISOString()
            });
        });
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map