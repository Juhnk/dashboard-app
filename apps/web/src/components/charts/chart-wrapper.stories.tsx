import type { Meta, StoryObj } from '@storybook/react'
import { ChartWrapper } from './chart-wrapper'

// Mock data for different chart scenarios
const mockLineData = [
  { date: '2024-01-01', revenue: 1200, conversions: 24 },
  { date: '2024-01-02', revenue: 1350, conversions: 27 },
  { date: '2024-01-03', revenue: 980, conversions: 20 },
  { date: '2024-01-04', revenue: 1500, conversions: 30 },
  { date: '2024-01-05', revenue: 1800, conversions: 36 },
]

const mockBarData = [
  { campaign: 'Q4 Brand Awareness', impressions: 15000, clicks: 450, cost: 890 },
  { campaign: 'Summer Sale Promo', impressions: 12000, clicks: 380, cost: 720 },
  { campaign: 'Lead Generation', impressions: 18000, clicks: 540, cost: 1200 },
  { campaign: 'Product Launch', impressions: 9000, clicks: 290, cost: 580 },
]

const mockPieData = [
  { name: 'Google Ads', value: 45, color: '#4285f4' },
  { name: 'Facebook Ads', value: 30, color: '#1877f2' },
  { name: 'LinkedIn Ads', value: 15, color: '#0077b5' },
  { name: 'Twitter Ads', value: 10, color: '#1da1f2' },
]

const meta = {
  title: 'Charts/ChartWrapper',
  component: ChartWrapper,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Universal chart wrapper that renders different chart types based on configuration. Supports all major chart types with consistent styling and responsive behavior.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['line_chart', 'bar_chart', 'pie_chart', 'donut_chart', 'area_chart', 'scatter_chart', 'metric_card', 'data_table'],
      description: 'Type of chart to render',
    },
    data: {
      control: { type: 'object' },
      description: 'Chart data array',
    },
    config: {
      control: { type: 'object' },
      description: 'Chart configuration options',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof ChartWrapper>

export default meta
type Story = StoryObj<typeof meta>

// Line Chart Stories
export const LineChart: Story = {
  args: {
    type: 'line_chart',
    data: mockLineData,
    config: {
      xAxisKey: 'date',
      lines: [
        { key: 'revenue', name: 'Revenue', color: '#10b981' },
        { key: 'conversions', name: 'Conversions', color: '#3b82f6' },
      ],
      title: 'Revenue & Conversions Over Time',
    },
    className: 'h-80',
  },
}

export const SingleLineChart: Story = {
  args: {
    type: 'line_chart',
    data: mockLineData,
    config: {
      xAxisKey: 'date',
      lines: [{ key: 'revenue', name: 'Revenue ($)', color: '#10b981' }],
      title: 'Daily Revenue Trend',
    },
    className: 'h-80',
  },
}

// Bar Chart Stories
export const BarChart: Story = {
  args: {
    type: 'bar_chart',
    data: mockBarData,
    config: {
      xAxisKey: 'campaign',
      bars: [
        { key: 'impressions', name: 'Impressions', color: '#6366f1' },
        { key: 'clicks', name: 'Clicks', color: '#10b981' },
      ],
      title: 'Campaign Performance',
    },
    className: 'h-80',
  },
}

export const StackedBarChart: Story = {
  args: {
    type: 'bar_chart',
    data: mockBarData,
    config: {
      xAxisKey: 'campaign',
      bars: [
        { key: 'impressions', name: 'Impressions', color: '#6366f1' },
        { key: 'clicks', name: 'Clicks', color: '#10b981' },
        { key: 'cost', name: 'Cost ($)', color: '#f59e0b' },
      ],
      title: 'Comprehensive Campaign Metrics',
      stacked: true,
    },
    className: 'h-80',
  },
}

// Pie Chart Stories
export const PieChart: Story = {
  args: {
    type: 'pie_chart',
    data: mockPieData,
    config: {
      dataKey: 'value',
      nameKey: 'name',
      title: 'Traffic Source Distribution',
    },
    className: 'h-80',
  },
}

export const DonutChart: Story = {
  args: {
    type: 'donut_chart',
    data: mockPieData,
    config: {
      dataKey: 'value',
      nameKey: 'name',
      title: 'Ad Spend by Platform',
      centerLabel: 'Total Spend',
      centerValue: '$12,450',
    },
    className: 'h-80',
  },
}

// Metric Card Stories
export const MetricCard: Story = {
  args: {
    type: 'metric_card',
    data: [{ value: 45280, change: 12.5, period: 'vs last month' }],
    config: {
      title: 'Total Revenue',
      value: 45280,
      change: 12.5,
      format: 'currency',
      trend: 'up',
    },
    className: 'h-40',
  },
}

export const MetricCardDown: Story = {
  args: {
    type: 'metric_card',
    data: [{ value: 2.34, change: -0.45, period: 'vs last week' }],
    config: {
      title: 'Cost Per Click',
      value: 2.34,
      change: -0.45,
      format: 'currency',
      trend: 'down',
    },
    className: 'h-40',
  },
}

// Data Table Story
export const DataTable: Story = {
  args: {
    type: 'data_table',
    data: mockBarData,
    config: {
      columns: [
        { key: 'campaign', label: 'Campaign', type: 'text' },
        { key: 'impressions', label: 'Impressions', type: 'number' },
        { key: 'clicks', label: 'Clicks', type: 'number' },
        { key: 'cost', label: 'Cost', type: 'currency' },
      ],
      title: 'Campaign Performance Data',
      pagination: true,
    },
    className: 'h-80',
  },
}

// Multi-Source Demo Data Story
export const MultiSourceChart: Story = {
  args: {
    type: 'line_chart',
    data: [
      { date: '2024-01-01', google_ads_cost: 450, facebook_ads_spend: 320, linkedin_ads_cost: 180 },
      { date: '2024-01-02', google_ads_cost: 520, facebook_ads_spend: 380, linkedin_ads_cost: 210 },
      { date: '2024-01-03', google_ads_cost: 380, facebook_ads_spend: 290, linkedin_ads_cost: 160 },
      { date: '2024-01-04', google_ads_cost: 650, facebook_ads_spend: 420, linkedin_ads_cost: 240 },
      { date: '2024-01-05', google_ads_cost: 720, facebook_ads_spend: 450, linkedin_ads_cost: 280 },
    ],
    config: {
      xAxisKey: 'date',
      lines: [
        { key: 'google_ads_cost', name: 'Google Ads', color: '#4285f4' },
        { key: 'facebook_ads_spend', name: 'Facebook Ads', color: '#1877f2' },
        { key: 'linkedin_ads_cost', name: 'LinkedIn Ads', color: '#0077b5' },
      ],
      title: 'Multi-Source Ad Spend Comparison',
      multiSource: true,
      sources: ['Google Ads', 'Facebook Ads', 'LinkedIn Ads'],
    },
    className: 'h-80',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of a chart displaying merged data from multiple advertising platforms with intelligent column mapping.',
      },
    },
  },
}

