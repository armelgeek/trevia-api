import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import { GetRouteByIdUseCase } from '../../application/use-cases/route/get-route-by-id.use-case'
import { GetRouteSchedulesUseCase } from '../../application/use-cases/route/get-route-schedules.use-case'
import { GetRoutesUseCase } from '../../application/use-cases/route/get-routes.use-case'
import type { Routes } from '../../domain/types/route.type'

export class RouteController implements Routes {
  public controller = new OpenAPIHono()

  public initRoutes() {
    const listRoutesQuerySchema = z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      sort: z.string().optional(),
      filter: z.string().optional()
    })

    const routeSchema = z.object({
      id: z.string(),
      departureCity: z.string().nullable(),
      arrivalCity: z.string().nullable(),
      distanceKm: z.string().nullable(),
      duration: z.string().nullable(),
      basePrice: z.string().nullable(),
      routeType: z.string().nullable(),
      status: z.string().nullable()
    })

    const listRoutesResponseSchema = z.object({
      data: z.array(routeSchema),
      page: z.number(),
      limit: z.number(),
      total: z.number()
    })

    const getRoutesRoute = createRoute({
      method: 'get',
      path: '/routes',
      request: {
        query: listRoutesQuerySchema
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: listRoutesResponseSchema
            }
          },
          description: 'Liste des routes disponibles'
        },
        400: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Erreur lors de la récupération des routes'
        }
      }
    })

    this.controller.openapi(getRoutesRoute, async (c: any) => {
      const getRoutesUseCase = new GetRoutesUseCase()
      const result = await getRoutesUseCase.execute(c.req.valid('query'))

      if (!result || !result.success) {
        return c.json({ error: result?.error || 'Erreur inconnue' }, 400)
      }

      return c.json(result, 200)
    })

    const getRouteByIdRoute = createRoute({
      method: 'get',
      path: '/routes/:id',
      request: {
        params: z.object({ id: z.string() })
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: routeSchema
            }
          },
          description: 'Route details'
        },
        404: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Route not found'
        }
      },
      tags: ['Routes'],
      summary: 'Get route details',
      description: 'Returns details for a specific route by ID'
    })

    this.controller.openapi(getRouteByIdRoute, async (c) => {
      const { id } = c.req.valid('param')
      const useCase = new GetRouteByIdUseCase()
      const result = await useCase.execute({ id })

      if (!result.success) {
        return c.json({ error: result.error || 'Route not found' }, 404)
      }

      return c.json(result.data!, 200)
    })

    const scheduleSchema = z.object({
      id: z.string(),
      routeId: z.string(),
      departureTime: z.string().nullable(),
      weekDays: z.string().nullable(),
      period: z.string().nullable(),
      frequency: z.string().nullable()
    })

    const getRouteSchedulesRoute = createRoute({
      method: 'get',
      path: '/routes/:id/schedules',
      request: {
        params: z.object({ id: z.string() }),
        query: z.object({
          date_start: z.string().optional(),
          date_end: z.string().optional()
        })
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: z.object({
                data: z.array(scheduleSchema)
              })
            }
          },
          description: 'Schedules for a route'
        },
        400: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Invalid parameters'
        }
      },
      tags: ['Routes'],
      summary: 'Get route schedules',
      description: 'Returns schedules for a specific route, optionally filtered by date'
    })

    this.controller.openapi(getRouteSchedulesRoute, async (c: any) => {
      const { id } = c.req.valid('param')
      const query = c.req.valid('query')
      const useCase = new GetRouteSchedulesUseCase()
      const result = await useCase.execute({ id, ...query })

      if (!result.success) {
        return c.json({ error: result.error }, 400)
      }

      return c.json({ data: result.data }, 200)
    })
  }
}

// feat: add distance calculation - 2025-06-21

// feat: create route model and repository - Development on 2025-05-29

// feat: add route optimization logic - Development on 2025-05-29
