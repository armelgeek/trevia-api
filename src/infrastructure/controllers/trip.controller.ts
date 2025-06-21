import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import { GetScheduleSeatsUseCase } from '../../application/use-cases/trip/get-schedule-seats.use-case'
import { GetTripByIdUseCase } from '../../application/use-cases/trip/get-trip-by-id.use-case'
import { GetTripSeatsUseCase } from '../../application/use-cases/trip/get-trip-seats.use-case'
import { GetTripsUseCase } from '../../application/use-cases/trip/get-trips.use-case'
import type { Routes } from '../../domain/types/route.type'

export class TripController implements Routes {
  public controller = new OpenAPIHono()

  public initRoutes() {
    const listTripsQuerySchema = z.object({
      page: z.string().optional(),
      limit: z.string().optional(),
      sort: z.string().optional(),
      filter: z.string().optional(),
      departureCity: z.string().optional(),
      arrivalCity: z.string().optional(),
      date: z.string().optional(),
      passengers: z.string().optional(),
      scheduleType: z.string().optional(),
      classType: z.string().optional()
    })

    const tripSchema = z.object({
      id: z.string(),
      routeId: z.string(),
      vehicleId: z.string(),
      driverId: z.string(),
      departureDate: z.string().nullable(),
      departureTime: z.string().nullable(),
      arrivalDate: z.string().nullable(),
      status: z.string().nullable(),
      price: z.string().nullable()
    })

    const listTripsResponseSchema = z.object({
      data: z.array(tripSchema),
      page: z.number(),
      limit: z.number(),
      total: z.number()
    })

    const tripIdParamSchema = z.object({
      id: z.string().min(1, 'Trip ID requis')
    })

    const getTripsRoute = createRoute({
      method: 'get',
      path: '/trips',
      request: {
        query: listTripsQuerySchema
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: listTripsResponseSchema
            }
          },
          description: 'Liste paginée des voyages disponibles'
        },
        400: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Paramètres de requête invalides'
        }
      },
      tags: ['Trips'],
      summary: 'Obtenir la liste des voyages',
      description: 'Retourne une liste paginée des voyages disponibles avec filtres optionnels'
    })

    this.controller.openapi(getTripsRoute, async (c: any) => {
      const query = c.req.valid('query')

      const getTripsUseCase = new GetTripsUseCase()
      const result = await getTripsUseCase.execute(query)

      if (!result.success) {
        return c.json({ error: result.error || 'Erreur lors de la récupération des voyages' }, 400)
      }

      return c.json(
        {
          data: result.data,
          page: result.page,
          limit: result.limit,
          total: result.total
        },
        200
      )
    })

    const getTripByIdRoute = createRoute({
      method: 'get',
      path: '/trips/{id}',
      request: {
        params: tripIdParamSchema
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: tripSchema
            }
          },
          description: 'Détails du voyage'
        },
        404: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Voyage non trouvé'
        },
        400: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Paramètre invalide'
        }
      },
      tags: ['Trips'],
      summary: 'Obtenir le détail d’un voyage',
      description: 'Retourne les informations détaillées d’un voyage à partir de son identifiant'
    })

    this.controller.openapi(getTripByIdRoute, async (c: any) => {
      const { id } = c.req.valid('param')

      const getTripByIdUseCase = new GetTripByIdUseCase()
      const result = await getTripByIdUseCase.execute({ id })

      if (!result.success) {
        if (result.error === 'Voyage non trouvé') {
          return c.json({ error: result.error }, 404)
        }
        return c.json({ error: result.error || 'Erreur lors de la récupération du voyage' }, 400)
      }

      return c.json(result.data, 200)
    })

    const seatPlanSchema = z.object({
      id: z.string(),
      seatNumber: z.string(),
      seatType: z.string().nullable(),
      row: z.string().nullable(),
      col: z.string().nullable(),
      status: z.enum(['free', 'occupied'])
    })
    const seatPlanListSchema = z.object({
      tripId: z.string(),
      scheduleId: z.string().nullable(),
      seats: z.array(seatPlanSchema)
    })

    const getTripSeatsRoute = createRoute({
      method: 'get',
      path: '/trips/{id}/seats',
      request: {
        params: tripIdParamSchema,
        query: z.object({
          scheduleId: z.string().optional()
        })
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: seatPlanListSchema
            }
          },
          description: 'Plan des places du voyage'
        },
        404: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Voyage non trouvé'
        },
        400: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Paramètre invalide'
        }
      },
      tags: ['Trips'],
      summary: 'Obtenir le plan des places d’un voyage',
      description:
        'Retourne le plan des places (libres/occupées) pour un voyage donné, optionnellement filtré par horaire avec le paramètre scheduleId'
    })

    this.controller.openapi(getTripSeatsRoute, async (c: any) => {
      const { id } = c.req.valid('param')
      const query = c.req.query()
      const scheduleId = query?.scheduleId

      const getTripSeatsUseCase = new GetTripSeatsUseCase()
      const result = await getTripSeatsUseCase.execute({
        tripId: id,
        scheduleId
      })

      if (!result.success) {
        if (result.error === 'Voyage non trouvé') {
          return c.json({ error: result.error }, 404)
        }
        return c.json({ error: result.error || 'Erreur lors de la récupération du plan des places' }, 400)
      }

      return c.json(result.data, 200)
    })

    const scheduleIdParamSchema = z.object({
      scheduleId: z.string().min(1, 'Schedule ID requis')
    })

    const getScheduleSeatsRoute = createRoute({
      method: 'get',
      path: '/schedules/{scheduleId}/seats',
      request: {
        params: scheduleIdParamSchema
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: z.object({
                scheduleId: z.string(),
                tripId: z.string(),
                seats: z.array(seatPlanSchema)
              })
            }
          },
          description: 'Plan des places pour un horaire spécifique'
        },
        404: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Horaire non trouvé'
        },
        400: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Paramètre invalide'
        }
      },
      tags: ['Schedules'],
      summary: 'Obtenir le plan des places pour un horaire',
      description: 'Retourne le plan des places (libres/occupées) pour un horaire donné'
    })

    this.controller.openapi(getScheduleSeatsRoute, async (c: any) => {
      const { scheduleId } = c.req.valid('param')

      const getScheduleSeatsUseCase = new GetScheduleSeatsUseCase()
      const result = await getScheduleSeatsUseCase.execute({ scheduleId })

      if (!result.success) {
        if (result.error === 'Horaire non trouvé') {
          return c.json({ error: result.error }, 404)
        }
        return c.json({ error: result.error || 'Erreur lors de la récupération du plan des places' }, 400)
      }

      return c.json(result.data, 200)
    })
  }
}

// ci: add monitoring setup - Development on 2025-06-21
