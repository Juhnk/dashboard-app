"use client"

import { ChartProps } from './types'
import { DemoDataService } from '@/lib/demo-data-service'

// Generate demo data using the unified service
const getDemoData = () => {
  const demoConfig = DemoDataService.getDemoDataForChart({
    chartType: 'table',
    limit: 20
  })
  return demoConfig.data
}

export function DataTable({ data, config = {}, title, className }: ChartProps) {
  // Use provided data, or fall back to demo data if none provided
  const tableData = data && data.length > 0 ? data : getDemoData()
  
  // Auto-generate columns from data if not specified
  let autoColumns: Array<{key: string, label: string, type: string}> = []
  if (tableData.length > 0) {
    autoColumns = Object.keys(tableData[0]).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      type: typeof tableData[0][key] === 'number' ? 
        (key.includes('cost') || key.includes('revenue') ? 'currency' : 
         key.includes('ctr') || key.includes('rate') ? 'percentage' : 'number') : 
        key.includes('date') ? 'date' : 'text'
    }))
  }
  
  const {
    columns = autoColumns.length > 0 ? autoColumns : [
      { key: 'product', label: 'Product', type: 'text' },
      { key: 'sales', label: 'Sales', type: 'number' },
      { key: 'revenue', label: 'Revenue', type: 'currency' },
      { key: 'growth', label: 'Growth', type: 'percentage' }
    ],
    showHeader = true,
    striped = true,
    sortable = true
  } = config

  const formatValue = (value: any, type: string) => {
    if (value == null) return '-'

    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(Number(value))
      case 'percentage':
        const num = Number(value)
        return (
          <span className={`${num >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {num >= 0 ? '+' : ''}{num}%
          </span>
        )
      case 'number':
        return Number(value).toLocaleString()
      default:
        return String(value)
    }
  }

  return (
    <div className={`h-full ${className || ''}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      
      <div className="h-full overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {showHeader && (
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {columns.map((column: any) => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {sortable && (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          )}
          
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((row: any, index: number) => (
              <tr 
                key={index}
                className={striped && index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
              >
                {columns.map((column: any) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {formatValue(row[column.key], column.type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {tableData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No data available</div>
          </div>
        )}
      </div>
    </div>
  )
}