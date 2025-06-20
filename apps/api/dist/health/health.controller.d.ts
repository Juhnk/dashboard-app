import { Request } from 'express';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../cache/redis.service';
export declare class HealthController {
    private readonly prismaService;
    private readonly redisService;
    constructor(prismaService: PrismaService, redisService: RedisService);
    getHealth(req: Request): Promise<{
        status: string;
        timestamp: string;
        traceId: string;
        service: {
            name: string;
            version: string;
            environment: string;
            uptime: number;
            pid: number;
        };
        performance: {
            responseTime: string;
            memoryUsage: {
                used: number;
                total: number;
                unit: string;
            };
            cpuUsage: NodeJS.CpuUsage;
        };
        database: {
            status: string;
            responseTime: string;
            connectionPool: string;
            error?: undefined;
        } | {
            status: string;
            responseTime: string;
            connectionPool: string;
            error: string;
        };
        cache: {
            status: string;
            responseTime: string;
            connections: string;
            error?: undefined;
        } | {
            status: string;
            responseTime: string;
            connections: string;
            error: string;
        };
        dependencies: {
            googleSheets: string;
            facebookAds: string;
            linkedinAds: string;
        };
    }>;
    getDetailedHealth(req: Request): Promise<{
        status: string;
        timestamp: string;
        traceId: string;
        system: {
            platform: NodeJS.Platform;
            arch: NodeJS.Architecture;
            nodeVersion: string;
            memory: {
                rss: number;
                heapTotal: number;
                heapUsed: number;
                external: number;
                arrayBuffers: number;
            };
            cpu: NodeJS.CpuUsage;
            uptime: {
                process: number;
                system: any;
            };
        };
        environment: {
            nodeEnv: string;
            port: string;
            databaseUrl: string;
            redisUrl: string;
        };
        performance: {
            responseTime: string;
            loadAverage: any;
            freeMemory: number;
            totalMemory: number;
        };
    }>;
    private getDatabaseHealth;
    private getCacheHealth;
}
