import { and, eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db/index'
import { bookings, bookingSeats, seats, trips } from '../../../infrastructure/database/schema/schema'

interface GetTripSeatsInput {
  tripId: string
  scheduleId?: string
}

interface GetTripSeatsOutput {
  success: boolean
  data?: any[]
  error?: string
}

export class GetTripSeatsUseCase {
  public async execute(input: GetTripSeatsInput): Promise<GetTripSeatsOutput> {
    const { tripId, scheduleId } = input

    try {
      let seatsList: any[] = []

      if (scheduleId) {
        seatsList = await db.select().from(seats).where(eq(seats.scheduleId, scheduleId))
      } else {
        // Si pas de scheduleId, récupérer tous les sièges du véhicule
        const trip = await db
          .select()
          .from(trips)
          .where(eq(trips.id, tripId))
          .then((r) => r[0])
        if (!trip?.vehicleId) {
          return { success: false, error: 'Voyage ou véhicule non trouvé' }
        }
        seatsList = await db.select().from(seats).where(eq(seats.vehicleId, trip.vehicleId))
      }

      // Récupérer les sièges déjà réservés
      const bookedSeats = await db
        .select({ seatId: bookingSeats.seatId })
        .from(bookingSeats)
        .leftJoin(bookings, eq(bookingSeats.bookingId, bookings.id))
        .where(
          scheduleId
            ? and(eq(bookings.tripId, tripId), eq(bookings.scheduleId, scheduleId))
            : eq(bookings.tripId, tripId)
        )

      const occupiedSeatIds = bookedSeats.map((bs) => bs.seatId)

      // Marquer les sièges comme occupés ou libres
      const seatsWithStatus = seatsList.map((seat) => ({
        ...seat,
        isOccupied: occupiedSeatIds.includes(seat.id)
      }))

      return { success: true, data: seatsWithStatus }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des sièges:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}

// feat: create trip model and schema - Development on 2025-05-30
