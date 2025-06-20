import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

// GET /api/data-sources - Get all data sources for user's organization
async function getDataSources(req: AuthenticatedRequest) {
  try {
    const dataSources = await prisma.dataSource.findMany({
      where: {
        organization_id: req.user!.organizationId
      },
      include: {
        _count: {
          select: {
            snapshots: true,
            widgets: true
          }
        }
      },
      orderBy: { updated_at: 'desc' }
    })

    return NextResponse.json({ dataSources })
  } catch (error) {
    console.error('Error fetching data sources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data sources' },
      { status: 500 }
    )
  }
}

// POST /api/data-sources - Create a new data source
async function createDataSource(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    const { name, source_type, connection_config, schema_config } = body

    if (!name || !source_type || !connection_config) {
      return NextResponse.json(
        { error: 'Name, source type, and connection config are required' },
        { status: 400 }
      )
    }

    // Validate source_type
    const validSourceTypes = [
      'google_sheets',
      'csv_upload', 
      'google_ads',
      'facebook_ads',
      'linkedin_ads',
      'tiktok_ads',
      'twitter_ads',
      'api_endpoint'
    ]

    if (!validSourceTypes.includes(source_type)) {
      return NextResponse.json(
        { error: 'Invalid source type' },
        { status: 400 }
      )
    }

    // For Google Sheets, validate connection and fetch initial schema
    if (source_type === 'google_sheets') {
      try {
        const { GoogleSheetsService } = await import('@/lib/google-sheets')
        const { spreadsheetId, sheetName = 'Sheet1' } = connection_config
        
        if (!spreadsheetId) {
          return NextResponse.json(
            { error: 'Spreadsheet ID is required for Google Sheets' },
            { status: 400 }
          )
        }

        const isConnected = await GoogleSheetsService.testConnection(spreadsheetId)
        if (!isConnected) {
          return NextResponse.json(
            { error: 'Failed to connect to Google Sheets' },
            { status: 400 }
          )
        }

        // Get initial schema if not provided
        if (!schema_config) {
          const { schema } = await GoogleSheetsService.getSheetDataWithSchema(
            spreadsheetId,
            sheetName
          )
          body.schema_config = schema
        }
      } catch (error) {
        console.error('Google Sheets validation error:', error)
        return NextResponse.json(
          { error: 'Failed to validate Google Sheets connection' },
          { status: 400 }
        )
      }
    }

    const dataSource = await prisma.dataSource.create({
      data: {
        name,
        source_type,
        connection_config,
        schema_config: body.schema_config || schema_config,
        organization_id: req.user!.organizationId,
        sync_status: source_type === 'google_sheets' ? 'active' : 'pending'
      },
      include: {
        _count: {
          select: {
            snapshots: true,
            widgets: true
          }
        }
      }
    })

    return NextResponse.json({ dataSource }, { status: 201 })
  } catch (error) {
    console.error('Error creating data source:', error)
    return NextResponse.json(
      { error: 'Failed to create data source' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getDataSources)
export const POST = withAuth(createDataSource)