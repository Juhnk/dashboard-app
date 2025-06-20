import { z } from 'zod';
export declare const UserRole: z.ZodEnum<["viewer", "editor", "admin"]>;
export type UserRole = z.infer<typeof UserRole>;
export declare const User: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodEnum<["viewer", "editor", "admin"]>;
    organizationId: z.ZodString;
    avatar: z.ZodOptional<z.ZodString>;
    preferences: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    role: "viewer" | "editor" | "admin";
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
    name?: string | undefined;
    avatar?: string | undefined;
    preferences?: Record<string, any> | undefined;
}, {
    id: string;
    email: string;
    role: "viewer" | "editor" | "admin";
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
    name?: string | undefined;
    avatar?: string | undefined;
    preferences?: Record<string, any> | undefined;
}>;
export type User = z.infer<typeof User>;
export declare const DataSourceType: z.ZodEnum<["google_sheets", "csv", "google_ads", "facebook_ads", "linkedin_ads", "tiktok_ads", "email", "api"]>;
export type DataSourceType = z.infer<typeof DataSourceType>;
export declare const DataSource: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<["google_sheets", "csv", "google_ads", "facebook_ads", "linkedin_ads", "tiktok_ads", "email", "api"]>;
    organizationId: z.ZodString;
    config: z.ZodRecord<z.ZodString, z.ZodAny>;
    credentials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    refreshSchedule: z.ZodOptional<z.ZodString>;
    lastSyncAt: z.ZodOptional<z.ZodDate>;
    status: z.ZodEnum<["connected", "disconnected", "error"]>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    organizationId: string;
    type: "email" | "google_sheets" | "csv" | "google_ads" | "facebook_ads" | "linkedin_ads" | "tiktok_ads" | "api";
    createdAt: Date;
    updatedAt: Date;
    status: "connected" | "disconnected" | "error";
    config: Record<string, any>;
    credentials?: Record<string, any> | undefined;
    refreshSchedule?: string | undefined;
    lastSyncAt?: Date | undefined;
}, {
    id: string;
    name: string;
    organizationId: string;
    type: "email" | "google_sheets" | "csv" | "google_ads" | "facebook_ads" | "linkedin_ads" | "tiktok_ads" | "api";
    createdAt: Date;
    updatedAt: Date;
    status: "connected" | "disconnected" | "error";
    config: Record<string, any>;
    credentials?: Record<string, any> | undefined;
    refreshSchedule?: string | undefined;
    lastSyncAt?: Date | undefined;
}>;
export type DataSource = z.infer<typeof DataSource>;
export declare const Dashboard: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodString;
    createdBy: z.ZodString;
    isDefault: z.ZodDefault<z.ZodBoolean>;
    settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    isDefault: boolean;
    description?: string | undefined;
    settings?: Record<string, any> | undefined;
}, {
    id: string;
    name: string;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    description?: string | undefined;
    isDefault?: boolean | undefined;
    settings?: Record<string, any> | undefined;
}>;
export type Dashboard = z.infer<typeof Dashboard>;
export declare const DashboardTab: z.ZodObject<{
    id: z.ZodString;
    dashboardId: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    orderIndex: z.ZodNumber;
    layout: z.ZodRecord<z.ZodString, z.ZodAny>;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    isPublished: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    dashboardId: string;
    slug: string;
    orderIndex: number;
    layout: Record<string, any>;
    isPublished: boolean;
    filters?: Record<string, any> | undefined;
}, {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    dashboardId: string;
    slug: string;
    orderIndex: number;
    layout: Record<string, any>;
    filters?: Record<string, any> | undefined;
    isPublished?: boolean | undefined;
}>;
export type DashboardTab = z.infer<typeof DashboardTab>;
export declare const ChartType: z.ZodEnum<["line", "bar", "pie", "donut", "area", "scatter", "table", "metric_card", "funnel", "heatmap", "gauge"]>;
export type ChartType = z.infer<typeof ChartType>;
export declare const FilterOperator: z.ZodEnum<["equals", "not_equals", "contains", "not_contains", "starts_with", "ends_with", "greater_than", "less_than", "greater_than_or_equal", "less_than_or_equal", "in", "not_in", "between", "is_null", "is_not_null", "regex"]>;
export type FilterOperator = z.infer<typeof FilterOperator>;
export declare const FilterCondition: z.ZodObject<{
    field: z.ZodString;
    operator: z.ZodEnum<["equals", "not_equals", "contains", "not_contains", "starts_with", "ends_with", "greater_than", "less_than", "greater_than_or_equal", "less_than_or_equal", "in", "not_in", "between", "is_null", "is_not_null", "regex"]>;
    value: z.ZodAny;
    logicalOperator: z.ZodOptional<z.ZodEnum<["AND", "OR"]>>;
}, "strip", z.ZodTypeAny, {
    field: string;
    operator: "equals" | "not_equals" | "contains" | "not_contains" | "starts_with" | "ends_with" | "greater_than" | "less_than" | "greater_than_or_equal" | "less_than_or_equal" | "in" | "not_in" | "between" | "is_null" | "is_not_null" | "regex";
    value?: any;
    logicalOperator?: "AND" | "OR" | undefined;
}, {
    field: string;
    operator: "equals" | "not_equals" | "contains" | "not_contains" | "starts_with" | "ends_with" | "greater_than" | "less_than" | "greater_than_or_equal" | "less_than_or_equal" | "in" | "not_in" | "between" | "is_null" | "is_not_null" | "regex";
    value?: any;
    logicalOperator?: "AND" | "OR" | undefined;
}>;
export type FilterCondition = z.infer<typeof FilterCondition>;
export declare const Widget: z.ZodObject<{
    id: z.ZodString;
    tabId: z.ZodString;
    type: z.ZodEnum<["line", "bar", "pie", "donut", "area", "scatter", "table", "metric_card", "funnel", "heatmap", "gauge"]>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    config: z.ZodObject<{
        dataSources: z.ZodArray<z.ZodString, "many">;
        dimensions: z.ZodArray<z.ZodString, "many">;
        metrics: z.ZodArray<z.ZodString, "many">;
        filters: z.ZodOptional<z.ZodArray<z.ZodObject<{
            field: z.ZodString;
            operator: z.ZodEnum<["equals", "not_equals", "contains", "not_contains", "starts_with", "ends_with", "greater_than", "less_than", "greater_than_or_equal", "less_than_or_equal", "in", "not_in", "between", "is_null", "is_not_null", "regex"]>;
            value: z.ZodAny;
            logicalOperator: z.ZodOptional<z.ZodEnum<["AND", "OR"]>>;
        }, "strip", z.ZodTypeAny, {
            field: string;
            operator: "equals" | "not_equals" | "contains" | "not_contains" | "starts_with" | "ends_with" | "greater_than" | "less_than" | "greater_than_or_equal" | "less_than_or_equal" | "in" | "not_in" | "between" | "is_null" | "is_not_null" | "regex";
            value?: any;
            logicalOperator?: "AND" | "OR" | undefined;
        }, {
            field: string;
            operator: "equals" | "not_equals" | "contains" | "not_contains" | "starts_with" | "ends_with" | "greater_than" | "less_than" | "greater_than_or_equal" | "less_than_or_equal" | "in" | "not_in" | "between" | "is_null" | "is_not_null" | "regex";
            value?: any;
            logicalOperator?: "AND" | "OR" | undefined;
        }>, "many">>;
        aggregation: z.ZodDefault<z.ZodEnum<["sum", "avg", "count", "max", "min"]>>;
        groupBy: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        sortBy: z.ZodOptional<z.ZodObject<{
            field: z.ZodString;
            direction: z.ZodEnum<["asc", "desc"]>;
        }, "strip", z.ZodTypeAny, {
            field: string;
            direction: "asc" | "desc";
        }, {
            field: string;
            direction: "asc" | "desc";
        }>>;
        limit: z.ZodOptional<z.ZodNumber>;
        display: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        dataSources: string[];
        dimensions: string[];
        metrics: string[];
        aggregation: "sum" | "avg" | "count" | "max" | "min";
        filters?: {
            field: string;
            operator: "equals" | "not_equals" | "contains" | "not_contains" | "starts_with" | "ends_with" | "greater_than" | "less_than" | "greater_than_or_equal" | "less_than_or_equal" | "in" | "not_in" | "between" | "is_null" | "is_not_null" | "regex";
            value?: any;
            logicalOperator?: "AND" | "OR" | undefined;
        }[] | undefined;
        groupBy?: string[] | undefined;
        sortBy?: {
            field: string;
            direction: "asc" | "desc";
        } | undefined;
        limit?: number | undefined;
        display?: Record<string, any> | undefined;
    }, {
        dataSources: string[];
        dimensions: string[];
        metrics: string[];
        filters?: {
            field: string;
            operator: "equals" | "not_equals" | "contains" | "not_contains" | "starts_with" | "ends_with" | "greater_than" | "less_than" | "greater_than_or_equal" | "less_than_or_equal" | "in" | "not_in" | "between" | "is_null" | "is_not_null" | "regex";
            value?: any;
            logicalOperator?: "AND" | "OR" | undefined;
        }[] | undefined;
        aggregation?: "sum" | "avg" | "count" | "max" | "min" | undefined;
        groupBy?: string[] | undefined;
        sortBy?: {
            field: string;
            direction: "asc" | "desc";
        } | undefined;
        limit?: number | undefined;
        display?: Record<string, any> | undefined;
    }>;
    position: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        w: z.ZodNumber;
        h: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        w: number;
        h: number;
    }, {
        x: number;
        y: number;
        w: number;
        h: number;
    }>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "line" | "bar" | "pie" | "donut" | "area" | "scatter" | "table" | "metric_card" | "funnel" | "heatmap" | "gauge";
    createdAt: Date;
    updatedAt: Date;
    config: {
        dataSources: string[];
        dimensions: string[];
        metrics: string[];
        aggregation: "sum" | "avg" | "count" | "max" | "min";
        filters?: {
            field: string;
            operator: "equals" | "not_equals" | "contains" | "not_contains" | "starts_with" | "ends_with" | "greater_than" | "less_than" | "greater_than_or_equal" | "less_than_or_equal" | "in" | "not_in" | "between" | "is_null" | "is_not_null" | "regex";
            value?: any;
            logicalOperator?: "AND" | "OR" | undefined;
        }[] | undefined;
        groupBy?: string[] | undefined;
        sortBy?: {
            field: string;
            direction: "asc" | "desc";
        } | undefined;
        limit?: number | undefined;
        display?: Record<string, any> | undefined;
    };
    tabId: string;
    title: string;
    position: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    description?: string | undefined;
}, {
    id: string;
    type: "line" | "bar" | "pie" | "donut" | "area" | "scatter" | "table" | "metric_card" | "funnel" | "heatmap" | "gauge";
    createdAt: Date;
    updatedAt: Date;
    config: {
        dataSources: string[];
        dimensions: string[];
        metrics: string[];
        filters?: {
            field: string;
            operator: "equals" | "not_equals" | "contains" | "not_contains" | "starts_with" | "ends_with" | "greater_than" | "less_than" | "greater_than_or_equal" | "less_than_or_equal" | "in" | "not_in" | "between" | "is_null" | "is_not_null" | "regex";
            value?: any;
            logicalOperator?: "AND" | "OR" | undefined;
        }[] | undefined;
        aggregation?: "sum" | "avg" | "count" | "max" | "min" | undefined;
        groupBy?: string[] | undefined;
        sortBy?: {
            field: string;
            direction: "asc" | "desc";
        } | undefined;
        limit?: number | undefined;
        display?: Record<string, any> | undefined;
    };
    tabId: string;
    title: string;
    position: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    description?: string | undefined;
}>;
export type Widget = z.infer<typeof Widget>;
export declare const QueryPayload: z.ZodObject<{
    dataSources: z.ZodArray<z.ZodString, "many">;
    dimensions: z.ZodArray<z.ZodString, "many">;
    metrics: z.ZodArray<z.ZodString, "many">;
    filters: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<["equals", "not_equals", "contains", "not_contains", "starts_with", "ends_with", "greater_than", "less_than", "greater_than_or_equal", "less_than_or_equal", "in", "not_in", "between", "is_null", "is_not_null", "regex"]>;
        value: z.ZodAny;
        logicalOperator: z.ZodOptional<z.ZodEnum<["AND", "OR"]>>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        operator: "equals" | "not_equals" | "contains" | "not_contains" | "starts_with" | "ends_with" | "greater_than" | "less_than" | "greater_than_or_equal" | "less_than_or_equal" | "in" | "not_in" | "between" | "is_null" | "is_not_null" | "regex";
        value?: any;
        logicalOperator?: "AND" | "OR" | undefined;
    }, {
        field: string;
        operator: "equals" | "not_equals" | "contains" | "not_contains" | "starts_with" | "ends_with" | "greater_than" | "less_than" | "greater_than_or_equal" | "less_than_or_equal" | "in" | "not_in" | "between" | "is_null" | "is_not_null" | "regex";
        value?: any;
        logicalOperator?: "AND" | "OR" | undefined;
    }>, "many">>;
    groupBy: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    aggregate: z.ZodDefault<z.ZodEnum<["sum", "avg", "count", "max", "min"]>>;
    sortBy: z.ZodOptional<z.ZodObject<{
        field: z.ZodString;
        direction: z.ZodEnum<["asc", "desc"]>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        direction: "asc" | "desc";
    }, {
        field: string;
        direction: "asc" | "desc";
    }>>;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    dataSources: string[];
    dimensions: string[];
    metrics: string[];
    aggregate: "sum" | "avg" | "count" | "max" | "min";
    filters?: {
        field: string;
        operator: "equals" | "not_equals" | "contains" | "not_contains" | "starts_with" | "ends_with" | "greater_than" | "less_than" | "greater_than_or_equal" | "less_than_or_equal" | "in" | "not_in" | "between" | "is_null" | "is_not_null" | "regex";
        value?: any;
        logicalOperator?: "AND" | "OR" | undefined;
    }[] | undefined;
    groupBy?: string[] | undefined;
    sortBy?: {
        field: string;
        direction: "asc" | "desc";
    } | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}, {
    dataSources: string[];
    dimensions: string[];
    metrics: string[];
    filters?: {
        field: string;
        operator: "equals" | "not_equals" | "contains" | "not_contains" | "starts_with" | "ends_with" | "greater_than" | "less_than" | "greater_than_or_equal" | "less_than_or_equal" | "in" | "not_in" | "between" | "is_null" | "is_not_null" | "regex";
        value?: any;
        logicalOperator?: "AND" | "OR" | undefined;
    }[] | undefined;
    groupBy?: string[] | undefined;
    sortBy?: {
        field: string;
        direction: "asc" | "desc";
    } | undefined;
    limit?: number | undefined;
    aggregate?: "sum" | "avg" | "count" | "max" | "min" | undefined;
    offset?: number | undefined;
}>;
export type QueryPayload = z.infer<typeof QueryPayload>;
export declare const QueryResult: z.ZodObject<{
    data: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">;
    meta: z.ZodObject<{
        total: z.ZodNumber;
        fields: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodEnum<["string", "number", "date", "boolean"]>;
            nullable: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            name: string;
            type: "string" | "number" | "boolean" | "date";
            nullable: boolean;
        }, {
            name: string;
            type: "string" | "number" | "boolean" | "date";
            nullable: boolean;
        }>, "many">;
        executionTime: z.ZodNumber;
        sources: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        total: number;
        fields: {
            name: string;
            type: "string" | "number" | "boolean" | "date";
            nullable: boolean;
        }[];
        executionTime: number;
        sources: string[];
    }, {
        total: number;
        fields: {
            name: string;
            type: "string" | "number" | "boolean" | "date";
            nullable: boolean;
        }[];
        executionTime: number;
        sources: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    data: Record<string, any>[];
    meta: {
        total: number;
        fields: {
            name: string;
            type: "string" | "number" | "boolean" | "date";
            nullable: boolean;
        }[];
        executionTime: number;
        sources: string[];
    };
}, {
    data: Record<string, any>[];
    meta: {
        total: number;
        fields: {
            name: string;
            type: "string" | "number" | "boolean" | "date";
            nullable: boolean;
        }[];
        executionTime: number;
        sources: string[];
    };
}>;
export type QueryResult = z.infer<typeof QueryResult>;
export declare const Theme: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    colors: z.ZodObject<{
        primary: z.ZodString;
        secondary: z.ZodString;
        accent: z.ZodString;
        background: z.ZodString;
        surface: z.ZodString;
        text: z.ZodString;
        border: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
        border: string;
    }, {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
        border: string;
    }>;
    fonts: z.ZodObject<{
        sans: z.ZodString;
        mono: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        sans: string;
        mono: string;
    }, {
        sans: string;
        mono: string;
    }>;
    spacing: z.ZodRecord<z.ZodString, z.ZodString>;
    borderRadius: z.ZodRecord<z.ZodString, z.ZodString>;
    customCSS: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
        border: string;
    };
    fonts: {
        sans: string;
        mono: string;
    };
    spacing: Record<string, string>;
    borderRadius: Record<string, string>;
    customCSS?: string | undefined;
    logo?: string | undefined;
}, {
    id: string;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
        border: string;
    };
    fonts: {
        sans: string;
        mono: string;
    };
    spacing: Record<string, string>;
    borderRadius: Record<string, string>;
    customCSS?: string | undefined;
    logo?: string | undefined;
}>;
export type Theme = z.infer<typeof Theme>;
export declare const ApiError: z.ZodObject<{
    status: z.ZodNumber;
    message: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    traceId: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    status: number;
    code?: string | undefined;
    traceId?: string | undefined;
    details?: Record<string, any> | undefined;
}, {
    message: string;
    status: number;
    code?: string | undefined;
    traceId?: string | undefined;
    details?: Record<string, any> | undefined;
}>;
export type ApiError = z.infer<typeof ApiError>;
export declare const ApiResponse: <T extends z.ZodType>(dataSchema: T) => z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodObject<{
        status: z.ZodNumber;
        message: z.ZodString;
        code: z.ZodOptional<z.ZodString>;
        traceId: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        status: number;
        code?: string | undefined;
        traceId?: string | undefined;
        details?: Record<string, any> | undefined;
    }, {
        message: string;
        status: number;
        code?: string | undefined;
        traceId?: string | undefined;
        details?: Record<string, any> | undefined;
    }>>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodObject<{
        status: z.ZodNumber;
        message: z.ZodString;
        code: z.ZodOptional<z.ZodString>;
        traceId: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        status: number;
        code?: string | undefined;
        traceId?: string | undefined;
        details?: Record<string, any> | undefined;
    }, {
        message: string;
        status: number;
        code?: string | undefined;
        traceId?: string | undefined;
        details?: Record<string, any> | undefined;
    }>>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}>, any> extends infer T_1 ? { [k in keyof T_1]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodObject<{
        status: z.ZodNumber;
        message: z.ZodString;
        code: z.ZodOptional<z.ZodString>;
        traceId: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        status: number;
        code?: string | undefined;
        traceId?: string | undefined;
        details?: Record<string, any> | undefined;
    }, {
        message: string;
        status: number;
        code?: string | undefined;
        traceId?: string | undefined;
        details?: Record<string, any> | undefined;
    }>>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}>, any>[k]; } : never, z.baseObjectInputType<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodObject<{
        status: z.ZodNumber;
        message: z.ZodString;
        code: z.ZodOptional<z.ZodString>;
        traceId: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        status: number;
        code?: string | undefined;
        traceId?: string | undefined;
        details?: Record<string, any> | undefined;
    }, {
        message: string;
        status: number;
        code?: string | undefined;
        traceId?: string | undefined;
        details?: Record<string, any> | undefined;
    }>>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}> extends infer T_2 ? { [k_1 in keyof T_2]: z.baseObjectInputType<{
    success: z.ZodBoolean;
    data: z.ZodOptional<T>;
    error: z.ZodOptional<z.ZodObject<{
        status: z.ZodNumber;
        message: z.ZodString;
        code: z.ZodOptional<z.ZodString>;
        traceId: z.ZodOptional<z.ZodString>;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        status: number;
        code?: string | undefined;
        traceId?: string | undefined;
        details?: Record<string, any> | undefined;
    }, {
        message: string;
        status: number;
        code?: string | undefined;
        traceId?: string | undefined;
        details?: Record<string, any> | undefined;
    }>>;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}>[k_1]; } : never>;
export type ApiResponseType<T> = {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: Record<string, unknown>;
};
//# sourceMappingURL=index.d.ts.map