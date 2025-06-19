import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import { GetOptionsUseCase } from '../../application/use-cases/option/get-options.use-case'
import type { Routes } from '../../domain/types/route.type'

export class OptionController implements Routes {
  public controller = new OpenAPIHono()

  public initRoutes() {
    const optionSchema = z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      extraPrice: z.string().nullable(),
      optionType: z.string().nullable()
    })

    const optionListSchema = z.object({
      data: z.array(optionSchema)
    })

    const getOptionsRoute = createRoute({
      method: 'get',
      path: '/options',
      responses: {
        200: {
          content: {
            'application/json': {
              schema: optionListSchema
            }
          },
          description: 'Liste des options disponibles'
        }
      },
      tags: ['Options'],
      summary: 'Lister les options disponibles',
      description: 'Retourne la liste des options disponibles (endpoint public)'
    })

    this.controller.openapi(getOptionsRoute, async (c: any) => {
      const getOptionsUseCase = new GetOptionsUseCase()
      const result = await getOptionsUseCase.execute()

      if (!result.success) {
        return c.json({ error: result.error || 'Erreur lors de la récupération des options' }, 400)
      }

      return c.json({ data: result.data }, 200)
    })
  }
}
