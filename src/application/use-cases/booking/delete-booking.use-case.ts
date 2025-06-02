import { and, eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db/index'
import { bookings, bookingSeats } from '../../../infrastructure/database/schema/schema'

interface DeleteBookingInput {
  bookingId: string
  userId: string
}

interface DeleteBookingOutput {
  success: boolean
  message?: string
  error?: string
}

export class DeleteBookingUseCase {
  public async execute(input: DeleteBookingInput): Promise<DeleteBookingOutput> {
    const { bookingId, userId } = input

    try {
      const existingBooking = await db
        .select()
        .from(bookings)
        .where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
        .then((r) => r[0])

      if (!existingBooking) {
        return { success: false, error: 'Réservation non trouvée' }
      }

      // Supprimer d'abord les sièges associés
      await db.delete(bookingSeats).where(eq(bookingSeats.bookingId, bookingId))

      // Puis supprimer la réservation
      await db.delete(bookings).where(eq(bookings.id, bookingId))

      return { success: true, message: 'Réservation supprimée avec succès' }
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la réservation:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}

// test: booking flow tests - Development on 2025-06-02
