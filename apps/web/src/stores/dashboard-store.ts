import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { dashboardApi } from '@/lib/api-client'

export interface Dashboard {
  id: string
  name: string
  description?: string
  is_public: boolean
  layout_config?: any
  refresh_interval?: number
  created_at: string
  updated_at: string
  tabs: DashboardTab[]
}

export interface DashboardTab {
  id: string
  dashboard_id: string
  name: string
  position: number
  layout_config?: any
  widgets: Widget[]
}

export interface Widget {
  id: string
  tab_id: string
  name: string
  widget_type: string
  position_x: number
  position_y: number
  width: number
  height: number
  config: any
  data_source_id?: string
  query_config?: any
}

interface DashboardState {
  // NEW: Simplified state for the builder
  widgets: Widget[]
  isInitialized: boolean
  moveWidget: (oldIndex: number, newIndex: number) => void

  // Current dashboard
  currentDashboard: Dashboard | null
  currentTabId: string | null
  
  // Dashboard list
  dashboards: Dashboard[]
  
  // Loading states
  isLoading: boolean
  isSaving: boolean
  
  // Auto-save timer
  saveTimer: NodeJS.Timeout | null
  
  // Actions
  setCurrentDashboard: (dashboard: Dashboard | null) => void
  setCurrentTab: (tabId: string) => void
  setDashboards: (dashboards: Dashboard[]) => void
  addDashboard: (dashboard: Dashboard) => void
  updateDashboard: (dashboard: Dashboard) => void
  deleteDashboard: (id: string) => void
  
  // Widget actions
  addNewWidget: (widgetType: string) => Promise<void>
  addWidget: (widget: Widget) => void
  updateWidget: (widget: Widget) => void
  deleteWidget: (id: string) => void
  updateWidgetLayout: (widgets: { id: string; x: number; y: number; w: number; h: number }[]) => void
  
  // Tab actions
  addTab: (tab: DashboardTab) => void
  updateTab: (tab: DashboardTab) => void
  deleteTab: (id: string) => void
  
  // Loading states
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  
  // Auto-save functionality
  saveDashboard: () => Promise<void>
  fetchDashboard: (id: string) => Promise<void>
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      // NEW: Initial state for builder
      widgets: [],
      isInitialized: false,

      currentDashboard: null,
      currentTabId: null,
      dashboards: [],
      isLoading: false,
      isSaving: false,
      saveTimer: null,
      
      setCurrentDashboard: (dashboard) => {
        const currentTabId = dashboard?.tabs[0]?.id || null
        const currentTab = dashboard?.tabs.find(t => t.id === currentTabId)
        set({ 
          currentDashboard: dashboard,
          currentTabId: currentTabId,
          widgets: currentTab?.widgets || [],
          isInitialized: true,
        }, false, 'setCurrentDashboard')
      },
        
      setCurrentTab: (tabId) => {
        const { currentDashboard } = get()
        const currentTab = currentDashboard?.tabs.find(t => t.id === tabId)
        set({ 
          currentTabId: tabId,
          widgets: currentTab?.widgets || [],
        }, false, 'setCurrentTab')
      },
        
      setDashboards: (dashboards) => 
        set({ dashboards }, false, 'setDashboards'),
        
      addDashboard: (dashboard) => 
        set((state) => ({ 
          dashboards: [...state.dashboards, dashboard] 
        }), false, 'addDashboard'),
        
      updateDashboard: (dashboard) => 
        set((state) => ({
          dashboards: state.dashboards.map(d => d.id === dashboard.id ? dashboard : d),
          currentDashboard: state.currentDashboard?.id === dashboard.id ? dashboard : state.currentDashboard
        }), false, 'updateDashboard'),
        
      deleteDashboard: (id) => 
        set((state) => ({
          dashboards: state.dashboards.filter(d => d.id !== id),
          currentDashboard: state.currentDashboard?.id === id ? null : state.currentDashboard
        }), false, 'deleteDashboard'),
        
