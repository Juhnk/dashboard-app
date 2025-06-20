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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const redis_service_1 = require("../cache/redis.service");
let HealthController = class HealthController {
    prismaService;
    redisService;
    constructor(prismaService, redisService) {
        this.prismaService = prismaService;
        this.redisService = redisService;
    }
    async getHealth(req) {
        const now = Date.now();
        const responseTime = now - req.startTime;
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
                googleSheets: 'pending',
                facebookAds: 'pending',
                linkedinAds: 'pending'
            }
        };
        console.log({
            level: 'info',
            message: 'Health check completed',
            traceId: req.traceId,
            responseTime,
            memoryUsage: healthData.performance.memoryUsage,
            uptime: healthData.service.uptime,
            timestamp: healthData.timestamp
        });
        return healthData;
    }
    async getDetailedHealth(req) {
        const now = Date.now();
        const responseTime = now - req.startTime;
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
        };
        console.log({
            level: 'info',
            message: 'Detailed health check completed',
            traceId: req.traceId,
            responseTime,
            systemLoad: detailedHealth.performance.loadAverage[0],
            freeMemory: detailedHealth.performance.freeMemory,
            timestamp: detailedHealth.timestamp
        });
        return detailedHealth;
    }
    async getDatabaseHealth() {
        try {
            const result = await this.prismaService.healthCheck();
            return {
                status: result.status,
                responseTime: `${result.responseTime}ms`,
                connectionPool: result.status === 'healthy' ? 'active' : 'inactive'
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                responseTime: 'timeout',
                connectionPool: 'inactive',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    async getCacheHealth() {
        try {
            const result = await this.redisService.healthCheck();
            return {
                status: result.status,
                responseTime: `${result.responseTime}ms`,
                connections: result.status === 'healthy' ? 'active' : 'inactive'
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                responseTime: 'timeout',
                connections: 'inactive',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('detailed'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getDetailedHealth", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], HealthController);
//# sourceMappingURL=health.controller.js.map