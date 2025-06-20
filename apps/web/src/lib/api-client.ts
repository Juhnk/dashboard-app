import { getSession } from 'next-auth/react'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options
    
    // Get session for auth token
    const session = await getSession()
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(session?.user?.id && { 'Authorization': `Bearer ${session.user.id}` })
      }
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Convenience methods
  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body })
  }

  put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body })
  }

  patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body })
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()

// Data Source API functions
export const dataSourceApi = {
  // Get all data sources for user's organization
  fetchDataSources: () => 
    apiClient.get<{ dataSources: any[] }>('/data-sources'),

  // Create a new data source
  createDataSource: (dataSource: {
    name: string
    source_type: string
    connection_config: any
    schema_config?: any
  }) => 
    apiClient.post<{ dataSource: any }>('/data-sources', dataSource),

  // Update an existing data source
  updateDataSource: (id: string, updates: any) =>
    apiClient.put<{ dataSource: any }>(`/data-sources/${id}`, updates),

  // Delete a data source
  deleteDataSource: (id: string) =>
    apiClient.delete(`/data-sources/${id}`),

  // Test Google Sheets connection
  testGoogleSheetsConnection: (spreadsheetUrl: string) =>
    apiClient.post<{ success: boolean; metadata: any; authMethod?: string }>('/data-sources/google-sheets/test', {
      spreadsheetUrl
    }),

  // Get data from a data source
  getDataSourceData: (id: string) =>
    apiClient.get<{ 
      data: any[]
      schema: Record<string, string>
      metadata: {
        dataSourceId: string
        sourceType: string
        rowCount: number
        columnCount: number
        lastSynced: string | null
        syncStatus: string
      }
    }>(`/data-sources/${id}/data`),

  // Trigger manual sync for a data source
  syncDataSource: (id: string) =>
    apiClient.post<{ success: boolean }>(`/data-sources/${id}/sync`)
}

// Dashboard API functions
export const dashboardApi = {
  // Get all dashboards for user's organization
  fetchDashboards: () =>
    apiClient.get<{ dashboards: any[] }>('/dashboards'),

  // Get a specific dashboard
  fetchDashboard: (id: string) =>
    apiClient.get<{ dashboard: any }>(`/dashboards/${id}`),

  // Create a new dashboard
  createDashboard: (dashboard: {
    name: string
    description?: string
    is_public?: boolean
    refresh_interval?: number
  }) =>
    apiClient.post<{ dashboard: any }>('/dashboards', dashboard),

  // Update an existing dashboard
  updateDashboard: (id: string, updates: {
    name?: string
    description?: string
    is_public?: boolean
    refresh_interval?: number
    layout_config?: any
  }) =>
    apiClient.put<{ dashboard: any }>(`/dashboards/${id}`, updates),

  // Delete a dashboard
  deleteDashboard: (id: string) =>
    apiClient.delete(`/dashboards/${id}`)
}

// Widget API functions
export const widgetApi = {
  // Create a new widget
  createWidget: (widget: {
    tab_id: string
    name: string
    widget_type: string
    position_x?: number
    position_y?: number
    width?: number
    height?: number
    config?: any
    data_source_id?: string
    query_config?: any
  }) =>
    apiClient.post<{ widget: any }>('/widgets', widget),

  // Update an existing widget
  updateWidget: (id: string, updates: {
    name?: string
    widget_type?: string
    position_x?: number
    position_y?: number
    width?: number
    height?: number
    config?: any
    data_source_id?: string
    query_config?: any
  }) =>
    apiClient.put<{ widget: any }>(`/widgets/${id}`, updates),

  // Get a specific widget
  getWidget: (id: string) =>
    apiClient.get<{ widget: any }>(`/widgets/${id}`),

  // Delete a widget
  deleteWidget: (id: string) =>
    apiClient.delete(`/widgets/${id}`)
}