import { eq } from 'drizzle-orm'
import { IUseCase } from '../../../domain/types/use-case.type'
import { ActivityType } from '../../../infrastructure/config/activity.config'
import { db } from '../../../infrastructure/database/db/index'
import { payments } from '../../../infrastructure/database/schema/schema'

export interface GetPaymentStatusRequest {
  bookingId: string
}

export interface PaymentStatusResponse {
  bookingId: string
  amount: string
  paymentMethod: string
  paymentDate: string | null
  status: string
  bankRef: string | null
}

export class GetPaymentStatusUseCase extends IUseCase<GetPaymentStatusRequest, PaymentStatusResponse> {
  async execute(request: GetPaymentStatusRequest): Promise<PaymentStatusResponse> {
    const { bookingId } = request

    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.bookingId, bookingId))
      .then((r) => r[0])

    if (!payment) {
      throw new Error('Paiement non trouvé')
    }

    return {
      bookingId: payment.bookingId ?? '',
      amount: payment.amount ?? '0',
      paymentMethod: payment.paymentMethod ?? '',
      paymentDate: payment.paymentDate ? payment.paymentDate.toISOString() : null,
      status: payment.status ?? 'pending',
      bankRef: payment.bankRef ?? null
    }
  }

  log(): ActivityType {
    return ActivityType.TEST
  }
}

// fix: payment error handling - Development on 2025-06-04
