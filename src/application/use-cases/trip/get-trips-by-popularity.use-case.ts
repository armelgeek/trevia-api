import { db } from '../../../infrastructure/database/db/index'
import { bookings, drivers, routes, schedules, trips, vehicles } from '../../../infrastructure/database/schema/schema'
import { sql, eq, and, count, desc, inArray } from 'drizzle-orm'

export interface GetTripsByPopularityInput {
  page?: string
  limit?: string
}

export interface TripPopularityData {
  tripId: string
  routeLabel: string
  departureDate: string | null
  bookingsCount: number
  price: number | null
  availableTimes: string[]
  duration: number | null
  driverName: string | null
  vehicleModel: string | null
}

export interface GetTripsByPopularityOutput {
  success: boolean
  data?: TripPopularityData[]
  page?: number
  limit?: number
  total?: number
  error?: string
}

export class GetTripsByPopularityUseCase {
  public async execute(input: GetTripsByPopularityInput): Promise<GetTripsByPopularityOutput> {
    const { page = '1', limit = '20' } = input
    const pageNum = Math.max(1, Number.parseInt(page))
    const limitNum = Math.max(1, Math.min(100, Number.parseInt(limit)))
    const offset = (pageNum - 1) * limitNum

    try {
      const rows = await db
        .select({
          tripId: trips.id,
          departureDate: trips.departureDate,
          price: trips.price,
          routeDeparture: routes.departureCity,
          routeArrival: routes.arrivalCity,
          driverFirstName: drivers.firstName,
          driverLastName: drivers.lastName,
          vehicleModel: vehicles.model,
          bookingsCount: count(bookings.id).as('bookingsCount'),
          duration: routes.duration
        })
        .from(trips)
        .leftJoin(bookings, eq(bookings.tripId, trips.id))
        .leftJoin(routes, eq(routes.id, trips.routeId))
        .leftJoin(drivers, eq(drivers.id, trips.driverId))
        .leftJoin(vehicles, eq(vehicles.id, trips.vehicleId))
        .groupBy(
          trips.id,
          routes.departureCity,
          routes.arrivalCity,
          drivers.firstName,
          drivers.lastName,
          vehicles.model,
          routes.duration,
          trips.departureDate,
          trips.price
        )
        .orderBy(desc(count(bookings.id)))
        .limit(limitNum)
        .offset(offset)
        .execute()

      // For each trip, get available times (from schedules)
      const tripIds = rows.map((r) => r.tripId)
      let availableTimesMap: Record<string, string[]> = {}
      if (tripIds.length > 0) {
        const schedulesRows = await db
          .select({ tripId: schedules.tripId, departureTime: schedules.departureTime })
          .from(schedules)
          .where(inArray(schedules.tripId, tripIds))
          .execute()
        availableTimesMap = schedulesRows.reduce((acc, s) => {
          if (!acc[s.tripId]) acc[s.tripId] = []
          if (s.departureTime) acc[s.tripId].push(s.departureTime)
          return acc
        }, {} as Record<string, string[]>)
      }

      const data: TripPopularityData[] = rows.map(row => ({
        tripId: row.tripId,
        routeLabel: [row.routeDeparture, row.routeArrival].filter(Boolean).join(' - '),
        departureDate: row.departureDate ? new Date(row.departureDate).toISOString() : null,
        bookingsCount: Number(row.bookingsCount),
        price: row.price ? Number(row.price) : null,
        availableTimes: availableTimesMap[row.tripId] || [],
        duration: row.duration ? Number(row.duration) : null,
        driverName: row.driverFirstName && row.driverLastName ? `${row.driverFirstName} ${row.driverLastName}` : null,
        vehicleModel: row.vehicleModel || null
      }))

      // Get total count
      const totalRows = await db
        .select({ tripId: trips.id })
        .from(trips)
        .execute()
      const total = totalRows.length

      return { success: true, data, page: pageNum, limit: limitNum, total }
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erreur lors de la récupération des voyages populaires' }
    }
  }
}
