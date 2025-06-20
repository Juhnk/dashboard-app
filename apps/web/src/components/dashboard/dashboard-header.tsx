"use client"

import { useState } from 'react'
import { useDashboardStore, useUIStore } from '@/stores'
import { useDataSourceStore } from '@/stores/data-source-store'
import { Button } from '@/components/ui/Button'
import { DataDictionary } from '@/components/data-sources/data-dictionary'
import { AddWidgetControl } from './add-widget-control'

export function DashboardHeader() {
  const { currentDashboard, isSaving, widgets } = useDashboardStore()
  const { toggleSidebar, showToast } = useUIStore()
  const { demoSources, mergeSuggestions } = useDataSourceStore()
  const [isEditing, setIsEditing] = useState(false)
  const [dashboardName, setDashboardName] = useState('')
  const [showDataDictionary, setShowDataDictionary] = useState(false)

  const handleSave = async () => {
    try {
      // This would call the API to save dashboard changes
      showToast({
        type: 'success',
        title: 'Dashboard saved',
        message: 'Your changes have been saved successfully.'
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Save failed',
        message: 'Failed to save dashboard changes.'
      })
    }
  }

  const handleNameEdit = () => {
    setDashboardName(currentDashboard?.name || '')
    setIsEditing(true)
  }

  const handleNameSave = () => {
    if (dashboardName.trim()) {
      // Update dashboard name via API
      setIsEditing(false)
    }
  }

  const handleNameCancel = () => {
    setIsEditing(false)
    setDashboardName('')
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={dashboardName}
                  onChange={(e) => setDashboardName(e.target.value)}
                  className="text-xl font-semibold border-b-2 border-primary-500 bg-transparent focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNameSave()
                    if (e.key === 'Escape') handleNameCancel()
                  }}
                  autoFocus
                />
                <button
                  onClick={handleNameSave}
                  className="text-green-600 hover:text-green-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={handleNameCancel}
                  className="text-red-600 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentDashboard?.name}
                </h1>
                <button
                  onClick={handleNameEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}

            {currentDashboard?.description && (
              <p className="text-sm text-gray-500">{currentDashboard.description}</p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Auto-save enabled</span>
              {isSaving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              )}
            </div>

            {/* Add Chart Button - Only show when dashboard has widgets */}
            {widgets.length > 0 && (
              <div className="w-20">
                <AddWidgetControl variant="compact" />
              </div>
            )}

            {/* Data Dictionary Button */}
            {demoSources.length > 0 && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setShowDataDictionary(true)}
                className="flex items-center space-x-1"
              >
                <span>📚</span>
                <span>Data Dictionary</span>
                {mergeSuggestions.length > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-medium text-white bg-red-500 rounded-full">
                    {mergeSuggestions.length}
                  </span>
                )}
              </Button>
            )}

            <Button variant="secondary" size="sm">
              Preview
            </Button>
            
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>

            <button className="p-2 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      {/* Data Dictionary Modal */}
      <DataDictionary
        isOpen={showDataDictionary}
        onClose={() => setShowDataDictionary(false)}
      />
    </>
  )
}