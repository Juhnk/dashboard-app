"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.WorkerAppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    console.log({
        level: 'info',
        message: 'Anti-Fragile Worker service started successfully',
        service: '@mustache/worker',
        version: process.env.npm_package_version || '0.1.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        pid: process.pid,
        uptime: process.uptime(),
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || '6379',
            db: process.env.REDIS_DB || '0'
        }
    });
    if (process.env.NODE_ENV !== 'production') {
        console.log({
            level: 'info',
            message: 'Development mode - Worker ready to process jobs',
            queues: {
                dataIngestion: 'Ready to process data ingestion jobs',
                googleSheets: 'Ready to process Google Sheets ingestion',
            },
            timestamp: new Date().toISOString()
        });
    }
    await app.init();
}
process.on('uncaughtException', (error) => {
    console.log({
        level: 'error',
        message: 'Worker uncaught exception - shutting down gracefully',
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
        message: 'Worker unhandled rejection - shutting down gracefully',
        reason: String(reason),
        timestamp: new Date().toISOString(),
        pid: process.pid
    });
    process.exit(1);
});
process.on('SIGTERM', () => {
    console.log({
        level: 'info',
        message: 'Worker SIGTERM received - initiating graceful shutdown',
        timestamp: new Date().toISOString(),
        pid: process.pid
    });
    process.exit(0);
});
bootstrap().catch((error) => {
    console.log({
        level: 'error',
        message: 'Failed to start Worker service',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
    process.exit(1);
});
//# sourceMappingURL=main.js.map