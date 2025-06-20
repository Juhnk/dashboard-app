"use client"

import { useCallback, useRef, useState } from 'react'
import { Responsive, WidthProvider, Layout } from 'react-grid-layout'
import { useDashboardStore, useUIStore } from '@/stores'
import { WidgetCard } from './widget-card'
import { AddWidgetControl } from './add-widget-control'

// Chart-specific minimum sizes (in grid units)
const getMinSize = (chartType: string) => {
  switch (chartType) {
    case 'line_chart':
    case 'area_chart':
    case 'bar_chart':
      return { minW: 4, minH: 3 } // Need space for axes and data
    case 'pie_chart':
    case 'donut_chart':
      return { minW: 3, minH: 3 } // Square aspect ratio for circular charts
    case 'scatter_chart':
      return { minW: 4, minH: 3 } // Need space for both axes
    case 'table':
      return { minW: 4, minH: 4 } // Need space for headers and rows
    case 'metric_card':
      return { minW: 2, minH: 2 } // Can be compact
    case 'gauge_chart':
      return { minW: 3, minH: 3 } // Square for gauge
    case 'funnel_chart':
      return { minW: 3, minH: 4 } // Vertical space for funnel
    case 'heatmap':
      return { minW: 4, minH: 3 } // Need space for grid
    default:
      return { minW: 2, minH: 2 }
  }
}

// Make react-grid-layout responsive
const ResponsiveGridLayout = WidthProvider(Responsive)

export function DashboardGrid() {
  const { widgets, updateWidgetLayout } = useDashboardStore()
  const { selectWidget } = useUIStore()
  
  // Track interaction state for click vs drag detection
  const dragStartTime = useRef<number>(0)
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  // Convert widgets to grid layout format with chart-specific constraints
  const layouts = {
    lg: widgets.map(widget => {
      const minSize = getMinSize(widget.widget_type)
      return {
        i: widget.id,
        x: widget.position_x,
        y: widget.position_y,
        w: Math.max(widget.width, minSize.minW), // Ensure minimum width
        h: Math.max(widget.height, minSize.minH), // Ensure minimum height
        ...minSize
      }
    })
  }

  // Handle drag start - detect if this is a click or actual drag
  const handleDragStart = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent) => {
    dragStartTime.current = Date.now()
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    setIsDragging(true)
    
    // Set a timeout to check if this was just a click
    setTimeout(() => {
      const currentTime = Date.now()
      const timeDiff = currentTime - dragStartTime.current
      
      // If very little time has passed and we're still "dragging", treat as click
      if (timeDiff < 200 && isDragging) {
        // This is likely a click, not a drag - select the widget
        selectWidget(oldItem.i, 'data')
        setIsDragging(false)
      }
    }, 150)
  }, [selectWidget, isDragging])

  // Handle drag stop
  const handleDragStop = useCallback((layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent) => {
    const currentTime = Date.now()
    const timeDiff = currentTime - dragStartTime.current
    const distance = Math.sqrt(
      Math.pow(e.clientX - dragStartPos.current.x, 2) + 
      Math.pow(e.clientY - dragStartPos.current.y, 2)
    )
    
    setIsDragging(false)
    
    // If it was a very quick interaction with minimal movement, treat as click
    if (timeDiff < 200 && distance < 5) {
      selectWidget(oldItem.i, 'data')
    }
  }, [selectWidget])

  const handleLayoutChange = useCallback((layout: Layout[]) => {
    const updates = layout.map(item => ({
      id: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h
    }))
    
    updateWidgetLayout(updates)
  }, [updateWidgetLayout])

  if (widgets.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-96">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Your First Chart</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Start building your dashboard by adding charts with demo data. 
            Choose from line charts, bar charts, tables, and more.
          </p>
          
          {/* Add Widget Control */}
          <div className="max-w-xs mx-auto">
            <AddWidgetControl />
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            💡 Charts will populate with demo data and can be edited by clicking on them
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        onLayoutChange={handleLayoutChange}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        isDraggable={true}
        isResizable={true}
        resizeHandles={['se', 'sw', 'ne', 'nw']}
        useCSSTransforms={true}
        preventCollision={false}
        compactType="vertical"
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="widget-container">
            <WidgetCard widget={widget} />
          </div>
        ))}
      </ResponsiveGridLayout>

      <style jsx global>{`
        .react-grid-layout {
          position: relative;
        }
        
        .react-grid-item {
          transition: all 200ms ease;
          transition-property: left, top;
        }
        
        .react-grid-item.cssTransforms {
          transition-property: transform;
        }
        
        .react-grid-item > .react-resizable-handle {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid white;
          opacity: 0;
          transition: opacity 200ms ease;
          z-index: 10;
        }
        
        .react-grid-item:hover > .react-resizable-handle {
          opacity: 1;
        }
        
        .react-grid-item > .react-resizable-handle-se {
          bottom: -6px;
          right: -6px;
          cursor: se-resize;
        }
        
        .react-grid-item > .react-resizable-handle-sw {
          bottom: -6px;
          left: -6px;
          cursor: sw-resize;
        }
        
        .react-grid-item > .react-resizable-handle-ne {
          top: -6px;
          right: -6px;
          cursor: ne-resize;
        }
        
        .react-grid-item > .react-resizable-handle-nw {
          top: -6px;
          left: -6px;
          cursor: nw-resize;
        }
        
        .react-grid-item.react-grid-placeholder {
          background: rgb(37 99 235 / 0.2);
          border: 2px dashed rgb(37 99 235);
          opacity: 0.2;
          transition-duration: 100ms;
          z-index: 2;
          user-select: none;
        }
        
        .widget-container {
          height: 100%;
          position: relative;
        }
        
        .react-grid-item.react-grid-drag-active {
          z-index: 3;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .react-grid-item.react-resizing {
          z-index: 3;
          opacity: 0.8;
        }
        
        .react-grid-item.react-resizing .widget-card {
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}