import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { GoogleSheetsService } from '@/lib/google-sheets'

// GET /api/data-sources/[id] - Get a specific data source
async function getDataSource(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const dataSource = await prisma.dataSource.findFirst({
      where: {
        id: params.id,
        organization_id: req.user!.organizationId
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

    if (!dataSource) {
      return NextResponse.json(
        { error: 'Data source not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ dataSource })
  } catch (error) {
    console.error('Error fetching data source:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data source' },
      { status: 500 }
    )
  }
}

// PUT /api/data-sources/[id] - Update a data source
async function updateDataSource(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { name, connection_config, schema_config } = body

    const existingDataSource = await prisma.dataSource.findFirst({
      where: {
        id: params.id,
        organization_id: req.user!.organizationId
      }
    })

    if (!existingDataSource) {
      return NextResponse.json(
        { error: 'Data source not found' },
        { status: 404 }
      )
    }

    // For Google Sheets, validate connection if config changed
    if (existingDataSource.source_type === 'google_sheets' && connection_config) {
      try {
        const { spreadsheetId, sheetName = 'Sheet1' } = connection_config
        
        if (spreadsheetId) {
          const isConnected = await GoogleSheetsService.testConnection(spreadsheetId)
          if (!isConnected) {
            return NextResponse.json(
              { error: 'Failed to connect to Google Sheets' },
              { status: 400 }
            )
          }

          // Update schema if connection config changed
          if (!schema_config) {
            const { schema } = await GoogleSheetsService.getSheetDataWithSchema(
              spreadsheetId,
              sheetName
            )
            body.schema_config = schema
          }
        }
      } catch (error) {
        console.error('Google Sheets validation error:', error)
        return NextResponse.json(
          { error: 'Failed to validate Google Sheets connection' },
          { status: 400 }
        )
      }
    }

    const updatedDataSource = await prisma.dataSource.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(connection_config && { connection_config }),
        ...(body.schema_config && { schema_config: body.schema_config }),
        updated_at: new Date()
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

    return NextResponse.json({ dataSource: updatedDataSource })
  } catch (error) {
    console.error('Error updating data source:', error)
    return NextResponse.json(
      { error: 'Failed to update data source' },
      { status: 500 }
    )
  }
}

// DELETE /api/data-sources/[id] - Delete a data source
async function deleteDataSource(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const existingDataSource = await prisma.dataSource.findFirst({
      where: {
        id: params.id,
        organization_id: req.user!.organizationId
      }
    })

    if (!existingDataSource) {
      return NextResponse.json(
        { error: 'Data source not found' },
        { status: 404 }
      )
    }

    await prisma.dataSource.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting data source:', error)
    return NextResponse.json(
      { error: 'Failed to delete data source' },
      { status: 500 }
    )
  }
}

export const GET = withAuth<{ params: { id: string } }>(getDataSource)
export const PUT = withAuth<{ params: { id: string } }>(updateDataSource)
export const DELETE = withAuth<{ params: { id: string } }>(deleteDataSource)