import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db/index'
import { bookings, bookingSeats, schedules, seats, trips } from '../../../infrastructure/database/schema/schema'

interface GetBookingByIdInput {
  bookingId: string
  userId: string
}

interface GetBookingByIdOutput {
  success: boolean
  data?: any
  error?: string
}

export class GetBookingByIdUseCase {
  public async execute(input: GetBookingByIdInput): Promise<GetBookingByIdOutput> {
    const { bookingId, userId } = input

    try {
      const booking = await db
        .select()
        .from(bookings)
        .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
        .then((r) => r[0])

      if (!booking) {
        return { success: false, error: 'Réservation non trouvée' }
      }

      const trip = await db
        .select()
        .from(trips)
        .where(eq(trips.id, booking.tripId!))
        .then((r) => r[0])

      const seatIds = await db
        .select({ seatId: bookingSeats.seatId })
        .from(bookingSeats)
        .where(eq(bookingSeats.bookingId, bookingId))
        .then((rows) => rows.map((row) => row.seatId))

      const schedule = await db
        .select()
        .from(schedules)
        .where(eq(schedules.id, booking.scheduleId!))
        .then((r) => r[0])

      const seatNumbers = await db
        .select({ seatNumber: seats.seatNumber })
        .from(seats)
        .where(inArray(seats.id, seatIds.filter((id) => id !== null) as string[]))
        .then((rows) => rows.map((row) => row.seatNumber))

      const enrichedBooking = {
        ...booking,
        trip,
        schedule,
        seatIds,
        seatNumbers
      }

      return { success: true, data: enrichedBooking }
    } catch (error: any) {
      console.error('Erreur lors de la récupération de la réservation:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}
// feat: create booking system - Development on 2025-06-01

// feat: add booking confirmation - Development on 2025-06-01
