import { eq } from 'drizzle-orm'
import { db } from '../../../infrastructure/database/db/index'

interface GetRouteByIdInput {
  id: string
}

interface RouteData {
  id: string
  departureCity: string | null
  arrivalCity: string | null
  distanceKm: string | null
  duration: string | null
  basePrice: string | null
  routeType: string | null
  status: string | null
}

interface GetRouteByIdOutput {
  success: boolean
  data?: RouteData
  error?: string
}

export class GetRouteByIdUseCase {
  public async execute(input: GetRouteByIdInput): Promise<GetRouteByIdOutput> {
    const { id } = input

    try {
      const route = await db.query.routes.findFirst({ where: (r: any) => eq(r.id, id) })

      if (!route) {
        return { success: false, error: 'Route not found' }
      }

      return { success: true, data: route }
    } catch (error: any) {
      console.error('Erreur lors de la récupération de la route:', error)
      return { success: false, error: error.message || 'Erreur interne du serveur' }
    }
  }
}

// feat: create route model and repository - 2025-06-21

// feat: add route optimization logic - 2025-06-21

// feat: create route controller - Development on 2025-05-30
