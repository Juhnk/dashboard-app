import { ConfigService } from '@nestjs/config';
import { BaseConnector } from './base-connector';
export interface GoogleSheetsParams {
    spreadsheetId: string;
    range?: string;
    accessToken: string;
    refreshToken?: string;
    majorDimension?: 'ROWS' | 'COLUMNS';
}
export interface GoogleSheetsResponse {
    range: string;
    majorDimension: string;
    values: any[][];
}
export declare class GoogleSheetsConnector extends BaseConnector {
    private readonly configService;
    private readonly apiBaseUrl;
    constructor(configService: ConfigService);
    protected executeRequest(params: GoogleSheetsParams): Promise<GoogleSheetsResponse>;
    private isValidGoogleSheetsResponse;
    private transformResponse;
    protected sanitizeParams(params: any): any;
    protected getRecordCount(result: any): number;
    private detectHeaders;
    fetchSheetData(spreadsheetId: string, range: string, accessToken: string, traceId?: string): Promise<any>;
}