// Error States
export const EmptyData: Story = {
  args: {
    type: 'line_chart',
    data: [],
    config: {
      title: 'No Data Available',
      xAxisKey: 'date',
      lines: [{ key: 'revenue', name: 'Revenue', color: '#10b981' }],
    },
    className: 'h-80',
  },
}

export const LoadingState: Story = {
  args: {
    type: 'line_chart',
    data: undefined,
    config: {
      title: 'Loading Chart Data...',
      loading: true,
    },
    className: 'h-80',
  },
}

// Responsive Showcase
export const ResponsiveCharts: Story = {
  args: {
    type: 'line_chart',
    data: mockLineData,
    config: {
      xAxisKey: 'date',
      lines: [
        { key: 'revenue', name: 'Revenue', color: '#10b981' },
        { key: 'conversions', name: 'Conversions', color: '#3b82f6' },
      ],
      title: 'Performance Trends',
    },
    className: 'h-80',
  },
  render: () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartWrapper
          type="metric_card"
          data={[{ value: 1250 }]}
          config={{ title: 'Total Clicks', value: 1250, format: 'number' }}
          className="h-32"
        />
        <ChartWrapper
          type="metric_card"
          data={[{ value: 3.45 }]}
          config={{ title: 'Avg CPC', value: 3.45, format: 'currency' }}
          className="h-32"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper
          type="pie_chart"
          data={mockPieData}
          config={{
            dataKey: 'value',
            nameKey: 'name',
            title: 'Traffic Sources',
          }}
          className="h-64"
        />
        <ChartWrapper
          type="bar_chart"
          data={mockBarData.slice(0, 3)}
          config={{
            xAxisKey: 'campaign',
            bars: [{ key: 'clicks', name: 'Clicks', color: '#10b981' }],
            title: 'Top Campaigns',
          }}
          className="h-64"
        />
      </div>
      <ChartWrapper
        type="line_chart"
        data={mockLineData}
        config={{
          xAxisKey: 'date',
          lines: [
            { key: 'revenue', name: 'Revenue', color: '#10b981' },
            { key: 'conversions', name: 'Conversions', color: '#3b82f6' },
          ],
          title: 'Performance Trends',
        }}
        className="h-80"
      />
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
    },
    docs: {
      description: {
        story: 'Responsive layout showcase demonstrating how charts adapt to different screen sizes.',
      },
    },
  },
}