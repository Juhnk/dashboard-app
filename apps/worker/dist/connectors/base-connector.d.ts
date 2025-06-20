import { Logger } from '@nestjs/common';
export declare abstract class BaseConnector {
    protected readonly connectorName: string;
    protected readonly circuitBreakerOptions?: any;
    protected readonly logger: Logger;
    protected circuitBreaker: any;
    constructor(connectorName: string, circuitBreakerOptions?: any);
    protected abstract executeRequest(params: any): Promise<any>;
    processData(params: any, traceId?: string): Promise<any>;
    getHealth(): any;
    private setupCircuitBreakerEvents;
    private generateOperationId;
    protected sanitizeParams(params: any): any;
    protected getRecordCount(result: any): number;
}
