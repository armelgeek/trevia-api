import { eq } from 'drizzle-orm'
import Stripe from 'stripe'
import { IUseCase } from '../../../domain/types/use-case.type'
import { ActivityType } from '../../../infrastructure/config/activity.config'
import { sendEmail } from '../../../infrastructure/config/mail.config'
import { db } from '../../../infrastructure/database/db'
import { bookings, trips } from '../../../infrastructure/database/schema/schema'

const stripe = new Stripe(Bun.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia'
})

export interface RetryPaymentRequest {
  bookingId: string
}

export interface RetryPaymentResponse {
  success: boolean
  paymentUrl: string
}

export class RetryPaymentUseCase extends IUseCase<RetryPaymentRequest, RetryPaymentResponse> {
  async execute(request: RetryPaymentRequest): Promise<RetryPaymentResponse> {
    const { bookingId } = request

    // Vérifier si la réservation existe et est en statut 'pending'
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .then((r) => r[0])

    if (!booking) {
      throw new Error('Réservation non trouvée')
    }

    if (booking.status !== 'pending') {
      throw new Error("La réservation n'est pas en attente de paiement")
    }

    // Récupérer les informations nécessaires pour recréer la session
    const trip = await db
      .select()
      .from(trips)
      .where(eq(trips.id, booking.tripId!))
      .then((r) => r[0])

    if (!trip) {
      throw new Error('Voyage non trouvé pour cette réservation')
    }

    const totalAmount = Number.parseFloat(booking.totalPrice || '0')

    // Créer une nouvelle session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Réservation pour le voyage ${booking.tripId}`
            },
            unit_amount: Math.round(totalAmount * 100)
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${Bun.env.REACT_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${Bun.env.REACT_APP_URL}/cancel`,
      metadata: {
        bookingId
      }
    })

    // Envoi d'un email après recréation de la session de paiement
    const userEmail = 'user@example.com' // Remplacer par l'email réel de l'utilisateur
    await sendEmail({
      to: userEmail,
      subject: 'Nouvelle tentative de paiement',
      text: `Une nouvelle session de paiement a été créée pour votre réservation (ID: ${bookingId}). Veuillez finaliser votre paiement.`
    })

    return { success: true, paymentUrl: session.url! }
  }

  log(): ActivityType {
    return ActivityType.PAYMENT_RETRY
  }
}

// feat: add payment webhooks - Development on 2025-06-03

// feat: create webhook handlers - Development on 2025-06-11

// fix: webhook reliability improvements - Development on 2025-06-12
