import type { Meta, StoryObj } from '@storybook/react'
import { MultiSourceChartBuilder } from './multi-source-chart-builder'

const meta = {
  title: 'Dashboard/MultiSourceChartBuilder',
  component: MultiSourceChartBuilder,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Advanced chart builder that enables users to create sophisticated visualizations by combining data from multiple sources with intelligent semantic merging. This is the crown jewel of our Dynamic Marketing Intelligence Platform.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: { type: 'boolean' },
      description: 'Whether the modal is open',
    },
    widgetType: {
      control: { type: 'select' },
      options: ['line_chart', 'bar_chart', 'pie_chart', 'donut_chart', 'area_chart'],
      description: 'Type of chart to build',
    },
    onClose: {
      action: 'closed',
      description: 'Called when modal is closed',
    },
    onSave: {
      action: 'saved',
      description: 'Called when chart configuration is saved',
    },
  },
} satisfies Meta<typeof MultiSourceChartBuilder>

export default meta
type Story = StoryObj<typeof meta>

// Primary story showcasing the full functionality
export const Default: Story = {
  args: {
    isOpen: true,
    widgetType: 'line_chart',
    onClose: () => console.log('Modal closed'),
    onSave: (config) => console.log('Chart saved:', config),
  },
  parameters: {
    docs: {
      description: {
        story: 'The multi-source chart builder in its default state, ready for users to select data sources and configure advanced analytics.',
      },
    },
  },
}

export const BarChartBuilder: Story = {
  args: {
    isOpen: true,
    widgetType: 'bar_chart',
    onClose: () => console.log('Modal closed'),
    onSave: (config) => console.log('Bar chart saved:', config),
  },
  parameters: {
    docs: {
      description: {
        story: 'Multi-source chart builder configured for creating bar charts, perfect for comparing metrics across different advertising platforms.',
      },
    },
  },
}

export const PieChartBuilder: Story = {
  args: {
    isOpen: true,
    widgetType: 'pie_chart',
    onClose: () => console.log('Modal closed'),
    onSave: (config) => console.log('Pie chart saved:', config),
  },
  parameters: {
    docs: {
      description: {
        story: 'Multi-source chart builder for pie charts, ideal for showing distribution of metrics across different sources or campaigns.',
      },
    },
  },
}

// Story with pre-configured data to show advanced state
export const WithInitialConfig: Story = {
  args: {
    isOpen: true,
    widgetType: 'line_chart',
    initialConfig: {
      title: 'Cross-Platform Cost Analysis',
      selectedSources: ['google_ads_demo', 'facebook_ads_demo'],
      dimensions: ['date'],
      metrics: ['cost', 'spend'],
      chartType: 'line_chart',
    },
    onClose: () => console.log('Modal closed'),
    onSave: (config) => console.log('Pre-configured chart saved:', config),
  },
  parameters: {
    docs: {
      description: {
        story: 'Multi-source chart builder with pre-selected configuration, demonstrating how the interface appears when editing an existing multi-source widget.',
      },
    },
  },
}

// Closed state for documentation
export const Closed: Story = {
  args: {
    isOpen: false,
    widgetType: 'line_chart',
    onClose: () => console.log('Modal closed'),
    onSave: (config) => console.log('Chart saved:', config),
  },
  parameters: {
    docs: {
      description: {
        story: 'The multi-source chart builder in its closed state. In practice, this would be triggered by clicking the "Multi-Source Builder" button in the widget configuration modal.',
      },
    },
  },
}

// Story showcasing different widget types
export const AllWidgetTypes: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close'),
    onSave: (config) => console.log('Save:', config),
    widgetType: 'bar-chart',
  },
  render: () => (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Multi-Source Chart Builder - Widget Types</h2>
      <p className="text-gray-600 mb-6">
        The multi-source chart builder supports all major chart types for comprehensive data visualization:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { type: 'line_chart', name: 'Line Chart', icon: '📈', description: 'Perfect for time-series data and trend analysis' },
          { type: 'bar_chart', name: 'Bar Chart', icon: '📊', description: 'Ideal for comparing metrics across categories' },
          { type: 'pie_chart', name: 'Pie Chart', icon: '🥧', description: 'Great for showing proportional data' },
          { type: 'donut_chart', name: 'Donut Chart', icon: '🍩', description: 'Similar to pie chart with center space for additional info' },
          { type: 'area_chart', name: 'Area Chart', icon: '📉', description: 'Shows cumulative data over time' },
        ].map((chart) => (
          <div key={chart.type} className="p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{chart.icon}</span>
              <h3 className="font-medium">{chart.name}</h3>
            </div>
            <p className="text-sm text-gray-600">{chart.description}</p>
            <button 
              className="mt-2 text-xs text-blue-600 hover:text-blue-700"
              onClick={() => {
                // In real implementation, this would open the builder
                console.log(`Opening ${chart.type} builder`)
              }}
            >
              Open Builder →
            </button>
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Overview of all chart types supported by the multi-source chart builder, each optimized for different types of data visualization needs.',
      },
    },
  },
}

// Usage examples and workflow
export const WorkflowExample: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close'),
    onSave: (config) => console.log('Save:', config),
    widgetType: 'line-chart',
  },
  render: () => (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Multi-Source Chart Builder Workflow</h2>
        <p className="text-gray-600">
          The intelligent workflow for creating sophisticated cross-platform analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">🗂️</span>
          </div>
          <h3 className="font-medium mb-2">1. Select Sources</h3>
          <p className="text-sm text-gray-600">
            Choose from Google Ads, Facebook Ads, LinkedIn Ads, and other connected data sources
          </p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">🔗</span>
          </div>
          <h3 className="font-medium mb-2">2. Smart Merging</h3>
          <p className="text-sm text-gray-600">
            AI suggests column merges (cost ↔ spend, clicks ↔ link_clicks) with confidence scores
          </p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">📊</span>
          </div>
          <h3 className="font-medium mb-2">3. Configure Chart</h3>
          <p className="text-sm text-gray-600">
            Select dimensions, metrics, and apply filters with real-time preview
          </p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">👁️</span>
          </div>
          <h3 className="font-medium mb-2">4. Live Preview</h3>
          <p className="text-sm text-gray-600">
            See merged data visualization in real-time before saving to dashboard
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="font-medium mb-3">🚀 Advanced Features</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span><strong>Semantic Column Mapping:</strong> Automatically detects that "cost", "spend", and "total_spend" represent the same metric</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span><strong>Intelligent Aggregation:</strong> Supports sum, average, max, min, and first-value aggregation strategies</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span><strong>Runtime Query Engine:</strong> Merges data on-demand without duplication or preprocessing</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span><strong>Visual Regression Testing:</strong> Every UI state is automatically tested for pixel-perfect consistency</span>
          </li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive workflow documentation showing how the multi-source chart builder transforms complex data integration into an intuitive user experience.',
      },
    },
  },
}