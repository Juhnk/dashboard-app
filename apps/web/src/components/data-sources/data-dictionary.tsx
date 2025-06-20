"use client"

import { useState, useEffect } from 'react'
import { useDataSourceStore } from '@/stores/data-source-store'
import { DemoDataSource, DemoColumnSchema } from '@/lib/multi-source-demo-data'
import { MergeSuggestion, SemanticMergeEngine } from '@/lib/semantic-merge-engine'
import { Button } from '@/components/ui/Button'

interface DataDictionaryProps {
  isOpen: boolean
  onClose: () => void
}

interface ColumnOverride {
  sourceId: string
  columnName: string
  newDisplayName?: string
  newClassification?: 'dimension' | 'metric' | 'identifier'
}

export function DataDictionary({ isOpen, onClose }: DataDictionaryProps) {
  const { 
    demoSources, 
    mergeSuggestions,
    mergeRules,
    isAnalyzing,
    refreshMergeSuggestions,
    addMergeRule
  } = useDataSourceStore()

  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [columnOverrides, setColumnOverrides] = useState<ColumnOverride[]>([])
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<MergeSuggestion | null>(null)

  // Load initial data
  useEffect(() => {
    if (isOpen && demoSources.length > 0 && !selectedSource) {
      setSelectedSource(demoSources[0].id)
    }
  }, [isOpen, demoSources, selectedSource])

  const handleColumnOverride = (sourceId: string, columnName: string, field: string, value: any) => {
    setColumnOverrides(prev => {
      const existing = prev.find(o => o.sourceId === sourceId && o.columnName === columnName)
      if (existing) {
        return prev.map(o => 
          o.sourceId === sourceId && o.columnName === columnName 
            ? { ...o, [field]: value }
            : o
        )
      } else {
        return [...prev, { sourceId, columnName, [field]: value } as ColumnOverride]
      }
    })
  }

  const getColumnDisplayName = (sourceId: string, column: DemoColumnSchema): string => {
    const override = columnOverrides.find(o => o.sourceId === sourceId && o.columnName === column.name)
    return override?.newDisplayName || column.displayName
  }

  const getColumnClassification = (sourceId: string, column: DemoColumnSchema): string => {
    const override = columnOverrides.find(o => o.sourceId === sourceId && o.columnName === column.name)
    return override?.newClassification || column.classification
  }

  const handleCreateMerge = (suggestion: MergeSuggestion) => {
    setSelectedSuggestion(suggestion)
    setShowMergeModal(true)
  }

  const handleConfirmMerge = (aggregationType: 'sum' | 'avg' | 'max' | 'min' | 'first') => {
    if (!selectedSuggestion) return

    const mergeRule = SemanticMergeEngine.createMergeRule(
      selectedSuggestion.canonicalName,
      selectedSuggestion.displayName,
      selectedSuggestion.columns.map(col => ({
        sourceId: col.sourceId,
        columnName: col.columnName
      })),
      aggregationType
    )

    addMergeRule(mergeRule)
    setShowMergeModal(false)
    setSelectedSuggestion(null)
  }

  if (!isOpen) return null

  const selectedSourceData = selectedSource ? demoSources.find(s => s.id === selectedSource) : null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Data Dictionary</h2>
              <p className="text-sm text-gray-500 mt-1">
                Explore your data sources, customize column classifications, and manage merge rules
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Sidebar - Sources */}
          <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Data Sources</h3>
              <div className="space-y-1">
                {demoSources.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => setSelectedSource(source.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedSource === source.id
                        ? 'bg-primary-100 text-primary-800 border border-primary-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        source.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <span className="font-medium truncate">{source.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {source.schema.length} columns • {source.data.length} rows
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Merge Suggestions */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Merge Suggestions</h3>
                <button
                  onClick={refreshMergeSuggestions}
                  disabled={isAnalyzing}
                  className="text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Refresh'}
                </button>
              </div>
              
              <div className="space-y-2">
                {mergeSuggestions.slice(0, 5).map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white rounded-md border border-gray-200 text-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{suggestion.displayName}</span>
                      <span className="text-green-600 font-medium">
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{suggestion.reason}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {suggestion.columns.map((col, colIndex) => (
                        <span
                          key={colIndex}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                        >
                          {col.sourceName}: {col.columnName}
                        </span>
                      ))}
                    </div>
                    <Button
                      onClick={() => handleCreateMerge(suggestion)}
                      size="sm"
                      className="w-full"
                    >
                      Create Merge
                    </Button>
                  </div>
                ))}
                
                {mergeSuggestions.length === 0 && !isAnalyzing && (
                  <div className="text-xs text-gray-500 text-center py-4">
                    No merge suggestions found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Column Details */}
          <div className="flex-1 overflow-y-auto">
            {selectedSourceData ? (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedSourceData.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Type: {selectedSourceData.type}</span>
                    <span>•</span>
                    <span>{selectedSourceData.schema.length} columns</span>
                    <span>•</span>
                    <span>{selectedSourceData.data.length} rows</span>
                    <span>•</span>
                    <span>Last synced: {new Date(selectedSourceData.lastSynced).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{selectedSourceData.description}</p>
                </div>

                {/* Column Schema Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900">Column Schema</h4>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Column Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Display Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Classification
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sample Values
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedSourceData.schema.map((column, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">
                              {column.name}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <input
                                type="text"
                                value={getColumnDisplayName(selectedSourceData.id, column)}
                                onChange={(e) => handleColumnOverride(
                                  selectedSourceData.id, 
                                  column.name, 
                                  'newDisplayName', 
                                  e.target.value
                                )}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                column.type === 'number' ? 'bg-blue-100 text-blue-800' :
                                column.type === 'date' ? 'bg-green-100 text-green-800' :
                                column.type === 'boolean' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {column.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <select
                                value={getColumnClassification(selectedSourceData.id, column)}
                                onChange={(e) => handleColumnOverride(
                                  selectedSourceData.id, 
                                  column.name, 
                                  'newClassification', 
                                  e.target.value
                                )}
                                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                              >
                                <option value="dimension">Dimension</option>
                                <option value="metric">Metric</option>
                                <option value="identifier">Identifier</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              <div className="flex flex-wrap gap-1">
                                {column.sampleValues.slice(0, 3).map((value, sampleIndex) => (
                                  <span
                                    key={sampleIndex}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                                  >
                                    {String(value)}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {column.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Active Merge Rules */}
                {mergeRules.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Active Merge Rules</h4>
                    <div className="space-y-3">
                      {mergeRules.map((rule) => (
                        <div key={rule.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-sm font-medium text-blue-900">{rule.displayName}</h5>
                              <p className="text-xs text-blue-700 mt-1">
                                Merges {rule.sourceColumns.length} columns using {rule.aggregationType} aggregation
                              </p>
                            </div>
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {rule.classification}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {rule.sourceColumns.map((col, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-xs bg-white text-blue-800 border border-blue-200"
                              >
                                {demoSources.find(s => s.id === col.sourceId)?.name}: {col.columnName}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6">
                <div className="text-center py-12">
                  <div className="text-gray-500">Select a data source to view its schema</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Merge Confirmation Modal */}
        {showMergeModal && selectedSuggestion && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create Merge Rule: {selectedSuggestion.displayName}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">{selectedSuggestion.reason}</p>
                <div className="space-y-2">
                  {selectedSuggestion.columns.map((col, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="font-medium">{col.sourceName}</span>
                      <span className="text-gray-500">→</span>
                      <span className="font-mono">{col.columnName}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aggregation Method
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  How should values be combined when multiple sources have data for the same dimension?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleConfirmMerge('sum')}
                    variant="secondary"
                    className="justify-start"
                  >
                    Sum
                  </Button>
                  <Button
                    onClick={() => handleConfirmMerge('avg')}
                    variant="secondary"
                    className="justify-start"
                  >
                    Average
                  </Button>
                  <Button
                    onClick={() => handleConfirmMerge('max')}
                    variant="secondary"
                    className="justify-start"
                  >
                    Maximum
                  </Button>
                  <Button
                    onClick={() => handleConfirmMerge('first')}
                    variant="secondary"
                    className="justify-start"
                  >
                    First Value
                  </Button>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowMergeModal(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}