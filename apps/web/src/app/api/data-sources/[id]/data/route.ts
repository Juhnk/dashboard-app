import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { GoogleSheetsService } from '@/lib/google-sheets'

// GET /api/data-sources/[id]/data - Fetch data from a specific data source
async function getDataSourceData(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const refresh = searchParams.get('refresh') === 'true'

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

    // Handle different data source types
    let data: any[] = []
    let schema: Record<string, string> = {}

    switch (dataSource.source_type) {
      case 'google_sheets':
        try {
          const config = dataSource.connection_config as any
          const { spreadsheetId, sheetName = 'Sheet1', range } = config

          const result = await GoogleSheetsService.getSheetDataWithSchema(
            spreadsheetId,
            sheetName,
            range
          )
          
          data = result.data
          schema = result.schema

          // Update sync status to active if successful
          await prisma.dataSource.update({
            where: { id: dataSource.id },
            data: { 
              sync_status: 'active',
              last_synced_at: new Date()
            }
          })
        } catch (error) {
          console.error('Google Sheets fetch error:', error)
          await prisma.dataSource.update({
            where: { id: dataSource.id },
            data: { sync_status: 'error' }
          })
          
          return NextResponse.json(
            { error: 'Failed to fetch data from Google Sheets' },
            { status: 500 }
          )
        }
        break

      case 'csv_upload':
        // TODO: Implement CSV data fetching from stored snapshots
        const latestSnapshot = await prisma.dataSnapshot.findFirst({
          where: { data_source_id: dataSource.id },
          orderBy: { created_at: 'desc' }
        })
        
        if (latestSnapshot) {
          data = latestSnapshot.data as any[]
          schema = dataSource.schema_config as Record<string, string> || {}
        }
        break

      default:
        return NextResponse.json(
          { error: `Data source type '${dataSource.source_type}' not yet implemented` },
          { status: 501 }
        )
    }

    // Store/update snapshot if refresh requested or no recent snapshot exists
    if (refresh || dataSource.source_type === 'google_sheets') {
      try {
        await prisma.dataSnapshot.create({
          data: {
            data_source_id: dataSource.id,
            snapshot_date: new Date(),
            data: data,
            row_count: data.length
          }
        })
      } catch (snapshotError) {
        console.warn('Failed to create snapshot:', snapshotError)
      }
    }

    return NextResponse.json({
      data,
      schema,
      metadata: {
        dataSourceId: dataSource.id,
        sourceType: dataSource.source_type,
        rowCount: data.length,
        columnCount: Object.keys(schema).length,
        lastSynced: dataSource.last_synced_at,
        syncStatus: dataSource.sync_status
      }
    })
  } catch (error) {
    console.error('Error fetching data source data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

export const GET = withAuth<{ params: { id: string } }>(getDataSourceData)