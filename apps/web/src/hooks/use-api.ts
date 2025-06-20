import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Dashboard, DataSource, Widget } from '@/stores'

// Dashboard hooks
export function useDashboards() {
  return useQuery({
    queryKey: ['dashboards'],
    queryFn: () => apiClient.get<{ dashboards: Dashboard[] }>('/dashboards'),
    select: (data) => data.dashboards
  })
}

export function useDashboard(id: string) {
  return useQuery({
    queryKey: ['dashboards', id],
    queryFn: () => apiClient.get<{ dashboard: Dashboard }>(`/dashboards/${id}`),
    select: (data) => data.dashboard,
    enabled: !!id
  })
}

export function useCreateDashboard() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { name: string; description?: string; is_public?: boolean }) =>
      apiClient.post<{ dashboard: Dashboard }>('/dashboards', data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] })
      return response.dashboard
    }
  })
}

export function useUpdateDashboard() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Dashboard>) =>
      apiClient.put<{ dashboard: Dashboard }>(`/dashboards/${id}`, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] })
      queryClient.invalidateQueries({ queryKey: ['dashboards', variables.id] })
      return response.dashboard
    }
  })
}

export function useDeleteDashboard() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/dashboards/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] })
    }
  })
}

// Data Source hooks
export function useDataSources() {
  return useQuery({
    queryKey: ['data-sources'],
    queryFn: () => apiClient.get<{ dataSources: DataSource[] }>('/data-sources'),
    select: (data) => data.dataSources
  })
}

export function useCreateDataSource() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: {
      name: string
      source_type: string
      connection_config: any
      schema_config?: any
    }) => apiClient.post<{ dataSource: DataSource }>('/data-sources', data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] })
      return response.dataSource
    }
  })
}

// Widget hooks
export function useCreateWidget() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: {
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
    }) => apiClient.post<{ widget: Widget }>('/widgets', data),
    onSuccess: (response, variables) => {
      // Invalidate dashboard queries to refresh widget data
      queryClient.invalidateQueries({ queryKey: ['dashboards'] })
      return response.widget
    }
  })
}