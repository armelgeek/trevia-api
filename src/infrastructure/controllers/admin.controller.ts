import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import { GetAdminBookingsUseCase } from '../../application/use-cases/admin/get-admin-bookings.use-case'
import { GetAdminTripsUseCase } from '../../application/use-cases/admin/get-admin-trips.use-case'
import { GetDashboardUseCase } from '../../application/use-cases/admin/get-dashboard.use-case'
import type { Routes } from '../../domain/types/route.type'

export class AdminController implements Routes {
  public controller = new OpenAPIHono()

  public initRoutes() {
    const dashboardSchema = z.object({
      totalBookings: z.number(),
      totalTrips: z.number(),
      totalUsers: z.number().optional(),
      alerts: z.array(z.string())
    })

    const getDashboardRoute = createRoute({
      method: 'get',
      path: '/admin/dashboard',
      responses: {
        200: {
          content: {
            'application/json': {
              schema: dashboardSchema
            }
          },
          description: 'Statistiques et alertes du dashboard admin'
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
          description: 'Accès interdit (admin uniquement)'
        }
      },
      tags: ['Admin'],
      summary: 'Dashboard admin',
      description: 'Retourne les statistiques et alertes pour l’administration (admin uniquement)'
    })

    this.controller.openapi(getDashboardRoute, async (c: any) => {
      const user = c.get('user')
      if (!user || !user.isAdmin) {
        return c.json({ error: 'Accès interdit' }, user ? 403 : 401)
      }
      try {
        const getDashboardUseCase = new GetDashboardUseCase()
        const result = await getDashboardUseCase.execute()
        return c.json(result, 200)
      } catch {
        return c.json({ error: 'Erreur lors de la récupération du dashboard' }, 400)
      }
    })

    const listBookingsQuerySchema = z.object({
      page: z.string().optional(),
      limit: z.string().optional()
    })

    const bookingSummarySchema = z.object({
      bookingId: z.string(),
      tripId: z.string(),
      seatIds: z.array(z.string()).optional(),
      totalPrice: z.string(),
      status: z.string(),
      bookedAt: z.string().nullable().optional()
    })
    const bookingListSchema = z.object({
      data: z.array(bookingSummarySchema),
      page: z.number(),
      limit: z.number(),
      total: z.number()
    })

    const getAdminBookingsRoute = createRoute({
      method: 'get',
      path: '/admin/bookings',
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
          description: 'Liste paginée de toutes les réservations'
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
          description: 'Accès interdit (admin uniquement)'
        }
      },
      tags: ['Admin'],
      summary: 'Lister toutes les réservations (admin)',
      description: 'Retourne la liste paginée de toutes les réservations (admin uniquement)'
    })

    this.controller.openapi(getAdminBookingsRoute, async (c: any) => {
      const user = c.get('user')
      if (!user || !user.isAdmin) {
        return c.json({ error: 'Accès interdit' }, user ? 403 : 401)
      }
      const { page = '1', limit = '20' } = c.req.valid('query')
      const pageNum = Math.max(1, Number.parseInt(page))
      const limitNum = Math.max(1, Math.min(100, Number.parseInt(limit)))

      try {
        const getAdminBookingsUseCase = new GetAdminBookingsUseCase()
        const result = await getAdminBookingsUseCase.execute({
          page: pageNum,
          limit: limitNum
        })
        // Enrichissement à plat pour chaque réservation
        const enriched = result.data.map((booking: any) => {
          const trip = booking.trip || {}
          const driver = booking.driver || {}
          const vehicle = booking.vehicle || {}
          const route = booking.route || {}
          const user = booking.user || {}
          return {
            bookingId: booking.id,
            tripId: booking.tripId,
            routeLabel: route.departureCity && route.arrivalCity ? `${route.departureCity} - ${route.arrivalCity}` : null,
            departureDate: trip.departureDate || null,
            // arrivalDate supprimé
            driverId: driver.id || null,
            driverName: driver.firstName && driver.lastName ? `${driver.firstName} ${driver.lastName}` : null,
            driverPhone: driver.phone || null,
            vehicleId: vehicle.id || null,
            vehicleModel: vehicle.model || null,
            vehiclePlate: vehicle.plate || null,
            // Infos utilisateur à plat
            userId: user.id || null,
            userName: user.name || null,
            userFirstname: user.firstname || null,
            userLastname: user.lastname || null,
            userEmail: user.email || null,
            userFullName: (user.firstname && user.lastname)
              ? `${user.firstname} ${user.lastname}`
              : (user.name || null),
            seatIds: booking.seatIds,
            totalPrice: booking.totalPrice ?? '0',
            status: booking.status ?? 'pending',
            bookedAt: booking.bookedAt ? booking.bookedAt : null,
            seats: booking.seats,
            seatNumbers: (booking.seats || [])
              .map((s: any) => {
                const hour = s.schedule && s.schedule.departureTime
                  ? `(${new Date(s.schedule.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                  : ''
                return s.seatNumber ? `${s.seatNumber} ${hour}`.trim() : null
              })
              .filter(Boolean)
              .join(', '),
          }
        })
        return c.json({ ...result, data: enriched }, 200)
      } catch(error: any) {
        console.log('err',error);
        return c.json({ error: 'Erreur lors de la récupération des réservations' }, 400)
      }
    })

    const tripSummarySchema = z.object({
      tripId: z.string(),
      routeId: z.string(),
      vehicleId: z.string(),
      driverId: z.string(),
      departureDate: z.string().nullable(),
      status: z.string().nullable(),
      price: z.string().nullable()
    })
    const tripListSchema = z.object({
      data: z.array(tripSummarySchema),
      page: z.number(),
      limit: z.number(),
      total: z.number()
    })

    const getAdminTripsRoute = createRoute({
      method: 'get',
      path: '/admin/trips',
      request: {
        query: listBookingsQuerySchema
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: tripListSchema
            }
          },
          description: 'Liste paginée de tous les voyages'
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
          description: 'Accès interdit (admin uniquement)'
        }
      },
      tags: ['Admin'],
      summary: 'Lister tous les voyages (admin)',
      description: 'Retourne la liste paginée de tous les voyages (admin uniquement)'
    })

    this.controller.openapi(getAdminTripsRoute, async (c: any) => {
      const user = c.get('user')
      if (!user || !user.isAdmin) {
        return c.json({ error: 'Accès interdit' }, user ? 403 : 401)
      }
      const { page = '1', limit = '20' } = c.req.valid('query')
      const pageNum = Math.max(1, Number.parseInt(page))
      const limitNum = Math.max(1, Math.min(100, Number.parseInt(limit)))

      try {
        const getAdminTripsUseCase = new GetAdminTripsUseCase()
        const result = await getAdminTripsUseCase.execute({
          page: pageNum,
          limit: limitNum
        })
        return c.json(result, 200)
      } catch {
        return c.json({ error: 'Erreur lors de la récupération des voyages' }, 400)
      }
    })
  }
}
