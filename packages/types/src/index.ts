import { z } from 'zod'

// User & Authentication Types
export const UserRole = z.enum(['viewer', 'editor', 'admin'])
export type UserRole = z.infer<typeof UserRole>

export const User = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  role: UserRole,
  organizationId: z.string(),
  avatar: z.string().optional(),
  preferences: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type User = z.infer<typeof User>

// Data Source Types
export const DataSourceType = z.enum([
  'google_sheets',
  'csv',
  'google_ads',
  'facebook_ads',
  'linkedin_ads',
  'tiktok_ads',
  'email',
  'api'
])
export type DataSourceType = z.infer<typeof DataSourceType>

export const DataSource = z.object({
  id: z.string(),
  name: z.string(),
  type: DataSourceType,
  organizationId: z.string(),
  config: z.record(z.any()),
  credentials: z.record(z.any()).optional(),
  refreshSchedule: z.string().optional(),
  lastSyncAt: z.date().optional(),
  status: z.enum(['connected', 'disconnected', 'error']),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type DataSource = z.infer<typeof DataSource>

// Dashboard & Tab Types
export const Dashboard = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  organizationId: z.string(),
  createdBy: z.string(),
  isDefault: z.boolean().default(false),
  settings: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type Dashboard = z.infer<typeof Dashboard>

export const DashboardTab = z.object({
  id: z.string(),
  dashboardId: z.string(),
  name: z.string(),
  slug: z.string(),
  orderIndex: z.number(),
  layout: z.record(z.any()),
  filters: z.record(z.any()).optional(),
  isPublished: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type DashboardTab = z.infer<typeof DashboardTab>

// Widget Types
export const ChartType = z.enum([
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
])
export type ChartType = z.infer<typeof ChartType>

export const FilterOperator = z.enum([
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
])
export type FilterOperator = z.infer<typeof FilterOperator>

export const FilterCondition = z.object({
  field: z.string(),
  operator: FilterOperator,
  value: z.any(),
  logicalOperator: z.enum(['AND', 'OR']).optional(),
})
export type FilterCondition = z.infer<typeof FilterCondition>

export const Widget = z.object({
  id: z.string(),
  tabId: z.string(),
  type: ChartType,
  title: z.string(),
  description: z.string().optional(),
  config: z.object({
    dataSources: z.array(z.string()),
    dimensions: z.array(z.string()),
    metrics: z.array(z.string()),
    filters: z.array(FilterCondition).optional(),
    aggregation: z.enum(['sum', 'avg', 'count', 'max', 'min']).default('sum'),
    groupBy: z.array(z.string()).optional(),
    sortBy: z.object({
      field: z.string(),
      direction: z.enum(['asc', 'desc'])
    }).optional(),
    limit: z.number().optional(),
    display: z.record(z.any()).optional(),
  }),
  position: z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type Widget = z.infer<typeof Widget>

// Query Types
export const QueryPayload = z.object({
  dataSources: z.array(z.string()),
  dimensions: z.array(z.string()).min(1),
  metrics: z.array(z.string()).min(1),
  filters: z.array(FilterCondition).optional(),
  groupBy: z.array(z.string()).optional(),
  aggregate: z.enum(['sum', 'avg', 'count', 'max', 'min']).default('sum'),
  sortBy: z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc'])
  }).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
})
export type QueryPayload = z.infer<typeof QueryPayload>

export const QueryResult = z.object({
  data: z.array(z.record(z.any())),
  meta: z.object({
    total: z.number(),
    fields: z.array(z.object({
      name: z.string(),
      type: z.enum(['string', 'number', 'date', 'boolean']),
      nullable: z.boolean(),
    })),
    executionTime: z.number(),
    sources: z.array(z.string()),
  }),
})
export type QueryResult = z.infer<typeof QueryResult>

// Theme Types
export const Theme = z.object({
  id: z.string(),
  name: z.string(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    surface: z.string(),
    text: z.string(),
    border: z.string(),
  }),
  fonts: z.object({
    sans: z.string(),
    mono: z.string(),
  }),
  spacing: z.record(z.string()),
  borderRadius: z.record(z.string()),
  customCSS: z.string().optional(),
  logo: z.string().optional(),
})
export type Theme = z.infer<typeof Theme>

// API Response Types
export const ApiError = z.object({
  status: z.number(),
  message: z.string(),
  code: z.string().optional(),
  traceId: z.string().optional(),
  details: z.record(z.any()).optional(),
})
export type ApiError = z.infer<typeof ApiError>

export const ApiResponse = <T extends z.ZodType>(dataSchema: T) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  error: ApiError.optional(),
  meta: z.record(z.any()).optional(),
})

// Export utility type helpers
export type ApiResponseType<T> = {
  success: boolean
  data?: T
  error?: ApiError
  meta?: Record<string, unknown>
}