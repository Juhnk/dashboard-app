// Export all stores from a single location for easy imports
export { useAuthStore } from './auth-store'
export { useDashboardStore } from './dashboard-store'
export { useDataSourceStore } from './data-source-store'
export { useUIStore } from './ui-store'

// Store types
export type { User } from './auth-store'
export type { Dashboard, DashboardTab, Widget } from './dashboard-store'
export type { DataSource, DataSnapshot } from './data-source-store'
export type { Modal, Toast } from './ui-store'