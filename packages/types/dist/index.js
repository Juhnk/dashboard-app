"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = exports.ApiError = exports.Theme = exports.QueryResult = exports.QueryPayload = exports.Widget = exports.FilterCondition = exports.FilterOperator = exports.ChartType = exports.DashboardTab = exports.Dashboard = exports.DataSource = exports.DataSourceType = exports.User = exports.UserRole = void 0;
const zod_1 = require("zod");
// User & Authentication Types
exports.UserRole = zod_1.z.enum(['viewer', 'editor', 'admin']);
exports.User = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string().optional(),
    role: exports.UserRole,
    organizationId: zod_1.z.string(),
    avatar: zod_1.z.string().optional(),
    preferences: zod_1.z.record(zod_1.z.any()).optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// Data Source Types
exports.DataSourceType = zod_1.z.enum([
    'google_sheets',
    'csv',
    'google_ads',
    'facebook_ads',
    'linkedin_ads',
    'tiktok_ads',
    'email',
    'api'
]);
exports.DataSource = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    type: exports.DataSourceType,
    organizationId: zod_1.z.string(),
    config: zod_1.z.record(zod_1.z.any()),
    credentials: zod_1.z.record(zod_1.z.any()).optional(),
    refreshSchedule: zod_1.z.string().optional(),
    lastSyncAt: zod_1.z.date().optional(),
    status: zod_1.z.enum(['connected', 'disconnected', 'error']),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// Dashboard & Tab Types
exports.Dashboard = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    organizationId: zod_1.z.string(),
    createdBy: zod_1.z.string(),
    isDefault: zod_1.z.boolean().default(false),
    settings: zod_1.z.record(zod_1.z.any()).optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.DashboardTab = zod_1.z.object({
    id: zod_1.z.string(),
    dashboardId: zod_1.z.string(),
    name: zod_1.z.string(),
    slug: zod_1.z.string(),
    orderIndex: zod_1.z.number(),
    layout: zod_1.z.record(zod_1.z.any()),
    filters: zod_1.z.record(zod_1.z.any()).optional(),
    isPublished: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// Widget Types
exports.ChartType = zod_1.z.enum([
    'line',
    'bar',
    'pie',
    'donut',
    'area',
    'scatter',
    'table',
    'metric_card',
    'funnel',
    'heatmap',
    'gauge'
]);
exports.FilterOperator = zod_1.z.enum([
    'equals',
    'not_equals',
    'contains',
    'not_contains',
    'starts_with',
    'ends_with',
    'greater_than',
    'less_than',
    'greater_than_or_equal',
    'less_than_or_equal',
    'in',
    'not_in',
    'between',
    'is_null',
    'is_not_null',
    'regex'
]);
exports.FilterCondition = zod_1.z.object({
    field: zod_1.z.string(),
    operator: exports.FilterOperator,
    value: zod_1.z.any(),
    logicalOperator: zod_1.z.enum(['AND', 'OR']).optional(),
});
exports.Widget = zod_1.z.object({
    id: zod_1.z.string(),
    tabId: zod_1.z.string(),
    type: exports.ChartType,
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    config: zod_1.z.object({
        dataSources: zod_1.z.array(zod_1.z.string()),
        dimensions: zod_1.z.array(zod_1.z.string()),
        metrics: zod_1.z.array(zod_1.z.string()),
        filters: zod_1.z.array(exports.FilterCondition).optional(),
        aggregation: zod_1.z.enum(['sum', 'avg', 'count', 'max', 'min']).default('sum'),
        groupBy: zod_1.z.array(zod_1.z.string()).optional(),
        sortBy: zod_1.z.object({
            field: zod_1.z.string(),
            direction: zod_1.z.enum(['asc', 'desc'])
        }).optional(),
        limit: zod_1.z.number().optional(),
        display: zod_1.z.record(zod_1.z.any()).optional(),
    }),
    position: zod_1.z.object({
        x: zod_1.z.number(),
        y: zod_1.z.number(),
        w: zod_1.z.number(),
        h: zod_1.z.number(),
    }),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// Query Types
exports.QueryPayload = zod_1.z.object({
    dataSources: zod_1.z.array(zod_1.z.string()),
    dimensions: zod_1.z.array(zod_1.z.string()).min(1),
    metrics: zod_1.z.array(zod_1.z.string()).min(1),
    filters: zod_1.z.array(exports.FilterCondition).optional(),
    groupBy: zod_1.z.array(zod_1.z.string()).optional(),
    aggregate: zod_1.z.enum(['sum', 'avg', 'count', 'max', 'min']).default('sum'),
    sortBy: zod_1.z.object({
        field: zod_1.z.string(),
        direction: zod_1.z.enum(['asc', 'desc'])
    }).optional(),
    limit: zod_1.z.number().optional(),
    offset: zod_1.z.number().optional(),
});
exports.QueryResult = zod_1.z.object({
    data: zod_1.z.array(zod_1.z.record(zod_1.z.any())),
    meta: zod_1.z.object({
        total: zod_1.z.number(),
        fields: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            type: zod_1.z.enum(['string', 'number', 'date', 'boolean']),
            nullable: zod_1.z.boolean(),
        })),
        executionTime: zod_1.z.number(),
        sources: zod_1.z.array(zod_1.z.string()),
    }),
});
// Theme Types
exports.Theme = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    colors: zod_1.z.object({
        primary: zod_1.z.string(),
        secondary: zod_1.z.string(),
        accent: zod_1.z.string(),
        background: zod_1.z.string(),
        surface: zod_1.z.string(),
        text: zod_1.z.string(),
        border: zod_1.z.string(),
    }),
    fonts: zod_1.z.object({
        sans: zod_1.z.string(),
        mono: zod_1.z.string(),
    }),
    spacing: zod_1.z.record(zod_1.z.string()),
    borderRadius: zod_1.z.record(zod_1.z.string()),
    customCSS: zod_1.z.string().optional(),
    logo: zod_1.z.string().optional(),
});
// API Response Types
exports.ApiError = zod_1.z.object({
    status: zod_1.z.number(),
    message: zod_1.z.string(),
    code: zod_1.z.string().optional(),
    traceId: zod_1.z.string().optional(),
    details: zod_1.z.record(zod_1.z.any()).optional(),
});
const ApiResponse = (dataSchema) => zod_1.z.object({
    success: zod_1.z.boolean(),
    data: dataSchema.optional(),
    error: exports.ApiError.optional(),
    meta: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.ApiResponse = ApiResponse;
