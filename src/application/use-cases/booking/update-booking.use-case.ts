import { and, eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db/index'
import { bookings } from '../../../infrastructure/database/schema/schema'

interface UpdateBookingInput {
  bookingId: string
  userId: string
  status?: string
}

interface UpdateBookingOutput {
  success: boolean
  data?: any
  error?: string
}

export class UpdateBookingUseCase {
  public async execute(input: UpdateBookingInput): Promise<UpdateBookingOutput> {
    const { bookingId, userId, status } = input

    try {
      const existingBooking = await db
        .select()
        .from(bookings)
        .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
        .then((r) => r[0])

      if (!existingBooking) {
        return { success: false, error: 'Réservation non trouvée' }
      }

      const updatedBooking = await db
        .update(bookings)
        .set({
          status: status || existingBooking.status
        })
        .where(eq(bookings.id, bookingId))
        .returning()

      return { success: true, data: updatedBooking[0] }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la réservation:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}
