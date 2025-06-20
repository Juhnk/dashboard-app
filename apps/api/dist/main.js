"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));
    app.use((0, cors_1.default)({
        origin: [
            'http://localhost:3000',
            'http://localhost:6006',
            process.env.FRONTEND_URL || 'http://localhost:3000'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Trace-ID'],
    }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: process.env.NODE_ENV === 'production',
    }));
    app.setGlobalPrefix('api/v1');
    const port = configService.get('PORT', 3001);
    await app.listen(port);
    console.log({
        level: 'info',
        message: 'Anti-Fragile API service started successfully',
        service: '@mustache/api',
        version: process.env.npm_package_version || '0.1.0',
        environment: process.env.NODE_ENV || 'development',
        port,
        healthCheckUrl: `http://localhost:${port}/api/v1/health`,
        timestamp: new Date().toISOString(),
        pid: process.pid,
        uptime: process.uptime()
    });
    if (process.env.NODE_ENV !== 'production') {
        console.log({
            level: 'info',
            message: 'Development mode - API endpoints available',
            endpoints: {
                health: `http://localhost:${port}/api/v1/health`,
                detailedHealth: `http://localhost:${port}/api/v1/health/detailed`,
                documentation: 'Additional endpoints will be added as modules are built'
            },
            timestamp: new Date().toISOString()
        });
    }
}
process.on('uncaughtException', (error) => {
    console.log({
        level: 'error',
        message: 'Uncaught exception - shutting down gracefully',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        pid: process.pid
    });
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.log({
        level: 'error',
        message: 'Unhandled rejection - shutting down gracefully',
        reason: String(reason),
        timestamp: new Date().toISOString(),
        pid: process.pid
    });
    process.exit(1);
});
process.on('SIGTERM', () => {
    console.log({
        level: 'info',
        message: 'SIGTERM received - initiating graceful shutdown',
        timestamp: new Date().toISOString(),
        pid: process.pid
    });
    process.exit(0);
});
bootstrap().catch((error) => {
    console.log({
        level: 'error',
        message: 'Failed to start API service',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
    process.exit(1);
});
//# sourceMappingURL=main.js.map