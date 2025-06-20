"use client"

import { useState, useCallback } from 'react'
import { StyleConfig } from '@/stores/ui-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface StyleSectionProps {
  chartType: string
  styleConfig: StyleConfig
  onChange: (style: StyleConfig) => void
}

// Color Palette Selector
function ColorPaletteSelector({ 
  selectedColors, 
  onChange 
}: { 
  selectedColors?: string[]
  onChange: (colors: string[]) => void 
}) {
  const predefinedPalettes = [
    {
      name: 'Default',
      colors: ['#2563eb', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#ca8a04']
    },
    {
      name: 'Professional',
      colors: ['#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb']
    },
    {
      name: 'Ocean',
      colors: ['#0891b2', '#0284c7', '#2563eb', '#4f46e5', '#7c3aed', '#9333ea']
    },
    {
      name: 'Sunset',
      colors: ['#fbbf24', '#f59e0b', '#d97706', '#ea580c', '#dc2626', '#b91c1c']
    },
    {
      name: 'Nature',
      colors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']
    },
    {
      name: 'Gradient',
      colors: ['#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff', '#f3e8ff']
    }
  ]

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Color Palette</h4>
      
      {/* Current Selection */}
      {selectedColors && selectedColors.length > 0 && (
        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
          <span className="text-xs text-gray-600">Current:</span>
          <div className="flex space-x-1">
            {selectedColors.slice(0, 6).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Predefined Palettes */}
      <div className="grid gap-2">
        {predefinedPalettes.map((palette) => (
          <button
            key={palette.name}
            onClick={() => onChange(palette.colors)}
            className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium">{palette.name}</span>
            <div className="flex space-x-1">
              {palette.colors.slice(0, 6).map((color, index) => (
                <div
                  key={index}
                  className="w-3 h-3 rounded border border-gray-300"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Legend Configuration
function LegendConfiguration({ 
  showLegend, 
  legendPosition, 
  onChange 
}: { 
  showLegend?: boolean
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  onChange: (config: { showLegend?: boolean; legendPosition?: 'top' | 'bottom' | 'left' | 'right' }) => void 
}) {
  const positions = [
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' }
  ]

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Legend</h4>
      
      {/* Show/Hide Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Show Legend</span>
        <button
          onClick={() => onChange({ showLegend: !showLegend })}
          className={`
            relative inline-flex h-5 w-9 items-center rounded-full transition-colors
            ${showLegend ? 'bg-blue-500' : 'bg-gray-200'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${showLegend ? 'translate-x-5' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* Position Selection */}
      {showLegend && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
          <div className="grid grid-cols-2 gap-2">
            {positions.map((position) => (
              <button
                key={position.value}
                onClick={() => onChange({ legendPosition: position.value as any })}
                className={`
                  px-3 py-1.5 text-xs rounded border transition-colors
                  ${legendPosition === position.value
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {position.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Axis Configuration
function AxisConfiguration({ 
  chartType,
  axisLabels, 
  onChange 
}: { 
  chartType: string
  axisLabels?: { x?: string; y?: string }
  onChange: (axisLabels: { x?: string; y?: string }) => void 
}) {
  const hasXAxis = !['pie_chart', 'donut_chart', 'metric_card', 'gauge_chart'].includes(chartType)
  const hasYAxis = !['pie_chart', 'donut_chart', 'metric_card', 'gauge_chart'].includes(chartType)

  if (!hasXAxis && !hasYAxis) return null

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Axis Labels</h4>
      
      <div className="space-y-2">
        {hasXAxis && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">X-Axis Label</label>
            <input
              type="text"
              value={axisLabels?.x || ''}
              onChange={(e) => onChange({ ...axisLabels, x: e.target.value })}
              placeholder="X-axis label"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}
        
        {hasYAxis && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Y-Axis Label</label>
            <input
              type="text"
              value={axisLabels?.y || ''}
              onChange={(e) => onChange({ ...axisLabels, y: e.target.value })}
              placeholder="Y-axis label"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Grid Configuration
function GridConfiguration({ 
  chartType,
  showGrid, 
  onChange 
}: { 
  chartType: string
  showGrid?: boolean
  onChange: (showGrid: boolean) => void 
}) {
  const supportsGrid = !['pie_chart', 'donut_chart', 'metric_card', 'gauge_chart'].includes(chartType)

  if (!supportsGrid) return null

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Grid Lines</h4>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Show Grid Lines</span>
        <button
          onClick={() => onChange(!showGrid)}
          className={`
            relative inline-flex h-5 w-9 items-center rounded-full transition-colors
            ${showGrid ? 'bg-blue-500' : 'bg-gray-200'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${showGrid ? 'translate-x-5' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    </div>
  )
}

// Chart-Specific Settings
function ChartSpecificSettings({ 
  chartType, 
  styleConfig, 
  onChange 
}: { 
  chartType: string
  styleConfig: StyleConfig
  onChange: (updates: Partial<StyleConfig>) => void 
}) {
  switch (chartType) {
    case 'pie_chart':
    case 'donut_chart':
      return (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Pie Chart Options</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Show Values</span>
              <button
                onClick={() => onChange({ showValues: !styleConfig.showValues })}
                className={`
                  relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                  ${styleConfig.showValues ? 'bg-blue-500' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${styleConfig.showValues ? 'translate-x-5' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        </div>
      )

    case 'table':
      return (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Table Options</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Show Row Numbers</span>
              <button
                onClick={() => onChange({ showRowNumbers: !styleConfig.showRowNumbers })}
                className={`
                  relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                  ${styleConfig.showRowNumbers ? 'bg-blue-500' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${styleConfig.showRowNumbers ? 'translate-x-5' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Alternating Row Colors</span>
              <button
                onClick={() => onChange({ alternatingRows: !styleConfig.alternatingRows })}
                className={`
                  relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                  ${styleConfig.alternatingRows ? 'bg-blue-500' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${styleConfig.alternatingRows ? 'translate-x-5' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        </div>
      )

    default:
      return null
  }
}

export function StyleSection({ chartType, styleConfig, onChange }: StyleSectionProps) {
  const getChartTypeName = (type: string) => {
    const names: Record<string, string> = {
      line_chart: 'Line Chart',
      bar_chart: 'Bar Chart',
      pie_chart: 'Pie Chart',
      donut_chart: 'Donut Chart',
      area_chart: 'Area Chart',
      scatter_chart: 'Scatter Plot',
      table: 'Data Table',
      metric_card: 'Metric Card',
      funnel_chart: 'Funnel Chart',
      heatmap: 'Heatmap',
      gauge_chart: 'Gauge Chart'
    }
    return names[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Chart Type Info */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-purple-800 font-medium">
              {getChartTypeName(chartType)} Styling
            </span>
          </div>
          <p className="text-xs text-purple-600 mt-1">
            Customize the visual appearance of your chart
          </p>
        </CardContent>
      </Card>

      {/* Color Palette */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Colors</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ColorPaletteSelector
            selectedColors={styleConfig.colors}
            onChange={(colors) => onChange({ ...styleConfig, colors })}
          />
        </CardContent>
      </Card>

      {/* Legend Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <LegendConfiguration
            showLegend={styleConfig.showLegend}
            legendPosition={styleConfig.legendPosition}
            onChange={(updates) => onChange({ ...styleConfig, ...updates })}
          />
        </CardContent>
      </Card>

      {/* Axis Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Axes</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <AxisConfiguration
              chartType={chartType}
              axisLabels={styleConfig.axisLabels}
              onChange={(axisLabels) => onChange({ ...styleConfig, axisLabels })}
            />
            
            <GridConfiguration
              chartType={chartType}
              showGrid={styleConfig.showGrid}
              onChange={(showGrid) => onChange({ ...styleConfig, showGrid })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chart-Specific Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Chart Options</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ChartSpecificSettings
            chartType={chartType}
            styleConfig={styleConfig}
            onChange={(updates) => onChange({ ...styleConfig, ...updates })}
          />
        </CardContent>
      </Card>

      {/* Reset to Defaults */}
      <div className="pt-4 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={() => onChange({
            colors: [],
            showLegend: true,
            showGrid: true,
            legendPosition: 'bottom',
            axisLabels: {}
          })}
          className="w-full text-sm"
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}