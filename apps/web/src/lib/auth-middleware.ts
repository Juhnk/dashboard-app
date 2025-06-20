import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from './prisma'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    role: string
    organizationId: string
    organization: string
  }
}

export function withAuth<T = any>(
  handler: (req: AuthenticatedRequest, context: T) => Promise<NextResponse>,
  options: {
    requiredRoles?: string[]
  } = {}
) {
  return async (req: NextRequest, context?: T) => {
    try {
      // Get the token from the request
      const token = await getToken({ 
        req: req as any, 
        secret: process.env.NEXTAUTH_SECRET 
      })

      if (!token || !token.sub) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Get user from database to ensure they still exist and are active
      const user = await prisma.user.findUnique({
        where: { id: token.sub },
        include: { organization: true }
      })

      if (!user || !user.is_active) {
        return NextResponse.json(
          { error: 'User not found or inactive' },
          { status: 401 }
        )
      }

      // Check role requirements
      if (options.requiredRoles && !options.requiredRoles.includes(user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      // Add user info to request
      const authReq = req as AuthenticatedRequest
      authReq.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id,
        organization: user.organization?.name || ''
      }

      return handler(authReq, context as T)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

export function requireRole(roles: string[]) {
  return { requiredRoles: roles }
}