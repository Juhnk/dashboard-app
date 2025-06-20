/**
 * Marketing Data Analyzer - Intelligent detection and classification of marketing metrics
 * Provides the foundation for smart field mapping and metric normalization
 */

export interface MarketingMetric {
  id: string
  name: string
  category: 'impressions' | 'clicks' | 'spend' | 'conversions' | 'revenue' | 'ctr' | 'cpa' | 'roas' | 'other'
  dataType: 'number' | 'percentage' | 'currency' | 'string' | 'date'
  unit?: string
  description: string
}

export interface DetectedField {
  originalName: string
  suggestedMetric: MarketingMetric | null
  confidence: number
  sampleValues: any[]
  dataType: 'number' | 'string' | 'date' | 'boolean'
}

export interface DataColumnMapping {
  dimensions: string[] // Fields suitable for grouping (dates, campaigns, channels)
  metrics: string[]   // Fields suitable for measuring (impressions, clicks, spend)
  identifiers: string[] // Fields for identification (IDs, names)
}

// Common marketing metric patterns
const MARKETING_METRICS: MarketingMetric[] = [
  // Impressions
  {
    id: 'impressions',
    name: 'Impressions',
    category: 'impressions',
    dataType: 'number',
    description: 'Number of times ads were displayed'
  },
  
  // Clicks
  {
    id: 'clicks',
    name: 'Clicks',
    category: 'clicks',
    dataType: 'number',
    description: 'Number of ad clicks'
  },
  
  // Spend/Cost
  {
    id: 'spend',
    name: 'Spend',
    category: 'spend',
    dataType: 'currency',
    unit: 'USD',
    description: 'Amount spent on advertising'
  },
  
  // Conversions
  {
    id: 'conversions',
    name: 'Conversions',
    category: 'conversions',
    dataType: 'number',
    description: 'Number of desired actions completed'
  },
  
  // Revenue
  {
    id: 'revenue',
    name: 'Revenue',
    category: 'revenue',
    dataType: 'currency',
    unit: 'USD',
    description: 'Revenue generated from campaigns'
  },
  
  // Calculated Metrics
  {
    id: 'ctr',
    name: 'Click-Through Rate',
    category: 'ctr',
    dataType: 'percentage',
    unit: '%',
    description: 'Percentage of impressions that resulted in clicks'
  },
  
  {
    id: 'cpa',
    name: 'Cost Per Acquisition',
    category: 'cpa',
    dataType: 'currency',
    unit: 'USD',
    description: 'Average cost per conversion'
  },
  
  {
    id: 'roas',
    name: 'Return on Ad Spend',
    category: 'roas',
    dataType: 'number',
    description: 'Revenue divided by ad spend'
  }
]

// Field name patterns for auto-detection
const FIELD_PATTERNS = {
  impressions: [
    /^impressions?$/i,
    /^imps?$/i,
    /^views?$/i,
    /^ad[_\s]?impressions?$/i,
    /^impression[_\s]?count$/i
  ],
  
  clicks: [
    /^clicks?$/i,
    /^click[_\s]?count$/i,
    /^ad[_\s]?clicks?$/i,
    /^link[_\s]?clicks?$/i
  ],
  
  spend: [
    /^spend$/i,
    /^cost$/i,
    /^amount[_\s]?spent$/i,
    /^ad[_\s]?spend$/i,
    /^budget[_\s]?spent$/i,
    /^total[_\s]?cost$/i,
    /^expense$/i
  ],
  
  conversions: [
    /^conversions?$/i,
    /^converts?$/i,
    /^actions?$/i,
    /^purchases?$/i,
    /^leads?$/i,
    /^sign[_\s]?ups?$/i
  ],
  
  revenue: [
    /^revenue$/i,
    /^sales?$/i,
    /^income$/i,
    /^earnings?$/i,
    /^value$/i,
    /^total[_\s]?revenue$/i
  ],
  
  ctr: [
    /^ctr$/i,
    /^click[_\s]?through[_\s]?rate$/i,
    /^click[_\s]?rate$/i
  ],
  
  cpa: [
    /^cpa$/i,
    /^cost[_\s]?per[_\s]?acquisition$/i,
    /^cost[_\s]?per[_\s]?conversion$/i,
    /^acquisition[_\s]?cost$/i
  ],
  
  roas: [
    /^roas$/i,
    /^return[_\s]?on[_\s]?ad[_\s]?spend$/i,
    /^roi$/i
  ]
}

// Dimension patterns (for grouping data)
const DIMENSION_PATTERNS = [
  /^date$/i,
  /^day$/i,
  /^week$/i,
  /^month$/i,
  /^campaign[_\s]?name$/i,
  /^campaign$/i,
  /^ad[_\s]?group$/i,
  /^channel$/i,
  /^source$/i,
  /^medium$/i,
  /^device$/i,
  /^country$/i,
  /^region$/i,
  /^city$/i,
  /^age[_\s]?group$/i,
  /^gender$/i
]

export class MarketingDataAnalyzer {
  /**
   * Analyze sheet headers and detect marketing metrics
   */
  static analyzeHeaders(headers: string[], sampleData: any[][] = []): DetectedField[] {
    return headers.map((header, index) => {
      const sampleValues = sampleData.slice(0, 5).map(row => row[index]).filter(val => val != null)
      
      return {
        originalName: header,
        suggestedMetric: this.detectMetric(header),
        confidence: this.calculateConfidence(header, sampleValues),
        sampleValues,
        dataType: this.inferDataType(sampleValues)
      }
    })
  }