      addNewWidget: async (widgetType) => {
        const { currentDashboard, currentTabId, addWidget } = get()
        if (!currentDashboard || !currentTabId) return

        const currentTab = currentDashboard.tabs.find(t => t.id === currentTabId)
        if (!currentTab) return
        
        try {
          // 1. Get intelligent defaults from the demo service
          const { DemoDataService } = require('@/lib/demo-data-service')
          const demoConfig = DemoDataService.getDemoDataForChart({ chartType: widgetType })

          // 2. Smart placement logic
          const y = currentTab.widgets.length > 0
            ? Math.max(...currentTab.widgets.map(w => w.position_y + w.height))
            : 0
          
          // 3. Create widget via API
          const { widgetApi } = await import('@/lib/api-client')
          const response = await widgetApi.createWidget({
            tab_id: currentTabId,
            name: `New ${widgetType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
            widget_type: widgetType,
            position_x: 0,
            position_y: y,
            width: 4,  // Sensible default width
            height: 5, // Sensible default height
            config: {
              ...demoConfig.config,
              data: demoConfig.data, // Embed demo data directly
              isDemoData: true
            }
          })
          
          // 4. Add the API-created widget to local state
          addWidget(response.widget)
        } catch (error) {
          console.error('Failed to create widget:', error)
          // Optionally show error toast here
        }
      },
        
      moveWidget: (oldIndex: number, newIndex: number) => {
        set((state) => {
          const newWidgets = [...state.widgets];
          const [moved] = newWidgets.splice(oldIndex, 1);
          newWidgets.splice(newIndex, 0, moved);

          if (!state.currentDashboard || !state.currentTabId) return { widgets: newWidgets }

          const updatedDashboard = {
            ...state.currentDashboard,
            tabs: state.currentDashboard.tabs.map(tab =>
              tab.id === state.currentTabId
                ? { ...tab, widgets: newWidgets }
                : tab
            )
          }

          return {
            widgets: newWidgets,
            currentDashboard: updatedDashboard,
            dashboards: state.dashboards.map(d =>
              d.id === updatedDashboard.id ? updatedDashboard : d
            )
          }
        }, false, 'moveWidget')
      },
        
      addWidget: (widget) => 
        set((state) => {
          const newWidgets = [...state.widgets, widget]
          if (!state.currentDashboard || !state.currentTabId) return { widgets: newWidgets }
          
          const updatedDashboard = {
            ...state.currentDashboard,
            tabs: state.currentDashboard.tabs.map(tab => 
              tab.id === widget.tab_id 
                ? { ...tab, widgets: newWidgets }
                : tab
            )
          }
          
          return {
            widgets: newWidgets,
            currentDashboard: updatedDashboard,
            dashboards: state.dashboards.map(d => 
              d.id === updatedDashboard.id ? updatedDashboard : d
            )
          }
        }, false, 'addWidget'),
        
      updateWidget: (widget) => 
        set((state) => {
          if (!state.currentDashboard) return state
          
          const updatedDashboard = {
            ...state.currentDashboard,
            tabs: state.currentDashboard.tabs.map(tab => 
              tab.id === widget.tab_id 
                ? { 
                    ...tab, 
                    widgets: tab.widgets.map(w => w.id === widget.id ? widget : w) 
                  }
                : tab
            )
          }
          
          return {
            currentDashboard: updatedDashboard,
            dashboards: state.dashboards.map(d => 
              d.id === updatedDashboard.id ? updatedDashboard : d
            )
          }
        }, false, 'updateWidget'),
        
      deleteWidget: (id) => 
        set((state) => {
          const newWidgets = state.widgets.filter(w => w.id !== id)
          if (!state.currentDashboard) return { widgets: newWidgets }
          
          const updatedDashboard = {
            ...state.currentDashboard,
            tabs: state.currentDashboard.tabs.map(tab => ({
              ...tab,
              widgets: tab.widgets.filter(w => w.id !== id)
            }))
          }
          
          return {
            widgets: newWidgets,
            currentDashboard: updatedDashboard,
            dashboards: state.dashboards.map(d => 
              d.id === updatedDashboard.id ? updatedDashboard : d
            )
          }
        }, false, 'deleteWidget'),
        
      updateWidgetLayout: (widgets) => {
        set((state) => {
          if (!state.currentDashboard || !state.currentTabId) return state
          
          const updatedDashboard = {
            ...state.currentDashboard,
            tabs: state.currentDashboard.tabs.map(tab => 
              tab.id === state.currentTabId 
                ? {
                    ...tab,
                    widgets: tab.widgets.map(widget => {
                      const layoutUpdate = widgets.find(w => w.id === widget.id)
                      return layoutUpdate 
                        ? {
                            ...widget,
                            position_x: layoutUpdate.x,
                            position_y: layoutUpdate.y,
                            width: layoutUpdate.w,
                            height: layoutUpdate.h
                          }
                        : widget
                    })
                  }
                : tab
            )
          }
          
          return {
            currentDashboard: updatedDashboard,
            dashboards: state.dashboards.map(d => 
              d.id === updatedDashboard.id ? updatedDashboard : d
            )
          }
        }, false, 'updateWidgetLayout')
        
        // Auto-save after layout changes (debounced)
        const state = get()
        if (state.saveTimer) {
          clearTimeout(state.saveTimer)
        }
        
        const timer = setTimeout(() => {
          state.saveDashboard()
        }, 1000) // Save after 1 second of inactivity
        
        set({ saveTimer: timer }, false, 'updateWidgetLayout:setSaveTimer')
      },
        
      addTab: (tab) => 
        set((state) => {
          if (!state.currentDashboard) return state
          
          const updatedDashboard = {
            ...state.currentDashboard,
            tabs: [...state.currentDashboard.tabs, tab]
          }
          
          return {
            currentDashboard: updatedDashboard,
            dashboards: state.dashboards.map(d => 
              d.id === updatedDashboard.id ? updatedDashboard : d
            )
          }
        }, false, 'addTab'),
        
      updateTab: (tab) => 
        set((state) => {
          if (!state.currentDashboard) return state
          
          const updatedDashboard = {
            ...state.currentDashboard,
            tabs: state.currentDashboard.tabs.map(t => t.id === tab.id ? tab : t)
          }
          
          return {
            currentDashboard: updatedDashboard,
            dashboards: state.dashboards.map(d => 
              d.id === updatedDashboard.id ? updatedDashboard : d
            )
          }
        }, false, 'updateTab'),
        
      deleteTab: (id) => 
        set((state) => {
          if (!state.currentDashboard) return state
          
          const updatedDashboard = {
            ...state.currentDashboard,
            tabs: state.currentDashboard.tabs.filter(t => t.id !== id)
          }
          
          return {
            currentDashboard: updatedDashboard,
            currentTabId: state.currentTabId === id 
              ? updatedDashboard.tabs[0]?.id || null 
              : state.currentTabId,
            dashboards: state.dashboards.map(d => 
              d.id === updatedDashboard.id ? updatedDashboard : d
            )
          }
        }, false, 'deleteTab'),
        
      setLoading: (loading) => 
        set({ isLoading: loading }, false, 'setLoading'),
        
      setSaving: (saving) => 
        set({ isSaving: saving }, false, 'setSaving'),
        
      saveDashboard: async () => {
        const state = get()
        if (!state.currentDashboard) return
        
        set({ isSaving: true }, false, 'saveDashboard:start')
        
        try {
          await dashboardApi.updateDashboard(state.currentDashboard.id, {
            layout_config: state.currentDashboard.layout_config
          })
        } catch (error) {
          console.error('Failed to save dashboard:', error)
        } finally {
          set({ isSaving: false }, false, 'saveDashboard:end')
        }
      },
      
      fetchDashboard: async (id: string) => {
        set({ isLoading: true }, false, 'fetchDashboard:start')
        
        try {
          const result = await dashboardApi.fetchDashboard(id)
          set({ 
            currentDashboard: result.dashboard,
            currentTabId: result.dashboard.tabs[0]?.id || null 
          }, false, 'fetchDashboard:success')
        } catch (error) {
          console.error('Failed to fetch dashboard:', error)
          set({ currentDashboard: null, currentTabId: null }, false, 'fetchDashboard:error')
        } finally {
          set({ isLoading: false }, false, 'fetchDashboard:end')
        }
      },
    }),
    { name: 'dashboard-store' }
  )
)