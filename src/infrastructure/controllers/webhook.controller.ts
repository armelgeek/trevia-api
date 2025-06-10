import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { CancelTripUseCase } from '../../application/use-cases/webhook/cancel-trip.use-case'
import { HandleStripeWebhookUseCase } from '../../application/use-cases/webhook/handle-stripe-webhook.use-case'
import { RetryPaymentUseCase } from '../../application/use-cases/webhook/retry-payment.use-case'
import type { Routes } from '../../domain/types/route.type'

export class WebhookController implements Routes {
  public controller = new OpenAPIHono()

  public initRoutes() {
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/stripe/webhook',
        tags: ['Reservation'],
        summary: 'Stripe Webhook',
        description: 'Handle Stripe webhook events.',
        operationId: 'stripeWebhook',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: z.object({
                  message: z.string()
                })
              }
            }
          }
        }
      }),
      async (ctx: any) => {
        const sig = ctx.req.header('stripe-signature')
        const rawBody = await ctx.req.raw.text()

        try {
          const handleStripeWebhookUseCase = new HandleStripeWebhookUseCase()
          const result = await handleStripeWebhookUseCase.execute({
            signature: sig!,
            rawBody
          })
          return ctx.json(result)
        } catch (error) {
          console.error('[Stripe Webhook Error]', error)
          return ctx.json({ message: 'Webhook Error' }, 400)
        }
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/retry-payment',
        tags: ['Payment'],
        summary: 'Retry Payment',
        description: 'Recreate a Stripe payment session for a failed booking.',
        operationId: 'retryPayment',
        request: {
          body: {
            content: {
              'application/json': {
                schema: z.object({
                  bookingId: z.string()
                })
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Payment session recreated successfully.',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  paymentUrl: z.string()
                })
              }
            }
          },
          400: {
            description: 'Error recreating payment session.',
            content: {
              'application/json': {
                schema: z.object({
                  error: z.string()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const { bookingId } = c.req.valid('json')

        try {
          const retryPaymentUseCase = new RetryPaymentUseCase()
          const result = await retryPaymentUseCase.execute({ bookingId })
          return c.json(result, 200)
        } catch (error: any) {
          if (error.message === 'Réservation non trouvée') {
            return c.json({ error: 'Réservation non trouvée' }, 404)
          }
          if (error.message === "La réservation n'est pas en attente de paiement") {
            return c.json({ error: "La réservation n'est pas en attente de paiement" }, 400)
          }
          if (error.message === 'Voyage non trouvé pour cette réservation') {
            return c.json({ error: 'Voyage non trouvé pour cette réservation' }, 404)
          }
          console.error('Erreur lors de la recréation de la session de paiement:', error)
          return c.json({ error: 'Erreur lors de la recréation de la session de paiement' }, 500)
        }
      }
    )

    // Route pour annuler un voyage et demander un remboursement
    this.controller.openapi(
      createRoute({
        method: 'post',
        path: '/cancel-trip',
        tags: ['Booking'],
        summary: 'Cancel Trip',
        description: 'Cancel a trip and issue a refund.',
        operationId: 'cancelTrip',
        request: {
          body: {
            content: {
              'application/json': {
                schema: z.object({
                  bookingId: z.string()
                })
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Trip cancelled and refund issued successfully.',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean(),
                  message: z.string(),
                  refund: z.any()
                })
              }
            }
          },
          400: {
            description: 'Error cancelling trip.',
            content: {
              'application/json': {
                schema: z.object({
                  error: z.string()
                })
              }
            }
          }
        }
      }),
      async (c: any) => {
        const { bookingId } = c.req.valid('json')

        try {
          const cancelTripUseCase = new CancelTripUseCase()
          const result = await cancelTripUseCase.execute({ bookingId })
          return c.json(result)
        } catch (error: any) {
          if (error.message === 'Réservation non trouvée') {
            return c.json({ error: 'Réservation non trouvée' }, 404)
          }
          if (error.message === 'Seules les réservations payées peuvent être annulées') {
            return c.json({ error: 'Seules les réservations payées peuvent être annulées' }, 400)
          }
          if (error.message === 'Aucun paiement associé à cette réservation') {
            return c.json({ error: 'Aucun paiement associé à cette réservation' }, 400)
          }
          console.error("Erreur lors de l'annulation du voyage :", error)
          return c.json({ error: "Une erreur est survenue lors de l'annulation du voyage" }, 500)
        }
      }
    )
  }
}

// feat: add webhook validation - Development on 2025-06-11
