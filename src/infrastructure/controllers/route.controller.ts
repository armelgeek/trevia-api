import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import { ChangeRouteStatusUseCase } from '../../application/use-cases/route/change-route-status.use-case'
import { CreateRouteUseCase } from '../../application/use-cases/route/create-route.use-case'
import { DeleteRouteUseCase } from '../../application/use-cases/route/delete-route.use-case'
import { GetRouteByIdUseCase } from '../../application/use-cases/route/get-route-by-id.use-case'
import { GetRouteSchedulesUseCase } from '../../application/use-cases/route/get-route-schedules.use-case'
import { GetRoutesUseCase } from '../../application/use-cases/route/get-routes.use-case'
import { UpdateRouteUseCase } from '../../application/use-cases/route/update-route.use-case'
import { RouteRepositoryImpl } from '../repositories/route.repository'
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

    // --- Endpoint GET /routes (liste paginée, filtrée) ---
    this.controller.openapi(getRoutesRoute, async (c: any) => {
      const getRoutesUseCase = new GetRoutesUseCase()
      const result = await getRoutesUseCase.execute(c.req.valid('query'))

      if (!result || !result.success) {
        return c.json({ error: result?.error || 'Erreur inconnue' }, 400)
      }

      // Normalisation stricte des champs pour chaque route + champ combiné
      const data = result.data
        ? result.data.map((route: any) => ({
            ...route,
            departureCity: route.departureCity ?? null,
            arrivalCity: route.arrivalCity ?? null,
            distanceKm: route.distanceKm ?? null,
            duration: route.duration ?? null,
            basePrice: route.basePrice ?? null,
            routeType: route.routeType ?? null,
            status: route.status ?? null,
            routeLabel: `${route.departureCity ?? ''} - ${route.arrivalCity ?? ''}`.trim()
          }))
        : []
      return c.json(
        {
          ...result,
          data
        },
        200
      )
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

    // --- Ajout endpoint POST /routes ---
    const createRouteSchema = z.object({
      departureCity: z.string(),
      arrivalCity: z.string(),
      distanceKm: z.string().optional(),
      duration: z.string().optional(),
      basePrice: z.string().optional(),
      routeType: z.string().optional(),
      status: z.string().optional()
    })
    const createRouteRoute = createRoute({
      method: 'post',
      path: '/routes',
      request: { body: { content: { 'application/json': { schema: createRouteSchema } } } },
      responses: {
        201: { content: { 'application/json': { schema: routeSchema } }, description: 'Route créée' },
        400: { content: { 'application/json': { schema: z.object({ error: z.string() }) } }, description: 'Erreur' }
      },
      tags: ['Routes'],
      summary: 'Créer une route',
      description: 'Crée une nouvelle route.'
    })
    // Dépendance repository unique pour tous les use cases
    const routeRepository = new RouteRepositoryImpl()
    this.controller.openapi(createRouteRoute, async (c: any) => {
      const input = c.req.valid('json')
      const useCase = new CreateRouteUseCase(routeRepository)
      try {
        const route = await useCase.execute(input)
        return c.json(route, 201)
      } catch (error: any) {
        return c.json({ error: error.message || 'Erreur création route' }, 400)
      }
    })

    // --- Ajout endpoint PUT /routes/:id ---
    const updateRouteSchema = z.object({
      departureCity: z.string().optional(),
      arrivalCity: z.string().optional(),
      distanceKm: z.string().optional(),
      duration: z.string().optional(),
      basePrice: z.string().optional(),
      routeType: z.string().optional(),
      status: z.string().optional()
    })
    const updateRouteRoute = createRoute({
      method: 'put',
      path: '/routes/:id',
      request: {
        params: z.object({ id: z.string() }),
        body: { content: { 'application/json': { schema: updateRouteSchema } } }
      },
      responses: {
        200: { content: { 'application/json': { schema: routeSchema } }, description: 'Route mise à jour' },
        404: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Route non trouvée'
        }
      },
      tags: ['Routes'],
      summary: 'Mettre à jour une route',
      description: 'Met à jour les informations d’une route.'
    })
    this.controller.openapi(updateRouteRoute, async (c) => {
      const { id } = c.req.valid('param')
      const input = c.req.valid('json')
      const useCase = new UpdateRouteUseCase(routeRepository)
      const route = await useCase.execute(id, input)
      if (!route) return c.json({ error: 'Route non trouvée' }, 404)
      return c.json(
        {
          ...route,
          departureCity: route.departureCity ?? null,
          arrivalCity: route.arrivalCity ?? null,
          distanceKm: route.distanceKm ?? null,
          duration: route.duration ?? null,
          basePrice: route.basePrice ?? null,
          routeType: route.routeType ?? null,
          status: route.status ?? null
        },
        200
      )
    })

    // --- Ajout endpoint DELETE /routes/:id ---
    const deleteRouteRoute = createRoute({
      method: 'delete',
      path: '/routes/:id',
      request: {
        params: z.object({ id: z.string() })
      },
      responses: {
        204: { description: 'Route supprimée' },
        404: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Route non trouvée'
        }
      },
      tags: ['Routes'],
      summary: 'Supprimer une route',
      description: 'Supprime une route existante par son ID.'
    })
    this.controller.openapi(deleteRouteRoute, async (c) => {
      const { id } = c.req.valid('param')
      const useCase = new DeleteRouteUseCase(routeRepository)
      const deleted = await useCase.execute(id)
      if (!deleted) return c.json({ error: 'Route non trouvée' }, 404)
      return c.body(null, 204)
    })

    // --- Ajout endpoint PATCH /routes/:id/status ---
    const patchStatusSchema = z.object({
      status: z.string()
    })
    const patchStatusRoute = createRoute({
      method: 'patch',
      path: '/routes/:id/status',
      request: {
        params: z.object({ id: z.string() }),
        body: { content: { 'application/json': { schema: patchStatusSchema } } }
      },
      responses: {
        200: { content: { 'application/json': { schema: routeSchema } }, description: 'Statut de la route mis à jour' },
        404: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Route non trouvée'
        }
      },
      tags: ['Routes'],
      summary: 'Changer le statut d’une route',
      description: 'Met à jour le statut d’une route existante.'
    })
    this.controller.openapi(patchStatusRoute, async (c) => {
      const { id } = c.req.valid('param')
      const { status } = c.req.valid('json')
      const useCase = new ChangeRouteStatusUseCase(routeRepository)
      const route = await useCase.execute(id, status)
      if (!route) return c.json({ error: 'Route non trouvée' }, 404)
      return c.json(
        {
          ...route,
          departureCity: route.departureCity ?? null,
          arrivalCity: route.arrivalCity ?? null,
          distanceKm: route.distanceKm ?? null,
          duration: route.duration ?? null,
          basePrice: route.basePrice ?? null,
          routeType: route.routeType ?? null,
          status: route.status ?? null
        },
        200
      )
    })

    // --- Endpoint GET /routes/all (récupérer toutes les routes sans pagination/filtre) ---
    const getAllRoutesRoute = createRoute({
      method: 'get',
      path: '/routes',
      responses: {
        200: {
          content: {
            'application/json': {
              schema: z.object({ data: z.array(routeSchema) })
            }
          },
          description: 'Toutes les routes (sans pagination ni filtre)'
        }
      },
      tags: ['Routes'],
      summary: 'Lister toutes les routes',
      description: 'Retourne la liste complète des routes sans pagination.'
    })
    this.controller.openapi(getAllRoutesRoute, async (c) => {
      const repo = new RouteRepositoryImpl()
      const routes = await repo.findAll()
      // Normalisation stricte des champs + champ combiné
      const data = routes.map((route: any) => ({
        ...route,
        departureCity: route.departureCity ?? null,
        arrivalCity: route.arrivalCity ?? null,
        distanceKm: route.distanceKm ?? null,
        duration: route.duration ?? null,
        basePrice: route.basePrice ?? null,
        routeType: route.routeType ?? null,
        status: route.status ?? null,
        routeLabel: `${route.departureCity ?? ''} -> ${route.arrivalCity ?? ''}`.trim()
      }))
      return c.json({ data }, 200)
    })
  }
}

// feat: add distance calculation - 2025-06-21

// feat: create route model and repository - Development on 2025-05-29

// feat: add route optimization logic - Development on 2025-05-29

// fix: route validation improvements - Development on 2025-05-30
