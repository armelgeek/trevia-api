import { db } from '../../../infrastructure/database/db/index'
import { bookings, routes, trips, users } from '../../../infrastructure/database/schema/schema'

export class GetCancelledBookingsUseCase {
  async execute(limit = 10) {
    const bookingsAll = await db.select().from(bookings)
    const allTrips = await db.select().from(trips)
    const allRoutes = await db.select().from(routes)
    const allUsers = await db.select().from(users)
    const cancelledBookings = bookingsAll
      .filter((b) => b.status === 'cancelled')
      .sort((a, b) => (b.bookedAt && a.bookedAt ? new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime() : 0))
      .slice(0, limit)
      .map((booking) => {
        const user = booking.userId ? allUsers.find((u) => u.id === booking.userId) : null
        const trip = allTrips.find((t) => t.id === booking.tripId)
        const route = trip ? allRoutes.find((r) => r.id === trip.routeId) : null
        return {
          bookingId: booking.id,
          userName: user ? user.name || user.email || user.id : booking.userId || '',
          tripId: trip ? trip.id : '',
          routeLabel: route ? `${route.departureCity} - ${route.arrivalCity}` : '',
          bookedAt: booking.bookedAt
            ? typeof booking.bookedAt === 'string'
              ? booking.bookedAt
              : new Date(booking.bookedAt).toISOString()
            : '',
          status: booking.status || ''
        }
      })
    return { cancelledBookings }
  }
}
