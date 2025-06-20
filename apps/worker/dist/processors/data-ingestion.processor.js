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
var DataIngestionProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataIngestionProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const google_sheets_connector_1 = require("../connectors/google-sheets-connector");
let DataIngestionProcessor = DataIngestionProcessor_1 = class DataIngestionProcessor {
    googleSheetsConnector;
    logger = new common_1.Logger(DataIngestionProcessor_1.name);
    constructor(googleSheetsConnector) {
        this.googleSheetsConnector = googleSheetsConnector;
    }
    async process(job) {
        const startTime = Date.now();
        const { source, sourceId, config, traceId, userId } = job.data;
        const operationId = traceId || `job-${job.id}-${Date.now()}`;
        this.logger.log({
            level: 'info',
            message: `Starting data ingestion job`,
            jobId: job.id,
            operationId,
            source,
            sourceId,
            userId,
            attempt: job.attemptsMade + 1,
            maxAttempts: job.opts.attempts || 3,
            timestamp: new Date().toISOString()
        });
        try {
            let result;
            switch (source) {
                case 'google-sheets':
                    result = await this.processGoogleSheetsJob(config, operationId);
                    break;
                case 'facebook-ads':
                    throw new Error('Facebook Ads connector not yet implemented');
                case 'linkedin-ads':
                    throw new Error('LinkedIn Ads connector not yet implemented');
                default:
                    throw new Error(`Unsupported data source: ${source}`);
            }
            const processingTime = Date.now() - startTime;
            this.logger.log({
                level: 'info',
                message: `Data ingestion job completed successfully`,
                jobId: job.id,
                operationId,
                source,
                sourceId,
                userId,
                processingTime: `${processingTime}ms`,
                recordCount: result?.recordCount || 0,
                timestamp: new Date().toISOString()
            });
            return {
                success: true,
                source,
                sourceId,
                operationId,
                processingTime,
                recordCount: result?.recordCount || 0,
                data: result?.data,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            this.logger.error({
                level: 'error',
                message: `Data ingestion job failed`,
                jobId: job.id,
                operationId,
                source,
                sourceId,
                userId,
                error: error instanceof Error ? error.message : String(error),
                processingTime: `${processingTime}ms`,
                attempt: job.attemptsMade + 1,
                willRetry: job.attemptsMade < (job.opts.attempts || 3) - 1,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }
    async processGoogleSheetsJob(config, operationId) {
        const { spreadsheetId, range, accessToken } = config;
        if (!spreadsheetId || !range || !accessToken) {
            throw new Error('Missing required Google Sheets configuration: spreadsheetId, range, and accessToken are required');
        }
        this.logger.debug({
            level: 'debug',
            message: 'Processing Google Sheets ingestion job',
            operationId,
            spreadsheetId,
            range,
            timestamp: new Date().toISOString()
        });
        const result = await this.googleSheetsConnector.processData({
            spreadsheetId,
            range,
            accessToken
        }, operationId);
        if (!result.success) {
            throw new Error(`Google Sheets connector failed: ${result.error}`);
        }
        const transformedData = this.transformGoogleSheetsData(result.data);
        return {
            data: transformedData,
            recordCount: this.googleSheetsConnector['getRecordCount'](result.data),
            metadata: result.metadata
        };
    }
    transformGoogleSheetsData(data) {
        if (!data || !data.values || !Array.isArray(data.values)) {
            return { headers: [], rows: [] };
        }
        const values = data.values;
        if (values.length === 0) {
            return { headers: [], rows: [] };
        }
        const headers = values[0] || [];
        const rows = values.slice(1);
        const transformedRows = rows.map((row, index) => {
            const rowObject = { _rowIndex: index + 2 };
            headers.forEach((header, colIndex) => {
                const cellValue = row[colIndex];
                rowObject[header || `column_${colIndex}`] = cellValue !== undefined ? cellValue : null;
            });
            return rowObject;
        });
        return {
            source: 'google-sheets',
            range: data.range,
            headers,
            rows: transformedRows,
            metadata: {
                totalRows: rows.length,
                totalColumns: headers.length,
                transformedAt: new Date().toISOString()
            }
        };
    }
    onCompleted(job, result) {
        this.logger.log({
            level: 'info',
            message: 'Job completed successfully',
            jobId: job.id,
            source: job.data.source,
            sourceId: job.data.sourceId,
            duration: Date.now() - job.processedOn,
            recordCount: result?.recordCount || 0,
            timestamp: new Date().toISOString()
        });
    }
    onFailed(job, error) {
        this.logger.error({
            level: 'error',
            message: 'Job failed permanently',
            jobId: job.id,
            source: job.data.source,
            sourceId: job.data.sourceId,
            error: error.message,
            attempts: job.attemptsMade,
            maxAttempts: job.opts.attempts || 3,
            timestamp: new Date().toISOString()
        });
    }
    onStalled(job) {
        this.logger.warn({
            level: 'warn',
            message: 'Job stalled - may be stuck or taking too long',
            jobId: job.id,
            source: job.data.source,
            sourceId: job.data.sourceId,
            timestamp: new Date().toISOString()
        });
    }
    onProgress(job, progress) {
        this.logger.debug({
            level: 'debug',
            message: 'Job progress update',
            jobId: job.id,
            source: job.data.source,
            progress: `${progress}%`,
            timestamp: new Date().toISOString()
        });
    }
};
exports.DataIngestionProcessor = DataIngestionProcessor;
__decorate([
    (0, bull_1.Process)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DataIngestionProcessor.prototype, "process", null);
__decorate([
    (0, bull_1.OnQueueCompleted)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DataIngestionProcessor.prototype, "onCompleted", null);
__decorate([
    (0, bull_1.OnQueueFailed)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Error]),
    __metadata("design:returntype", void 0)
], DataIngestionProcessor.prototype, "onFailed", null);
__decorate([
    (0, bull_1.OnQueueStalled)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DataIngestionProcessor.prototype, "onStalled", null);
__decorate([
    (0, bull_1.OnQueueProgress)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], DataIngestionProcessor.prototype, "onProgress", null);
exports.DataIngestionProcessor = DataIngestionProcessor = DataIngestionProcessor_1 = __decorate([
    (0, bull_1.Processor)('data-ingestion'),
    __metadata("design:paramtypes", [google_sheets_connector_1.GoogleSheetsConnector])
], DataIngestionProcessor);
//# sourceMappingURL=data-ingestion.processor.js.map