import { db } from '../../../infrastructure/database/db/index'
import { bookings, routes, trips } from '../../../infrastructure/database/schema/schema'

export class GetTopDestinationsUseCase {
  async execute(limit = 5) {
    const bookingsAll = await db.select().from(bookings)
    const allTrips = await db.select().from(trips)
    const allRoutes = await db.select().from(routes)
    const date30dAgo = new Date()
    date30dAgo.setDate(date30dAgo.getDate() - 30)
    const bookingsLast30d = bookingsAll.filter((b) => b.bookedAt && new Date(b.bookedAt) >= date30dAgo)
    const routeBookingCount: Record<string, number> = {}
    bookingsLast30d.forEach((b) => {
      const trip = allTrips.find((t) => t.id === b.tripId)
      if (trip && trip.routeId) {
        routeBookingCount[trip.routeId] = (routeBookingCount[trip.routeId] || 0) + 1
      }
    })
    const topDestinations = Object.entries(routeBookingCount)
      .map(([routeId, bookings]) => {
        const route = allRoutes.find((r) => r.id === routeId)
        return {
          routeId,
          routeLabel: route ? `${route.departureCity} - ${route.arrivalCity}` : '',
          bookings
        }
      })
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, limit)
    return { topDestinations }
  }
}
