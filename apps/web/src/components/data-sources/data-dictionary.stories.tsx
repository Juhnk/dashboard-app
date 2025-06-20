import type { Meta, StoryObj } from '@storybook/react'
import { DataDictionary } from './data-dictionary'

const meta = {
  title: 'Data Sources/DataDictionary',
  component: DataDictionary,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Interactive data dictionary for exploring data sources, managing column classifications, and creating intelligent merge rules. This component provides transparency into the semantic merge engine and allows users to customize how data from different sources is understood and combined.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: { type: 'boolean' },
      description: 'Whether the data dictionary modal is open',
    },
    onClose: {
      action: 'closed',
      description: 'Called when the modal is closed',
    },
  },
} satisfies Meta<typeof DataDictionary>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Data dictionary closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'The data dictionary in its default state, showing all available data sources and their schemas with intelligent merge suggestions.',
      },
    },
  },
}

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => console.log('Data dictionary closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'The data dictionary in its closed state. Users access this through the "📚 Data Dictionary" button in the dashboard header.',
      },
    },
  },
}

// Story demonstrating the features and workflow
export const FeatureShowcase: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log('Close'),
  },
  render: () => (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Data Dictionary - System Intelligence</h2>
        <p className="text-gray-600">
          Explore your data sources, understand column relationships, and manage merge rules with confidence
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">🔍 Data Source Explorer</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Google Ads Campaign Data</span>
                  <span className="text-xs text-gray-500">11 columns • 270 rows</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Facebook Ads Campaign Data</span>
                  <span className="text-xs text-gray-500">13 columns • 270 rows</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">LinkedIn Ads Campaign Data</span>
                  <span className="text-xs text-gray-500">14 columns • 270 rows</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">🧠 Merge Suggestions</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-900">Cost</span>
                  <span className="text-sm text-green-600 font-medium">95% confidence</span>
                </div>
                <p className="text-sm text-blue-800 mb-2">
                  Found 3 columns that represent "Cost" across different sources
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-white text-blue-800 border border-blue-200">
                    Google Ads: cost
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-white text-blue-800 border border-blue-200">
                    Facebook Ads: spend
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-white text-blue-800 border border-blue-200">
                    LinkedIn Ads: total_spend
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-900">Clicks</span>
                  <span className="text-sm text-green-600 font-medium">92% confidence</span>
                </div>
                <p className="text-sm text-blue-800 mb-2">
                  Found 3 columns that represent "Clicks" across different sources
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-white text-blue-800 border border-blue-200">
                    Google Ads: clicks
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-white text-blue-800 border border-blue-200">
                    Facebook Ads: link_clicks
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-white text-blue-800 border border-blue-200">
                    LinkedIn Ads: clicks
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">📊 Column Schema Analysis</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-900">Google Ads Campaign Data</h4>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm">impressions</span>
                    <span className="ml-2 text-sm text-gray-600">Impressions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      number
                    </span>
                    <span className="text-xs text-gray-500">metric</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm">cost</span>
                    <span className="ml-2 text-sm text-gray-600">Cost</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      number
                    </span>
                    <span className="text-xs text-gray-500">metric</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm">campaign_name</span>
                    <span className="ml-2 text-sm text-gray-600">Campaign Name</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      string
                    </span>
                    <span className="text-xs text-gray-500">dimension</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">🔗 Active Merge Rules</h3>
            <div className="space-y-3">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-purple-900">Unified Cost</h5>
                    <p className="text-xs text-purple-700 mt-1">
                      Merges 3 columns using sum aggregation
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    metric
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-white text-purple-800 border border-purple-200">
                    Google Ads: cost
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-white text-purple-800 border border-purple-200">
                    Facebook Ads: spend
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-white text-purple-800 border border-purple-200">
                    LinkedIn Ads: total_spend
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="font-medium mb-3">✨ Key Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">🔍 Complete Transparency</h4>
            <p className="text-gray-700">
              See exactly how your data sources are structured and how columns are being mapped across different platforms.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">🧠 AI-Powered Suggestions</h4>
            <p className="text-gray-700">
              Intelligent merge suggestions with confidence scores help you quickly identify related columns across sources.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">🎛️ Custom Control</h4>
            <p className="text-gray-700">
              Override column classifications and create custom merge rules tailored to your specific business needs.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">⚡ Real-time Updates</h4>
            <p className="text-gray-700">
              Changes to merge rules immediately update all charts and widgets using those data sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive feature showcase demonstrating how the data dictionary provides complete transparency and control over multi-source data integration.',
      },
    },
  },
}