/**
 * Multi-Source Demo Data Architecture
 * Simulates realistic data from different marketing platforms with varying schemas
 * This enables testing of semantic merge engine and multi-source intelligence
 */

export interface DemoDataSource {
  id: string
  name: string
  type: 'google_ads' | 'facebook_ads' | 'linkedin_ads' | 'twitter_ads' | 'tiktok_ads'
  description: string
  schema: DemoColumnSchema[]
  data: Record<string, any>[]
  lastSynced: string
  status: 'active' | 'error' | 'syncing'
}

export interface DemoColumnSchema {
  name: string
  displayName: string
  type: 'string' | 'number' | 'date' | 'boolean'
  classification: 'dimension' | 'metric' | 'identifier'
  description: string
  isNullable: boolean
  sampleValues: any[]
}

// Helper function to generate realistic date range
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

// Generate realistic campaign names
const CAMPAIGN_NAMES = [
  'Q4 Brand Awareness',
  'Summer Sale Promo', 
  'Lead Generation Campaign',
  'Product Launch 2024',
  'Holiday Special Offer',
  'Back to School Drive',
  'Black Friday Deals',
  'New Year Kickoff',
  'Spring Collection Launch',
  'Customer Retention Focus'
]

const AUDIENCES = [
  'Lookalike - High Value Customers',
  'Retargeting - Website Visitors',
  'Interest Targeting - Marketing Professionals',
  'Custom Audience - Email List',
  'Broad Targeting - Demographics',
  'Behavioral - Online Shoppers',
  'Geographic - Major Cities',
  'Device - Mobile Users'
]

// Google Ads Demo Source
function generateGoogleAdsData(): DemoDataSource {
  const dates = generateDateRange(90)
  const data: Record<string, any>[] = []
  
  dates.forEach((date, dayIndex) => {
    // Generate 2-4 campaigns per day
    const dailyEntries = 2 + Math.floor(Math.random() * 3)
    
    for (let i = 0; i < dailyEntries; i++) {
      const campaign = CAMPAIGN_NAMES[Math.floor(Math.random() * CAMPAIGN_NAMES.length)]
      const adGroup = AUDIENCES[Math.floor(Math.random() * AUDIENCES.length)]
      
      // Google Ads has higher CTR and CPC typically
      const impressions = Math.round(5000 + Math.random() * 15000)
      const ctr = (2.5 + Math.random() * 2.0) / 100 // 2.5-4.5% CTR
      const clicks = Math.round(impressions * ctr)
      const cpc = 1.50 + Math.random() * 3.00 // $1.50-$4.50 CPC
      const cost = Math.round(clicks * cpc * 100) / 100
      const conversionRate = (2.0 + Math.random() * 4.0) / 100 // 2-6% conv rate
      const conversions = Math.round(clicks * conversionRate)
      const costPerConversion = conversions > 0 ? Math.round((cost / conversions) * 100) / 100 : 0
      const revenue = Math.round(conversions * (60 + Math.random() * 140) * 100) / 100 // $60-200 per conversion
      
      data.push({
        date,
        campaign_name: campaign,
        ad_group: adGroup,
        impressions,
        clicks,
        cost,
        conversions,
        revenue,
        ctr: Math.round(ctr * 10000) / 100,
        cpc: Math.round(cpc * 100) / 100,
        cost_per_conversion: costPerConversion,
        roas: cost > 0 ? Math.round((revenue / cost) * 100) / 100 : 0
      })
    }
  })
  
  return {
    id: 'google_ads_demo',
    name: 'Google Ads Campaign Data',
    type: 'google_ads',
    description: 'Search and display campaign performance from Google Ads',
    schema: [
      { name: 'date', displayName: 'Date', type: 'date', classification: 'dimension', description: 'Campaign date', isNullable: false, sampleValues: ['2024-01-01', '2024-01-02'] },
      { name: 'campaign_name', displayName: 'Campaign Name', type: 'string', classification: 'dimension', description: 'Name of the advertising campaign', isNullable: false, sampleValues: ['Q4 Brand Awareness', 'Summer Sale Promo'] },
      { name: 'ad_group', displayName: 'Ad Group', type: 'string', classification: 'dimension', description: 'Ad group within campaign', isNullable: false, sampleValues: ['Lookalike - High Value', 'Retargeting - Website'] },
      { name: 'impressions', displayName: 'Impressions', type: 'number', classification: 'metric', description: 'Number of times ads were shown', isNullable: false, sampleValues: [12543, 8921] },
      { name: 'clicks', displayName: 'Clicks', type: 'number', classification: 'metric', description: 'Number of clicks on ads', isNullable: false, sampleValues: [456, 234] },
      { name: 'cost', displayName: 'Cost', type: 'number', classification: 'metric', description: 'Total cost spent on ads', isNullable: false, sampleValues: [1234.56, 789.01] },
      { name: 'conversions', displayName: 'Conversions', type: 'number', classification: 'metric', description: 'Number of conversion events', isNullable: false, sampleValues: [23, 15] },
      { name: 'revenue', displayName: 'Revenue', type: 'number', classification: 'metric', description: 'Revenue generated from conversions', isNullable: false, sampleValues: [2890.45, 1567.89] },
      { name: 'ctr', displayName: 'CTR (%)', type: 'number', classification: 'metric', description: 'Click-through rate percentage', isNullable: false, sampleValues: [3.64, 2.62] },
      { name: 'cpc', displayName: 'CPC', type: 'number', classification: 'metric', description: 'Cost per click', isNullable: false, sampleValues: [2.71, 3.37] },
      { name: 'cost_per_conversion', displayName: 'Cost per Conversion', type: 'number', classification: 'metric', description: 'Average cost per conversion', isNullable: false, sampleValues: [53.68, 52.60] },
      { name: 'roas', displayName: 'ROAS', type: 'number', classification: 'metric', description: 'Return on ad spend', isNullable: false, sampleValues: [2.34, 1.99] }
    ],
    data,
    lastSynced: new Date().toISOString(),
    status: 'active'
  }
}

