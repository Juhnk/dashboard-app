import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

// POST /api/widgets - Create a new widget
async function createWidget(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    const { 
      tab_id, 
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

    if (!tab_id || !name || !widget_type) {
      return NextResponse.json(
        { error: 'Tab ID, name, and widget type are required' },
        { status: 400 }
      )
    }

    // Verify tab belongs to user's organization
    const tab = await prisma.dashboardTab.findFirst({
      where: {
        id: tab_id,
        dashboard: {
          organization_id: req.user!.organizationId
        }
      }
    })

    if (!tab) {
      return NextResponse.json(
        { error: 'Tab not found' },
        { status: 404 }
      )
    }

    // Validate widget_type
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

    const widget = await prisma.widget.create({
      data: {
        tab_id,
        name,
        widget_type,
        position_x: position_x || 0,
        position_y: position_y || 0,
        width: width || 4,
        height: height || 3,
        config: config || {},
        data_source_id,
        query_config
      },
      include: {
        data_source: true
      }
    })

    return NextResponse.json({ widget }, { status: 201 })
  } catch (error) {
    console.error('Error creating widget:', error)
    return NextResponse.json(
      { error: 'Failed to create widget' },
      { status: 500 }
    )
  }
}

export const POST = withAuth(createWidget)