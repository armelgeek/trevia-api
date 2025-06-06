import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import type { Routes } from '@/domain/types'
import { GetDepartureCitiesUseCase } from '../../application/use-cases/location/get-departure-cities.use-case'
import { GetDestinationsUseCase } from '../../application/use-cases/location/get-destinations.use-case'

export class LocationController implements Routes {
  public controller = new OpenAPIHono()

  public initRoutes() {
    // Schéma de validation pour les villes de départ
    const departureCitiesResponseSchema = z.object({
      data: z.array(z.string())
    })

    const getDepartureCitiesRoute = createRoute({
      method: 'get',
      path: '/locations/departure-cities',
      responses: {
        200: {
          content: {
            'application/json': {
              schema: departureCitiesResponseSchema
            }
          },
          description: 'Liste des villes de départ disponibles'
        }
      },
      tags: ['Locations'],
      summary: 'Obtenir les villes de départ',
      description: 'Retourne une liste des villes de départ disponibles'
    })

    this.controller.openapi(getDepartureCitiesRoute, async (c: any) => {
      const getDepartureCitiesUseCase = new GetDepartureCitiesUseCase()
      const result = await getDepartureCitiesUseCase.execute()

      if (!result.success) {
        return c.json({ error: result.error || 'Erreur interne du serveur' }, 500)
      }

      return c.json({ data: result.data })
    })

    // Schéma de validation pour les destinations
    const destinationsQuerySchema = z.object({
      city: z.string()
    })

    const destinationsResponseSchema = z.object({
      data: z.array(z.string())
    })

    const getDestinationsRoute = createRoute({
      method: 'get',
      path: '/locations/destinations',
      request: {
        query: destinationsQuerySchema
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: destinationsResponseSchema
            }
          },
          description: 'Liste des destinations disponibles depuis une ville donnée'
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
      tags: ['Locations'],
      summary: 'Obtenir les destinations disponibles',
      description: 'Retourne une liste des destinations disponibles depuis une ville donnée'
    })

    this.controller.openapi(getDestinationsRoute, async (c: any) => {
      const query = c.req.valid('query')

      const getDestinationsUseCase = new GetDestinationsUseCase()
      const result = await getDestinationsUseCase.execute({ city: query.city })

      if (!result.success) {
        return c.json({ error: result.error || 'Erreur interne du serveur' }, 500)
      }

      return c.json({ data: result.data })
    })
  }
}

// feat: create location controller - Development on 2025-06-06
