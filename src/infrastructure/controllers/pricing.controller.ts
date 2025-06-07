import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import { GetPricingUseCase } from '../../application/use-cases/pricing/get-pricing.use-case'
import type { Routes } from '../../domain/types/route.type'

export class PricingController implements Routes {
  public controller = new OpenAPIHono()

  public initRoutes() {
    // Schéma de validation des paramètres de requête
    const pricingQuerySchema = z.object({
      departureCity: z.string().optional(),
      arrivalCity: z.string().optional()
    })

    // Schéma de réponse pour les tarifs et horaires
    const pricingResponseSchema = z.array(
      z.object({
        routeId: z.string(),
        departureCity: z.string(),
        arrivalCity: z.string(),
        basePrice: z.string(),
        schedules: z.array(z.string())
      })
    )

    // Définition OpenAPI de la route GET /pricing
    const getPricingRoute = createRoute({
      method: 'get',
      path: '/pricing',
      request: {
        query: pricingQuerySchema
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: pricingResponseSchema
            }
          },
          description: 'Liste des tarifs et horaires disponibles'
        },
        400: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Paramètres de requête invalides'
        }
      },
      tags: ['Pricing'],
      summary: 'Obtenir les tarifs et horaires',
      description: 'Retourne les tarifs et horaires disponibles pour les routes spécifiées'
    })

    // Handler de la route GET /pricing
    this.controller.openapi(getPricingRoute, async (c: any) => {
      const { departureCity, arrivalCity } = c.req.valid('query')

      try {
        const getPricingUseCase = new GetPricingUseCase()
        const result = await getPricingUseCase.execute({
          departureCity,
          arrivalCity
        })
        return c.json(result, 200)
      } catch {
        return c.json({ error: 'Erreur lors de la récupération des tarifs et horaires' }, 400)
      }
    })
  }
}

// feat: implement dynamic pricing - Development on 2025-06-07
