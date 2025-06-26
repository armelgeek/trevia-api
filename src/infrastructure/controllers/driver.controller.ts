import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import type { Routes } from '../../domain/types/route.type'
import { DriverRepositoryImpl } from '../repositories/driver.repository'
import { ListDriversUseCase } from '../../application/use-cases/driver/list-drivers.use-case'
import { GetDriverUseCase } from '../../application/use-cases/driver/get-driver.use-case'
import { CreateDriverUseCase } from '../../application/use-cases/driver/create-driver.use-case'
import { UpdateDriverUseCase } from '../../application/use-cases/driver/update-driver.use-case'
import { DeleteDriverUseCase } from '../../application/use-cases/driver/delete-driver.use-case'

export class DriverController implements Routes {
  public controller = new OpenAPIHono()

  public initRoutes() {
    const driverSchema = z.object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      fullName: z.string().optional(),
      license: z.string().nullable(),
      certifications: z.string().nullable(),
      phone: z.string().nullable(),
      status: z.string().nullable(),
      reviews: z.string().nullable()
    })

    const driverIdParamSchema = z.object({
      id: z.string().min(1, 'Driver ID requis')
    })

    // Lister les drivers
    const listDriversRoute = createRoute({
      method: 'get',
      path: '/drivers',
      responses: {
        200: {
          content: {
            'application/json': {
              schema: z.object({ data: z.array(driverSchema) })
            }
          },
          description: 'Liste des conducteurs'
        }
      },
      tags: ['Drivers'],
      summary: 'Lister les conducteurs',
      description: 'Retourne la liste de tous les conducteurs'
    })

    this.controller.openapi(listDriversRoute, async (c: any) => {
      const repo = new DriverRepositoryImpl()
      const useCase = new ListDriversUseCase(repo)
      const data = await useCase.execute()
      return c.json({ data }, 200)
    })

    // Détail d'un driver
    const getDriverRoute = createRoute({
      method: 'get',
      path: '/drivers/{id}',
      request: { params: driverIdParamSchema },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: driverSchema
            }
          },
          description: 'Détail du conducteur'
        },
        404: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Conducteur non trouvé'
        }
      },
      tags: ['Drivers'],
      summary: 'Détail d’un conducteur',
      description: 'Retourne les informations détaillées d’un conducteur'
    })

    this.controller.openapi(getDriverRoute, async (c: any) => {
      const repo = new DriverRepositoryImpl()
      const useCase = new GetDriverUseCase(repo)
      const { id } = c.req.valid('param')
      const driver = await useCase.execute(id)
      if (!driver) return c.json({ error: 'Conducteur non trouvé' }, 404)
      return c.json(driver, 200)
    })

    // Créer un driver
    const createDriverRoute = createRoute({
      method: 'post',
      path: '/drivers',
      request: {
        body: {
          content: {
            'application/json': {
              schema: driverSchema.omit({ id: true })
            }
          }
        }
      },
      responses: {
        201: {
          content: {
            'application/json': {
              schema: driverSchema
            }
          },
          description: 'Conducteur créé'
        }
      },
      tags: ['Drivers'],
      summary: 'Créer un conducteur',
      description: 'Crée un nouveau conducteur'
    })

    this.controller.openapi(createDriverRoute, async (c: any) => {
      const repo = new DriverRepositoryImpl()
      const useCase = new CreateDriverUseCase(repo)
      const input = c.req.valid('json')
      const driver = await useCase.execute(input)
      return c.json(driver, 201)
    })

    // Mettre à jour un driver
    const updateDriverRoute = createRoute({
      method: 'put',
      path: '/drivers/{id}',
      request: {
        params: driverIdParamSchema,
        body: {
          content: {
            'application/json': {
              schema: driverSchema.omit({ id: true })
            }
          }
        }
      },
      responses: {
        200: {
          content: {
            'application/json': {
              schema: driverSchema
            }
          },
          description: 'Conducteur mis à jour'
        },
        404: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Conducteur non trouvé'
        }
      },
      tags: ['Drivers'],
      summary: 'Mettre à jour un conducteur',
      description: 'Met à jour les informations d’un conducteur'
    })

    this.controller.openapi(updateDriverRoute, async (c: any) => {
      const repo = new DriverRepositoryImpl()
      const useCase = new UpdateDriverUseCase(repo)
      const { id } = c.req.valid('param')
      const input = c.req.valid('json')
      const driver = await useCase.execute(id, input)
      if (!driver) return c.json({ error: 'Conducteur non trouvé' }, 404)
      return c.json(driver, 200)
    })

    // Supprimer un driver
    const deleteDriverRoute = createRoute({
      method: 'delete',
      path: '/drivers/{id}',
      request: { params: driverIdParamSchema },
      responses: {
        204: {
          description: 'Conducteur supprimé'
        },
        404: {
          content: {
            'application/json': {
              schema: z.object({ error: z.string() })
            }
          },
          description: 'Conducteur non trouvé'
        }
      },
      tags: ['Drivers'],
      summary: 'Supprimer un conducteur',
      description: 'Supprime un conducteur par ID'
    })

    this.controller.openapi(deleteDriverRoute, async (c: any) => {
      const repo = new DriverRepositoryImpl()
      const useCase = new DeleteDriverUseCase(repo)
      const { id } = c.req.valid('param')
      const ok = await useCase.execute(id)
      if (!ok) return c.json({ error: 'Conducteur non trouvé' }, 404)
      return c.body(null, 204)
    })
  }
}
