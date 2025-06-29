import { db } from '../../../infrastructure/database/db/index'
import { bookings, bookingSeats, routes, schedules, seats, trips } from '../../../infrastructure/database/schema/schema'

export class GetLowOccupancyTripsUseCase {
  async execute() {
    const now = new Date()
    const allTrips = await db.select().from(trips)
    const allSeats = await db.select().from(seats)
    const allBookingSeats = await db.select().from(bookingSeats)
    const allRoutes = await db.select().from(routes)
    const allSchedules = await db.select().from(schedules)
    const confirmedBookings = (await db.select().from(bookings)).filter((b) => b.status === 'confirmed')
    const upcomingTrips = allTrips.filter(
      (trip) => trip.departureDate && trip.departureDate >= now && trip.status !== 'cancelled'
    )
    const lowOccupancyTrips = upcomingTrips
      .map((trip) => {
        const route = allRoutes.find((r) => r.id === trip.routeId)
        // Adapter pour utiliser scheduleId -> tripId
        const schedulesForTrip = allSchedules.filter((schedule) => schedule.tripId === trip.id)
        const scheduleIdsForTrip = schedulesForTrip.map((schedule) => schedule.id)
        const seatsForTrip = allSeats.filter((seat) => seat.scheduleId && scheduleIdsForTrip.includes(seat.scheduleId))
        const totalSeats = seatsForTrip.length
        const bookingsForTrip = confirmedBookings.filter((b) => b.tripId === trip.id)
        const bookingSeatIds = allBookingSeats
          .filter((bs) => bookingsForTrip.some((b) => b.id === bs.bookingId))
          .map((bs) => bs.seatId)
        const reservedSeats = seatsForTrip.filter((seat) => bookingSeatIds.includes(seat.id)).length
        const occupancy = totalSeats > 0 ? Math.round((reservedSeats / totalSeats) * 100) : 0
        return {
          tripId: trip.id,
          label: `${route?.departureCity || ''} - ${route?.arrivalCity || ''} ${trip.departureDate ? new Date(trip.departureDate).toISOString().slice(0, 16) : ''}`,
          occupancy
        }
      })
      .filter((t) => t.occupancy < 30)
    const alerts =
      lowOccupancyTrips.length > 0
        ? [`Attention : ${lowOccupancyTrips.length} voyage(s) à faible taux d’occupation (<30%)`]
        : []
    return { lowOccupancyTrips, alerts }
  }
}