  /**
   * Classify columns into dimensions, metrics, and identifiers
   */
  static classifyColumns(detectedFields: DetectedField[]): DataColumnMapping {
    const dimensions: string[] = []
    const metrics: string[] = []
    const identifiers: string[] = []

    detectedFields.forEach(field => {
      if (this.isDimension(field.originalName)) {
        dimensions.push(field.originalName)
      } else if (field.suggestedMetric && field.confidence > 0.7) {
        metrics.push(field.originalName)
      } else if (field.dataType === 'number' && !this.isDimension(field.originalName)) {
        metrics.push(field.originalName) // Assume numeric fields are metrics
      } else {
        identifiers.push(field.originalName)
      }
    })

    return { dimensions, metrics, identifiers }
  }

  /**
   * Suggest chart types based on detected data structure
   */
  static suggestChartTypes(classification: DataColumnMapping): Array<{
    type: string
    name: string
    reason: string
    confidence: number
  }> {
    const suggestions = []
    const { dimensions, metrics } = classification

    const hasDate = dimensions.some((dim: string) => /date|day|week|month/i.test(dim))
    const hasCampaign = dimensions.some((dim: string) => /campaign|source|channel/i.test(dim))

    if (hasDate && metrics.length >= 1) {
      suggestions.push({
        type: 'line_chart',
        name: 'Time Series Line Chart',
        reason: 'Perfect for showing trends over time',
        confidence: 0.9
      })
    }

    if (hasCampaign && metrics.length >= 1) {
      suggestions.push({
        type: 'bar_chart',
        name: 'Campaign Comparison Bar Chart',
        reason: 'Great for comparing performance across campaigns',
        confidence: 0.8
      })
    }

    if (metrics.length >= 2) {
      suggestions.push({
        type: 'scatter_chart',
        name: 'Metric Correlation Scatter Plot',
        reason: 'Shows relationships between different metrics',
        confidence: 0.7
      })
    }

    if (metrics.length === 1 && dimensions.length >= 1) {
      suggestions.push({
        type: 'pie_chart',
        name: 'Distribution Pie Chart',
        reason: 'Shows how metric is distributed across categories',
        confidence: 0.6
      })
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Detect which marketing metric a field represents
   */
  private static detectMetric(fieldName: string): MarketingMetric | null {
    for (const [category, patterns] of Object.entries(FIELD_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(fieldName)) {
          return MARKETING_METRICS.find(m => m.category === category) || null
        }
      }
    }
    return null
  }

  /**
   * Calculate confidence score for metric detection
   */
  private static calculateConfidence(fieldName: string, sampleValues: any[]): number {
    let confidence = 0

    // Base confidence from pattern matching
    for (const patterns of Object.values(FIELD_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(fieldName)) {
          confidence = Math.max(confidence, 0.8)
          break
        }
      }
    }

    // Boost confidence based on data characteristics
    if (sampleValues.length > 0) {
      const numericValues = sampleValues.filter(val => !isNaN(parseFloat(val)))
      
      if (numericValues.length / sampleValues.length > 0.8) {
        confidence += 0.1 // Mostly numeric
      }
      
      // Check for currency patterns
      if (sampleValues.some(val => typeof val === 'string' && /^\$?\d+\.?\d*$/.test(val))) {
        confidence += 0.1
      }
    }

    return Math.min(confidence, 1.0)
  }

  /**
   * Infer data type from sample values
   */
  private static inferDataType(sampleValues: any[]): 'number' | 'string' | 'date' | 'boolean' {
    if (sampleValues.length === 0) return 'string'

    // Check for dates
    const dateCount = sampleValues.filter(val => {
      return !isNaN(Date.parse(val))
    }).length

    if (dateCount / sampleValues.length > 0.5) return 'date'

    // Check for numbers
    const numericCount = sampleValues.filter(val => {
      const num = parseFloat(val)
      return !isNaN(num) && isFinite(num)
    }).length

    if (numericCount / sampleValues.length > 0.7) return 'number'

    // Check for booleans
    const booleanCount = sampleValues.filter(val => {
      return val === true || val === false || 
             val === 'true' || val === 'false' ||
             val === 'yes' || val === 'no'
    }).length

    if (booleanCount / sampleValues.length > 0.8) return 'boolean'

    return 'string'
  }

  /**
   * Check if a field is likely a dimension (for grouping)
   */
  private static isDimension(fieldName: string): boolean {
    return DIMENSION_PATTERNS.some(pattern => pattern.test(fieldName))
  }
}

/**
 * Marketing metric calculation utilities
 */
export class MetricCalculator {
  /**
   * Calculate CTR (Click-Through Rate)
   */
  static calculateCTR(clicks: number, impressions: number): number {
    if (impressions === 0) return 0
    return (clicks / impressions) * 100
  }

  /**
   * Calculate CPA (Cost Per Acquisition)
   */
  static calculateCPA(spend: number, conversions: number): number {
    if (conversions === 0) return 0
    return spend / conversions
  }

  /**
   * Calculate ROAS (Return on Ad Spend)
   */
  static calculateROAS(revenue: number, spend: number): number {
    if (spend === 0) return 0
    return revenue / spend
  }

  /**
   * Calculate CPM (Cost Per Mille)
   */
  static calculateCPM(spend: number, impressions: number): number {
    if (impressions === 0) return 0
    return (spend / impressions) * 1000
  }

  /**
   * Calculate CPC (Cost Per Click)
   */
  static calculateCPC(spend: number, clicks: number): number {
    if (clicks === 0) return 0
    return spend / clicks
  }
}