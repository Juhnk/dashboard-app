/**
 * Semantic Merge Engine
 * The core intelligence system that understands column meanings across data sources
 * and enables intelligent merging and aggregation
 */

import { DemoDataSource, DemoColumnSchema } from './multi-source-demo-data'

export interface ColumnSynonym {
  id: string
  canonicalName: string
  displayName: string
  synonyms: string[]
  dataType: 'string' | 'number' | 'date' | 'boolean'
  classification: 'dimension' | 'metric' | 'identifier'
  description: string
  unit?: string
  formatType?: 'currency' | 'percentage' | 'number' | 'date'
}

export interface MergeRule {
  id: string
  mergedName: string
  displayName: string
  sourceColumns: Array<{
    sourceId: string
    columnName: string
    weight?: number // For weighted averages
  }>
  aggregationType: 'sum' | 'avg' | 'max' | 'min' | 'count' | 'first'
  classification: 'dimension' | 'metric'
  createdAt: string
  createdBy?: string
}

export interface MergeSuggestion {
  confidence: number // 0-1 scale
  canonicalName: string
  displayName: string
  columns: Array<{
    sourceId: string
    sourceName: string
    columnName: string
    displayName: string
    sampleValues: any[]
  }>
  suggestedAggregation: 'sum' | 'avg' | 'max' | 'min'
  reason: string
}

export interface MergedDataQuery {
  dimensions: string[] // Merged or single-source dimensions
  metrics: string[] // Merged or single-source metrics
  sources: string[] // Source IDs to query
  filters?: Array<{
    column: string
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'in'
    value: any
  }>
  groupBy?: string[]
  dateRange?: {
    start: string
    end: string
  }
  limit?: number
}

export interface MergedDataResult {
  data: Record<string, any>[]
  metadata: {
    totalRows: number
    sourcesUsed: string[]
    columnsReturned: string[]
    mergeRulesApplied: string[]
    queryExecutionTime: number
  }
}

export class SemanticMergeEngine {
  private static readonly SYNONYM_LIBRARY: ColumnSynonym[] = [
    {
      id: 'impressions',
      canonicalName: 'impressions',
      displayName: 'Impressions',
      synonyms: ['impressions', 'imps', 'impression', 'views', 'ad_views'],
      dataType: 'number',
      classification: 'metric',
      description: 'Number of times an ad was displayed',
      formatType: 'number'
    },
    {
      id: 'clicks',
      canonicalName: 'clicks',
      displayName: 'Clicks',
      synonyms: ['clicks', 'link_clicks', 'ad_clicks', 'click', 'taps'],
      dataType: 'number',
      classification: 'metric',
      description: 'Number of clicks on ads',
      formatType: 'number'
    },
    {
      id: 'cost',
      canonicalName: 'cost',
      displayName: 'Cost',
      synonyms: ['cost', 'spend', 'total_spend', 'amount_spent', 'budget_used', 'cost_usd'],
      dataType: 'number',
      classification: 'metric',
      description: 'Total amount spent on advertising',
      formatType: 'currency',
      unit: 'USD'
    },
    {
      id: 'conversions',
      canonicalName: 'conversions',
      displayName: 'Conversions',
      synonyms: ['conversions', 'conv', 'total_conversions', 'purchases', 'leads', 'signups'],
      dataType: 'number',
      classification: 'metric',
      description: 'Number of conversion events',
      formatType: 'number'
    },
    {
      id: 'revenue',
      canonicalName: 'revenue',
      displayName: 'Revenue',
      synonyms: ['revenue', 'sales', 'conversion_value', 'purchase_value', 'total_revenue'],
      dataType: 'number',
      classification: 'metric',
      description: 'Revenue generated from conversions',
      formatType: 'currency',
      unit: 'USD'
    },
    {
      id: 'ctr',
      canonicalName: 'ctr',
      displayName: 'CTR (%)',
      synonyms: ['ctr', 'click_through_rate', 'link_ctr', 'clickthrough_rate'],
      dataType: 'number',
      classification: 'metric',
      description: 'Click-through rate as a percentage',
      formatType: 'percentage'
    },
    {
      id: 'cpc',
      canonicalName: 'cpc',
      displayName: 'Cost Per Click',
      synonyms: ['cpc', 'avg_cpc', 'cost_per_click', 'average_cpc'],
      dataType: 'number',
      classification: 'metric',
      description: 'Average cost per click',
      formatType: 'currency',
      unit: 'USD'
    },
    {
      id: 'date',
      canonicalName: 'date',
      displayName: 'Date',
      synonyms: ['date', 'day', 'date_start', 'report_date', 'campaign_date'],
      dataType: 'date',
      classification: 'dimension',
      description: 'Date of the data point',
      formatType: 'date'
    },
    {
      id: 'campaign',
      canonicalName: 'campaign',
      displayName: 'Campaign',
      synonyms: ['campaign', 'campaign_name', 'campaign_title', 'ad_campaign'],
      dataType: 'string',
      classification: 'dimension',
      description: 'Name of the advertising campaign'
    }
  ]

