import { eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db/index'
import { bookings, bookingSeats, seats } from '../../../infrastructure/database/schema/schema'

interface GetScheduleSeatsInput {
  scheduleId: string
}

interface GetScheduleSeatsOutput {
  success: boolean
  data?: any[]
  error?: string
}

export class GetScheduleSeatsUseCase {
  public async execute(input: GetScheduleSeatsInput): Promise<GetScheduleSeatsOutput> {
    const { scheduleId } = input

    try {
      // Récupérer tous les sièges pour cet horaire
      const seatsList = await db.select().from(seats).where(eq(seats.scheduleId, scheduleId))

      // Récupérer les sièges déjà réservés pour cet horaire
      const bookedSeats = await db
        .select({ seatId: bookingSeats.seatId })
        .from(bookingSeats)
        .leftJoin(bookings, eq(bookingSeats.bookingId, bookings.id))
        .where(eq(bookings.scheduleId, scheduleId))

      const occupiedSeatIds = bookedSeats.map((bs) => bs.seatId)

      // Marquer les sièges comme occupés ou libres
      const seatsWithStatus = seatsList.map((seat) => ({
        ...seat,
        isOccupied: occupiedSeatIds.includes(seat.id)
      }))

      return { success: true, data: seatsWithStatus }
    } catch (error: any) {
      console.error("Erreur lors de la récupération des sièges de l'horaire:", error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}

// feat: create monitoring dashboard - Development on 2025-06-17
