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
exports.DataIngestionController = void 0;
const common_1 = require("@nestjs/common");
const data_ingestion_service_1 = require("./data-ingestion.service");
let DataIngestionController = class DataIngestionController {
    dataIngestionService;
    constructor(dataIngestionService) {
        this.dataIngestionService = dataIngestionService;
    }
    async ingestGoogleSheets(request, req) {
        const startTime = Date.now();
        console.log({
            level: 'info',
            message: 'Google Sheets ingestion request received',
            traceId: req.traceId,
            spreadsheetId: request.spreadsheetId,
            range: request.range,
            timestamp: new Date().toISOString()
        });
        try {
            const result = await this.dataIngestionService.ingestGoogleSheets(request, req.traceId);
            const responseTime = Date.now() - startTime;
            console.log({
                level: 'info',
                message: 'Google Sheets ingestion job created successfully',
                traceId: req.traceId,
                jobId: result.jobId,
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString()
            });
            return {
                success: true,
                jobId: result.jobId,
                status: 'queued',
                message: 'Google Sheets ingestion job has been queued for processing',
                traceId: req.traceId,
                estimatedProcessingTime: '30-60 seconds'
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            console.log({
                level: 'error',
                message: 'Failed to create Google Sheets ingestion job',
                traceId: req.traceId,
                error: error instanceof Error ? error.message : String(error),
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString()
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                traceId: req.traceId
            };
        }
    }
    async getJobStatus(jobId, req) {
        console.log({
            level: 'info',
            message: 'Job status request received',
            traceId: req.traceId,
            jobId,
            timestamp: new Date().toISOString()
        });
        try {
            const status = await this.dataIngestionService.getJobStatus(jobId);
            return {
                success: true,
                jobId,
                ...status,
                traceId: req.traceId
            };
        }
        catch (error) {
            console.log({
                level: 'error',
                message: 'Failed to get job status',
                traceId: req.traceId,
                jobId,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString()
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                traceId: req.traceId
            };
        }
    }
    async testGoogleSheets(request, req) {
        const startTime = Date.now();
        console.log({
            level: 'info',
            message: 'Google Sheets test request received',
            traceId: req.traceId,
            spreadsheetId: request.spreadsheetId,
            range: request.range,
            timestamp: new Date().toISOString()
        });
        try {
            const result = await this.dataIngestionService.testGoogleSheetsConnector(request, req.traceId);
            const responseTime = Date.now() - startTime;
            console.log({
                level: 'info',
                message: 'Google Sheets test completed successfully',
                traceId: req.traceId,
                recordCount: result.recordCount,
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString()
            });
            return {
                success: true,
                data: result.data,
                recordCount: result.recordCount,
                metadata: result.metadata,
                traceId: req.traceId,
                responseTime: `${responseTime}ms`
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            console.log({
                level: 'error',
                message: 'Google Sheets test failed',
                traceId: req.traceId,
                error: error instanceof Error ? error.message : String(error),
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString()
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                traceId: req.traceId,
                responseTime: `${responseTime}ms`
            };
        }
    }
    async getHealth(req) {
        console.log({
            level: 'info',
            message: 'Data ingestion health check requested',
            traceId: req.traceId,
            timestamp: new Date().toISOString()
        });
        try {
            const health = await this.dataIngestionService.getHealth();
            return {
                success: true,
                ...health,
                traceId: req.traceId
            };
        }
        catch (error) {
            console.log({
                level: 'error',
                message: 'Data ingestion health check failed',
                traceId: req.traceId,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString()
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                traceId: req.traceId
            };
        }
    }
};
exports.DataIngestionController = DataIngestionController;
__decorate([
    (0, common_1.Post)('google-sheets'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DataIngestionController.prototype, "ingestGoogleSheets", null);
__decorate([
    (0, common_1.Get)('jobs/:jobId'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DataIngestionController.prototype, "getJobStatus", null);
__decorate([
    (0, common_1.Post)('test/google-sheets'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DataIngestionController.prototype, "testGoogleSheets", null);
__decorate([
    (0, common_1.Get)('health'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DataIngestionController.prototype, "getHealth", null);
exports.DataIngestionController = DataIngestionController = __decorate([
    (0, common_1.Controller)('data-ingestion'),
    __metadata("design:paramtypes", [data_ingestion_service_1.DataIngestionService])
], DataIngestionController);
//# sourceMappingURL=data-ingestion.controller.js.map