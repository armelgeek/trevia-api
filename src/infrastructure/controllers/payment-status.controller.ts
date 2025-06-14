import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import { GetPaymentStatusUseCase } from '../../application/use-cases/payment-status/get-payment-status.use-case'
import type { Routes } from '../../domain/types/route.type'

export class PaymentStatusController implements Routes {
  public controller = new OpenAPIHono()

  public initRoutes() {
    const paymentStatusQuerySchema = z.object({
      bookingId: z.string()
    })

    const paymentStatusResponseSchema = z.object({
      bookingId: z.string(),
      amount: z.string(),
      paymentMethod: z.string(),
      paymentDate: z.string().nullable(),
      status: z.string(),
      bankRef: z.string().nullable()
    })

    const getPaymentStatusRoute = createRoute({
      method: 'get',
      path: '/payment-status',
      request: {
        query: paymentStatusQuerySchema
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: paymentStatusResponseSchema
            }
          },
          description: 'Statut de paiement récupéré avec succès'
        },
        404: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Paiement non trouvé'
        }
      },
      tags: ['Payment'],
      summary: 'Obtenir le statut de paiement',
      description: 'Retourne le statut de paiement pour une réservation spécifique'
    })

    this.controller.openapi(getPaymentStatusRoute, async (c: any) => {
      const { bookingId } = c.req.valid('query')

      try {
        const getPaymentStatusUseCase = new GetPaymentStatusUseCase()
        const result = await getPaymentStatusUseCase.execute({ bookingId })
        return c.json(result, 200)
      } catch (error: any) {
        if (error.message === 'Paiement non trouvé') {
          return c.json({ error: 'Paiement non trouvé' }, 404)
        }
        return c.json({ error: 'Erreur lors de la récupération du statut de paiement' }, 400)
      }
    })
  }
}

// feat: create payment model - Development on 2025-06-03

// perf: add caching layer - Development on 2025-06-14
