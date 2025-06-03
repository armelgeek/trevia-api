import { eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db/index'
import { bookings, payments } from '../../../infrastructure/database/schema/schema'

interface GetPaymentsInput {
  userId: string
}

interface PaymentData {
  paymentId: string
  bookingId: string
  amount: string
  paymentMethod: string
  status: string
  paymentDate: string | null
}

interface GetPaymentsOutput {
  success: boolean
  data?: PaymentData[]
  error?: string
}

export class GetPaymentsUseCase {
  public async execute(input: GetPaymentsInput): Promise<GetPaymentsOutput> {
    const { userId } = input

    try {
      // Récupérer tous les paiements des réservations de l'utilisateur
      const userPayments = await db
        .select({
          paymentId: payments.id,
          bookingId: payments.bookingId,
          amount: payments.amount,
          paymentMethod: payments.paymentMethod,
          status: payments.status,
          paymentDate: payments.paymentDate
        })
        .from(payments)
        .leftJoin(bookings, eq(payments.bookingId, bookings.id))
        .where(eq(bookings.userId, userId))

      const formattedPayments: PaymentData[] = userPayments.map((payment) => ({
        paymentId: payment.paymentId || '',
        bookingId: payment.bookingId || '',
        amount: payment.amount || '0',
        paymentMethod: payment.paymentMethod || '',
        status: payment.status || 'pending',
        paymentDate: payment.paymentDate ? payment.paymentDate.toISOString() : null
      }))

      return {
        success: true,
        data: formattedPayments
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des paiements:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}

// feat: implement payment processing - Development on 2025-06-03
