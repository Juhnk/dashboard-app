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
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    configService;
    constructor(configService) {
        const databaseUrl = configService.get('DATABASE_URL') || 'postgresql://skip:skip@localhost:5432/skip';
        super({
            datasources: {
                db: {
                    url: databaseUrl,
                },
            },
            log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        });
        this.configService = configService;
    }
    async onModuleInit() {
        if (this.configService.get('SKIP_DATABASE') === 'true') {
            console.log({
                level: 'info',
                message: 'Database connection skipped (SKIP_DATABASE=true)',
                service: 'PrismaService',
                timestamp: new Date().toISOString()
            });
            return;
        }
        try {
            await this.$connect();
            console.log({
                level: 'info',
                message: 'Database connection established successfully',
                service: 'PrismaService',
                databaseUrl: this.configService.get('DATABASE_URL')?.replace(/\/\/.*@/, '//***:***@'),
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.log({
                level: 'error',
                message: 'Failed to establish database connection',
                service: 'PrismaService',
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString()
            });
            if (process.env.NODE_ENV === 'production') {
                throw error;
            }
        }
    }
    async onModuleDestroy() {
        try {
            await this.$disconnect();
            console.log({
                level: 'info',
                message: 'Database connection closed successfully',
                service: 'PrismaService',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.log({
                level: 'error',
                message: 'Error closing database connection',
                service: 'PrismaService',
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString()
            });
        }
    }
    async healthCheck() {
        const startTime = Date.now();
        if (this.configService.get('SKIP_DATABASE') === 'true') {
            return {
                status: 'skipped',
                responseTime: Date.now() - startTime,
            };
        }
        try {
            await this.$queryRaw `SELECT 1 as health_check`;
            const responseTime = Date.now() - startTime;
            return {
                status: 'healthy',
                responseTime,
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            console.log({
                level: 'error',
                message: 'Database health check failed',
                service: 'PrismaService',
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
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map