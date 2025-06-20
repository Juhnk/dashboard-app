'use client'

import { useUIStore, useDashboardStore } from '@/stores'

export function WidgetEditorSidebar() {
  const { selectedWidgetId, setSelectedWidgetId } = useUIStore()
  const { widgets } = useDashboardStore()

  const selectedWidget = widgets.find(w => w.id === selectedWidgetId)

  if (!selectedWidget) {
    return null
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Edit Widget</h2>
          <button
            onClick={() => setSelectedWidgetId(null)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Widget Name</label>
            <input
              type="text"
              value={selectedWidget.name}
              // onChange={...}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Widget Type</label>
            <p className="mt-1 text-sm text-gray-500">{selectedWidget.widget_type}</p>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700">
          Save Changes
        </button>
      </div>
    </div>
  )
} 