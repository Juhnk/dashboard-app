import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { withAuth, type AuthenticatedRequest } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { ApiError, handleApiError, createApiResponse } from '@/lib/api-utils'

// Input validation schemas
const CreateResourceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

const UpdateResourceSchema = CreateResourceSchema.partial()

const QueryParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

type CreateResourceInput = z.infer<typeof CreateResourceSchema>
type UpdateResourceInput = z.infer<typeof UpdateResourceSchema>
type QueryParams = z.infer<typeof QueryParamsSchema>

/**
 * GET /api/resources
 * Retrieve a paginated list of resources
 */
async function getResources(req: AuthenticatedRequest) {
  try {
    // Parse and validate query parameters
    const url = new URL(req.url!)
    const queryParams = QueryParamsSchema.parse({
      page: url.searchParams.get('page'),
      limit: url.searchParams.get('limit'),
      search: url.searchParams.get('search'),
      sortBy: url.searchParams.get('sortBy'),
      sortOrder: url.searchParams.get('sortOrder'),
    })

    const { page, limit, search, sortBy, sortOrder } = queryParams
    const skip = (page - 1) * limit

    // Build where clause
    const where = {
      organizationId: req.user!.organizationId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    // Execute queries in parallel
    const [resources, totalCount] = await Promise.all([
      prisma.resource.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          // Include related data as needed
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.resource.count({ where }),
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return createApiResponse({
      data: resources,
      meta: {
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
        search: search || null,
        sortBy,
        sortOrder,
      },
    })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch resources')
  }
}

/**
 * POST /api/resources
 * Create a new resource
 */
async function createResource(req: AuthenticatedRequest) {
  try {
    // Parse and validate request body
    const body = await req.json()
    const validatedData = CreateResourceSchema.parse(body)

    // Check permissions
    if (!req.user!.permissions.includes('create:resources')) {
      throw new ApiError('Insufficient permissions', 403)
    }

    // Business logic validation
    const existingResource = await prisma.resource.findFirst({
      where: {
        name: validatedData.name,
        organizationId: req.user!.organizationId,
      },
    })

    if (existingResource) {
      throw new ApiError('Resource with this name already exists', 409)
    }

    // Create the resource
    const resource = await prisma.resource.create({
      data: {
        ...validatedData,
        organizationId: req.user!.organizationId,
        userId: req.user!.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Log the action
    console.log(`Resource created: ${resource.id} by user ${req.user!.id}`)

    return createApiResponse(
      { data: resource },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error, 'Failed to create resource')
  }
}

/**
 * GET /api/resources/[id]
 * Retrieve a specific resource by ID
 */
async function getResourceById(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Validate ID format (if using UUID)
    if (!id || typeof id !== 'string') {
      throw new ApiError('Invalid resource ID', 400)
    }

    const resource = await prisma.resource.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        // Include other related data as needed
      },
    })

    if (!resource) {
      throw new ApiError('Resource not found', 404)
    }

    return createApiResponse({ data: resource })
  } catch (error) {
    return handleApiError(error, 'Failed to fetch resource')
  }
}

/**
 * PUT /api/resources/[id]
 * Update a specific resource
 */
async function updateResource(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Parse and validate request body
    const body = await req.json()
    const validatedData = UpdateResourceSchema.parse(body)

    // Check if resource exists and user has access
    const existingResource = await prisma.resource.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existingResource) {
      throw new ApiError('Resource not found', 404)
    }

    // Check permissions
    if (!req.user!.permissions.includes('update:resources')) {
      throw new ApiError('Insufficient permissions', 403)
    }

    // Business logic validation
    if (validatedData.name && validatedData.name !== existingResource.name) {
      const nameConflict = await prisma.resource.findFirst({
        where: {
          name: validatedData.name,
          organizationId: req.user!.organizationId,
          id: { not: id },
        },
      })

      if (nameConflict) {
        throw new ApiError('Resource with this name already exists', 409)
      }
    }

    // Update the resource
    const updatedResource = await prisma.resource.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Log the action
    console.log(`Resource updated: ${id} by user ${req.user!.id}`)

    return createApiResponse({ data: updatedResource })
  } catch (error) {
    return handleApiError(error, 'Failed to update resource')
  }
}

/**
 * DELETE /api/resources/[id]
 * Delete a specific resource
 */
async function deleteResource(
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if resource exists and user has access
    const existingResource = await prisma.resource.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId,
      },
    })

    if (!existingResource) {
      throw new ApiError('Resource not found', 404)
    }

    // Check permissions
    if (!req.user!.permissions.includes('delete:resources')) {
      throw new ApiError('Insufficient permissions', 403)
    }

    // Soft delete (recommended) or hard delete
    await prisma.resource.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })

    // Alternative: Hard delete
    // await prisma.resource.delete({ where: { id } })

    // Log the action
    console.log(`Resource deleted: ${id} by user ${req.user!.id}`)

    return createApiResponse(
      { message: 'Resource deleted successfully' },
      { status: 204 }
    )
  } catch (error) {
    return handleApiError(error, 'Failed to delete resource')
  }
}

// Export HTTP method handlers with authentication
export const GET = withAuth(getResources)
export const POST = withAuth(createResource)

// For dynamic routes ([id]), export functions that handle the params
export function createDynamicHandlers() {
  return {
    GET: withAuth<{ params: { id: string } }>(getResourceById),
    PUT: withAuth<{ params: { id: string } }>(updateResource),
    DELETE: withAuth<{ params: { id: string } }>(deleteResource),
  }
}

// If this is a dynamic route file, use:
// export const { GET, PUT, DELETE } = createDynamicHandlers()