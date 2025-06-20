import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { GoogleSheetsService } from '@/lib/google-sheets'

async function getGoogleSheetsData(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const spreadsheetId = searchParams.get('spreadsheetId')
    const sheetName = searchParams.get('sheetName') || 'Sheet1'
    const range = searchParams.get('range') || undefined

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'Spreadsheet ID is required' },
        { status: 400 }
      )
    }

    const { data, schema } = await GoogleSheetsService.getSheetDataWithSchema(
      spreadsheetId,
      sheetName,
      range
    )

    return NextResponse.json({
      data,
      schema,
      metadata: {
        spreadsheetId,
        sheetName,
        range,
        rowCount: data.length,
        columnCount: Object.keys(schema).length
      }
    })
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data from Google Sheets' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getGoogleSheetsData)