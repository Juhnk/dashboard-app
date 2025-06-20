import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { GoogleSheetsService } from '@/lib/google-sheets'

async function testGoogleSheetsConnection(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    const { spreadsheetUrl } = body

    if (!spreadsheetUrl) {
      return NextResponse.json(
        { error: 'Spreadsheet URL is required' },
        { status: 400 }
      )
    }

    const spreadsheetId = GoogleSheetsService.extractSpreadsheetId(spreadsheetUrl)
    const isConnected = await GoogleSheetsService.testConnection(spreadsheetId)

    if (!isConnected) {
      return NextResponse.json(
        { error: 'Failed to connect to Google Sheets. Please sign in with Google and make sure you have access to this sheet.' },
        { status: 400 }
      )
    }

    const metadata = await GoogleSheetsService.getSpreadsheetMetadata(spreadsheetId)

    return NextResponse.json({
      success: true,
      metadata: {
        title: metadata.title,
        sheets: metadata.sheets,
        spreadsheetId
      },
      authMethod: 'authenticated'
    })
  } catch (error: any) {
    console.error('Error testing Google Sheets connection:', error)
    
    // Provide helpful error messages
    if (error.message.includes('Invalid Google Sheets URL')) {
      return NextResponse.json(
        { error: 'Please enter a valid Google Sheets URL' },
        { status: 400 }
      )
    }
    
    if (error.message.includes('No Google access token')) {
      return NextResponse.json(
        { error: 'Please sign in with Google to access your spreadsheets' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to test connection. Please make sure you have access to this sheet and try again.' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(testGoogleSheetsConnection)