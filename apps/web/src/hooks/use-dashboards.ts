import { useState, useEffect } from 'react'
import { dashboardApi } from '@/lib/api-client'
import { useDashboardStore } from '@/stores'

export function useDashboards() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { dashboards, setDashboards, setCurrentDashboard } = useDashboardStore()

  const fetchDashboards = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await dashboardApi.fetchDashboards()
      setDashboards(result.dashboards)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboards')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDashboard = async (id: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await dashboardApi.fetchDashboard(id)
      setCurrentDashboard(result.dashboard)
      return result.dashboard
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const createDashboard = async (dashboard: {
    name: string
    description?: string
    is_public?: boolean
    refresh_interval?: number
  }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await dashboardApi.createDashboard(dashboard)
      await fetchDashboards() // Refresh list
      return result.dashboard
    } catch (err: any) {
      setError(err.message || 'Failed to create dashboard')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateDashboard = async (id: string, updates: {
    name?: string
    description?: string
    is_public?: boolean
    refresh_interval?: number
    layout_config?: any
  }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await dashboardApi.updateDashboard(id, updates)
      await fetchDashboards() // Refresh list
      return result.dashboard
    } catch (err: any) {
      setError(err.message || 'Failed to update dashboard')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteDashboard = async (id: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await dashboardApi.deleteDashboard(id)
      await fetchDashboards() // Refresh list
    } catch (err: any) {
      setError(err.message || 'Failed to delete dashboard')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Auto-fetch dashboards on mount
    fetchDashboards()
  }, [])

  return {
    dashboards,
    isLoading,
    error,
    fetchDashboards,
    fetchDashboard,
    createDashboard,
    updateDashboard,
    deleteDashboard
  }
}