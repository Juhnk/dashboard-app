import { Request } from 'express';
import { DataIngestionService } from './data-ingestion.service';
export interface GoogleSheetsIngestionRequest {
    spreadsheetId: string;
    range: string;
    accessToken: string;
    refreshToken?: string;
}
export declare class DataIngestionController {
    private readonly dataIngestionService;
    constructor(dataIngestionService: DataIngestionService);
    ingestGoogleSheets(request: GoogleSheetsIngestionRequest, req: Request): Promise<{
        success: boolean;
        jobId: any;
        status: string;
        message: string;
        traceId: string;
        estimatedProcessingTime: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        traceId: string;
        jobId?: undefined;
        status?: undefined;
        message?: undefined;
        estimatedProcessingTime?: undefined;
    }>;
    getJobStatus(jobId: string, req: Request): Promise<any>;
    testGoogleSheets(request: GoogleSheetsIngestionRequest, req: Request): Promise<{
        success: boolean;
        data: any;
        recordCount: any;
        metadata: any;
        traceId: string;
        responseTime: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        traceId: string;
        responseTime: string;
        data?: undefined;
        recordCount?: undefined;
        metadata?: undefined;
    }>;
    getHealth(req: Request): Promise<any>;
}
