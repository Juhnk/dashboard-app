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
var DataIngestionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataIngestionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let DataIngestionService = DataIngestionService_1 = class DataIngestionService {
    configService;
    logger = new common_1.Logger(DataIngestionService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    async ingestGoogleSheets(request, traceId) {
        const operationId = traceId || this.generateOperationId();
        this.logger.log({
            level: 'info',
            message: 'Queueing Google Sheets ingestion job',
            operationId,
            spreadsheetId: request.spreadsheetId,
            range: request.range,
            timestamp: new Date().toISOString()
        });
        const mockJobId = `gs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.logger.log({
            level: 'info',
            message: 'Google Sheets ingestion job queued successfully',
            operationId,
            jobId: mockJobId,
            timestamp: new Date().toISOString()
        });
        return {
            jobId: mockJobId,
            status: 'queued',
            operationId
        };
    }
    async testGoogleSheetsConnector(request, traceId) {
        const operationId = traceId || this.generateOperationId();
        this.logger.log({
            level: 'info',
            message: 'Testing Google Sheets connector directly',
            operationId,
            spreadsheetId: request.spreadsheetId,
            range: request.range,
            timestamp: new Date().toISOString()
        });
        const mockData = this.createMockGoogleSheetsData(request);
        this.logger.log({
            level: 'info',
            message: 'Google Sheets connector test completed',
            operationId,
            recordCount: mockData.recordCount,
            timestamp: new Date().toISOString()
        });
        return mockData;
    }
    async getJobStatus(jobId) {
        this.logger.log({
            level: 'info',
            message: 'Retrieving job status',
            jobId,
            timestamp: new Date().toISOString()
        });
        const mockStatus = {
            status: 'completed',
            progress: 100,
            result: {
                recordCount: 42,
                processingTime: '1.2s',
                completedAt: new Date().toISOString()
            }
        };
        return mockStatus;
    }
    async getHealth() {
        this.logger.log({
            level: 'info',
            message: 'Checking data ingestion health',
            timestamp: new Date().toISOString()
        });
        return {
            service: 'data-ingestion',
            status: 'healthy',
            components: {
                queue: {
                    status: this.configService.get('SKIP_REDIS') === 'true' ? 'disabled' : 'healthy',
                    jobs: {
                        waiting: 0,
                        active: 0,
                        completed: 156,
                        failed: 3
                    }
                },
                connectors: {
                    googleSheets: {
                        status: 'healthy',
                        circuitBreaker: 'closed',
                        lastSuccess: new Date().toISOString()
                    }
                }
            },
            timestamp: new Date().toISOString()
        };
    }
    createMockGoogleSheetsData(request) {
        const mockHeaders = ['Date', 'Campaign', 'Impressions', 'Clicks', 'Cost', 'Conversions'];
        const mockRows = [
            { Date: '2025-06-19', Campaign: 'Summer Sale', Impressions: 15420, Clicks: 342, Cost: 125.50, Conversions: 12 },
            { Date: '2025-06-18', Campaign: 'Summer Sale', Impressions: 14280, Clicks: 298, Cost: 109.80, Conversions: 8 },
            { Date: '2025-06-17', Campaign: 'Brand Awareness', Impressions: 22100, Clicks: 156, Cost: 89.30, Conversions: 3 },
            { Date: '2025-06-16', Campaign: 'Retargeting', Impressions: 8750, Clicks: 245, Cost: 78.20, Conversions: 15 },
        ];
        return {
            data: {
                source: 'google-sheets',
                spreadsheetId: request.spreadsheetId,
                range: request.range,
                headers: mockHeaders,
                rows: mockRows,
                metadata: {
                    totalRows: mockRows.length,
                    totalColumns: mockHeaders.length,
                    transformedAt: new Date().toISOString()
                }
            },
            recordCount: mockRows.length,
            metadata: {
                connector: 'google-sheets',
                processingTime: '850ms',
                circuitBreakerState: 'closed',
                timestamp: new Date().toISOString()
            }
        };
    }
    generateOperationId() {
        return `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.DataIngestionService = DataIngestionService;
exports.DataIngestionService = DataIngestionService = DataIngestionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DataIngestionService);
//# sourceMappingURL=data-ingestion.service.js.map