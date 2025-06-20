import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Modal {
  id: string
  type: string
  props?: any
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

export interface ChartEditingConfig {
  dimensions: string[]
  metrics: string[]
  filters: FilterConfig[]
  sorting: SortConfig[]
  style: StyleConfig
  chartType: string
}

export interface FilterConfig {
  id: string
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'date_range' | 'not_null' | 'is_null'
  value: any
  enabled: boolean
  label?: string
}

export interface SortConfig {
  field: string
  direction: 'asc' | 'desc'
  priority: number
}

export interface StyleConfig {
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  axisLabels?: {
    x?: string
    y?: string
  }
  showValues?: boolean
  showRowNumbers?: boolean
  alternatingRows?: boolean
}

interface UIState {
  // Modals
  modals: Modal[]
  
  // Toasts
  toasts: Toast[]
  
  // Loading states
  globalLoading: boolean
  
  // Sidebar
  sidebarOpen: boolean
  
  // Theme
  theme: 'light' | 'dark' | 'system'
  
  // Chart Editing Panel State
  selectedWidgetId: string | null
  editingPanelOpen: boolean
  editingMode: 'data' | 'style' | 'filters'
  tempWidgetConfig: ChartEditingConfig | null
  pendingChanges: boolean
  
  // Actions
  openModal: (modal: Omit<Modal, 'id'>) => string
  closeModal: (id: string) => void
  closeAllModals: () => void
  
  showToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearToasts: () => void
  
  setGlobalLoading: (loading: boolean) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void

  // Unified Widget Selection Actions
  selectWidget: (widgetId: string | null, mode?: 'data' | 'style' | 'filters') => void
  setEditingMode: (mode: 'data' | 'style' | 'filters') => void
  setTempWidgetConfig: (config: ChartEditingConfig) => void
  setPendingChanges: (pending: boolean) => void
  resetTempConfig: () => void
  
  // Legacy actions (for backward compatibility)
  setSelectedWidgetId: (id: string | null) => void
  openEditingPanel: (widgetId: string, mode?: 'data' | 'style' | 'filters') => void
  closeEditingPanel: () => void
}

let modalIdCounter = 0
let toastIdCounter = 0

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      modals: [],
      toasts: [],
      globalLoading: false,
      sidebarOpen: true,
      theme: 'light',
      
      // Chart Editing Panel State
      selectedWidgetId: null,
      editingPanelOpen: false,
      editingMode: 'data',
      tempWidgetConfig: null,
      pendingChanges: false,
      
      openModal: (modal) => {
        const id = `modal-${++modalIdCounter}`
        set((state) => ({
          modals: [...state.modals, { ...modal, id }]
        }), false, 'openModal')
        return id
      },
      
      closeModal: (id) => 
        set((state) => ({
          modals: state.modals.filter(m => m.id !== id)
        }), false, 'closeModal'),
        
      closeAllModals: () => 
        set({ modals: [] }, false, 'closeAllModals'),
        
      showToast: (toast) => {
        const id = `toast-${++toastIdCounter}`
        const duration = toast.duration || 5000
        
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }]
        }), false, 'showToast')
        
        // Auto-remove toast after duration
        if (duration > 0) {
          setTimeout(() => {
            get().removeToast(id)
          }, duration)
        }
        
        return id
      },
      
      removeToast: (id) => 
        set((state) => ({
          toasts: state.toasts.filter(t => t.id !== id)
        }), false, 'removeToast'),
        
      clearToasts: () => 
        set({ toasts: [] }, false, 'clearToasts'),
        
      setGlobalLoading: (loading) => 
        set({ globalLoading: loading }, false, 'setGlobalLoading'),
        
      setSidebarOpen: (open) => 
        set({ sidebarOpen: open }, false, 'setSidebarOpen'),
        
      toggleSidebar: () => 
        set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar'),
        
      setTheme: (theme) => 
        set({ theme }, false, 'setTheme'),

      // Unified Widget Selection Actions
      selectWidget: (widgetId, mode = 'data') => {
        if (widgetId === null) {
          // Deselect widget and close panel
          set({ 
            selectedWidgetId: null,
            editingPanelOpen: false,
            tempWidgetConfig: null,
            pendingChanges: false
          }, false, 'selectWidget:deselect')
        } else {
          // Select widget and open panel
          set({ 
            selectedWidgetId: widgetId,
            editingPanelOpen: true,
            editingMode: mode,
            tempWidgetConfig: null,
            pendingChanges: false
          }, false, 'selectWidget:select')
        }
      },
      
      // Legacy actions (for backward compatibility)
      setSelectedWidgetId: (id) => {
        // Use the new unified action
        get().selectWidget(id)
      },
      
      openEditingPanel: (widgetId, mode = 'data') => {
        // Use the new unified action
        get().selectWidget(widgetId, mode)
      },
      
      closeEditingPanel: () => {
        // Use the new unified action
        get().selectWidget(null)
      },
      
      setEditingMode: (mode) =>
        set({ editingMode: mode }, false, 'setEditingMode'),
      
      setTempWidgetConfig: (config) =>
        set({ 
          tempWidgetConfig: config,
          pendingChanges: true
        }, false, 'setTempWidgetConfig'),
      
      setPendingChanges: (pending) =>
        set({ pendingChanges: pending }, false, 'setPendingChanges'),
      
      resetTempConfig: () =>
        set({ 
          tempWidgetConfig: null,
          pendingChanges: false
        }, false, 'resetTempConfig'),
    }),
    { name: 'ui-store' }
  )
)