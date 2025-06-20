import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { DemoDataSource, getAllDemoSources } from '@/lib/multi-source-demo-data'
import { MergeRule, MergeSuggestion, SemanticMergeEngine } from '@/lib/semantic-merge-engine'

export interface DataSource {
  id: string
  organization_id: string
  name: string
  source_type: 'google_sheets' | 'csv_upload' | 'google_ads' | 'facebook_ads' | 'linkedin_ads' | 'tiktok_ads' | 'twitter_ads' | 'api_endpoint'
  connection_config: any
  schema_config?: any
  last_synced_at?: string
  sync_status: 'pending' | 'syncing' | 'active' | 'error'
  created_at: string
  updated_at: string
}

export interface DataSnapshot {
  id: string
  data_source_id: string
  snapshot_date: string
  data: any
  row_count: number
  created_at: string
}

interface DataSourceState {
  // Data sources
  dataSources: DataSource[]
  currentDataSource: DataSource | null
  
  // Demo sources for intelligence testing
  demoSources: DemoDataSource[]
  isDemoMode: boolean
  
  // Data snapshots
  snapshots: Record<string, DataSnapshot[]> // keyed by data_source_id
  
  // Merge Intelligence
  mergeRules: MergeRule[]
  mergeSuggestions: MergeSuggestion[]
  isAnalyzing: boolean
  
  // Loading states
  isLoading: boolean
  isSyncing: Record<string, boolean> // keyed by data_source_id
  
  // Actions
  setDataSources: (dataSources: DataSource[]) => void
  setCurrentDataSource: (dataSource: DataSource | null) => void
  addDataSource: (dataSource: DataSource) => void
  updateDataSource: (dataSource: DataSource) => void
  deleteDataSource: (id: string) => void
  
  // Demo mode actions
  setDemoMode: (enabled: boolean) => void
  loadDemoSources: () => void
  getDemoSourceById: (id: string) => DemoDataSource | undefined
  
  // Merge intelligence actions
  refreshMergeSuggestions: () => void
  addMergeRule: (rule: MergeRule) => void
  removeMergeRule: (ruleId: string) => void
  getMergeRuleByName: (name: string) => MergeRule | undefined
  
  // Sync actions
  setSyncStatus: (id: string, status: DataSource['sync_status']) => void
  setSyncing: (id: string, syncing: boolean) => void
  setLastSynced: (id: string, timestamp: string) => void
  
  // Snapshot actions
  setSnapshots: (dataSourceId: string, snapshots: DataSnapshot[]) => void
  addSnapshot: (snapshot: DataSnapshot) => void
  
  // Loading
  setLoading: (loading: boolean) => void
  setAnalyzing: (analyzing: boolean) => void
  
  // Getters
  getDataSourceById: (id: string) => DataSource | undefined
  getSnapshotsByDataSourceId: (id: string) => DataSnapshot[]
  getLatestSnapshot: (dataSourceId: string) => DataSnapshot | undefined
  getAllAvailableSources: () => (DataSource | DemoDataSource)[]
}

