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
exports.GoogleSheetsConnector = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const base_connector_1 = require("./base-connector");
let GoogleSheetsConnector = class GoogleSheetsConnector extends base_connector_1.BaseConnector {
    configService;
    apiBaseUrl = 'https://sheets.googleapis.com/v4';
    constructor(configService) {
        super('google-sheets', {
            timeout: 15000,
            errorThresholdPercentage: 60,
            resetTimeout: 30000,
            volumeThreshold: 3,
        });
        this.configService = configService;
    }
    async executeRequest(params) {
        const { spreadsheetId, range = 'Sheet1', accessToken, majorDimension = 'ROWS' } = params;
        if (!spreadsheetId || !accessToken) {
            throw new Error('Missing required parameters: spreadsheetId and accessToken are required');
        }
        const url = `${this.apiBaseUrl}/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
        const queryParams = new URLSearchParams({
            majorDimension,
            valueRenderOption: 'UNFORMATTED_VALUE',
            dateTimeRenderOption: 'FORMATTED_STRING'
        });
        this.logger.debug({
            level: 'debug',
            message: 'Making Google Sheets API request',
            connector: this.connectorName,
            spreadsheetId,
            range,
            url: `${url}?${queryParams}`,
            timestamp: new Date().toISOString()
        });
        try {
            const response = await fetch(`${url}?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                    'User-Agent': '@mustache/worker v0.1.0'
                },
                signal: AbortSignal.timeout(12000)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Google Sheets API error: ${response.status} ${response.statusText} - ${errorText}`);
            }
            const data = await response.json();
            if (!this.isValidGoogleSheetsResponse(data)) {
                throw new Error('Invalid response format from Google Sheets API');
            }
            return this.transformResponse(data);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error('Google Sheets API request timed out');
                }
                if (error.message.includes('401')) {
                    throw new Error('Google Sheets authentication failed - token may be expired');
                }
                if (error.message.includes('403')) {
                    throw new Error('Google Sheets access denied - insufficient permissions');
                }
                if (error.message.includes('429')) {
                    throw new Error('Google Sheets rate limit exceeded - will retry with backoff');
                }
                if (error.message.includes('404')) {
                    throw new Error('Google Sheets spreadsheet or range not found');
                }
            }
            throw error;
        }
    }
    isValidGoogleSheetsResponse(data) {
        return (data &&
            typeof data === 'object' &&
            typeof data.range === 'string' &&
            Array.isArray(data.values));
    }
    transformResponse(data) {
        const response = {
            range: data.range,
            majorDimension: data.majorDimension || 'ROWS',
            values: data.values || []
        };
        this.logger.debug({
            level: 'debug',
            message: 'Google Sheets data transformation completed',
            connector: this.connectorName,
            range: response.range,
            rowCount: response.values.length,
            columnCount: response.values[0]?.length || 0,
            hasHeaders: response.values.length > 0,
            timestamp: new Date().toISOString()
        });
        return response;
    }
    sanitizeParams(params) {
        const sanitized = super.sanitizeParams(params);
        if (sanitized.accessToken) {
            sanitized.accessToken = '***redacted***';
        }
        if (sanitized.refreshToken) {
            sanitized.refreshToken = '***redacted***';
        }
        return sanitized;
    }
    getRecordCount(result) {
        if (result && result.values && Array.isArray(result.values)) {
            const hasHeaders = this.detectHeaders(result.values);
            return Math.max(0, result.values.length - (hasHeaders ? 1 : 0));
        }
        return 0;
    }
    detectHeaders(values) {
        if (!values || values.length < 2)
            return false;
        const firstRow = values[0];
        const secondRow = values[1];
        if (!firstRow || !secondRow)
            return false;
        const firstRowAllStrings = firstRow.every(cell => typeof cell === 'string');
        const secondRowMixed = secondRow.some(cell => typeof cell !== 'string');
        return firstRowAllStrings && secondRowMixed;
    }
    async fetchSheetData(spreadsheetId, range, accessToken, traceId) {
        const params = {
            spreadsheetId,
            range,
            accessToken
        };
        const result = await this.processData(params, traceId);
        if (!result.success) {
            throw new Error(`Failed to fetch Google Sheets data: ${result.error}`);
        }
        return result.data;
    }
};
exports.GoogleSheetsConnector = GoogleSheetsConnector;
exports.GoogleSheetsConnector = GoogleSheetsConnector = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleSheetsConnector);
//# sourceMappingURL=google-sheets-connector.js.map