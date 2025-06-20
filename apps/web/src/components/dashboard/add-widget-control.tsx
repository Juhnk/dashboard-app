'use client'

import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useDashboardStore } from '@/stores'

const WIDGET_TYPES = [
  { id: 'line_chart', name: 'Line Chart', icon: '📈' },
  { id: 'bar_chart', name: 'Bar Chart', icon: '📊' },
  { id: 'pie_chart', name: 'Pie Chart', icon: '🥧' },
  { id: 'data_table', name: 'Data Table', icon: '📋' },
  { id: 'metric_card', name: 'Metric Card', icon: '💳' },
  { id: 'funnel_chart', name: 'Funnel Chart', icon: '🔽' },
  { id: 'heatmap', name: 'Heatmap', icon: '🔥' },
  { id: 'gauge_chart', name: 'Gauge Chart', icon: '⏰' },
]

interface AddWidgetControlProps {
  variant?: 'default' | 'compact'
}

export function AddWidgetControl({ variant = 'default' }: AddWidgetControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { addNewWidget } = useDashboardStore()

  const handleSelectWidget = (widgetType: string) => {
    addNewWidget(widgetType)
    setIsOpen(false)
  }

  const isCompact = variant === 'compact'

  return (
    <div className="w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className={`w-full flex items-center justify-center gap-3 bg-primary-600 text-white rounded-xl shadow-lg hover:bg-primary-700 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 font-medium ${
              isCompact 
                ? 'h-10 text-sm px-3' 
                : 'h-14 text-lg'
            }`}
            aria-label="Add new chart"
          >
            <svg
              className={`${isCompact ? 'w-4 h-4' : 'w-6 h-6'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {isCompact ? 'Add' : 'Add Chart'}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3" align={isCompact ? "end" : "center"}>
          <div className="mb-3">
            <h4 className="font-semibold text-gray-900 text-sm">Choose Chart Type</h4>
            <p className="text-xs text-gray-500 mt-1">Charts will populate with demo data automatically</p>
          </div>
          <div className="grid grid-cols-1 gap-1">
            {WIDGET_TYPES.map((widget) => (
              <button
                key={widget.id}
                onClick={() => handleSelectWidget(widget.id)}
                className="w-full flex items-center p-3 rounded-lg text-left hover:bg-gray-50 hover:border-primary-200 border border-transparent transition-all duration-150 group"
              >
                <span className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-150">{widget.icon}</span>
                <span className="font-medium text-gray-800 group-hover:text-primary-700">{widget.name}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 