// Facebook Ads Demo Source (with different column names)
function generateFacebookAdsData(): DemoDataSource {
  const dates = generateDateRange(90)
  const data: Record<string, any>[] = []
  
  dates.forEach((date, dayIndex) => {
    const dailyEntries = 2 + Math.floor(Math.random() * 3)
    
    for (let i = 0; i < dailyEntries; i++) {
      const campaign = CAMPAIGN_NAMES[Math.floor(Math.random() * CAMPAIGN_NAMES.length)]
      const adSet = AUDIENCES[Math.floor(Math.random() * AUDIENCES.length)]
      
      // Facebook typically has lower CTR but different naming
      const imps = Math.round(8000 + Math.random() * 20000)
      const linkCtr = (1.2 + Math.random() * 1.8) / 100 // 1.2-3.0% CTR
      const linkClicks = Math.round(imps * linkCtr)
      const spend = Math.round(linkClicks * (0.80 + Math.random() * 2.20) * 100) / 100 // $0.80-$3.00 CPC
      const conversionRate = (1.5 + Math.random() * 3.5) / 100 // 1.5-5% conv rate
      const conv = Math.round(linkClicks * conversionRate)
      const revenue = Math.round(conv * (50 + Math.random() * 150) * 100) / 100
      
      data.push({
        date,
        campaign_name: campaign,
        ad_set_name: adSet,
        imps, // Different from Google's "impressions"
        link_clicks: linkClicks, // Different from Google's "clicks"  
        spend, // Different from Google's "cost"
        conv, // Different from Google's "conversions"
        revenue,
        link_ctr: Math.round(linkCtr * 10000) / 100,
        cpc: linkClicks > 0 ? Math.round((spend / linkClicks) * 100) / 100 : 0,
        cpa: conv > 0 ? Math.round((spend / conv) * 100) / 100 : 0,
        roas: spend > 0 ? Math.round((revenue / spend) * 100) / 100 : 0,
        frequency: 1.1 + Math.random() * 2.0, // Unique to Facebook
        reach: Math.round(imps / (1.1 + Math.random() * 2.0)) // Unique to Facebook
      })
    }
  })
  
  return {
    id: 'facebook_ads_demo',
    name: 'Facebook Ads Campaign Data',
    type: 'facebook_ads', 
    description: 'Social media campaign performance from Facebook Ads Manager',
    schema: [
      { name: 'date', displayName: 'Date', type: 'date', classification: 'dimension', description: 'Campaign date', isNullable: false, sampleValues: ['2024-01-01', '2024-01-02'] },
      { name: 'campaign_name', displayName: 'Campaign Name', type: 'string', classification: 'dimension', description: 'Name of the Facebook campaign', isNullable: false, sampleValues: ['Q4 Brand Awareness', 'Summer Sale Promo'] },
      { name: 'ad_set_name', displayName: 'Ad Set Name', type: 'string', classification: 'dimension', description: 'Ad set within campaign', isNullable: false, sampleValues: ['Lookalike - High Value', 'Interest - Marketing'] },
      { name: 'imps', displayName: 'Impressions', type: 'number', classification: 'metric', description: 'Number of times ads were shown', isNullable: false, sampleValues: [15432, 12987] },
      { name: 'link_clicks', displayName: 'Link Clicks', type: 'number', classification: 'metric', description: 'Number of clicks on ad links', isNullable: false, sampleValues: [234, 187] },
      { name: 'spend', displayName: 'Amount Spent', type: 'number', classification: 'metric', description: 'Total amount spent on ads', isNullable: false, sampleValues: [567.89, 423.56] },
      { name: 'conv', displayName: 'Conversions', type: 'number', classification: 'metric', description: 'Number of conversion events', isNullable: false, sampleValues: [12, 8] },
      { name: 'revenue', displayName: 'Revenue', type: 'number', classification: 'metric', description: 'Revenue generated from conversions', isNullable: false, sampleValues: [1234.56, 890.12] },
      { name: 'link_ctr', displayName: 'Link CTR (%)', type: 'number', classification: 'metric', description: 'Link click-through rate', isNullable: false, sampleValues: [1.52, 1.44] },
      { name: 'cpc', displayName: 'CPC', type: 'number', classification: 'metric', description: 'Cost per link click', isNullable: false, sampleValues: [2.43, 2.26] },
      { name: 'cpa', displayName: 'CPA', type: 'number', classification: 'metric', description: 'Cost per conversion', isNullable: false, sampleValues: [47.32, 52.95] },
      { name: 'roas', displayName: 'ROAS', type: 'number', classification: 'metric', description: 'Return on ad spend', isNullable: false, sampleValues: [2.18, 2.10] },
      { name: 'frequency', displayName: 'Frequency', type: 'number', classification: 'metric', description: 'Average times each person saw the ad', isNullable: false, sampleValues: [1.8, 2.1] },
      { name: 'reach', displayName: 'Reach', type: 'number', classification: 'metric', description: 'Number of unique people reached', isNullable: false, sampleValues: [8567, 6234] }
    ],
    data,
    lastSynced: new Date().toISOString(),
    status: 'active'
  }
}

