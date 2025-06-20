"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerAppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
const connectors_module_1 = require("./connectors/connectors.module");
const data_ingestion_processor_1 = require("./processors/data-ingestion.processor");
let WorkerAppModule = class WorkerAppModule {
};
exports.WorkerAppModule = WorkerAppModule;
exports.WorkerAppModule = WorkerAppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
                cache: true,
                expandVariables: true,
            }),
            ...(process.env.SKIP_REDIS !== 'true' ? [
                bull_1.BullModule.forRoot({
                    redis: {
                        host: process.env.REDIS_HOST || 'localhost',
                        port: parseInt(process.env.REDIS_PORT || '6379'),
                        password: process.env.REDIS_PASSWORD,
                        db: parseInt(process.env.REDIS_DB || '0'),
                        maxRetriesPerRequest: 3,
                        enableReadyCheck: true,
                        lazyConnect: true,
                    },
                }),
                bull_1.BullModule.registerQueue({
                    name: 'data-ingestion',
                    defaultJobOptions: {
                        attempts: 3,
                        backoff: {
                            type: 'exponential',
                            delay: 2000,
                        },
                        removeOnComplete: 100,
                        removeOnFail: 50,
                    },
                }),
            ] : []),
            connectors_module_1.ConnectorsModule,
        ],
        controllers: [],
        providers: [
            ...(process.env.SKIP_REDIS !== 'true' ? [data_ingestion_processor_1.DataIngestionProcessor] : []),
        ],
    })
], WorkerAppModule);
//# sourceMappingURL=app.module.js.map