  private static mergeRules: MergeRule[] = []

  /**
   * Analyze columns across multiple sources and suggest merges
   */
  static analyzeSources(sources: DemoDataSource[]): MergeSuggestion[] {
    const suggestions: MergeSuggestion[] = []
    const columnsByCanonical = new Map<string, Array<{
      sourceId: string
      sourceName: string
      columnName: string
      displayName: string
      schema: DemoColumnSchema
    }>>()

    // Group columns by their canonical meaning
    sources.forEach(source => {
      source.schema.forEach(column => {
        const synonym = this.findSynonym(column.name)
        if (synonym) {
          const key = synonym.canonicalName
          if (!columnsByCanonical.has(key)) {
            columnsByCanonical.set(key, [])
          }
          columnsByCanonical.get(key)!.push({
            sourceId: source.id,
            sourceName: source.name,
            columnName: column.name,
            displayName: column.displayName,
            schema: column
          })
        }
      })
    })

    // Generate suggestions for columns that appear in multiple sources
    columnsByCanonical.forEach((columns, canonicalName) => {
      if (columns.length > 1) {
        const synonym = this.getSynonymByCanonical(canonicalName)!
        const confidence = this.calculateConfidence(columns)
        
        suggestions.push({
          confidence,
          canonicalName,
          displayName: synonym.displayName,
          columns: columns.map(col => ({
            sourceId: col.sourceId,
            sourceName: col.sourceName,
            columnName: col.columnName,
            displayName: col.displayName,
            sampleValues: col.schema.sampleValues
          })),
          suggestedAggregation: synonym.classification === 'metric' ? 'sum' : 'max',
          reason: `Found ${columns.length} columns that represent "${synonym.displayName}" across different sources`
        })
      }
    })

    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Create a merge rule from user selection
   */
  static createMergeRule(
    mergedName: string,
    displayName: string,
    sourceColumns: Array<{ sourceId: string; columnName: string }>,
    aggregationType: 'sum' | 'avg' | 'max' | 'min' | 'count' | 'first'
  ): MergeRule {
    const rule: MergeRule = {
      id: `merge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      mergedName,
      displayName,
      sourceColumns,
      aggregationType,
      classification: aggregationType === 'first' ? 'dimension' : 'metric',
      createdAt: new Date().toISOString()
    }

    this.mergeRules.push(rule)
    return rule
  }

  /**
   * Execute a query with merging logic
   */
  static async executeQuery(
    query: MergedDataQuery,
    sources: DemoDataSource[]
  ): Promise<MergedDataResult> {
    const startTime = Date.now()
    const sourcesUsed = sources.filter(s => query.sources.includes(s.id))
    const mergeRulesApplied: string[] = []

    // Step 1: Collect raw data from each source
    const sourceData = new Map<string, Record<string, any>[]>()
    
    for (const source of sourcesUsed) {
      let data = source.data

      // Apply filters
      if (query.filters) {
        data = data.filter(row => {
          return query.filters!.every(filter => {
            const value = row[filter.column]
            switch (filter.operator) {
              case 'eq': return value === filter.value
              case 'ne': return value !== filter.value
              case 'gt': return Number(value) > Number(filter.value)
              case 'lt': return Number(value) < Number(filter.value)
              case 'contains': return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
              case 'in': return Array.isArray(filter.value) && filter.value.includes(value)
              default: return true
            }
          })
        })
      }

      // Apply date range filter
      if (query.dateRange) {
        data = data.filter(row => {
          const rowDate = row.date
          return rowDate >= query.dateRange!.start && rowDate <= query.dateRange!.end
        })
      }

      sourceData.set(source.id, data)
    }

    // Step 2: Identify which columns need merging
    const columnsToMerge = new Map<string, MergeRule>()
    const allRequestedColumns = [...query.dimensions, ...query.metrics]

    allRequestedColumns.forEach(columnName => {
      const mergeRule = this.mergeRules.find(rule => rule.mergedName === columnName)
      if (mergeRule) {
        columnsToMerge.set(columnName, mergeRule)
        mergeRulesApplied.push(mergeRule.id)
      }
    })

    // Step 3: Determine grouping strategy
    const groupByColumns = query.groupBy || query.dimensions.filter(dim => !columnsToMerge.has(dim))
    
    // Step 4: Merge and aggregate data
    const mergedData = new Map<string, Record<string, any>>()

    // Process each source's data
    for (const [sourceId, data] of sourceData) {
      for (const row of data) {
        // Create grouping key
        const groupKey = groupByColumns.map(col => {
          const mergeRule = columnsToMerge.get(col)
          if (mergeRule) {
            // Find the column in this source that maps to the merged column
            const sourceColumn = mergeRule.sourceColumns.find(sc => sc.sourceId === sourceId)
            return sourceColumn ? row[sourceColumn.columnName] : null
          }
          return row[col]
        }).join('|||')

        if (!mergedData.has(groupKey)) {
          // Initialize new merged row
          const mergedRow: Record<string, any> = {}
          
          // Set dimensions
          groupByColumns.forEach(col => {
            const mergeRule = columnsToMerge.get(col)
            if (mergeRule) {
              const sourceColumn = mergeRule.sourceColumns.find(sc => sc.sourceId === sourceId)
              mergedRow[col] = sourceColumn ? row[sourceColumn.columnName] : null
            } else {
              mergedRow[col] = row[col]
            }
          })

          // Initialize metrics
          query.metrics.forEach(metric => {
            const mergeRule = columnsToMerge.get(metric)
            if (mergeRule) {
              mergedRow[metric] = 0 // Will be aggregated
              mergedRow[`${metric}_count`] = 0 // Track count for averaging
            } else {
              mergedRow[metric] = row[metric] || 0
            }
          })

          mergedData.set(groupKey, mergedRow)
        }

        // Aggregate metrics
        const existingRow = mergedData.get(groupKey)!
        query.metrics.forEach(metric => {
          const mergeRule = columnsToMerge.get(metric)
          if (mergeRule) {
            // Apply merge rule aggregation
            const sourceColumn = mergeRule.sourceColumns.find(sc => sc.sourceId === sourceId)
            if (sourceColumn) {
              const value = row[sourceColumn.columnName] || 0
              switch (mergeRule.aggregationType) {
                case 'sum':
                  existingRow[metric] += Number(value)
                  break
                case 'avg':
                  existingRow[metric] += Number(value)
                  existingRow[`${metric}_count`] += 1
                  break
                case 'max':
                  existingRow[metric] = Math.max(existingRow[metric], Number(value))
                  break
                case 'min':
                  existingRow[metric] = Math.min(existingRow[metric], Number(value))
                  break
                case 'count':
                  existingRow[metric] += 1
                  break
                case 'first':
                  if (existingRow[metric] === 0) existingRow[metric] = value
                  break
              }
            }
          } else {
            // Direct column aggregation (assuming sum for metrics)
            existingRow[metric] = (existingRow[metric] || 0) + Number(row[metric] || 0)
          }
        })
      }
    }

    // Step 5: Finalize averages and clean up helper columns
    const finalData = Array.from(mergedData.values()).map(row => {
      const finalRow = { ...row }
      query.metrics.forEach(metric => {
        const mergeRule = columnsToMerge.get(metric)
        if (mergeRule && mergeRule.aggregationType === 'avg') {
          const count = finalRow[`${metric}_count`]
          if (count > 0) {
            finalRow[metric] = finalRow[metric] / count
          }
          delete finalRow[`${metric}_count`]
        }
      })
      return finalRow
    })

    // Step 6: Apply limit
    const limitedData = query.limit ? finalData.slice(0, query.limit) : finalData

    const executionTime = Date.now() - startTime

    return {
      data: limitedData,
      metadata: {
        totalRows: limitedData.length,
        sourcesUsed: sourcesUsed.map(s => s.id),
        columnsReturned: [...query.dimensions, ...query.metrics],
        mergeRulesApplied,
        queryExecutionTime: executionTime
      }
    }
  }

  /**
   * Get all active merge rules
   */
  static getMergeRules(): MergeRule[] {
    return [...this.mergeRules]
  }

  /**
   * Delete a merge rule
   */
  static deleteMergeRule(ruleId: string): boolean {
    const index = this.mergeRules.findIndex(rule => rule.id === ruleId)
    if (index >= 0) {
      this.mergeRules.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * Find synonym for a column name
   */
  private static findSynonym(columnName: string): ColumnSynonym | undefined {
    return this.SYNONYM_LIBRARY.find(synonym =>
      synonym.synonyms.some(syn => 
        syn.toLowerCase() === columnName.toLowerCase()
      )
    )
  }

  /**
   * Get synonym by canonical name
   */
  private static getSynonymByCanonical(canonicalName: string): ColumnSynonym | undefined {
    return this.SYNONYM_LIBRARY.find(synonym => synonym.canonicalName === canonicalName)
  }

  /**
   * Calculate confidence score for merge suggestion
   */
  private static calculateConfidence(columns: Array<{ schema: DemoColumnSchema }>): number {
    let confidence = 0.7 // Base confidence

    // Higher confidence if data types match
    const dataTypes = new Set(columns.map(col => col.schema.type))
    if (dataTypes.size === 1) {
      confidence += 0.2
    }

    // Higher confidence if classifications match
    const classifications = new Set(columns.map(col => col.schema.classification))
    if (classifications.size === 1) {
      confidence += 0.1
    }

    return Math.min(confidence, 1.0)
  }

  /**
   * Get all synonyms for reference
   */
  static getAllSynonyms(): ColumnSynonym[] {
    return [...this.SYNONYM_LIBRARY]
  }
}