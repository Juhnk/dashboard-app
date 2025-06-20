import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: { id: string }
}

// GET /api/dashboards/[id] - Get a specific dashboard
async function getDashboard(req: AuthenticatedRequest, { params }: RouteParams) {
  try {
    const dashboard = await prisma.dashboard.findFirst({
      where: {
        id: params.id,
        organization_id: req.user!.organizationId
      },
      include: {
        tabs: {
          include: {
            widgets: {
              include: {
                data_source: true
              }
            }
          },
          orderBy: { position: 'asc' }
        },
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    })

    if (!dashboard) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ dashboard })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard' },
      { status: 500 }
    )
  }
}

// PUT /api/dashboards/[id] - Update a dashboard
async function updateDashboard(req: AuthenticatedRequest, { params }: RouteParams) {
  try {
    const body = await req.json()
    const { name, description, is_public, refresh_interval, layout_config } = body

    // Check if dashboard exists and user has access
    const existingDashboard = await prisma.dashboard.findFirst({
      where: {
        id: params.id,
        organization_id: req.user!.organizationId
      }
    })

    if (!existingDashboard) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      )
    }

    // Check permissions - only creators and admins can edit
    if (existingDashboard.created_by !== req.user!.id && req.user!.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const dashboard = await prisma.dashboard.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(is_public !== undefined && { is_public }),
        ...(refresh_interval !== undefined && { refresh_interval }),
        ...(layout_config !== undefined && { layout_config })
      },
      include: {
        tabs: {
          include: {
            widgets: {
              include: {
                data_source: true
              }
            }
          },
          orderBy: { position: 'asc' }
        },
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ dashboard })
  } catch (error) {
    console.error('Error updating dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to update dashboard' },
      { status: 500 }
    )
  }
}

// DELETE /api/dashboards/[id] - Delete a dashboard
async function deleteDashboard(req: AuthenticatedRequest, { params }: RouteParams) {
  try {
    // Check if dashboard exists and user has access
    const existingDashboard = await prisma.dashboard.findFirst({
      where: {
        id: params.id,
        organization_id: req.user!.organizationId
      }
    })

    if (!existingDashboard) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      )
    }

    // Check permissions - only creators and admins can delete
    if (existingDashboard.created_by !== req.user!.id && req.user!.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    await prisma.dashboard.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Dashboard deleted successfully' })
  } catch (error) {
    console.error('Error deleting dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to delete dashboard' },
      { status: 500 }
    )
  }
}

export const GET = withAuth<RouteParams>(getDashboard)
export const PUT = withAuth<RouteParams>(updateDashboard)
export const DELETE = withAuth<RouteParams>(deleteDashboard)