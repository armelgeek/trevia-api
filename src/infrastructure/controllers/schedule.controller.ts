import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import { CreateScheduleUseCase } from '../../application/use-cases/schedule/create-schedule.use-case'
import { ScheduleRepositoryImpl } from '../repositories/schedule.repository'
import type { Routes } from '../../domain/types/route.type'
import { ListSchedulesUseCase } from '@/application/use-cases/schedule/list-schedules.use-case'
import { GetScheduleUseCase } from '@/application/use-cases/schedule/get-schedule.use-case'
import { UpdateScheduleUseCase } from '@/application/use-cases/schedule/update-schedule.use-case'
import { DeleteScheduleUseCase } from '@/application/use-cases/schedule/delete-schedule.use-case'

export class ScheduleController implements Routes {
  public controller = new OpenAPIHono()

  public initRoutes() {
    // Schéma Zod pour GET /api/schedules (tripId obligatoire)
    const listSchedulesQuerySchema = z.object({
      tripId: z.string().min(1, 'tripId requis'),
      page: z.string().optional(),
      limit: z.string().optional()
    })

    const scheduleSchema = z.object({
      id: z.string(),
      tripId: z.string(),
      departureTime: z.string(),
      arrivalTime: z.string(),
      status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
      createdAt: z.string(),
      updatedAt: z.string()
    })

    const scheduleListSchema = z.object({
      data: z.array(scheduleSchema),
      page: z.number(),
      limit: z.number(),
      total: z.number()
    })

    const listSchedulesRoute = createRoute({
      method: 'get',
      path: '/schedules',
      request: { query: listSchedulesQuerySchema },
      responses: {
        200: {
          content: { 'application/json': { schema: scheduleListSchema } },
          description: 'Liste paginée des schedules pour un voyage'
        },
        400: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Erreur de validation'
        }
      },
      tags: ['Schedules'],
      summary: 'Lister les schedules d’un voyage',
      description: 'Retourne la liste paginée des horaires pour un tripId donné (obligatoire)'
    })

    this.controller.openapi(listSchedulesRoute, async (c: any) => {
      const { tripId, page = '1', limit = '20' } = c.req.valid('query')
      if (!tripId) {
        return c.json({ error: 'tripId requis' }, 400)
      }
      const scheduleRepository = new ScheduleRepositoryImpl()
      const useCase = new ListSchedulesUseCase(scheduleRepository)
      const result = await useCase.execute({ tripId, page: Number(page), limit: Number(limit) })
      return c.json(result, 200)
    })

    const createScheduleBodySchema = z.object({
      tripId: z.string().min(1, 'tripId requis'),
      departureTime: z.string(),
      arrivalTime: z.string(),
      status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional()
    })

