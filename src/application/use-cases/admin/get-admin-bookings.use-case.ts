import { count, eq, inArray } from 'drizzle-orm'
import { ActivityType } from '../../../infrastructure/config/activity.config'
import { db } from '../../../infrastructure/database/db/index'
import {
  bookings,
  bookingSeats,
  drivers,
  routes,
  schedules,
  seats,
  trips,
  users,
  vehicles
} from '../../../infrastructure/database/schema/schema'

export interface GetAdminBookingsRequest {
  userId?: string // Optionnel, si on veut filtrer par utilisateur
  page: number
  limit: number
}

export interface BookingSummary {
  bookingId: string
  tripId: string
  seatIds: string[]
  seats?: Array<{ seatId: string; seatNumber?: string; seatType?: string; row?: string; col?: string }>
  totalPrice: string
  status: string
  bookedAt: string | null
  trip?: any
  driver?: any
  vehicle?: any
  route?: any
  user?: any
}

export interface GetAdminBookingsStats {
  totalTrips: number
  confirmedTrips: number
  completedTrips: number
  totalSpent: number
}

export interface GetAdminBookingsResponse {
  data: BookingSummary[]
  page: number
  limit: number
  total: number
  stats?: GetAdminBookingsStats
}

export class GetAdminBookingsUseCase {
  async execute(request: GetAdminBookingsRequest): Promise<GetAdminBookingsResponse> {
    const { page, limit, userId } = request
    const offset = (page - 1) * limit

    // Récupérer le total des bookings (pour la pagination) - utilisation de count()
    const [totalResult] = await db.select({ count: count() }).from(bookings)
    const total = totalResult.count

    // Requête paginée avec jointures pour enrichir chaque réservation
    // On peut filtrer par userId si fourni
    let rows = []
    if (userId) {
      rows = await db
        .select()
        .from(bookings)
        .leftJoin(trips, eq(bookings.tripId, trips.id))
        .leftJoin(drivers, eq(trips.driverId, drivers.id))
        .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
        .leftJoin(routes, eq(trips.routeId, routes.id))
        .leftJoin(users, eq(bookings.userId, users.id))
        .where(eq(bookings.userId, userId))
        .limit(limit)
        .offset(offset)
        .orderBy(bookings.bookedAt) // Ajout d'un ordre pour la cohérence
    } else {
      // Si pas de userId, on récupère tous les bookings
      rows = await db
        .select()
        .from(bookings)
        .leftJoin(trips, eq(bookings.tripId, trips.id))
        .leftJoin(drivers, eq(trips.driverId, drivers.id))
        .leftJoin(vehicles, eq(trips.vehicleId, vehicles.id))
        .leftJoin(routes, eq(trips.routeId, routes.id))
        .leftJoin(users, eq(bookings.userId, users.id))
        .limit(limit)
        .offset(offset)
        .orderBy(bookings.bookedAt) // Ajout d'un ordre pour la cohérence
    }
    // Récupérer les seatIds pour chaque booking (requête séparée, inArray)
    const bookingIds = rows.map((row) => row.bookings.id).filter(Boolean)
    let seatMap: Record<string, string[]> = {}
    let allSeatIds: string[] = []
    if (bookingIds.length) {
      const seatRows = await db.select().from(bookingSeats).where(inArray(bookingSeats.bookingId, bookingIds))
      seatMap = seatRows.reduce(
        (acc, curr) => {
          if (!curr.bookingId) return acc
          const key = curr.bookingId as string
          if (!acc[key]) acc[key] = []
          if (curr.seatId) acc[key].push(curr.seatId as string)
          return acc
        },
        {} as Record<string, string[]>
      )
      allSeatIds = seatRows.map((s) => s.seatId).filter((id): id is string => typeof id === 'string')
    }
    // Récupérer les infos des seats réservés (numéro, type...)
    let seatDetailsMap: Record<string, any> = {}
    let allScheduleIds: string[] = []
    if (allSeatIds.length) {
      const seatDetails = await db.select().from(seats).where(inArray(seats.id, allSeatIds))
      seatDetailsMap = seatDetails.reduce(
        (acc, seat) => {
          acc[seat.id] = seat
          return acc
        },
        {} as Record<string, any>
      )
      allScheduleIds = seatDetails.map((s) => s.scheduleId).filter((id): id is string => !!id)
    }
    // Récupérer les schedules associés aux seats
    let scheduleMap: Record<string, any> = {}
    if (allScheduleIds.length) {
      const scheduleRows = await db.select().from(schedules).where(inArray(schedules.id, allScheduleIds))
      scheduleMap = scheduleRows.reduce(
        (acc, sch) => {
          acc[sch.id] = sch
          return acc
        },
        {} as Record<string, any>
      )
    }
    const data: BookingSummary[] = rows.map((row) => {
      const b = row.bookings
      const seatIds = seatMap[b.id] ?? []
      const seatsArr = seatIds.map((sid) => {
        const s = seatDetailsMap[sid] || {}
        const schedule = s.scheduleId ? scheduleMap[s.scheduleId] || null : null
        return {
          seatId: sid,
          seatNumber: s.seatNumber || null,
          seatType: s.seatType || null,
          row: s.row || null,
          col: s.col || null,
          schedule
        }
      })
      const seatNumbers = seatsArr
        .map((s) => s.seatNumber)
        .filter(Boolean)
        .join(', ')
      return {
        bookingId: b.id,
        tripId: b.tripId ?? '',
        totalPrice: b.totalPrice ?? '0',
        status: b.status ?? 'pending',
        bookedAt: b.bookedAt ? b.bookedAt.toISOString() : null,
        trip: row.trips ?? null,
        driver: row.drivers ?? null,
        vehicle: row.vehicles ?? null,
        route: row.routes ?? null,
        user: row.users ?? null,
        seatIds,
        seats: seatsArr,
        seatNumbers
      }
    })

    // Statistiques utilisateur si userId défini
    let stats: GetAdminBookingsStats | undefined = undefined
    if (userId) {
      // Récupérer tous les bookings de l'utilisateur pour les stats
      const allUserBookings = await db.select().from(bookings).where(eq(bookings.userId, userId))

      const totalTrips = allUserBookings.length
      const confirmedTrips = allUserBookings.filter((b) => b.status === 'pending').length
      const completedTrips = allUserBookings.filter((b) => b.status === 'paid').length
      const totalSpent = allUserBookings.reduce((sum, b) => sum + (Number.parseFloat(b.totalPrice || '0') || 0), 0)

      stats = {
        totalTrips,
        confirmedTrips,
        completedTrips,
        totalSpent: Math.round(totalSpent)
      }
    }

    return {
      data,
      page,
      limit,
      total,
      ...(stats ? { stats } : {})
    }
  }

  log(): ActivityType {
    return ActivityType.TEST
  }
}

// feat: create admin panel functionality - Development on 2025-06-09
// feat: implement admin dashboard - Development on 2025-06-09
