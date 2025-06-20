/**
 * High-quality demo dataset for Mustache Cashstache marketing dashboard
 * Represents realistic marketing campaign performance over 90 days
 */

export interface DemoDataPoint {
  date: string
  channel: string
  campaign: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  revenue: number
  ctr: number
}

// Helper function to generate date range
function generateDateRange(days: number): string[] {
  const dates: string[] = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }
  
  return dates
}

// Marketing channels and campaigns
const CHANNELS = [
  'Google Ads',
  'Facebook Ads', 
  'Instagram Ads',
  'LinkedIn Ads',
  'Organic Search',
  'Direct',
  'Email Marketing',
  'Display Network'
]

const CAMPAIGNS = [
  'Q4 Brand Awareness',
  'Summer Sale Promo',
  'Lead Gen Campaign',
  'Product Launch 2024',
  'Holiday Special',
  'Back to School',
  'Black Friday Deals',
  'New Year Kickoff',
  'Spring Collection',
  'Customer Retention'
]

// Helper function to generate realistic metrics
function generateRealisticMetrics(channel: string, baseImpressions: number) {
  // Different channels have different performance characteristics
  const channelMultipliers = {
    'Google Ads': { ctr: 3.2, cost: 1.8, conv: 2.5 },
    'Facebook Ads': { ctr: 1.8, cost: 1.2, conv: 1.8 },
    'Instagram Ads': { ctr: 1.5, cost: 1.1, conv: 1.4 },
    'LinkedIn Ads': { ctr: 0.8, cost: 3.5, conv: 3.2 },
    'Organic Search': { ctr: 2.8, cost: 0.1, conv: 2.8 },
    'Direct': { ctr: 8.5, cost: 0.05, conv: 4.2 },
    'Email Marketing': { ctr: 2.1, cost: 0.2, conv: 3.5 },
    'Display Network': { ctr: 0.6, cost: 0.8, conv: 0.9 }
  }

  const multiplier = channelMultipliers[channel as keyof typeof channelMultipliers] || 
                   { ctr: 2.0, cost: 1.0, conv: 2.0 }

  // Calculate metrics with realistic relationships
  const impressions = Math.round(baseImpressions * (0.7 + Math.random() * 0.6))
  const ctr = (multiplier.ctr + Math.random() * 1.5) / 100
  const clicks = Math.round(impressions * ctr)
  const costPerClick = multiplier.cost * (0.5 + Math.random() * 1.0)
  const cost = Math.round(clicks * costPerClick * 100) / 100
  const conversionRate = (multiplier.conv + Math.random() * 2.0) / 100
  const conversions = Math.round(clicks * conversionRate)
  const revenuePerConversion = 45 + Math.random() * 155 // $45-200 per conversion
  const revenue = Math.round(conversions * revenuePerConversion * 100) / 100

  return {
    impressions,
    clicks,
    cost,
    conversions,
    revenue,
    ctr: Math.round(ctr * 10000) / 100 // Convert to percentage with 2 decimals
  }
}

// Generate the demo dataset
function generateDemoData(): DemoDataPoint[] {
  const data: DemoDataPoint[] = []
  const dates = generateDateRange(90)
  
  // Create multiple campaigns across different dates and channels
  dates.forEach((date, dayIndex) => {
    // Simulate weekend/weekday patterns
    const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6
    const dayMultiplier = isWeekend ? 0.6 : 1.0
    
    // Simulate seasonal trends (higher activity towards end of period)
    const seasonalMultiplier = 0.7 + (dayIndex / dates.length) * 0.6
    
    // Generate 3-8 data points per day across different channels/campaigns
    const dailyEntries = 3 + Math.floor(Math.random() * 6)
    
    for (let i = 0; i < dailyEntries; i++) {
      const channel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)]
      const campaign = CAMPAIGNS[Math.floor(Math.random() * CAMPAIGNS.length)]
      
      // Base impressions vary by channel and day patterns
      const baseImpressions = Math.floor(
        (1000 + Math.random() * 8000) * dayMultiplier * seasonalMultiplier
      )
      
      const metrics = generateRealisticMetrics(channel, baseImpressions)
      
      data.push({
        date,
        channel,
        campaign,
        ...metrics
      })
    }
  })
  
  return data.sort((a, b) => a.date.localeCompare(b.date))
}

// Export the demo dataset
export const DEMO_DATA: DemoDataPoint[] = generateDemoData()