    const createScheduleRoute = createRoute({
      method: 'post',
      path: '/schedules',
      request: {
        body: {
          content: {
            'application/json': {
              schema: createScheduleBodySchema
            }
          }
        }
      },
      responses: {
        201: {
          content: { 'application/json': { schema: scheduleSchema } },
          description: 'Schedule créé'
        },
        400: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Erreur de validation'
        }
      },
      tags: ['Schedules'],
      summary: 'Créer un schedule',
      description: 'Crée un nouvel horaire pour un voyage (tripId obligatoire)'
    })

    this.controller.openapi(createScheduleRoute, async (c: any) => {
      const input = c.req.valid('json')
      const inputData = {
        ...input, 
        status: input.status ? input.status: 'scheduled',
      }
      const scheduleRepository = new ScheduleRepositoryImpl()
      const useCase = new CreateScheduleUseCase(scheduleRepository)
      const result = await useCase.execute(inputData)
      if (!result.success) {
        return c.json({ error: result.error }, 400)
      }
      return c.json(result.data, 201)
    })

    // GET /api/schedules/seats?tripId=...
    const getSchedulesSeatsQuerySchema = z.object({
      tripId: z.string().min(1, 'tripId requis')
    })
    const seatAvailabilitySchema = z.object({
      scheduleId: z.string(),
      departureTime: z.string(),
      arrivalTime: z.string(),
      seats: z.array(
        z.object({
          seatNumber: z.string(),
          status: z.enum(['free', 'occupied'])
        })
      )
    })
    const getSchedulesSeatsRoute = createRoute({
      method: 'get',
      path: '/schedules/seats',
      request: { query: getSchedulesSeatsQuerySchema },
      responses: {
        200: {
          content: { 'application/json': { schema: z.object({ data: z.array(seatAvailabilitySchema) }) } },
          description: 'Disponibilité des sièges pour chaque schedule d’un trip'
        },
        400: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Erreur de validation'
        }
      },
      tags: ['Schedules'],
      summary: 'Voir la disponibilité des sièges par horaire',
      description: 'Retourne la liste des horaires et la disponibilité des sièges pour un tripId donné'
    })
    this.controller.openapi(getSchedulesSeatsRoute, async (c: any) => {
      const { tripId } = c.req.valid('query')
      if (!tripId) {
        return c.json({ error: 'tripId requis' }, 400)
      }
      const scheduleRepository = new ScheduleRepositoryImpl()
      const results = await scheduleRepository.getSchedulesSeats(tripId)
      return c.json({ data: results }, 200)
    })

    // GET /api/schedules/{id}
    const scheduleIdParamSchema = z.object({ id: z.string().min(1, 'Schedule ID requis') })
    const getScheduleRoute = createRoute({
      method: 'get',
      path: '/schedules/{id}',
      request: { params: scheduleIdParamSchema },
      responses: {
        200: { content: { 'application/json': { schema: scheduleSchema } }, description: 'Détail du schedule' },
        404: { content: { 'application/json': { schema: z.object({ error: z.string() }) } }, description: 'Non trouvé' }
      },
      tags: ['Schedules'],
      summary: 'Détail d’un schedule',
      description: 'Retourne le détail d’un horaire par ID'
    })
    this.controller.openapi(getScheduleRoute, async (c: any) => {
      const { id } = c.req.valid('param')
      const scheduleRepository = new ScheduleRepositoryImpl()
      const useCase = new GetScheduleUseCase(scheduleRepository)
      const result = await useCase.execute(id)
      if (!result.success) {
        return c.json({ error: result.error }, 404)
      }
      return c.json(result.data, 200)
    })

    // PUT /api/schedules/{id}
    const updateScheduleBodySchema = z.object({
      departureTime: z.string().optional(),
      arrivalTime: z.string().optional(),
      status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional()
    })
    const updateScheduleRoute = createRoute({
      method: 'put',
      path: '/schedules/{id}',
      request: {
        params: scheduleIdParamSchema,
        body: { content: { 'application/json': { schema: updateScheduleBodySchema } } }
      },
      responses: {
        200: { content: { 'application/json': { schema: scheduleSchema } }, description: 'Schedule modifié' },
        404: { content: { 'application/json': { schema: z.object({ error: z.string() }) } }, description: 'Non trouvé' }
      },
      tags: ['Schedules'],
      summary: 'Modifier un schedule',
      description: 'Modifie un horaire (hors tripId)'
    })
    this.controller.openapi(updateScheduleRoute, async (c: any) => {
      const { id } = c.req.valid('param')
      const input = c.req.valid('json')
      const scheduleRepository = new ScheduleRepositoryImpl()
      const useCase = new UpdateScheduleUseCase(scheduleRepository)
      const result = await useCase.execute(id, input)
      if (!result.success) {
        return c.json({ error: result.error }, 404)
      }
      return c.json(result.data, 200)
    })

    // DELETE /api/schedules/{id}
    const deleteScheduleRoute = createRoute({
      method: 'delete',
      path: '/schedules/{id}',
      request: { params: scheduleIdParamSchema },
      responses: {
        200: {
          content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
          description: 'Schedule supprimé'
        },
        404: { content: { 'application/json': { schema: z.object({ error: z.string() }) } }, description: 'Non trouvé' }
      },
      tags: ['Schedules'],
      summary: 'Supprimer un schedule',
      description: 'Supprime un horaire par ID'
    })
    this.controller.openapi(deleteScheduleRoute, async (c: any) => {
      const { id } = c.req.valid('param')
      const scheduleRepository = new ScheduleRepositoryImpl()
      const useCase = new DeleteScheduleUseCase(scheduleRepository)
      const result = await useCase.execute(id)
      if (!result.success) {
        return c.json({ error: result.error }, 404)
      }
      return c.json({ success: true }, 200)
    })
  }
}
