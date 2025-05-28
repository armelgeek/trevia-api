import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import { CreateVehicleUseCase } from '../../application/use-cases/vehicle/create-vehicle.use-case'
import { GetVehicleByIdUseCase } from '../../application/use-cases/vehicle/get-vehicle-by-id.use-case'
import { GetVehiclesUseCase } from '../../application/use-cases/vehicle/get-vehicles.use-case'
import { UpdateVehicleUseCase } from '../../application/use-cases/vehicle/update-vehicle.use-case'
import type { Routes } from '../../domain/types/route.type'

export class VehicleController implements Routes {
  public controller = new OpenAPIHono()

  public initRoutes() {
    const listVehiclesQuerySchema = z.object({
      page: z.string().optional(),
      limit: z.string().optional()
    })

    const vehicleSchema = z.object({
      id: z.string(),
      registration: z.string(),
      type: z.string().nullable(),
      seatCount: z.string().nullable(),
      model: z.string().nullable(),
      status: z.string().nullable(),
      equipment: z.string().nullable()
    })

    const vehicleListSchema = z.object({
      data: z.array(vehicleSchema),
      page: z.number(),
      limit: z.number(),
      total: z.number()
    })

    const vehicleIdParamSchema = z.object({
      id: z.string().min(1, 'Vehicle ID requis')
    })

    const createVehicleBodySchema = z.object({
      registration: z.string().min(1, 'Immatriculation requise'),
      type: z.string().optional(),
      seatCount: z.string().optional(),
      model: z.string().optional(),
      status: z.string().optional(),
      equipment: z.string().optional()
    })

    const updateVehicleBodySchema = z.object({
      registration: z.string().optional(),
      type: z.string().optional(),
      seatCount: z.string().optional(),
      model: z.string().optional(),
      status: z.string().optional(),
      equipment: z.string().optional()
    })

    const getVehiclesRoute = createRoute({
      method: 'get',
      path: '/vehicles',
      request: {
        query: listVehiclesQuerySchema
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: vehicleListSchema
            }
          },
          description: 'Liste paginée des véhicules'
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
          description: 'Accès interdit (admin uniquement)'
        }
      },
      tags: ['Vehicles'],
      summary: 'Lister les véhicules (admin)',
      description: 'Retourne la liste paginée des véhicules. Accès réservé aux administrateurs.'
    })

    this.controller.openapi(getVehiclesRoute, async (c: any) => {
      const user = c.get('user')
      if (!user || !user.isAdmin) {
        return c.json({ error: 'Accès interdit' }, user ? 403 : 401)
      }

      const query = c.req.valid('query')
      const getVehiclesUseCase = new GetVehiclesUseCase()
      const result = await getVehiclesUseCase.execute(query)

      if (!result.success) {
        return c.json({ error: result.error || 'Erreur lors de la récupération des véhicules' }, 400)
      }

      return c.json(
        {
          data: result.data,
          page: result.page,
          limit: result.limit,
          total: result.total
        },
        200
      )
    })

    const getVehicleByIdRoute = createRoute({
      method: 'get',
      path: '/vehicles/{id}',
      request: {
        params: vehicleIdParamSchema
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: vehicleSchema
            }
          },
          description: 'Détail du véhicule'
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
          description: 'Accès interdit (admin uniquement)'
        },
        404: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Véhicule non trouvé'
        }
      },
      tags: ['Vehicles'],
      summary: 'Obtenir le détail d’un véhicule (admin)',
      description: 'Retourne le détail d’un véhicule. Accès réservé aux administrateurs.'
    })

    this.controller.openapi(getVehicleByIdRoute, async (c: any) => {
      const user = c.get('user')
      if (!user || !user.isAdmin) {
        return c.json({ error: 'Accès interdit' }, user ? 403 : 401)
      }

      const { id } = c.req.valid('param')
      const getVehicleByIdUseCase = new GetVehicleByIdUseCase()
      const result = await getVehicleByIdUseCase.execute({ vehicleId: id })

      if (!result.success) {
        if (result.error === 'Véhicule non trouvé') {
          return c.json({ error: result.error }, 404)
        }
        return c.json({ error: result.error || 'Erreur lors de la récupération du véhicule' }, 400)
      }

      return c.json(result.data, 200)
    })

    const createVehicleRoute = createRoute({
      method: 'post',
      path: '/vehicles',
      request: {
        body: {
          content: {
            'application/json': {
              schema: createVehicleBodySchema
            }
          }
        }
      },
      responses: {
        201: {
          content: {
            'application/json': {
              schema: vehicleSchema
            }
          },
          description: 'Véhicule créé'
        },
        400: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Erreur de validation'
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
          description: 'Accès interdit (admin uniquement)'
        }
      },
      tags: ['Vehicles'],
      summary: 'Créer un véhicule (admin)',
      description: 'Crée un nouveau véhicule. Accès réservé aux administrateurs.'
    })

    this.controller.openapi(createVehicleRoute, async (c: any) => {
      const user = c.get('user')
      if (!user || !user.isAdmin) {
        return c.json({ error: 'Accès interdit' }, user ? 403 : 401)
      }

      const body = c.req.valid('json')
      const createVehicleUseCase = new CreateVehicleUseCase()
      const result = await createVehicleUseCase.execute(body)

      if (!result.success) {
        return c.json({ error: result.error || 'Erreur lors de la création du véhicule' }, 400)
      }

      return c.json(result.data, 201)
    })

    const updateVehicleRoute = createRoute({
      method: 'put',
      path: '/vehicles/{id}',
      request: {
        params: vehicleIdParamSchema,
        body: {
          content: {
            'application/json': {
              schema: updateVehicleBodySchema
            }
          }
        }
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: vehicleSchema
            }
          },
          description: 'Véhicule mis à jour'
        },
        400: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Erreur de validation'
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
          description: 'Accès interdit (admin uniquement)'
        },
        404: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Véhicule non trouvé'
        }
      },
      tags: ['Vehicles'],
      summary: 'Mettre à jour un véhicule (admin)',
      description: 'Met à jour les informations d’un véhicule. Accès réservé aux administrateurs.'
    })

    this.controller.openapi(updateVehicleRoute, async (c: any) => {
      const user = c.get('user')
      if (!user || !user.isAdmin) {
        return c.json({ error: 'Accès interdit' }, user ? 403 : 401)
      }

      const { id } = c.req.valid('param')
      const body = c.req.valid('json')

      const updateVehicleUseCase = new UpdateVehicleUseCase()
      const result = await updateVehicleUseCase.execute({
        vehicleId: id,
        ...body
      })

      if (!result.success) {
        if (result.error === 'Véhicule non trouvé') {
          return c.json({ error: result.error }, 404)
        }
        return c.json({ error: result.error || 'Erreur lors de la mise à jour du véhicule' }, 400)
      }

      return c.json(result.data, 200)
    })
  }
}

// feat: add vehicle availability tracking - 2025-06-21

// fix: vehicle data integrity checks - 2025-06-21

// feat: create vehicle controller - Development on 2025-05-28