export const useDataSourceStore = create<DataSourceState>()(
  devtools(
    (set, get) => ({
      dataSources: [],
      currentDataSource: null,
      demoSources: [],
      isDemoMode: true,
      snapshots: {},
      mergeRules: [],
      mergeSuggestions: [],
      isAnalyzing: false,
      isLoading: false,
      isSyncing: {},
      
      setDataSources: (dataSources) => 
        set({ dataSources }, false, 'setDataSources'),
        
      setCurrentDataSource: (dataSource) => 
        set({ currentDataSource: dataSource }, false, 'setCurrentDataSource'),
        
      addDataSource: (dataSource) => 
        set((state) => ({ 
          dataSources: [...state.dataSources, dataSource] 
        }), false, 'addDataSource'),
        
      updateDataSource: (dataSource) => 
        set((state) => ({
          dataSources: state.dataSources.map(ds => ds.id === dataSource.id ? dataSource : ds),
          currentDataSource: state.currentDataSource?.id === dataSource.id ? dataSource : state.currentDataSource
        }), false, 'updateDataSource'),
        
      deleteDataSource: (id) => 
        set((state) => ({
          dataSources: state.dataSources.filter(ds => ds.id !== id),
          currentDataSource: state.currentDataSource?.id === id ? null : state.currentDataSource,
          snapshots: Object.fromEntries(
            Object.entries(state.snapshots).filter(([key]) => key !== id)
          ),
          isSyncing: Object.fromEntries(
            Object.entries(state.isSyncing).filter(([key]) => key !== id)
          )
        }), false, 'deleteDataSource'),
        
      setSyncStatus: (id, status) => 
        set((state) => ({
          dataSources: state.dataSources.map(ds => 
            ds.id === id ? { ...ds, sync_status: status } : ds
          ),
          currentDataSource: state.currentDataSource?.id === id 
            ? { ...state.currentDataSource, sync_status: status }
            : state.currentDataSource
        }), false, 'setSyncStatus'),
        
      setSyncing: (id, syncing) => 
        set((state) => ({
          isSyncing: { ...state.isSyncing, [id]: syncing }
        }), false, 'setSyncing'),
        
      setLastSynced: (id, timestamp) => 
        set((state) => ({
          dataSources: state.dataSources.map(ds => 
            ds.id === id ? { ...ds, last_synced_at: timestamp } : ds
          ),
          currentDataSource: state.currentDataSource?.id === id 
            ? { ...state.currentDataSource, last_synced_at: timestamp }
            : state.currentDataSource
        }), false, 'setLastSynced'),
        
      setSnapshots: (dataSourceId, snapshots) => 
        set((state) => ({
          snapshots: { ...state.snapshots, [dataSourceId]: snapshots }
        }), false, 'setSnapshots'),
        
      addSnapshot: (snapshot) => 
        set((state) => ({
          snapshots: {
            ...state.snapshots,
            [snapshot.data_source_id]: [
              ...(state.snapshots[snapshot.data_source_id] || []),
              snapshot
            ].sort((a, b) => new Date(b.snapshot_date).getTime() - new Date(a.snapshot_date).getTime())
          }
        }), false, 'addSnapshot'),
        
      // Demo mode actions
      setDemoMode: (enabled) => {
        set({ isDemoMode: enabled }, false, 'setDemoMode')
        if (enabled) {
          get().loadDemoSources()
        }
      },
      
      loadDemoSources: () => {
        set({ isLoading: true }, false, 'loadDemoSources start')
        try {
          const demoSources = getAllDemoSources()
          set({ 
            demoSources,
            isLoading: false 
          }, false, 'loadDemoSources success')
          // Auto-refresh merge suggestions
          setTimeout(() => get().refreshMergeSuggestions(), 100)
        } catch (error) {
          set({ 
            isLoading: false 
          }, false, 'loadDemoSources error')
        }
      },
      
      getDemoSourceById: (id) => 
        get().demoSources.find(ds => ds.id === id),
      
      // Merge intelligence actions
      refreshMergeSuggestions: () => {
        const { demoSources, isAnalyzing } = get()
        if (isAnalyzing || demoSources.length === 0) return
        
        set({ isAnalyzing: true }, false, 'refreshMergeSuggestions start')
        try {
          const suggestions = SemanticMergeEngine.analyzeSources(demoSources)
          set({ 
            mergeSuggestions: suggestions,
            isAnalyzing: false 
          }, false, 'refreshMergeSuggestions success')
        } catch (error) {
          set({ 
            isAnalyzing: false 
          }, false, 'refreshMergeSuggestions error')
        }
      },
      
      addMergeRule: (rule) => {
        set((state) => ({ 
          mergeRules: [...state.mergeRules, rule] 
        }), false, 'addMergeRule')
        get().refreshMergeSuggestions()
      },
      
      removeMergeRule: (ruleId) => {
        SemanticMergeEngine.deleteMergeRule(ruleId)
        set((state) => ({
          mergeRules: state.mergeRules.filter(rule => rule.id !== ruleId)
        }), false, 'removeMergeRule')
        get().refreshMergeSuggestions()
      },
      
      getMergeRuleByName: (name) => 
        get().mergeRules.find(rule => rule.mergedName === name),

      setLoading: (loading) => 
        set({ isLoading: loading }, false, 'setLoading'),
        
      setAnalyzing: (analyzing) => 
        set({ isAnalyzing: analyzing }, false, 'setAnalyzing'),
        
      // Getters
      getDataSourceById: (id) => 
        get().dataSources.find(ds => ds.id === id),
        
      getSnapshotsByDataSourceId: (id) => 
        get().snapshots[id] || [],
        
      getLatestSnapshot: (dataSourceId) => {
        const snapshots = get().snapshots[dataSourceId] || []
        return snapshots[0] // Already sorted by date desc
      },
      
      getAllAvailableSources: () => {
        const { dataSources, demoSources, isDemoMode } = get()
        return isDemoMode ? demoSources : dataSources
      }
    }),
    { name: 'data-source-store' }
  )
)

// Initialize demo sources on store creation
useDataSourceStore.getState().loadDemoSources()