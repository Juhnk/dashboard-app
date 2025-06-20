"use client"

import { useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardBuilder } from "@/components/dashboard/dashboard-builder"
import { useDashboards } from "@/hooks/use-dashboards"
import { useDashboardStore } from "@/stores"

export default function Dashboard() {
  const { dashboards, isLoading, error, fetchDashboard, createDashboard } = useDashboards()
  const { currentDashboard } = useDashboardStore()

  useEffect(() => {
    const loadDashboard = async () => {
      if (dashboards.length > 0 && !currentDashboard) {
        // Load the first available dashboard
        try {
          await fetchDashboard(dashboards[0].id)
        } catch (err) {
          console.error('Failed to load dashboard:', err)
        }
      } else if (dashboards.length === 0 && !isLoading && !currentDashboard) {
        // Create a default dashboard if none exist
        try {
          const newDashboard = await createDashboard({
            name: 'My First Dashboard',
            description: 'Welcome to your marketing analytics dashboard',
            is_public: false
          })
          await fetchDashboard(newDashboard.id)
        } catch (err) {
          console.error('Failed to create default dashboard:', err)
        }
      }
    }

    loadDashboard()
  }, [dashboards, currentDashboard, isLoading, fetchDashboard, createDashboard])

  if (isLoading && !currentDashboard) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error && !currentDashboard) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">Failed to load dashboard</p>
            <p className="text-gray-500 text-sm mt-1">{error}</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DashboardBuilder />
      </div>
    </ProtectedRoute>
  )
}