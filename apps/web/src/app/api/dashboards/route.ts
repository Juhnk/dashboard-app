import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

// GET /api/dashboards - Get all dashboards for user's organization
async function getDashboards(req: AuthenticatedRequest) {
  try {
    const dashboards = await prisma.dashboard.findMany({
      where: {
        organization_id: req.user!.organizationId
      },
      include: {
        tabs: {
          include: {
            widgets: true
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
      },
      orderBy: { updated_at: 'desc' }
    })

    return NextResponse.json({ dashboards })
  } catch (error) {
    console.error('Error fetching dashboards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboards' },
      { status: 500 }
    )
  }
}

// POST /api/dashboards - Create a new dashboard
async function createDashboard(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    const { name, description, is_public = false, refresh_interval } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Dashboard name is required' },
        { status: 400 }
      )
    }

    const dashboard = await prisma.dashboard.create({
      data: {
        name,
        description,
        is_public,
        refresh_interval,
        organization_id: req.user!.organizationId,
        created_by: req.user!.id
      },
      include: {
        tabs: {
          include: {
            widgets: true
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

    // Create default tab
    await prisma.dashboardTab.create({
      data: {
        dashboard_id: dashboard.id,
        name: 'Main',
        position: 0
      }
    })

    // Fetch dashboard with tabs
    const dashboardWithTabs = await prisma.dashboard.findUnique({
      where: { id: dashboard.id },
      include: {
        tabs: {
          include: {
            widgets: true
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

    return NextResponse.json({ dashboard: dashboardWithTabs }, { status: 201 })
  } catch (error) {
    console.error('Error creating dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to create dashboard' },
      { status: 500 }
    )
  }
}

export const GET = withAuth(getDashboards)
export const POST = withAuth(createDashboard)