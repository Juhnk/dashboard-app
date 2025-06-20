import { describe, it, expect, beforeEach } from 'vitest'
import { useDashboardStore } from '@/stores/dashboard-store'

describe('Dashboard Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useDashboardStore.getState().resetStore?.()
  })

  it('initializes with empty state', () => {
    const state = useDashboardStore.getState()
    
    expect(state.dashboards).toEqual([])
    expect(state.currentDashboard).toBeNull()
    expect(state.widgets).toEqual([])
    expect(state.isDirty).toBe(false)
  })

  it('can add a new dashboard', () => {
    const store = useDashboardStore.getState()
    
    const newDashboard = {
      id: 'test-dashboard',
      name: 'Test Dashboard',
      description: 'A test dashboard'
    }
    
    store.addDashboard?.(newDashboard)
    
    const state = useDashboardStore.getState()
    expect(state.dashboards).toHaveLength(1)
    expect(state.dashboards[0]).toMatchObject(newDashboard)
  })

  it('can set current dashboard', () => {
    const store = useDashboardStore.getState()
    
    const dashboard = {
      id: 'test-dashboard',
      name: 'Test Dashboard',
      description: 'A test dashboard'
    }
    
    store.addDashboard?.(dashboard)
    store.setCurrentDashboard?.(dashboard.id)
    
    const state = useDashboardStore.getState()
    expect(state.currentDashboard?.id).toBe(dashboard.id)
  })

  it('can add a widget', () => {
    const store = useDashboardStore.getState()
    
    const widget = {
      id: 'test-widget',
      name: 'Test Widget',
      type: 'line_chart',
      config: {
        metrics: ['impressions'],
        dimension: 'date'
      }
    }
    
    store.addWidget?.(widget)
    
    const state = useDashboardStore.getState()
    expect(state.widgets).toHaveLength(1)
    expect(state.widgets[0]).toMatchObject(widget)
  })

  it('can update a widget', () => {
    const store = useDashboardStore.getState()
    
    const widget = {
      id: 'test-widget',
      name: 'Test Widget',
      type: 'line_chart',
      config: {
        metrics: ['impressions'],
        dimension: 'date'
      }
    }
    
    store.addWidget?.(widget)
    
    const updates = {
      name: 'Updated Widget',
      config: {
        metrics: ['clicks'],
        dimension: 'channel'
      }
    }
    
    store.updateWidget?.(widget.id, updates)
    
    const state = useDashboardStore.getState()
    const updatedWidget = state.widgets.find(w => w.id === widget.id)
    
    expect(updatedWidget?.name).toBe('Updated Widget')
    expect(updatedWidget?.config.metrics).toEqual(['clicks'])
  })

  it('can delete a widget', () => {
    const store = useDashboardStore.getState()
    
    const widget = {
      id: 'test-widget',
      name: 'Test Widget',
      type: 'line_chart',
      config: {}
    }
    
    store.addWidget?.(widget)
    expect(useDashboardStore.getState().widgets).toHaveLength(1)
    
    store.deleteWidget?.(widget.id)
    expect(useDashboardStore.getState().widgets).toHaveLength(0)
  })

  it('marks store as dirty when changes are made', () => {
    const store = useDashboardStore.getState()
    
    expect(store.isDirty).toBe(false)
    
    store.addWidget?.({
      id: 'test-widget',
      name: 'Test Widget',
      type: 'line_chart',
      config: {}
    })
    
    const state = useDashboardStore.getState()
    expect(state.isDirty).toBe(true)
  })
})