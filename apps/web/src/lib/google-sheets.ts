import { google } from 'googleapis'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { MarketingDataAnalyzer, DetectedField, DataColumnMapping } from './marketing-data-analyzer'

export interface SheetsData {
  values: any[][]
  headers: string[]
  sheetName: string
}

export interface SheetsMetadata {
  title: string
  sheets: Array<{
    name: string
    gridProperties: {
      rowCount: number
      columnCount: number
    }
  }>
}

export interface EnhancedSheetsData {
  data: Record<string, any>[]
  schema: Record<string, string>
  detectedFields: DetectedField[]
  columnMapping: DataColumnMapping
  suggestedCharts: Array<{
    type: string
    name: string
    reason: string
    confidence: number
  }>
}

export class GoogleSheetsService {
  private static async getAuthenticatedClient() {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      throw new Error('No Google access token available')
    }

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    auth.setCredentials({
      access_token: session.accessToken
    })

    return google.sheets({ version: 'v4', auth })
  }

  static async getSpreadsheetMetadata(spreadsheetId: string): Promise<SheetsMetadata> {
    const sheets = await this.getAuthenticatedClient()
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'properties.title,sheets(properties(title,gridProperties(rowCount,columnCount)))'
    })

    const spreadsheet = response.data
    
    return {
      title: spreadsheet.properties?.title || 'Untitled',
      sheets: spreadsheet.sheets?.map(sheet => ({
        name: sheet.properties?.title || 'Sheet1',
        gridProperties: {
          rowCount: sheet.properties?.gridProperties?.rowCount || 0,
          columnCount: sheet.properties?.gridProperties?.columnCount || 0
        }
      })) || []
    }
  }

  static async testConnection(spreadsheetId: string): Promise<boolean> {
    try {
      await this.getSpreadsheetMetadata(spreadsheetId)
      return true
    } catch (error: any) {
      console.error('Google Sheets connection test failed:', error)
      return false
    }
  }

  static extractSpreadsheetId(url: string): string {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    if (!match) {
      throw new Error('Invalid Google Sheets URL')
    }
    return match[1]
  }

  static async getSheetData(
    spreadsheetId: string, 
    sheetName: string = 'Sheet1',
    range?: string
  ): Promise<SheetsData> {
    const sheets = await this.getAuthenticatedClient()
    
    const fullRange = range ? `${sheetName}!${range}` : sheetName
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: fullRange,
      valueRenderOption: 'FORMATTED_VALUE'
    })

    const values = response.data.values || []
    const headers = values.length > 0 ? values[0] : []
    const dataRows = values.slice(1)

    return {
      values: dataRows,
      headers,
      sheetName
    }
  }

  static async getSheetDataWithSchema(
    spreadsheetId: string,
    sheetName: string = 'Sheet1',
    range?: string
  ): Promise<{ data: Record<string, any>[], schema: Record<string, string> }> {
    const sheetData = await this.getSheetData(spreadsheetId, sheetName, range)
    
    const data = sheetData.values.map(row => {
      const record: Record<string, any> = {}
      sheetData.headers.forEach((header, index) => {
        record[header] = row[index] || null
      })
      return record
    })

    const schema: Record<string, string> = {}
    sheetData.headers.forEach(header => {
      schema[header] = 'string'
    })

    return { data, schema }
  }

  static async getEnhancedSheetData(
    spreadsheetId: string,
    sheetName: string = 'Sheet1',
    range?: string
  ): Promise<EnhancedSheetsData> {
    const sheetData = await this.getSheetData(spreadsheetId, sheetName, range)
    
    // Analyze headers and detect marketing metrics
    const detectedFields = MarketingDataAnalyzer.analyzeHeaders(
      sheetData.headers,
      sheetData.values.slice(0, 10) // Use first 10 rows for analysis
    )
    
    // Classify columns into dimensions and metrics
    const columnMapping = MarketingDataAnalyzer.classifyColumns(detectedFields)
    
    // Get chart suggestions based on data structure
    const suggestedCharts = MarketingDataAnalyzer.suggestChartTypes(columnMapping)
    
    // Convert to structured data
    const data = sheetData.values.map(row => {
      const record: Record<string, any> = {}
      sheetData.headers.forEach((header, index) => {
        let value = row[index] || null
        
        // Apply smart type conversion based on detected field type
        const detectedField = detectedFields.find(f => f.originalName === header)
        if (detectedField && value !== null) {
          switch (detectedField.dataType) {
            case 'number':
              const num = parseFloat(value)
              value = isNaN(num) ? null : num
              break
            case 'date':
              const date = new Date(value)
              value = isNaN(date.getTime()) ? value : date.toISOString()
              break
            case 'boolean':
              value = value === 'true' || value === 'yes' || value === true
              break
            default:
              value = String(value)
          }
        }
        
        record[header] = value
      })
      return record
    })

    // Create enhanced schema with detected types
    const schema: Record<string, string> = {}
    detectedFields.forEach(field => {
      schema[field.originalName] = field.dataType
    })

    return {
      data,
      schema,
      detectedFields,
      columnMapping,
      suggestedCharts
    }
  }
}