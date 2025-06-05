import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { CreateReservationUseCase } from '../../application/use-cases/reservation/create-reservation.use-case'
import type { Routes } from '../../domain/types/route.type'

export class ReservationController implements Routes {
  public controller = new OpenAPIHono()

  public initRoutes() {
    const reservationSchema = z.object({
      tripId: z.string(),
      seatIds: z.array(z.string()),
      scheduleId: z.string()
    })

    const createReservationRoute = createRoute({
      method: 'post',
      path: '/reservation',
      request: {
        body: {
          content: {
            'application/json': {
              schema: reservationSchema
            }
          }
        }
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: z.object({
                success: z.boolean(),
                paymentUrl: z.string()
              })
            }
          },
          description: 'Réservation créée avec succès'
        },
        400: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Erreur lors de la création de la réservation'
        }
      },
      tags: ['Reservation'],
      summary: 'Créer une réservation',
      description: 'Permet de réserver des places pour un voyage et de générer un lien de paiement Stripe'
    })

    this.controller.openapi(createReservationRoute, async (c: any) => {
      const body = c.req.valid('json')
      const { tripId, seatIds, scheduleId } = body

      const userId = c.get('user')?.id
      if (!userId) {
        return c.json({ error: 'Utilisateur non authentifié' }, 401)
      }
      const customerEmail = c.get('user')?.email
      if (!customerEmail) {
        return c.json({ error: 'Utilisateur non authentifié' }, 401)
      }

      const useCase = new CreateReservationUseCase()
      const result = await useCase.execute({
        tripId,
        seatIds,
        scheduleId,
        userId,
        userEmail: customerEmail
      })

      if (!result.success) {
        return c.json({ error: result.error }, 400)
      }

      return c.json({ success: true, paymentUrl: result.paymentUrl }, 200)
    })
  }
}

// feat: add reservation management - Development on 2025-06-05