// Export aggregated data for different chart types
export const DEMO_DATA_AGGREGATED = {
  // Daily totals for time series
  dailyTotals: DEMO_DATA.reduce((acc, row) => {
    const existing = acc.find(item => item.date === row.date)
    if (existing) {
      existing.impressions += row.impressions
      existing.clicks += row.clicks
      existing.cost += row.cost
      existing.conversions += row.conversions
      existing.revenue += row.revenue
    } else {
      acc.push({
        date: row.date,
        impressions: row.impressions,
        clicks: row.clicks,
        cost: Math.round(row.cost * 100) / 100,
        conversions: row.conversions,
        revenue: Math.round(row.revenue * 100) / 100
      })
    }
    return acc
  }, [] as any[]),

  // Channel totals for comparison charts
  channelTotals: DEMO_DATA.reduce((acc, row) => {
    const existing = acc.find(item => item.channel === row.channel)
    if (existing) {
      existing.impressions += row.impressions
      existing.clicks += row.clicks
      existing.cost += row.cost
      existing.conversions += row.conversions
      existing.revenue += row.revenue
    } else {
      acc.push({
        channel: row.channel,
        impressions: row.impressions,
        clicks: row.clicks,
        cost: Math.round(row.cost * 100) / 100,
        conversions: row.conversions,
        revenue: Math.round(row.revenue * 100) / 100
      })
    }
    return acc
  }, [] as any[]),

  // Campaign totals for pie charts
  campaignTotals: DEMO_DATA.reduce((acc, row) => {
    const existing = acc.find(item => item.campaign === row.campaign)
    if (existing) {
      existing.impressions += row.impressions
      existing.clicks += row.clicks
      existing.cost += row.cost
      existing.conversions += row.conversions
      existing.revenue += row.revenue
    } else {
      acc.push({
        campaign: row.campaign,
        impressions: row.impressions,
        clicks: row.clicks,
        cost: Math.round(row.cost * 100) / 100,
        conversions: row.conversions,
        revenue: Math.round(row.revenue * 100) / 100
      })
    }
    return acc
  }, [] as any[]),

  // Summary metrics for metric cards
  summary: {
    totalImpressions: DEMO_DATA.reduce((sum, row) => sum + row.impressions, 0),
    totalClicks: DEMO_DATA.reduce((sum, row) => sum + row.clicks, 0),
    totalCost: Math.round(DEMO_DATA.reduce((sum, row) => sum + row.cost, 0) * 100) / 100,
    totalConversions: DEMO_DATA.reduce((sum, row) => sum + row.conversions, 0),
    totalRevenue: Math.round(DEMO_DATA.reduce((sum, row) => sum + row.revenue, 0) * 100) / 100,
    averageCTR: Math.round(DEMO_DATA.reduce((sum, row) => sum + row.ctr, 0) / DEMO_DATA.length * 100) / 100,
    get totalROAS() {
      return this.totalCost > 0 ? Math.round((this.totalRevenue / this.totalCost) * 100) / 100 : 0
    },
    get averageCPA() {
      return this.totalConversions > 0 ? Math.round((this.totalCost / this.totalConversions) * 100) / 100 : 0
    }
  }
}

// Export chart-specific data configurations
export const DEMO_CHART_CONFIGS = {
  line_chart: {
    data: DEMO_DATA_AGGREGATED.dailyTotals,
    dimension: 'date',
    metrics: ['impressions', 'clicks'],
    title: 'Daily Performance Trends'
  },
  
  bar_chart: {
    data: DEMO_DATA_AGGREGATED.channelTotals,
    dimension: 'channel', 
    metrics: ['cost', 'revenue'],
    title: 'Channel Performance Comparison'
  },
  
  pie_chart: {
    data: DEMO_DATA_AGGREGATED.campaignTotals.slice(0, 8), // Top 8 campaigns
    dimension: 'campaign',
    metrics: ['conversions'],
    title: 'Conversions by Campaign'
  },
  
  donut_chart: {
    data: DEMO_DATA_AGGREGATED.channelTotals,
    dimension: 'channel',
    metrics: ['revenue'],
    title: 'Revenue Distribution by Channel'
  },
  
  area_chart: {
    data: DEMO_DATA_AGGREGATED.dailyTotals,
    dimension: 'date',
    metrics: ['cost', 'revenue'],
    title: 'Cost vs Revenue Over Time'
  },
  
  table: {
    data: DEMO_DATA.slice(0, 20), // Show last 20 entries
    title: 'Recent Campaign Performance'
  },
  
  metric_card: {
    data: [DEMO_DATA_AGGREGATED.summary],
    metrics: ['totalRevenue'],
    title: 'Total Revenue'
  }
}

// Generated ${DEMO_DATA.length} demo data points spanning 90 days
// Total Revenue: $${DEMO_DATA_AGGREGATED.summary.totalRevenue.toLocaleString()}
// Total ROAS: ${DEMO_DATA_AGGREGATED.summary.totalROAS}x