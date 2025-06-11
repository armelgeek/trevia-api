import { eq } from 'drizzle-orm'
import Stripe from 'stripe'
import { IUseCase } from '../../../domain/types/use-case.type'
import { ActivityType } from '../../../infrastructure/config/activity.config'
import { sendEmail } from '../../../infrastructure/config/mail.config'
import { db } from '../../../infrastructure/database/db'
import { bookings } from '../../../infrastructure/database/schema/schema'

const stripe = new Stripe(Bun.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia'
})

export interface HandleStripeWebhookRequest {
  signature: string
  rawBody: string
}

export interface HandleStripeWebhookResponse {
  message: string
}

export class HandleStripeWebhookUseCase extends IUseCase<HandleStripeWebhookRequest, HandleStripeWebhookResponse> {
  async execute(request: HandleStripeWebhookRequest): Promise<HandleStripeWebhookResponse> {
    const { signature, rawBody } = request

    const event = await stripe.webhooks.constructEventAsync(rawBody, signature, Bun.env.STRIPE_WEBHOOK_SECRET!)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const bookingId = session.metadata?.bookingId

        if (!bookingId) {
          throw new Error('Booking ID is missing in session metadata.')
        }

        await db.update(bookings).set({ status: 'paid' }).where(eq(bookings.id, bookingId))

        // Envoi d'un email après un paiement réussi
        if (session.customer_email) {
          await sendEmail({
            to: session.customer_email,
            subject: 'Paiement réussi',
            text: `Votre réservation (ID: ${bookingId}) a été confirmée avec succès. Merci pour votre confiance !`
          })
        }

        return { message: 'Reservation updated successfully.' }
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const bookingId = session.metadata?.bookingId

        if (!bookingId) {
          throw new Error('Booking ID is missing in session metadata.')
        }

        await db.update(bookings).set({ status: 'failed' }).where(eq(bookings.id, bookingId))

        // Envoi d'un email après un échec de paiement
        if (session.customer_email) {
          await sendEmail({
            to: session.customer_email,
            subject: 'Échec du paiement',
            text: `Votre réservation (ID: ${bookingId}) n'a pas pu être confirmée en raison d'un échec de paiement. Veuillez réessayer.`
          })
        }

        return { message: 'Reservation marked as failed.' }
      }
      default:
        return { message: 'Event not handled.' }
    }
  }

  log(): ActivityType {
    return ActivityType.CALL_WEBHOOK
  }
}

// feat: create webhook controller - Development on 2025-06-11
