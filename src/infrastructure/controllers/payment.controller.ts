import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import { CreatePaymentUseCase } from '../../application/use-cases/payment/create-payment.use-case'
import { GetPaymentsUseCase } from '../../application/use-cases/payment/get-payments.use-case'
import type { Routes } from '../../domain/types/route.type'

export class PaymentController implements Routes {
  public controller = new OpenAPIHono()

  public initRoutes() {
    const createPaymentBodySchema = z.object({
      amount: z.string().min(1, 'Montant requis'),
      paymentMethod: z.string().min(1, 'Méthode de paiement requise')
    })

    const paymentSummarySchema = z.object({
      paymentId: z.string(),
      bookingId: z.string(),
      amount: z.string(),
      paymentMethod: z.string(),
      status: z.string(),
      paymentDate: z.string().nullable()
    })

    const paymentHistorySchema = z.object({
      data: z.array(paymentSummarySchema)
    })

    const createPaymentRoute = createRoute({
      method: 'post',
      path: '/bookings/{id}/payments',
      request: {
        params: z.object({ id: z.string().min(1, 'Booking ID requis') }),
        body: {
          content: {
            'application/json': {
              schema: createPaymentBodySchema
            }
          }
        }
      },
      responses: {
        201: {
          content: {
            'application/json': {
              schema: paymentSummarySchema
            }
          },
          description: 'Paiement effectué avec succès'
        },
        400: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Erreur de validation ou de paiement'
        },
        401: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Utilisateur non authentifié'
        },
        402: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Paiement refusé'
        }
      },
      tags: ['Payments'],
      summary: 'Effectuer un paiement pour une réservation',
      description: 'Permet à l’utilisateur de payer une réservation (intégration Stripe à brancher)'
    })

    this.controller.openapi(createPaymentRoute, async (c: any) => {
      const user = c.get('user')
      const { id } = c.req.valid('param')
      const { amount, paymentMethod } = c.req.valid('json')

      const createPaymentUseCase = new CreatePaymentUseCase()
      const result = await createPaymentUseCase.execute({
        bookingId: id,
        amount,
        paymentMethod,
        userId: user.id
      })

      if (!result.success) {
        if (result.error === 'Réservation non trouvée') {
          return c.json({ error: result.error }, 400)
        }
        if (result.error === 'Accès interdit à cette réservation') {
          return c.json({ error: 'Accès interdit' }, 401)
        }
        return c.json({ error: result.error || 'Erreur lors du paiement' }, 400)
      }

      return c.json(result.data, 201)
    })

    const getPaymentsRoute = createRoute({
      method: 'get',
      path: '/bookings/{id}/payments',
      request: {
        params: z.object({ id: z.string().min(1, 'Booking ID requis') })
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: paymentHistorySchema
            }
          },
          description: 'Historique des paiements de la réservation'
        },
        401: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Utilisateur non authentifié'
        },
        403: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Accès interdit'
        },
        404: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Réservation non trouvée'
        }
      },
      tags: ['Payments'],
      summary: 'Obtenir l’historique des paiements d’une réservation',
      description: 'Retourne la liste des paiements pour une réservation donnée (propriétaire ou admin)'
    })

    this.controller.openapi(getPaymentsRoute, async (c: any) => {
      const user = c.get('user')

      const getPaymentsUseCase = new GetPaymentsUseCase()
      const result = await getPaymentsUseCase.execute({
        userId: user.id
      })

      if (!result.success) {
        return c.json({ error: result.error || 'Erreur lors de la récupération des paiements' }, 400)
      }

      return c.json({ data: result.data }, 200)
    })
  }
}

// feat: integrate Stripe payment system - Development on 2025-06-03

// feat: create payment controller - Development on 2025-06-04

// feat: add logging system - Development on 2025-06-17
