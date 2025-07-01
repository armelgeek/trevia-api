import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import { GetAdminBookingsUseCase } from '@/application/use-cases/admin/get-admin-bookings.use-case'
import { GetBookingDistributionUseCase } from '@/application/use-cases/admin/get-booking-distribution.use-case'
import { GetCancelledBookingsUseCase } from '@/application/use-cases/admin/get-cancelled-bookings.use-case'
import { GetCancelledTripsUseCase } from '@/application/use-cases/admin/get-cancelled-trips.use-case'
import { GetLowOccupancyTripsUseCase } from '@/application/use-cases/admin/get-low-occupancy-trips.use-case'
import { GetRecentBookingsUseCase } from '@/application/use-cases/admin/get-recent-bookings.use-case'
import { GetTopDestinationsUseCase } from '@/application/use-cases/admin/get-top-destinations.use-case'
import { GetUpcomingDeparturesUseCase } from '@/application/use-cases/admin/get-upcoming-departures.use-case'
import type { Routes } from '../../domain/types/route.type'

export class AdminController implements Routes {
  public controller = new OpenAPIHono()

  public initRoutes() {
    // --- Dashboard global ---
    const dashboardSchema = z.object({
      totalBookings: z.number(),
      totalTrips: z.number(),
      totalUsers: z.number().optional(),
      alerts: z.array(z.string()),
      upcomingTrips: z.object({ today: z.number(), week: z.number(), month: z.number() }).optional(),
      averageOccupancyRate: z.number().optional(),
      totalActiveVehicles: z.number().optional(),
      bookingTrends: z.array(z.object({ date: z.string(), count: z.number() })).optional(),
      occupancyByRoute: z.array(z.object({ routeId: z.string(), label: z.string(), occupancy: z.number() })).optional(),
      occupancyByVehicle: z
        .array(z.object({ vehicleId: z.string(), label: z.string(), occupancy: z.number() }))
        .optional(),
      occupancyBySchedule: z
        .array(
          z.object({
            scheduleId: z.string(),
            tripId: z.string(),
            routeId: z.string(),
            label: z.string(),
            departureTime: z.string(),
            occupancy: z.number()
          })
        )
        .optional(),
      upcomingDepartures: z
        .array(
          z.object({
            scheduleId: z.string(),
            tripId: z.string(),
            routeLabel: z.string(),
            departureTime: z.string(),
            occupancy: z.number(),
            status: z.string()
          })
        )
        .optional(),
      recentBookings: z
        .array(
          z.object({
            bookingId: z.string(),
            userName: z.string(),
            tripId: z.string(),
            routeLabel: z.string(),
            bookedAt: z.string(),
            status: z.string()
          })
        )
        .optional(),
      topDestinations: z
        .array(
          z.object({
            routeId: z.string(),
            routeLabel: z.string(),
            bookings: z.number()
          })
        )
        .optional()
    })
    const getDashboardRoute = createRoute({
      method: 'get',
      path: '/admin/dashboard',
      responses: {
        200: {
          content: { 'application/json': { schema: dashboardSchema } },
          description: 'Statistiques globales du dashboard admin'
        },
        401: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Utilisateur non authentifié'
        },
        403: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Accès interdit (admin uniquement)'
        }
      },
      tags: ['Admin'],
      summary: 'Dashboard global',
      description: 'Retourne toutes les statistiques du dashboard admin (agrégation de toutes les stats)'
    })
    this.controller.openapi(getDashboardRoute, async (c: any) => {
      const user = c.get('user')
      if (!user || !user.isAdmin) return c.json({ error: 'Accès interdit' }, user ? 403 : 401)
      const { GetDashboardUseCase } = await import('@/application/use-cases/admin/get-dashboard.use-case')
      const useCase = new GetDashboardUseCase()
      const result = await useCase.execute()
      return c.json(result, 200)
    })

    // --- Top destinations ---
    const topDestinationsSchema = z.object({
      topDestinations: z.array(
        z.object({
          routeId: z.string(),
          routeLabel: z.string(),
          bookings: z.number()
        })
      )
    })
    const getTopDestinationsRoute = createRoute({
      method: 'get',
      path: '/admin/dashboard/top-destinations',
      responses: {
        200: {
          content: { 'application/json': { schema: topDestinationsSchema } },
          description: 'Classement des lignes les plus populaires'
        },
        401: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Utilisateur non authentifié'
        },
        403: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Accès interdit (admin uniquement)'
        }
      },
      tags: ['Admin'],
      summary: 'Top destinations',
      description: 'Retourne le classement des lignes les plus populaires (admin uniquement)'
    })
    this.controller.openapi(getTopDestinationsRoute, async (c: any) => {
      const user = c.get('user')
      if (!user || !user.isAdmin) return c.json({ error: 'Accès interdit' }, user ? 403 : 401)
      const useCase = new GetTopDestinationsUseCase()
      const result = await useCase.execute()
      return c.json(result, 200)
    })

    // --- Voyages à faible remplissage ---
    const lowOccupancyTripsSchema = z.object({
      lowOccupancyTrips: z.array(
        z.object({
          tripId: z.string(),
          label: z.string(),
          occupancy: z.number()
        })
      ),
      alerts: z.array(z.string())
    })
    const getLowOccupancyTripsRoute = createRoute({
      method: 'get',
      path: '/admin/dashboard/low-occupancy-trips',
      responses: {
        200: {
          content: { 'application/json': { schema: lowOccupancyTripsSchema } },
          description: 'Voyages à faible taux d’occupation'
        },
        401: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Utilisateur non authentifié'
        },
        403: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Accès interdit (admin uniquement)'
        }
      },
      tags: ['Admin'],
      summary: 'Voyages à faible remplissage',
      description: 'Retourne la liste des voyages à faible taux d’occupation (admin uniquement)'
    })
    this.controller.openapi(getLowOccupancyTripsRoute, async (c: any) => {
      const user = c.get('user')
      if (!user || !user.isAdmin) return c.json({ error: 'Accès interdit' }, user ? 403 : 401)
      const useCase = new GetLowOccupancyTripsUseCase()
      const result = await useCase.execute()
      return c.json(result, 200)
    })

    // --- Prochains départs ---
    const upcomingDeparturesSchema = z.object({
      upcomingDepartures: z.array(
        z.object({
          scheduleId: z.string(),
          tripId: z.string(),
          routeLabel: z.string(),
          departureTime: z.string(),
          occupancy: z.number(),
          status: z.string()
        })
      )
    })
    const getUpcomingDeparturesRoute = createRoute({
      method: 'get',
      path: '/admin/dashboard/upcoming-departures',
      responses: {
        200: {
          content: { 'application/json': { schema: upcomingDeparturesSchema } },
          description: 'Tableau des prochains départs'
        },
        401: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Utilisateur non authentifié'
        },
        403: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Accès interdit (admin uniquement)'
        }
      },
      tags: ['Admin'],
      summary: 'Prochains départs',
      description: 'Retourne le tableau des prochains départs (admin uniquement)'
    })
    this.controller.openapi(getUpcomingDeparturesRoute, async (c: any) => {
      const user = c.get('user')
      if (!user || !user.isAdmin) return c.json({ error: 'Accès interdit' }, user ? 403 : 401)
      const useCase = new GetUpcomingDeparturesUseCase()
      const result = await useCase.execute()
      return c.json(result, 200)
    })

    // --- Réservations récentes ---
    const recentBookingsSchema = z.object({
      recentBookings: z.array(
        z.object({
          bookingId: z.string(),
          userName: z.string(),
          tripId: z.string(),
          routeLabel: z.string(),
          bookedAt: z.string(),
          status: z.string()
        })
      )
    })
    const getRecentBookingsRoute = createRoute({
      method: 'get',
      path: '/admin/dashboard/recent-bookings',
      responses: {
        200: {
          content: { 'application/json': { schema: recentBookingsSchema } },
          description: 'Liste des dernières réservations'
        },
        401: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Utilisateur non authentifié'
        },
        403: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Accès interdit (admin uniquement)'
        }
      },
      tags: ['Admin'],
      summary: 'Réservations récentes',
      description: 'Retourne la liste des dernières réservations (admin uniquement)'
    })
    this.controller.openapi(getRecentBookingsRoute, async (c: any) => {
      const user = c.get('user')
      if (!user || !user.isAdmin) return c.json({ error: 'Accès interdit' }, user ? 403 : 401)
      const useCase = new GetRecentBookingsUseCase()
      const result = await useCase.execute()
      return c.json(result, 200)
    })

    // --- Répartition des réservations ---
    const bookingDistributionSchema = z.object({
      bookingDistribution: z.array(
        z.object({
          type: z.string(),
          routeId: z.string(),
          routeLabel: z.string(),
          count: z.number()
        })
      )
    })
    const getBookingDistributionRoute = createRoute({
      method: 'get',
      path: '/admin/dashboard/booking-distribution',
      responses: {
        200: {
          content: { 'application/json': { schema: bookingDistributionSchema } },
          description: 'Répartition des réservations par type ou destination'
        },
        401: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Utilisateur non authentifié'
        },
        403: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Accès interdit (admin uniquement)'
        }
      },
      tags: ['Admin'],
      summary: 'Répartition des réservations',
      description: 'Retourne la répartition des réservations par type ou destination (admin uniquement)'
    })
    this.controller.openapi(getBookingDistributionRoute, async (c: any) => {
      const user = c.get('user')
      if (!user || !user.isAdmin) return c.json({ error: 'Accès interdit' }, user ? 403 : 401)
      const useCase = new GetBookingDistributionUseCase()
      const result = await useCase.execute()
      return c.json(result, 200)
    })

    // --- Réservations annulées ---
    const cancelledBookingsSchema = z.object({
      cancelledBookings: z.array(
        z.object({
          bookingId: z.string(),
          userName: z.string(),
          tripId: z.string(),
          routeLabel: z.string(),
          bookedAt: z.string(),
          status: z.string()
        })
      )
    })
    const getCancelledBookingsRoute = createRoute({
      method: 'get',
      path: '/admin/dashboard/cancelled-bookings',
      responses: {
        200: {
          content: { 'application/json': { schema: cancelledBookingsSchema } },
          description: 'Liste des réservations annulées'
        },
        401: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Utilisateur non authentifié'
        },
        403: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Accès interdit (admin uniquement)'
        }
      },
      tags: ['Admin'],
      summary: 'Réservations annulées',
      description: 'Retourne la liste des réservations annulées (admin uniquement)'
    })
    this.controller.openapi(getCancelledBookingsRoute, async (c: any) => {
      const user = c.get('user')
      if (!user || !user.isAdmin) return c.json({ error: 'Accès interdit' }, user ? 403 : 401)
      const useCase = new GetCancelledBookingsUseCase()
      const result = await useCase.execute()
      return c.json(result, 200)
    })

    // --- Voyages annulés ---
    const cancelledTripsSchema = z.object({
      cancelledTrips: z.array(
        z.object({
          tripId: z.string(),
          routeLabel: z.string(),
          departureDate: z.string(),
          status: z.string()
        })
      )
    })
    const getCancelledTripsRoute = createRoute({
      method: 'get',
      path: '/admin/dashboard/cancelled-departures',
      responses: {
        200: {
          content: { 'application/json': { schema: cancelledTripsSchema } },
          description: 'Liste des voyages annulés'
        },
        401: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Utilisateur non authentifié'
        },
        403: {
          content: { 'application/json': { schema: z.object({ error: z.string() }) } },
          description: 'Accès interdit (admin uniquement)'
        }
      },
      tags: ['Admin'],
      summary: 'Voyages annulés',
      description: 'Retourne la liste des voyages annulés (admin uniquement)'
    })
    this.controller.openapi(getCancelledTripsRoute, async (c: any) => {
      const user = c.get('user')
      if (!user || !user.isAdmin) return c.json({ error: 'Accès interdit' }, user ? 403 : 401)
      const useCase = new GetCancelledTripsUseCase()
      const result = await useCase.execute()
      return c.json(result, 200)
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

    const getUserBookingsRoute = createRoute({
      method: 'get',
      path: '/user/bookings',
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
          description: "Liste paginée des réservations de l'utilisateur"
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
      summary: 'Lister toutes les réservations',
      description: 'Retourne la liste paginée de toutes les réservations'
    })
    this.controller.openapi(getUserBookingsRoute, async (c: any) => {
      const user = c.get('user')
      if (!user) {
        return c.json({ error: 'Accès interdit' }, user ? 403 : 401)
      }
      const { page = '1', limit = '20' } = c.req.valid('query')
      const pageNum = Math.max(1, Number.parseInt(page))
      const limitNum = Math.max(1, Math.min(100, Number.parseInt(limit)))

      try {
        const getAdminBookingsUseCase = new GetAdminBookingsUseCase()
        const result = await getAdminBookingsUseCase.execute({
          userId: user.id,
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
            id: booking.bookingId,
            tripId: booking.tripId,
            routeLabel:
              route.departureCity && route.arrivalCity ? `${route.departureCity} - ${route.arrivalCity}` : null,
            departureDate: trip.departureDate || null,
            // arrivalDate supprimé
            driverId: driver.id || null,
            driverName: driver.firstName && driver.lastName ? `${driver.firstName} ${driver.lastName}` : null,
            driverPhone: driver.phone || null,
            vehicleId: vehicle.model && vehicle.registration ? `${vehicle.model}-${vehicle.registration}` : null,
            vehicleModel: vehicle.model || null,
            vehiclePlate: vehicle.plate || null,
            // Infos utilisateur à plat
            userId: user.id || null,
            userName: user.name || null,
            userFirstname: user.firstname || null,
            userLastname: user.lastname || null,
            userEmail: user.email || null,
            userFullName: user.firstname && user.lastname ? `${user.firstname} ${user.lastname}` : user.name || null,
            seatIds: booking.seatIds,
            totalPrice: booking.totalPrice ?? '0',
            status: booking.status ?? 'pending',
            bookedAt: booking.bookedAt ? booking.bookedAt : null,
            seats: booking.seats,
            seatNumbers: (booking.seats || [])
              .map((s: any) => {
                let hour = ''
                if (s.schedule && s.schedule.departureTime) {
                  if (/^\d{2}:\d{2}$/.test(s.schedule.departureTime)) {
                    hour = `(${s.schedule.departureTime})`
                  } else if (
                    typeof s.schedule.departureTime === 'string' &&
                    !Number.isNaN(Date.parse(s.schedule.departureTime))
                  ) {
                    const d = new Date(s.schedule.departureTime)
                    hour = ` • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  }
                }
                return s.seatNumber ? `${s.seatNumber} ${hour}`.trim() : null
              })
              .filter(Boolean)
              .join(', ')
          }
        })
        return c.json(
          {
            ...result,
            data: {
              data: enriched,
              pagination: {
                page: pageNum,
                limit: limitNum,
                total: result.total
              },
              stats: result.stats ? result.stats : {}
            }
          },
          200
        )
      } catch (error: any) {
        console.log('err', error)
        return c.json({ error: 'Erreur lors de la récupération des réservations' }, 400)
      }
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
            id: booking.bookingId,
            tripId: booking.tripId,
            routeLabel:
              route.departureCity && route.arrivalCity ? `${route.departureCity} - ${route.arrivalCity}` : null,
            departureDate: trip.departureDate || null,
            // arrivalDate supprimé
            driverId: driver.id || null,
            driverName: driver.firstName && driver.lastName ? `${driver.firstName} ${driver.lastName}` : null,
            driverPhone: driver.phone || null,
            vehicleId: vehicle.model && vehicle.registration ? `${vehicle.model}-${vehicle.registration}` : null,
            vehicleModel: vehicle.model || null,
            vehiclePlate: vehicle.plate || null,
            // Infos utilisateur à plat
            userId: user.id || null,
            userName: user.name || null,
            userFirstname: user.firstname || null,
            userLastname: user.lastname || null,
            userEmail: user.email || null,
            userFullName: user.firstname && user.lastname ? `${user.firstname} ${user.lastname}` : user.name || null,
            seatIds: booking.seatIds,
            totalPrice: booking.totalPrice ?? '0',
            status: booking.status ?? 'pending',
            bookedAt: booking.bookedAt ? booking.bookedAt : null,
            seats: booking.seats,
            seatNumbers: (booking.seats || [])
              .map((s: any) => {
                let hour = ''
                if (s.schedule && s.schedule.departureTime) {
                  if (/^\d{2}:\d{2}$/.test(s.schedule.departureTime)) {
                    hour = `(${s.schedule.departureTime})`
                  } else if (
                    typeof s.schedule.departureTime === 'string' &&
                    !Number.isNaN(Date.parse(s.schedule.departureTime))
                  ) {
                    const d = new Date(s.schedule.departureTime)
                    hour = ` • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  }
                }
                return s.seatNumber ? `${s.seatNumber} ${hour}`.trim() : null
              })
              .filter(Boolean)
              .join(', ')
          }
        })
        return c.json({ ...result, data: enriched }, 200)
      } catch (error: any) {
        console.log('err', error)
        return c.json({ error: 'Erreur lors de la récupération des réservations' }, 400)
      }
    })
  }
}