// LinkedIn Ads Demo Source (with yet more variations)
function generateLinkedInAdsData(): DemoDataSource {
  const dates = generateDateRange(90)
  const data: Record<string, any>[] = []
  
  dates.forEach((date, dayIndex) => {
    const dailyEntries = 1 + Math.floor(Math.random() * 3) // LinkedIn typically has fewer but higher-value campaigns
    
    for (let i = 0; i < dailyEntries; i++) {
      const campaign = CAMPAIGN_NAMES[Math.floor(Math.random() * CAMPAIGN_NAMES.length)]
      
      // LinkedIn has higher CPCs but better B2B targeting
      const impressions = Math.round(2000 + Math.random() * 8000)
      const ctr = (0.8 + Math.random() * 1.2) / 100 // Lower CTR: 0.8-2.0%
      const clicks = Math.round(impressions * ctr)
      const totalSpend = Math.round(clicks * (3.00 + Math.random() * 6.00) * 100) / 100 // Higher CPC: $3-9
      const conversionRate = (3.0 + Math.random() * 5.0) / 100 // Higher conv rate: 3-8%
      const totalConversions = Math.round(clicks * conversionRate)
      const revenue = Math.round(totalConversions * (150 + Math.random() * 350) * 100) / 100 // Higher value: $150-500
      
      data.push({
        date,
        campaign_name: campaign,
        impressions, // Same as Google
        clicks, // Same as Google
        total_spend: totalSpend, // Different from "cost" or "spend"
        total_conversions: totalConversions, // Different naming
        revenue,
        ctr: Math.round(ctr * 10000) / 100,
        avg_cpc: clicks > 0 ? Math.round((totalSpend / clicks) * 100) / 100 : 0,
        conversion_rate: Math.round(conversionRate * 10000) / 100,
        cost_per_conversion: totalConversions > 0 ? Math.round((totalSpend / totalConversions) * 100) / 100 : 0,
        roas: totalSpend > 0 ? Math.round((revenue / totalSpend) * 100) / 100 : 0,
        video_views: Math.round(impressions * (0.05 + Math.random() * 0.15)), // LinkedIn-specific
        engagement_rate: (0.5 + Math.random() * 2.0) // LinkedIn-specific
      })
    }
  })
  
  return {
    id: 'linkedin_ads_demo', 
    name: 'LinkedIn Ads Campaign Data',
    type: 'linkedin_ads',
    description: 'B2B campaign performance from LinkedIn Campaign Manager',
    schema: [
      { name: 'date', displayName: 'Date', type: 'date', classification: 'dimension', description: 'Campaign date', isNullable: false, sampleValues: ['2024-01-01', '2024-01-02'] },
      { name: 'campaign_name', displayName: 'Campaign Name', type: 'string', classification: 'dimension', description: 'Name of the LinkedIn campaign', isNullable: false, sampleValues: ['Q4 Brand Awareness', 'Lead Generation'] },
      { name: 'impressions', displayName: 'Impressions', type: 'number', classification: 'metric', description: 'Number of times ads were served', isNullable: false, sampleValues: [5432, 4123] },
      { name: 'clicks', displayName: 'Clicks', type: 'number', classification: 'metric', description: 'Number of clicks on ads', isNullable: false, sampleValues: [87, 65] },
      { name: 'total_spend', displayName: 'Total Spend', type: 'number', classification: 'metric', description: 'Total amount spent on advertising', isNullable: false, sampleValues: [456.78, 334.12] },
      { name: 'total_conversions', displayName: 'Total Conversions', type: 'number', classification: 'metric', description: 'Total number of conversions', isNullable: false, sampleValues: [7, 5] },
      { name: 'revenue', displayName: 'Revenue', type: 'number', classification: 'metric', description: 'Revenue generated from conversions', isNullable: false, sampleValues: [2100.00, 1750.00] },
      { name: 'ctr', displayName: 'CTR (%)', type: 'number', classification: 'metric', description: 'Click-through rate percentage', isNullable: false, sampleValues: [1.60, 1.58] },
      { name: 'avg_cpc', displayName: 'Avg CPC', type: 'number', classification: 'metric', description: 'Average cost per click', isNullable: false, sampleValues: [5.25, 5.14] },
      { name: 'conversion_rate', displayName: 'Conversion Rate (%)', type: 'number', classification: 'metric', description: 'Percentage of clicks that converted', isNullable: false, sampleValues: [8.05, 7.69] },
      { name: 'cost_per_conversion', displayName: 'Cost per Conversion', type: 'number', classification: 'metric', description: 'Average cost per conversion', isNullable: false, sampleValues: [65.25, 66.82] },
      { name: 'roas', displayName: 'ROAS', type: 'number', classification: 'metric', description: 'Return on ad spend', isNullable: false, sampleValues: [4.60, 5.24] },
      { name: 'video_views', displayName: 'Video Views', type: 'number', classification: 'metric', description: 'Number of video ad views', isNullable: false, sampleValues: [234, 189] },
      { name: 'engagement_rate', displayName: 'Engagement Rate (%)', type: 'number', classification: 'metric', description: 'Rate of engagement with ads', isNullable: false, sampleValues: [1.2, 1.8] }
    ],
    data,
    lastSynced: new Date().toISOString(),
    status: 'active'
  }
}

// Export all demo sources
export const MULTI_SOURCE_DEMO_DATA: DemoDataSource[] = [
  generateGoogleAdsData(),
  generateFacebookAdsData(), 
  generateLinkedInAdsData()
]

// Export individual sources for direct access
export const GOOGLE_ADS_DEMO = generateGoogleAdsData()
export const FACEBOOK_ADS_DEMO = generateFacebookAdsData()
export const LINKEDIN_ADS_DEMO = generateLinkedInAdsData()

// Utility function to get a source by ID
export function getDemoSourceById(id: string): DemoDataSource | undefined {
  return MULTI_SOURCE_DEMO_DATA.find(source => source.id === id)
}

// Utility function to get all available sources
export function getAllDemoSources(): DemoDataSource[] {
  return MULTI_SOURCE_DEMO_DATA
}