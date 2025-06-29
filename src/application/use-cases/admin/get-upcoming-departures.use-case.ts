import { db } from '../../../infrastructure/database/db/index'
import { bookings, bookingSeats, routes, schedules, seats, trips } from '../../../infrastructure/database/schema/schema'

export class GetUpcomingDeparturesUseCase {
  async execute(limit = 20) {
    const allTrips = await db.select().from(trips)
    const allSchedules = await db.select().from(schedules)
    const allSeats = await db.select().from(seats)
    const allBookingSeats = await db.select().from(bookingSeats)
    const allRoutes = await db.select().from(routes)
    const confirmedBookings = (await db.select().from(bookings)).filter((b) => b.status === 'confirmed')
    const now = new Date()
    const upcomingTrips = allTrips.filter(
      (trip) => trip.departureDate && trip.departureDate >= now && trip.status !== 'cancelled'
    )
    const upcomingDepartures = allSchedules
      .filter((schedule) => upcomingTrips.some((t) => t.id === schedule.tripId))
      .map((schedule) => {
        const trip = upcomingTrips.find((t) => t.id === schedule.tripId)
        if (!trip) return null
        const route = allRoutes.find((r) => r.id === trip.routeId)
        const seatsForSchedule = allSeats.filter((seat) => seat.scheduleId === schedule.id)
        const totalSeatsSchedule = seatsForSchedule.length
        const bookingsForSchedule = confirmedBookings.filter((b) => b.tripId === trip.id)
        const bookingSeatIds = allBookingSeats
          .filter((bs) => bookingsForSchedule.some((b) => b.id === bs.bookingId))
          .map((bs) => bs.seatId)
        const reservedSeatsSchedule = seatsForSchedule.filter((seat) => bookingSeatIds.includes(seat.id)).length
        const occupancy = totalSeatsSchedule > 0 ? Math.round((reservedSeatsSchedule / totalSeatsSchedule) * 100) : 0
        return {
          scheduleId: schedule.id,
          tripId: trip.id,
          routeLabel: `${route?.departureCity || ''} - ${route?.arrivalCity || ''}`,
          departureTime: schedule.departureTime || '',
          occupancy,
          status: trip.status || 'scheduled'
        }
      })
      .filter(
        (
          s
        ): s is {
          scheduleId: string
          tripId: string
          routeLabel: string
          departureTime: string
          occupancy: number
          status: string
        } => s !== null
      )
      .sort((a, b) => (a.departureTime > b.departureTime ? 1 : -1))
      .slice(0, limit)
    return { upcomingDepartures }
  }
}
