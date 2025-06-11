import { eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db/index'
import { bookings, payments } from '../../../infrastructure/database/schema/schema'

interface CreatePaymentInput {
  bookingId: string
  amount: string
  paymentMethod: string
  userId: string
}

interface CreatePaymentOutput {
  success: boolean
  data?: {
    paymentId: string
    bookingId: string
    amount: string
    paymentMethod: string
    status: string
    paymentDate: string | null
  }
  error?: string
}

export class CreatePaymentUseCase {
  public async execute(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
    const { bookingId, amount, paymentMethod, userId } = input

    try {
      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .then((r) => r[0])

      if (!booking) {
        return { success: false, error: 'Réservation non trouvée' }
      }

      if (booking.userId !== userId) {
        return { success: false, error: 'Accès interdit à cette réservation' }
      }

      const paymentId = crypto.randomUUID()
      const newPayment = await db
        .insert(payments)
        .values({
          id: paymentId,
          bookingId,
          amount,
          paymentMethod,
          status: 'pending',
          paymentDate: new Date()
        })
        .returning()

      if (!newPayment[0]) {
        return { success: false, error: 'Erreur lors de la création du paiement' }
      }

      return {
        success: true,
        data: {
          paymentId: newPayment[0].id,
          bookingId: newPayment[0].bookingId!,
          amount: newPayment[0].amount!,
          paymentMethod: newPayment[0].paymentMethod!,
          status: newPayment[0].status!,
          paymentDate: newPayment[0].paymentDate ? newPayment[0].paymentDate.toISOString() : null
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du paiement:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}
