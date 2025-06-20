import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { GoogleSheetsService } from '@/lib/google-sheets'

// GET /api/data-sources/[id]/analyze - Get enhanced analysis of data source
async function analyzeDataSource(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const dataSource = await prisma.dataSource.findFirst({
      where: {
        id: params.id,
        organization_id: req.user!.organizationId
      }
    })

    if (!dataSource) {
      return NextResponse.json(
        { error: 'Data source not found' },
        { status: 404 }
      )
    }

    // Currently only support Google Sheets analysis
    if (dataSource.source_type !== 'google_sheets') {
      return NextResponse.json(
        { error: 'Enhanced analysis only supported for Google Sheets data sources' },
        { status: 400 }
      )
    }

    try {
      const config = dataSource.connection_config as any
      const { spreadsheetId, sheetName = 'Sheet1', range } = config

      // Get enhanced analysis from Google Sheets service
      const enhancedData = await GoogleSheetsService.getEnhancedSheetData(
        spreadsheetId,
        sheetName,
        range
      )

      return NextResponse.json(enhancedData)
    } catch (error: any) {
      console.error('Google Sheets analysis error:', error)
      
      return NextResponse.json(
        { error: 'Failed to analyze Google Sheets data. Please ensure you have access and the sheet contains data.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error analyzing data source:', error)
    return NextResponse.json(
      { error: 'Failed to analyze data source' },
      { status: 500 }
    )
  }
}

export const GET = withAuth<{ params: { id: string } }>(analyzeDataSource)