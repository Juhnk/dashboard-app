"use client"

import React from 'react'
import { useDashboardStore, useUIStore } from '@/stores'
import { DashboardGrid } from './dashboard-grid'
import { DashboardHeader } from './dashboard-header'
import { ChartEditingPanel } from './chart-editing-panel'

export function DashboardBuilder() {
  const { isInitialized } = useDashboardStore()
  const { selectedWidgetId, editingPanelOpen, selectWidget } = useUIStore()

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading Dashboard...</div>
      </div>
    )
  }


  const handleBackgroundClick = () => {
    selectWidget(null)
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${editingPanelOpen ? 'mr-96' : ''}`}>
        <DashboardHeader />
        <main className="flex-1 p-6 overflow-y-auto" onClick={handleBackgroundClick}>
          <DashboardGrid />
        </main>
      </div>
      <ChartEditingPanel />
    </div>
  )
}