import { useState, useEffect } from 'react'
import { dataSourceApi } from '@/lib/api-client'
import { DEMO_DATA } from '@/lib/demo-data'

interface UseDataSourceResult {
  data: any[]
  schema: Record<string, string>
  metadata: {
    dataSourceId: string
    sourceType: string
    rowCount: number
    columnCount: number
    lastSynced: string | null
    syncStatus: string
  } | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDataSource(dataSourceId: string | null | undefined, enabled: boolean = true): UseDataSourceResult {
  const [data, setData] = useState<any[]>([])
  const [schema, setSchema] = useState<Record<string, string>>({})
  const [metadata, setMetadata] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!dataSourceId || !enabled) {
      setData([])
      setSchema({})
      setMetadata(null)
      setError(null)
      return
    }

    // Handle demo data source
    if (dataSourceId === 'demo') {
      setIsLoading(true)
      setError(null)
      
      // Simulate brief loading for demo data
      setTimeout(() => {
        setData(DEMO_DATA.slice(0, 100)) // Use first 100 demo records
        setSchema({
          date: 'date',
          channel: 'string',
          campaign: 'string',
          impressions: 'number',
          clicks: 'number',
          cost: 'number',
          conversions: 'number',
          revenue: 'number',
          ctr: 'number'
        })
        setMetadata({
          dataSourceId: 'demo',
          sourceType: 'demo',
          rowCount: DEMO_DATA.length,
          columnCount: 9,
          lastSynced: new Date().toISOString(),
          syncStatus: 'active'
        })
        setIsLoading(false)
      }, 300) // Brief delay to show loading state
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await dataSourceApi.getDataSourceData(dataSourceId)
      setData(result.data || [])
      setSchema(result.schema || {})
      setMetadata(result.metadata || null)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data')
      setData([])
      setSchema({})
      setMetadata(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dataSourceId, enabled])

  return {
    data,
    schema,
    metadata,
    isLoading,
    error,
    refetch: fetchData
  }
}