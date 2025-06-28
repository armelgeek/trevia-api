import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import { DeleteBookingUseCase } from '../../application/use-cases/booking/delete-booking.use-case'
import { GetBookingByIdUseCase } from '../../application/use-cases/booking/get-booking-by-id.use-case'
import { GetBookingsUseCase } from '../../application/use-cases/booking/get-bookings.use-case'
import { UpdateBookingUseCase } from '../../application/use-cases/booking/update-booking.use-case'
import type { Routes } from '../../domain/types/route.type'

export class BookingController implements Routes {
  public controller = new OpenAPIHono()

  public initRoutes() {
    const bookingSummarySchema = z.object({
      bookingId: z.string(),
      tripId: z.string(),
      seatIds: z.array(z.string()),
      totalPrice: z.string(),
      status: z.string()
    })
    const listBookingsQuerySchema = z.object({
      page: z.string().optional(),
      limit: z.string().optional()
    })

    const bookingListSchema = z.object({
      data: z.array(bookingSummarySchema),
      page: z.number(),
      limit: z.number(),
      total: z.number()
    })

    const getBookingsRoute = createRoute({
      method: 'get',
      path: '/bookings',
      request: {
        query: listBookingsQuerySchema
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: bookingListSchema
            }
          },
          description: 'Liste paginée des réservations de l’utilisateur'
        },
        401: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Utilisateur non authentifié'
        }
      },
      tags: ['Bookings'],
      summary: 'Lister les réservations de l’utilisateur',
      description: 'Retourne la liste paginée des réservations de l’utilisateur authentifié'
    })

    this.controller.openapi(getBookingsRoute, async (c: any) => {
      const user = c.get('user')
      const { page = '1', limit = '20' } = c.req.valid('query')

      const getBookingsUseCase = new GetBookingsUseCase()
      const result = await getBookingsUseCase.execute({
        userId: user.id,
        page,
        limit
      })

      if (!result.success) {
        return c.json({ error: result.error || 'Erreur lors de la récupération des réservations' }, 400)
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

    const bookingIdParamSchema = z.object({
      id: z.string().min(1, 'Booking ID requis')
    })

    const bookingDetailSchema = z.object({
      bookingId: z.string(),
      tripId: z.string(),
      seatIds: z.array(z.string()),
      totalPrice: z.string(),
      status: z.string(),
      bookedAt: z.string().nullable()
    })

    const getBookingByIdRoute = createRoute({
      method: 'get',
      path: '/bookings/{id}',
      request: {
        params: bookingIdParamSchema
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: bookingDetailSchema
            }
          },
          description: 'Détail de la réservation'
        },
        401: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Utilisateur non authentifié'
        },
        403: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Accès interdit'
        },
        404: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Réservation non trouvée'
        }
      },
      tags: ['Bookings'],
      summary: 'Obtenir le détail d’une réservation',
      description: 'Retourne le détail d’une réservation si l’utilisateur y a accès'
    })

    this.controller.openapi(getBookingByIdRoute, async (c: any) => {
      const user = c.get('user')
      const { id } = c.req.valid('param')

      const getBookingByIdUseCase = new GetBookingByIdUseCase()
      const result = await getBookingByIdUseCase.execute({
        bookingId: id,
        userId: user.id
      })

      if (!result.success) {
        if (result.error === 'Réservation non trouvée') {
          return c.json({ error: result.error }, 404)
        }
        return c.json({ error: result.error || 'Erreur lors de la récupération de la réservation' }, 400)
      }

      const booking = result.data
      const trip = booking.trip || {}
      const driver = trip.driver || {}
      const vehicle = trip.vehicle || {}
      const route = trip.route || {}
      return c.json(
        {
          bookingId: booking.id,
          tripId: booking.tripId,
          routeLabel: route.departureCity && route.arrivalCity ? `${route.departureCity} - ${route.arrivalCity}` : null,
          departureDate: trip.departureDate || null,
          driverId: driver.id || null,
          driverName: driver.firstName && driver.lastName ? `${driver.firstName} ${driver.lastName}` : null,
          driverPhone: driver.phone || null,
          vehicleId: vehicle.id || null,
          vehicleModel: vehicle.model || null,
          vehiclePlate: vehicle.plate || null,
          seatIds: booking.seatIds,
          totalPrice: booking.totalPrice ?? '0',
          status: booking.status ?? 'pending',
          bookedAt: booking.bookedAt ? booking.bookedAt.toISOString() : null,
          schedule: booking.schedule
            ? {
                id: booking.schedule.id,
                departureTime: booking.schedule.departureTime,
                arrivalTime: booking.schedule.arrivalTime
              }
            : undefined
        },
        200
      )
    })

    const updateBookingBodySchema = z.object({
      seatIds: z.array(z.string().min(1)).min(1, 'Au moins un siège doit être sélectionné').optional(),
      options: z.array(z.object({ optionId: z.string(), quantity: z.number().min(1) })).optional()
    })

    const updateBookingRoute = createRoute({
      method: 'put',
      path: '/bookings/{id}',
      request: {
        params: bookingIdParamSchema,
        body: {
          content: {
            'application/json': {
              schema: updateBookingBodySchema
            }
          }
        }
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: bookingDetailSchema
            }
          },
          description: 'Réservation mise à jour'
        },
        400: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Erreur de validation'
        },
        403: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Accès interdit'
        },
        404: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Réservation non trouvée'
        }
      },
      tags: ['Bookings'],
      summary: 'Mettre à jour une réservation',
      description: 'Permet de modifier les sièges ou options d’une réservation avant le début du voyage'
    })

    this.controller.openapi(updateBookingRoute, async (c: any) => {
      const user = c.get('user')
      const { id } = c.req.valid('param')
      // const body = c.req.valid('json') // TODO: implémenter la logique de mise à jour complète

      const updateBookingUseCase = new UpdateBookingUseCase()
      const result = await updateBookingUseCase.execute({
        bookingId: id,
        userId: user.id,
        status: undefined
      })

      if (!result.success) {
        if (result.error === 'Réservation non trouvée') {
          return c.json({ error: result.error }, 404)
        }
        if (result.error === 'Accès interdit') {
          return c.json({ error: result.error }, 403)
        }
        return c.json({ error: result.error || 'Erreur lors de la mise à jour de la réservation' }, 400)
      }

      const booking = result.data
      return c.json(
        {
          bookingId: booking.id,
          tripId: booking.tripId,
          seatIds: [], // TODO: récupérer les seatIds depuis le use case
          totalPrice: booking.totalPrice ?? '0',
          status: booking.status ?? 'pending',
          bookedAt: booking.bookedAt ? booking.bookedAt.toISOString() : null
        },
        200
      )
    })

    const deleteBookingRoute = createRoute({
      method: 'delete',
      path: '/bookings/{id}',
      request: {
        params: bookingIdParamSchema
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: z.object({ success: z.boolean() })
            }
          },
          description: 'Réservation annulée'
        },
        400: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Erreur de validation'
        },
        403: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Accès interdit'
        },
        404: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Réservation non trouvée'
        }
      },
      tags: ['Bookings'],
      summary: 'Annuler une réservation',
      description: 'Permet d’annuler une réservation et de libérer les sièges avant le début du voyage'
    })

    this.controller.openapi(deleteBookingRoute, async (c: any) => {
      const user = c.get('user')
      const { id } = c.req.valid('param')

      const deleteBookingUseCase = new DeleteBookingUseCase()
      const result = await deleteBookingUseCase.execute({
        bookingId: id,
        userId: user.id
      })

      if (!result.success) {
        if (result.error === 'Réservation non trouvée') {
          return c.json({ error: result.error }, 404)
        }
        if (result.error === 'Accès interdit') {
          return c.json({ error: result.error }, 403)
        }
        return c.json({ error: result.error || "Erreur lors de l'annulation de la réservation" }, 400)
      }

      return c.json({ success: true }, 200)
    })
  }
}

// feat: create booking controller - Development on 2025-06-02
