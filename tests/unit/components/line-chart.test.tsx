import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LineChart } from '@/components/charts/line-chart'

// Mock Recharts components
vi.mock('recharts', () => ({
  LineChart: vi.fn(({ children, data }) => (
    <div data-testid="recharts-line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  )),
  Line: vi.fn(() => <div data-testid="recharts-line" />),
  XAxis: vi.fn(() => <div data-testid="recharts-xaxis" />),
  YAxis: vi.fn(() => <div data-testid="recharts-yaxis" />),
  CartesianGrid: vi.fn(() => <div data-testid="recharts-grid" />),
  Tooltip: vi.fn(() => <div data-testid="recharts-tooltip" />),
  Legend: vi.fn(() => <div data-testid="recharts-legend" />),
  ResponsiveContainer: vi.fn(({ children }) => (
    <div data-testid="recharts-responsive-container">{children}</div>
  )),
}))

describe('LineChart', () => {
  const mockData = [
    { date: '2024-01-01', impressions: 1500, clicks: 45 },
    { date: '2024-01-02', impressions: 1800, clicks: 52 },
    { date: '2024-01-03', impressions: 1650, clicks: 48 },
  ]

  const mockConfig = {
    metrics: ['impressions', 'clicks'],
    dimension: 'date',
  }

  it('renders without crashing', () => {
    render(<LineChart data={mockData} config={mockConfig} />)
    
    expect(screen.getByTestId('recharts-responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('recharts-line-chart')).toBeInTheDocument()
  })

  it('displays chart elements when showGrid is true', () => {
    const config = { ...mockConfig, showGrid: true }
    
    render(<LineChart data={mockData} config={config} />)
    
    expect(screen.getByTestId('recharts-grid')).toBeInTheDocument()
  })

  it('displays legend when showLegend is true', () => {
    const config = { ...mockConfig, showLegend: true }
    
    render(<LineChart data={mockData} config={config} />)
    
    expect(screen.getByTestId('recharts-legend')).toBeInTheDocument()
  })

  it('displays tooltip when showTooltip is true', () => {
    const config = { ...mockConfig, showTooltip: true }
    
    render(<LineChart data={mockData} config={config} />)
    
    expect(screen.getByTestId('recharts-tooltip')).toBeInTheDocument()
  })

  it('renders with title when provided', () => {
    const title = 'Test Line Chart'
    
    render(<LineChart data={mockData} config={mockConfig} title={title} />)
    
    expect(screen.getByText(title)).toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    render(<LineChart data={[]} config={mockConfig} />)
    
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('handles invalid configuration gracefully', () => {
    const invalidConfig = { metrics: [], dimension: '' }
    
    render(<LineChart data={mockData} config={invalidConfig} />)
    
    expect(screen.getByText('Invalid chart configuration')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const customClass = 'custom-chart-class'
    
    render(<LineChart data={mockData} config={mockConfig} className={customClass} />)
    
    const container = screen.getByTestId('recharts-responsive-container').parentElement
    expect(container).toHaveClass(customClass)
  })

  it('renders lines for each metric in config', () => {
    render(<LineChart data={mockData} config={mockConfig} />)
    
    // Should have lines for impressions and clicks
    const lines = screen.getAllByTestId('recharts-line')
    expect(lines).toHaveLength(2)
  })

  it('passes data to chart component', () => {
    render(<LineChart data={mockData} config={mockConfig} />)
    
    const chartElement = screen.getByTestId('recharts-line-chart')
    const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '[]')
    expect(chartData).toEqual(mockData)
  })
})