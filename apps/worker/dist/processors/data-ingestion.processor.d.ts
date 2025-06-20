import { Job } from 'bull';
import { GoogleSheetsConnector } from '../connectors/google-sheets-connector';
export interface DataIngestionJobData {
    source: 'google-sheets' | 'facebook-ads' | 'linkedin-ads';
    sourceId: string;
    config: any;
    traceId?: string;
    userId?: string;
    retryCount?: number;
}
export interface GoogleSheetsJobConfig {
    spreadsheetId: string;
    range: string;
    accessToken: string;
    refreshToken?: string;
}
export declare class DataIngestionProcessor {
    private readonly googleSheetsConnector;
    private readonly logger;
    constructor(googleSheetsConnector: GoogleSheetsConnector);
    process(job: Job<DataIngestionJobData>): Promise<any>;
    private processGoogleSheetsJob;
    private transformGoogleSheetsData;
    onCompleted(job: Job<DataIngestionJobData>, result: any): void;
    onFailed(job: Job<DataIngestionJobData>, error: Error): void;
    onStalled(job: Job<DataIngestionJobData>): void;
    onProgress(job: Job<DataIngestionJobData>, progress: number): void;
}
