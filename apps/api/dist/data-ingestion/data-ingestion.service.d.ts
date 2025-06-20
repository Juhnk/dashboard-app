import { ConfigService } from '@nestjs/config';
export interface GoogleSheetsRequest {
    spreadsheetId: string;
    range: string;
    accessToken: string;
    refreshToken?: string;
}
export declare class DataIngestionService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    ingestGoogleSheets(request: GoogleSheetsRequest, traceId?: string): Promise<any>;
    testGoogleSheetsConnector(request: GoogleSheetsRequest, traceId?: string): Promise<any>;
    getJobStatus(jobId: string): Promise<any>;
    getHealth(): Promise<any>;
    private createMockGoogleSheetsData;
    private generateOperationId;
}
