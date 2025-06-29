import { db } from '../../../infrastructure/database/db/index'
import { routes, trips } from '../../../infrastructure/database/schema/schema'

export class GetCancelledTripsUseCase {
  async execute(limit = 20) {
    const allTrips = await db.select().from(trips)
    const allRoutes = await db.select().from(routes)
    const cancelledTrips = allTrips
      .filter((trip) => trip.status === 'cancelled')
      .sort((a, b) =>
        b.departureDate && a.departureDate
          ? new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime()
          : 0
      )
      .slice(0, limit)
      .map((trip) => {
        const route = allRoutes.find((r) => r.id === trip.routeId)
        return {
          tripId: trip.id,
          routeLabel: route ? `${route.departureCity} - ${route.arrivalCity}` : '',
          departureDate: trip.departureDate ? new Date(trip.departureDate).toISOString() : '',
          status: trip.status || ''
        }
      })
    return { cancelledTrips }
  }
}
