import { db } from '../../../infrastructure/database/db/index'
import { bookings, routes, trips } from '../../../infrastructure/database/schema/schema'

export class GetBookingDistributionUseCase {
  async execute() {
    const bookingsAll = await db.select().from(bookings)
    const allTrips = await db.select().from(trips)
    const allRoutes = await db.select().from(routes)
    // Distribution par type
    const typeCount: Record<string, number> = {}
    bookingsAll.forEach((b) => {
      if ((b as any).type) typeCount[(b as any).type] = (typeCount[(b as any).type] || 0) + 1
    })
    const byType = Object.entries(typeCount).map(([type, count]) => ({ type, count }))
    // Distribution par destination
    const destCount: Record<string, number> = {}
    bookingsAll.forEach((b) => {
      const trip = allTrips.find((t) => t.id === b.tripId)
      if (trip && trip.routeId) {
        const route = allRoutes.find((r) => r.id === trip.routeId)
        if (route && route.arrivalCity) {
          destCount[route.arrivalCity] = (destCount[route.arrivalCity] || 0) + 1
        }
      }
    })
    const byDestination = Object.entries(destCount).map(([destination, count]) => ({ destination, count }))
    return { bookingDistribution: { byType, byDestination } }
  }
}
