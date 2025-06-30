import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import { CreateTripUseCase } from '@/application/use-cases/trip/create-trip.use-case'
import { DeleteTripUseCase } from '@/application/use-cases/trip/delete-trip.use-case'
import { GetTripsByPopularityUseCase } from '@/application/use-cases/trip/get-trips-by-popularity.use-case'
import { UpdateTripUseCase } from '@/application/use-cases/trip/update-trip.use-case'
import { GetScheduleSeatsUseCase } from '../../application/use-cases/trip/get-schedule-seats.use-case'
import { GetTripByIdUseCase } from '../../application/use-cases/trip/get-trip-by-id.use-case'
import { GetTripSeatsUseCase } from '../../application/use-cases/trip/get-trip-seats.use-case'
import { GetTripsUseCase } from '../../application/use-cases/trip/get-trips.use-case'
import { TripRepositoryImpl } from '../repositories/trip.repository'
import type { Routes } from '../../domain/types/route.type'

export class TripController implements Routes {
  public controller = new OpenAPIHono()

  public initRoutes() {
    const tripSchema = z.object({
      id: z.string(),
      routeId: z.string(),
      routeName: z.string().nullable(),
      vehicleId: z.string(),
      vehicleName: z.string().nullable(),
      driverId: z.string(),
      driverName: z.string().nullable(),
      departureDate: z.string().nullable(),
      status: z.string().nullable(),
      price: z.string().nullable(),
      departureCity: z.string().nullable(),
      arrivalCity: z.string().nullable()
    })

    const tripIdParamSchema = z.object({
      id: z.string().min(1, 'Trip ID requis')
    })

    // --- Endpoint GET /trips/popular ---
    const tripPopularitySchema = z.object({
      tripId: z.string(),
      routeLabel: z.string(),
      departureDate: z.string().nullable(),
      bookingsCount: z.number(),
      price: z.number().nullable(),
      availableTimes: z.array(z.string()),
      duration: z.number().nullable(),
      driverName: z.string().nullable(),
      vehicleModel: z.string().nullable()
    })
    const tripPopularityListSchema = z.object({
      data: z.array(tripPopularitySchema),
      page: z.number(),
      limit: z.number(),
      total: z.number()
    })
    const listTripsByPopularityRoute = createRoute({
      method: 'get',
      path: '/trips/popular',
      request: {
        query: z.object({
          page: z.string().optional(),
          limit: z.string().optional()
        })
      },
      responses: {
        200: {
          content: { 'application/json': { schema: tripPopularityListSchema } },
          description: 'Liste paginée des voyages triés par popularité'
        },
        400: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Erreur de requête'
        }
      },
      tags: ['Trips'],
      summary: 'Lister les voyages par popularité',
      description:
        'Retourne la liste paginée des voyages triés par nombre de réservations décroissant, avec prix, horaires et durée.'
    })
    this.controller.openapi(listTripsByPopularityRoute, async (c: any) => {
      const { page = '1', limit = '20' } = c.req.valid('query')
      const useCase = new GetTripsByPopularityUseCase()
      const result = await useCase.execute({ page, limit })
      if (!result.success) {
        return c.json({ error: result.error || 'Erreur lors de la récupération des voyages populaires' }, 400)
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

    // GET /trips
    const listTripsRoute = createRoute({
      method: 'get',
      path: '/trips',
      request: {
        params: z.object({
          page: z.string().optional(),
          limit: z.string().optional()
        })
      },
      responses: {
        200: {
          content: { 'application/json': { schema: z.object({ data: z.array(tripSchema), total: z.number() }) } },
          description: 'Liste des voyages'
        }
      },
      tags: ['Trips'],
      summary: 'Lister les voyages',
      description: 'Retourne la liste des voyages.'
    })
    this.controller.openapi(listTripsRoute, async (c: any) => {
      const useCase = new GetTripsUseCase()
      const result = await useCase.execute({
        page: c.req.query('page') || '1',
        limit: c.req.query('pageSize') || '10'
      })
      return c.json({ data: result.data, total: result.total, limit: result.limit, page: result.page }, 200)
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

    // --- Endpoint POST /trips ---
    const createTripSchema = z.object({
      routeId: z.string(),
      driverId: z.string(),
      vehicleId: z.string(),
      departureDate: z.string().nullable(),
      price: z.number().nullable()
    })
    const createTripRoute = createRoute({
      method: 'post',
      path: '/trips',
      request: { body: { content: { 'application/json': { schema: createTripSchema } } } },
      responses: {
        201: { content: { 'application/json': { schema: tripSchema } }, description: 'Voyage créé' },
        400: { content: { 'application/json': { schema: z.object({ error: z.string() }) } }, description: 'Erreur' }
      },
      tags: ['Trips'],
      summary: 'Créer un voyage',
      description: 'Crée un nouveau voyage.'
    })
    this.controller.openapi(createTripRoute, async (c: any) => {
      try {
        const input = c.req.valid('json')
        const tripRepository = new TripRepositoryImpl()
        const useCase = new CreateTripUseCase(tripRepository)
        const result = await useCase.execute(input)
        return c.json(result, 201)
      } catch (error: any) {
        return c.json({ error: error?.message || 'Erreur création voyage' }, 400)
      }
    })

    // --- Endpoint PUT /trips/:id ---
    const updateTripSchema = z.object({
      routeId: z.string().optional(),
      driverId: z.string().optional(),
      vehicleId: z.string().optional(),
      departureDate: z.string().nullable().optional(),
      status: z.string().optional(),
      price: z.string().nullable().optional()
    })
    const updateTripRoute = createRoute({
      method: 'put',
      path: '/trips/{id}',
      request: {
        params: tripIdParamSchema,
        body: { content: { 'application/json': { schema: updateTripSchema } } }
      },
      responses: {
        200: { content: { 'application/json': { schema: tripSchema } }, description: 'Voyage mis à jour' },
        404: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Voyage non trouvé'
        }
      },
      tags: ['Trips'],
      summary: 'Mettre à jour un voyage',
      description: 'Met à jour les informations d’un voyage.'
    })
    this.controller.openapi(updateTripRoute, async (c: any) => {
      try {
        const { id } = c.req.valid('param')
        const input = c.req.valid('json')
        const tripRepository = new TripRepositoryImpl()
        const useCase = new UpdateTripUseCase(tripRepository)
        const result = await useCase.execute(id, input)

        return c.json(result, 200)
      } catch (error: any) {
        return c.json({ error: error?.message || 'Erreur mise à jour voyage' }, 400)
      }
    })

    // --- Endpoint DELETE /trips/:id ---
    const deleteTripRoute = createRoute({
      method: 'delete',
      path: '/trips/{id}',
      request: { params: tripIdParamSchema },
      responses: {
        204: { description: 'Voyage supprimé' },
        404: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Voyage non trouvé'
        }
      },
      tags: ['Trips'],
      summary: 'Supprimer un voyage',
      description: 'Supprime un voyage existant par son ID.'
    })
    this.controller.openapi(deleteTripRoute, async (c: any) => {
      try {
        const { id } = c.req.valid('param')
        const tripRepository = new TripRepositoryImpl()
        const useCase = new DeleteTripUseCase(tripRepository)
        await useCase.execute(id)

        return c.body(
          {
            success: true
          },
          204
        )
      } catch (error: any) {
        console.error('Erreur lors de la suppression du voyage:', error)
        return c.json({ error: error?.message || 'Erreur suppression voyage' }, 400)
      }
    })
  }
}

// ci: add monitoring setup - Development on 2025-06-21
