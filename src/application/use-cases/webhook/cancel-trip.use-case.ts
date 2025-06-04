import { eq } from 'drizzle-orm'
import Stripe from 'stripe'
import { IUseCase } from '../../../domain/types/use-case.type'
import { ActivityType } from '../../../infrastructure/config/activity.config'
import { sendEmail } from '../../../infrastructure/config/mail.config'
import { db } from '../../../infrastructure/database/db'
import { bookings, payments } from '../../../infrastructure/database/schema/schema'

const stripe = new Stripe(Bun.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia'
})

export interface CancelTripRequest {
  bookingId: string
}

export interface CancelTripResponse {
  success: boolean
  message: string
  refund: any
}

export class CancelTripUseCase extends IUseCase<CancelTripRequest, CancelTripResponse> {
  async execute(request: CancelTripRequest): Promise<CancelTripResponse> {
    const { bookingId } = request

    // Vérifier si la réservation existe et est éligible à un remboursement
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .then((r) => r[0])

    if (!booking) {
      throw new Error('Réservation non trouvée')
    }

    if (booking.status !== 'paid') {
      throw new Error('Seules les réservations payées peuvent être annulées')
    }

    // Vérifier si un paiement est associé à cette réservation
    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.bookingId, bookingId))
      .then((r) => r[0])

    if (!payment || !payment.paymentIntentId) {
      throw new Error('Aucun paiement associé à cette réservation')
    }

    // Effectuer le remboursement via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.paymentIntentId
    })

    // Envoi d'un email après annulation
    const userEmail = 'user@example.com' // Remplacer par l'email réel de l'utilisateur
    await sendEmail({
      to: userEmail,
      subject: 'Annulation de votre réservation',
      text: `Votre réservation (ID: ${bookingId}) a été annulée et remboursée avec succès.`
    })

    return {
      success: true,
      message: 'Réservation annulée et remboursée avec succès',
      refund
    }
  }

  log(): ActivityType {
    return ActivityType.CANCEL_SUBSCRIPTION
  }
}

// feat: add reservation validation - Development on 2025-06-05
