import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/widgets/[id] - Get a specific widget
async function getWidget(req: AuthenticatedRequest, { params }: RouteParams) {
  try {
    const { id } = params

    const widget = await prisma.widget.findFirst({
      where: {
        id,
        tab: {
          dashboard: {
            organization_id: req.user!.organizationId
          }
        }
      },
      include: {
        data_source: true,
        tab: {
          include: {
            dashboard: true
          }
        }
      }
    })

    if (!widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ widget })
  } catch (error) {
    console.error('Error fetching widget:', error)
    return NextResponse.json(
      { error: 'Failed to fetch widget' },
      { status: 500 }
    )
  }
}

// PUT /api/widgets/[id] - Update a widget
async function updateWidget(req: AuthenticatedRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const body = await req.json()
    const { 
      name, 
      widget_type, 
      position_x, 
      position_y, 
      width, 
      height, 
      config, 
      data_source_id, 
      query_config 
    } = body

    // Verify widget exists and belongs to user's organization
    const existingWidget = await prisma.widget.findFirst({
      where: {
        id,
        tab: {
          dashboard: {
            organization_id: req.user!.organizationId
          }
        }
      }
    })

    if (!existingWidget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      )
    }

    // Validate widget_type if provided
    if (widget_type) {
      const validWidgetTypes = [
        'line_chart',
        'bar_chart', 
        'pie_chart',
        'donut_chart',
        'area_chart',
        'scatter_chart',
        'table',
        'metric_card',
        'funnel_chart',
        'heatmap',
        'gauge_chart'
      ]

      if (!validWidgetTypes.includes(widget_type)) {
        return NextResponse.json(
          { error: 'Invalid widget type' },
          { status: 400 }
        )
      }
    }

    // If data_source_id provided, verify it exists and belongs to organization
    if (data_source_id) {
      const dataSource = await prisma.dataSource.findFirst({
        where: {
          id: data_source_id,
          organization_id: req.user!.organizationId
        }
      })

      if (!dataSource) {
        return NextResponse.json(
          { error: 'Data source not found' },
          { status: 404 }
        )
      }
    }

    // Update the widget
    const updatedWidget = await prisma.widget.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(widget_type !== undefined && { widget_type }),
        ...(position_x !== undefined && { position_x }),
        ...(position_y !== undefined && { position_y }),
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height }),
        ...(config !== undefined && { config }),
        ...(data_source_id !== undefined && { data_source_id }),
        ...(query_config !== undefined && { query_config }),
        updated_at: new Date()
      },
      include: {
        data_source: true
      }
    })

    return NextResponse.json({ widget: updatedWidget })
  } catch (error) {
    console.error('Error updating widget:', error)
    return NextResponse.json(
      { error: 'Failed to update widget' },
      { status: 500 }
    )
  }
}

// DELETE /api/widgets/[id] - Delete a widget
async function deleteWidget(req: AuthenticatedRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Verify widget exists and belongs to user's organization
    const existingWidget = await prisma.widget.findFirst({
      where: {
        id,
        tab: {
          dashboard: {
            organization_id: req.user!.organizationId
          }
        }
      }
    })

    if (!existingWidget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      )
    }

    // Delete the widget
    await prisma.widget.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting widget:', error)
    return NextResponse.json(
      { error: 'Failed to delete widget' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getWidget)
export const PUT = withAuth(updateWidget)
export const DELETE = withAuth(deleteWidget)