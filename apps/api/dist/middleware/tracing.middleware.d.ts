import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            traceId: string;
            startTime: number;
        }
    }
}
export declare class TracingMiddleware implements NestMiddleware {
    private generateTraceId;
    use(req: Request, res: Response, next: NextFunction): void;
}
